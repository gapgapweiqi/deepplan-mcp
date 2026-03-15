#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { config } from "./config.js";
import { runCouncil } from "./council.js";
import { checkAuth, insufficientCreditsMessage } from "./auth.js";

const server = new McpServer({
  name: "deepplan",
  version: "0.1.0",
});

server.tool(
  "upgrade_architecture_blueprint",
  `Sends a draft architecture plan to the DeepPlan backend for expert-level review.
Returns structured architectural directives, edge cases, constraints, and numbered
next steps that you (the IDE agent) can execute immediately.

Use this when:
- A plan feels too shallow or generic
- Starting a complex feature or new project
- You need architecture-level guidance before writing code

The response includes a "Next Steps for Agent" section with numbered instructions
you can follow directly.

Internally, this tool runs a "Council of Architects" — 4 expert AI personas
(Security, Performance, UX/DX, DevOps) analyze the plan in parallel, then a
Lead Architect synthesizes their reports into a unified blueprint.`,
  {
    draft_plan: z.string().describe(
      "The shallow plan or blueprint text to upgrade. This is the main input."
    ),
    tech_stack: z.string().optional().describe(
      "Technology stack context, e.g. 'SvelteKit, Cloudflare Workers, D1, TailwindCSS'"
    ),
    model_choice: z.string().optional().describe(
      "OpenRouter model ID to use for the Lead Architect (summary). e.g. 'google/gemini-2.5-pro'. Defaults to DeepPlan Architect."
    ),
    context_constraints: z.string().optional().describe(
      "Runtime or infrastructure constraints, e.g. 'Must run on Cloudflare Workers Edge Runtime', 'No external libraries except listed ones'"
    ),
  },
  async (params) => {
    // Input validation
    const draftPlan = params.draft_plan.trim();

    if (!draftPlan) {
      return {
        content: [{ type: "text" as const, text: "❌ Error: draft_plan cannot be empty. Please provide the plan text you want to upgrade." }],
        isError: true,
      };
    }

    if (draftPlan.length > config.draftPlanMaxLength) {
      return {
        content: [{
          type: "text" as const,
          text: `❌ Error: draft_plan exceeds maximum length of ${config.draftPlanMaxLength} characters (got ${draftPlan.length}). Please shorten your plan.`,
        }],
        isError: true,
      };
    }

    // First-run auth check — opens browser if no key found
    const auth = checkAuth();
    if (!auth.ok) {
      return {
        content: [{ type: "text" as const, text: auth.errorMessage! }],
        isError: true,
      };
    }

    try {
      const result = await runCouncil({
        draftPlan,
        techStack: params.tech_stack,
        modelChoice: params.model_choice,
        contextConstraints: params.context_constraints,
      });

      return {
        content: [{ type: "text" as const, text: result }],
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error occurred";
      // Detect insufficient credits (402)
      if (message.includes("402") || message.toLowerCase().includes("insufficient") || message.toLowerCase().includes("credit")) {
        return {
          content: [{ type: "text" as const, text: insufficientCreditsMessage() }],
          isError: true,
        };
      }
      return {
        content: [{ type: "text" as const, text: `❌ Error: ${message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "auto_select_personas",
  `Analyzes a draft architecture plan and recommends the most relevant expert personas
to include in the council review. Returns a list of recommended persona names and focus areas.

Use this when:
- You want the AI to pick the best experts for a specific plan
- The plan covers a niche domain that may benefit from specialized personas

This tool does NOT run the full council — it only recommends which personas to use.`,
  {
    draft_plan: z.string().describe(
      "The architecture plan text to analyze for persona recommendations."
    ),
    available_personas: z.array(z.object({
      name: z.string(),
      focus: z.string(),
    })).optional().describe(
      "Optional list of available custom personas. If not provided, uses the 4 default experts."
    ),
  },
  async (params) => {
    const draftPlan = params.draft_plan.trim();

    if (!draftPlan) {
      return {
        content: [{ type: "text" as const, text: "❌ Error: draft_plan cannot be empty." }],
        isError: true,
      };
    }

    const auth = checkAuth();
    if (!auth.ok) {
      return {
        content: [{ type: "text" as const, text: auth.errorMessage! }],
        isError: true,
      };
    }

    const defaults = [
      { name: "Security Architect", focus: "Auth, data exposure, injection, CORS, API abuse" },
      { name: "Performance Architect", focus: "Latency, caching, token cost, cold starts, DB queries" },
      { name: "UX/DX Designer", focus: "IDE integration, error clarity, onboarding, config simplicity" },
      { name: "DevOps Architect", focus: "Deploy strategy, CI/CD, monitoring, disaster recovery" },
    ];

    const personas = params.available_personas ?? defaults;
    const personaList = personas.map((p, i) => `${i + 1}. ${p.name} — ${p.focus}`).join("\n");

    const prompt = `Analyze this draft plan and recommend which expert personas (by number) are most relevant for reviewing it. Pick 3-5 personas.

Available personas:
${personaList}

Draft plan:
${draftPlan.slice(0, 4000)}

Respond with a brief explanation of why each selected persona is relevant, formatted as:
## Recommended Personas
1. **[Name]** — [1-sentence reason why this persona is relevant to this specific plan]
...`;

    try {
      const { callOpenRouter } = await import("./openrouter.js");
      const result = await callOpenRouter({
        model: config.councilModel || "minimax/minimax-m2.5",
        messages: [
          { role: "system", content: "You recommend expert personas for architecture plan reviews. Be specific about why each persona is relevant." },
          { role: "user", content: prompt },
        ],
        maxTokens: 512,
        temperature: 0.3,
        timeoutMs: 30_000,
      });

      return {
        content: [{ type: "text" as const, text: result }],
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return {
        content: [{ type: "text" as const, text: `❌ Error: ${message}` }],
        isError: true,
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("DeepPlan MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
