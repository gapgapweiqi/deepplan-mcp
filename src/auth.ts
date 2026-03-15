/**
 * First-run auth helper for DeepPlan MCP.
 *
 * Since MCP servers communicate via stdio (stdin/stdout are reserved for
 * the MCP protocol), we cannot do interactive prompts. Instead, we:
 * 1. Detect missing API key
 * 2. Attempt to open the browser to the API Keys page
 * 3. Return a helpful error message guiding the user to configure their key
 */

import { config } from "./config.js";
import { spawn } from "node:child_process";

/** Try to open a URL in the user's default browser (best-effort, no dependency) */
function openBrowser(url: string): void {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return;
  } catch {
    return;
  }

  const platform = process.platform;
  const cmd =
    platform === "darwin" ? "open" :
    platform === "win32" ? "cmd" :
    "xdg-open";

  const args = platform === "win32" ? ["/c", "start", "", url] : [url];

  try {
    const child = spawn(cmd, args, { stdio: "ignore", detached: true });
    child.unref();
  } catch {
    // best-effort — ignore errors (e.g. headless server)
  }
}

export interface AuthCheck {
  ok: boolean;
  errorMessage?: string;
}

const DASHBOARD_URL = "https://deepplan.dev/api-keys";

export function checkAuth(): AuthCheck {
  if (config.deepplanApiKey || config.openrouterApiKey) {
    return { ok: true };
  }

  // No key found — attempt to open browser
  openBrowser(DASHBOARD_URL);

  return {
    ok: false,
    errorMessage: [
      "🚀 Welcome to DeepPlan!",
      "",
      "No API key found. We're opening your browser to get one.",
      "",
      "If the browser didn't open, visit:",
      `  ${DASHBOARD_URL}`,
      "",
      "Then add your key to your IDE's MCP config:",
      "",
      '  "env": {',
      '    "DEEPPLAN_API_KEY": "dpk_your-key-here"',
      "  }",
      "",
      "Need help? See: https://deepplan.dev/docs/getting-started",
    ].join("\n"),
  };
}

/**
 * Check for insufficient credits (402) and return a friendly message.
 */
export function insufficientCreditsMessage(needed?: number): string {
  return [
    "❌ Insufficient Credits",
    "",
    needed ? `This council run requires ${needed} credits.` : "You don't have enough credits for this run.",
    "",
    "Top up credits at: https://deepplan.dev/pricing",
    "",
    "Tip: Volume discounts up to 33% at 3,000+ credits.",
  ].join("\n");
}
