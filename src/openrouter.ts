import { config } from "./config.js";
import { SYSTEM_PROMPT } from "./system-prompt.js";

export interface OpenRouterMessage {
  role: "system" | "user";
  content: string;
}

interface OpenRouterChoice {
  message: { content: string };
}

interface OpenRouterResponse {
  choices: OpenRouterChoice[];
  error?: { message: string; code: number };
}

export interface AnalyzeParams {
  draftPlan: string;
  techStack?: string;
  modelChoice?: string;
  contextConstraints?: string;
}

export interface CallOpenRouterOptions {
  model: string;
  messages: OpenRouterMessage[];
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
}

export function buildUserMessage(params: AnalyzeParams): string {
  let msg = `## Draft Plan\n\n${params.draftPlan}`;

  if (params.techStack) {
    msg += `\n\n## Tech Stack\n\n${params.techStack}`;
  }

  if (params.contextConstraints) {
    msg += `\n\n## Context Constraints\n\n${params.contextConstraints}`;
  }

  return msg;
}

export async function callOpenRouter(opts: CallOpenRouterOptions): Promise<string> {
  const apiKey = config.openrouterApiKey;
  if (!apiKey) {
    throw new Error(
      "Missing OPENROUTER_API_KEY. Set it in your .env file or environment.\n" +
      "Get your key at https://openrouter.ai/keys"
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 90_000);

  try {
    const res = await fetch(`${config.openrouterBaseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/deepplandev/deepplan-mcp",
        "X-Title": "DeepPlan MCP",
      },
      body: JSON.stringify({
        model: opts.model,
        messages: opts.messages,
        max_tokens: opts.maxTokens ?? 8192,
        temperature: opts.temperature ?? 0.3,
      }),
      signal: controller.signal,
    });

    if (res.status === 401) {
      throw new Error("Unauthorized: Your OpenRouter API key is invalid or expired.");
    }
    if (res.status === 402) {
      throw new Error("No credits remaining on your OpenRouter account. Top up at https://openrouter.ai/credits");
    }
    if (res.status === 429) {
      throw new Error("Rate limited by OpenRouter. Please wait a moment and try again.");
    }

    const data = (await res.json()) as OpenRouterResponse;

    if (data.error) {
      throw new Error(`OpenRouter error: ${data.error.message}`);
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Received an empty response from OpenRouter.");
    }

    return content;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`Backend took too long (>${(opts.timeoutMs ?? 90_000) / 1000}s). Try again or simplify your plan.`);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export async function analyzeBlueprint(params: AnalyzeParams): Promise<string> {
  const model = params.modelChoice || config.openrouterModel || "google/gemini-3-flash-preview";

  const messages: OpenRouterMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: buildUserMessage(params) },
  ];

  return callOpenRouter({ model, messages });
}
