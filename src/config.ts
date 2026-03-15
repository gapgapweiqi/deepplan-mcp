import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const DEFAULT_API_URL = "https://deepplan.dev/api/mcp/council";

// ─── Parse CLI args (--api-key=xxx, --api-url=xxx) ───

function parseCliArgs(): Record<string, string> {
  const args: Record<string, string> = {};
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith("--api-key=")) {
      args.DEEPPLAN_API_KEY = arg.slice("--api-key=".length);
    } else if (arg.startsWith("--api-url=")) {
      args.DEEPPLAN_API_URL = arg.slice("--api-url=".length);
    }
  }
  return args;
}

const cliArgs = parseCliArgs();

function loadEnvFile(): Record<string, string> {
  const envPath = resolve(__dirname, "..", ".env");
  if (!existsSync(envPath)) return {};

  const content = readFileSync(envPath, "utf-8");
  const vars: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    vars[key] = val;
  }
  return vars;
}

const fileEnv = loadEnvFile();

// Priority: CLI args > env vars > .env file > fallback
function env(key: string, fallback?: string): string | undefined {
  return cliArgs[key] ?? process.env[key] ?? fileEnv[key] ?? fallback;
}

export const config = {
  // DeepPlan proxy (preferred)
  deepplanApiKey: env("DEEPPLAN_API_KEY") ?? "",
  deepplanApiUrl: env("DEEPPLAN_API_URL", DEFAULT_API_URL),
  // OpenRouter fallback (used only if DEEPPLAN_API_KEY is not set)
  openrouterApiKey: env("OPENROUTER_API_KEY") ?? "",
  openrouterModel: env("OPENROUTER_MODEL", "minimax/minimax-m2.5"),
  councilModel: env("COUNCIL_MODEL", "minimax/minimax-m2.5"),
  leadArchitectModel: env("LEAD_ARCHITECT_MODEL"),
  draftPlanMaxLength: parseInt(env("DRAFT_PLAN_MAX_LENGTH", "8000") ?? "8000", 10),
  openrouterBaseUrl: "https://openrouter.ai/api/v1",
  // Mode: 'proxy' (via website) or 'direct' (OpenRouter)
  get mode(): "proxy" | "direct" {
    return this.deepplanApiKey ? "proxy" : "direct";
  },
} as const;
