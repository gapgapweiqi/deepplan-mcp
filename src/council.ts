import { config } from "./config.js";
import {
  callOpenRouter,
  buildUserMessage,
  type AnalyzeParams,
  type OpenRouterMessage,
} from "./openrouter.js";
import { EXPERT_PERSONAS, LEAD_ARCHITECT, type Persona } from "./prompts/personas.js";
import type { SearchProvider, SearchResult } from "./search/types.js";
import { StubSearchProvider } from "./search/stub.js";

interface ExpertReport {
  persona: Persona;
  content: string;
  durationMs: number;
}

interface CouncilResult {
  expertReports: ExpertReport[];
  finalBlueprint: string;
  leadModel: string;
  totalDurationMs: number;
}

interface CouncilOptions {
  searchProvider?: SearchProvider;
  customPersonas?: Persona[];
}

// ─── Proxy Mode: Call website API ───

interface ProxyResponse {
  runId: string;
  status: string;
  result: string;
  error?: string;
}

async function runCouncilViaProxy(params: AnalyzeParams): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 180_000);

  try {
    const res = await fetch(config.deepplanApiUrl!, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.deepplanApiKey}`,
        "Content-Type": "application/json",
        "X-Timestamp": new Date().toISOString(),
      },
      body: JSON.stringify({
        draftPlan: params.draftPlan,
        techStack: params.techStack,
        contextConstraints: params.contextConstraints,
        modelChoice: params.modelChoice,
      }),
      signal: controller.signal,
    });

    if (res.status === 401) {
      throw new Error(
        "Invalid DEEPPLAN_API_KEY. Generate a new key at your DeepPlan dashboard (API Keys page)."
      );
    }
    if (res.status === 403) {
      throw new Error("API key expired or revoked. Generate a new key at your DeepPlan dashboard.");
    }
    if (res.status === 402) {
      throw new Error("402 Insufficient credits for this council run.");
    }
    if (res.status === 429) {
      const retryAfter = res.headers.get("Retry-After") || "60";
      throw new Error(`Rate limited. Please wait ${retryAfter}s and try again.`);
    }

    if (!res.ok) {
      let msg = `Server error (${res.status})`;
      try {
        const data = await res.json();
        msg = (data as { message?: string }).message || msg;
      } catch { /* ignore */ }
      throw new Error(msg);
    }

    const data = await res.json() as ProxyResponse;
    if (!data.result) {
      throw new Error("Empty response from DeepPlan API.");
    }

    return data.result;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("DeepPlan API timeout (>180s). Try again or simplify your plan.");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Direct Mode: Call OpenRouter directly (fallback) ───

async function callExpert(
  persona: Persona,
  model: string,
  userMessage: string,
): Promise<ExpertReport> {
  const start = Date.now();

  const messages: OpenRouterMessage[] = [
    { role: "system", content: persona.systemPrompt },
    { role: "user", content: userMessage },
  ];

  const content = await callOpenRouter({
    model,
    messages,
    maxTokens: 2048,
    temperature: 0.3,
    timeoutMs: 90_000,
  });

  return {
    persona,
    content,
    durationMs: Date.now() - start,
  };
}

function buildLeadArchitectMessage(
  originalDraft: string,
  params: AnalyzeParams,
  reports: ExpertReport[],
  searchResults?: SearchResult[],
): string {
  let msg = `## Original Draft Plan\n\n${originalDraft}`;

  if (params.techStack) {
    msg += `\n\n## Tech Stack\n\n${params.techStack}`;
  }

  if (params.contextConstraints) {
    msg += `\n\n## Context Constraints\n\n${params.contextConstraints}`;
  }

  msg += `\n\n---\n\n# Expert Council Reports\n\n`;

  for (const report of reports) {
    msg += `${report.content}\n\n---\n\n`;
  }

  if (searchResults && searchResults.length > 0) {
    msg += `# Supplementary Search Results\n\n`;
    for (const result of searchResults) {
      msg += `- **${result.title}**: ${result.snippet}`;
      if (result.url) msg += ` (${result.url})`;
      msg += `\n`;
    }
    msg += `\n---\n\n`;
  }

  msg += `Based on the original draft plan and ALL expert reports above, produce the final unified architecture blueprint.`;

  return msg;
}

async function runCouncilDirect(
  params: AnalyzeParams,
  options?: CouncilOptions,
): Promise<string> {
  const totalStart = Date.now();

  const councilModel = config.councilModel || "minimax/minimax-m2.5";
  const leadModel = params.modelChoice || config.leadArchitectModel || "google/gemini-3-flash-preview";
  const searchProvider = options?.searchProvider ?? new StubSearchProvider();
  const personas = options?.customPersonas ?? EXPERT_PERSONAS;

  const userMessage = buildUserMessage(params);

  // Phase 0: Search for supplementary context (if provider available)
  let searchResults: SearchResult[] = [];
  if (await searchProvider.isAvailable()) {
    try {
      searchResults = await searchProvider.search({
        query: params.draftPlan.slice(0, 500),
        techStack: params.techStack,
        maxResults: 5,
      });
    } catch {
      // Search is optional — silently continue without results
    }
  }

  // Phase 1: Call experts in parallel
  const expertPromises = personas.map((persona) =>
    callExpert(persona, councilModel, userMessage)
  );

  const expertResults = await Promise.allSettled(expertPromises);

  const successfulReports: ExpertReport[] = [];
  const failedExperts: string[] = [];

  for (let i = 0; i < expertResults.length; i++) {
    const result = expertResults[i];
    if (result.status === "fulfilled") {
      successfulReports.push(result.value);
    } else {
      failedExperts.push(
        `${personas[i].emoji} ${personas[i].name}: ${result.reason}`
      );
    }
  }

  if (successfulReports.length === 0) {
    throw new Error(
      "All 4 expert analyses failed. Cannot proceed.\n\nErrors:\n" +
      failedExperts.join("\n")
    );
  }

  // Phase 2: Lead Architect synthesizes
  const leadMessages: OpenRouterMessage[] = [
    { role: "system", content: LEAD_ARCHITECT.systemPrompt },
    {
      role: "user",
      content: buildLeadArchitectMessage(params.draftPlan, params, successfulReports, searchResults),
    },
  ];

  const finalBlueprint = await callOpenRouter({
    model: leadModel,
    messages: leadMessages,
    maxTokens: 8192,
    temperature: 0.3,
    timeoutMs: 120_000,
  });

  const totalDurationMs = Date.now() - totalStart;

  // Build output with metadata header
  let output = "";

  if (failedExperts.length > 0) {
    output += `> ⚠️ ${failedExperts.length} expert(s) failed: ${failedExperts.join(", ")}\n>\n> Proceeding with ${successfulReports.length}/4 expert reports.\n\n`;
  }

  output += `> 👑 Council: ${successfulReports.length} experts (${councilModel}) → Lead Architect (${leadModel})\n`;
  output += `> ⏱️ Total: ${(totalDurationMs / 1000).toFixed(1)}s`;

  for (const report of successfulReports) {
    output += ` | ${report.persona.emoji} ${(report.durationMs / 1000).toFixed(1)}s`;
  }

  output += `\n\n---\n\n`;
  output += finalBlueprint;

  return output;
}

// ─── Main Entry Point ───

export async function runCouncil(
  params: AnalyzeParams,
  options?: CouncilOptions,
): Promise<string> {
  if (config.mode === "proxy") {
    return runCouncilViaProxy(params);
  }
  return runCouncilDirect(params, options);
}
