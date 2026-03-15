<p align="center">
  <img src="https://deepplan.dev/favicon.svg" width="80" height="80" alt="DeepPlan Logo" />
</p>

<h1 align="center">DeepPlan MCP</h1>

<p align="center">
  <strong>The Architectural Guardrail Engine for AI IDEs</strong>
</p>

<p align="center">
  Upgrade shallow architecture plans into production-ready blueprints<br/>
  via a Council of AI Architects — right inside your IDE.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/deepplan-mcp"><img src="https://img.shields.io/npm/v/deepplan-mcp?color=blue&label=npm" alt="npm version" /></a>
  <a href="https://github.com/deepplandev/deepplan-mcp/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License" /></a>
  <a href="https://modelcontextprotocol.io"><img src="https://img.shields.io/badge/MCP-compatible-purple" alt="MCP Compatible" /></a>
  <a href="https://deepplan.dev"><img src="https://img.shields.io/badge/deepplan.dev-website-black" alt="Website" /></a>
</p>

---

## What is DeepPlan?

DeepPlan is an **MCP server** that turns vague architecture plans into detailed, actionable blueprints. When you ask your AI coding assistant to build something complex, DeepPlan runs a **Council of AI Architects** — 4 expert personas analyze your plan in parallel, then a Lead Architect synthesizes their insights into a unified blueprint with numbered, executable steps.

```
Your Draft Plan → 🔒 Security · ⚡ Performance · 🎨 UX/DX · 🔧 DevOps → 👑 Lead Architect → Blueprint
```

### The Constitution

Every council session enforces **architectural guardrails** called "The Constitution" — a set of rules that prevent AI hallucination drift:

- **Terminology Precision** — Flags misused architectural terms (e.g., "fetch" for a DB query)
- **Clean Architecture Metrics** — Enforces low coupling, high cohesion, dependency direction
- **No Code Output** — Experts focus on WHAT and WHY, never HOW in code
- **Tech Stack Awareness** — All recommendations must reference your actual stack

---

## Quick Start

### Cursor

Add to your Cursor MCP settings (`~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "deepplan": {
      "command": "npx",
      "args": ["-y", "deepplan-mcp"],
      "env": {
        "DEEPPLAN_API_KEY": "dpk_your-key-here"
      }
    }
  }
}
```

### Windsurf

Add to your Windsurf MCP configuration:

```json
{
  "mcpServers": {
    "deepplan": {
      "command": "npx",
      "args": ["-y", "deepplan-mcp"],
      "env": {
        "DEEPPLAN_API_KEY": "dpk_your-key-here"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add deepplan -- npx -y deepplan-mcp --api-key=dpk_your-key-here
```

### VS Code (Copilot)

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "deepplan": {
      "command": "npx",
      "args": ["-y", "deepplan-mcp"],
      "env": {
        "DEEPPLAN_API_KEY": "dpk_your-key-here"
      }
    }
  }
}
```

> **Get your API key** at [deepplan.dev/api-keys](https://deepplan.dev/api-keys) (free tier included).

---

## Tools

### `upgrade_architecture_blueprint`

Send a draft plan to the Council of Architects for expert-level review.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `draft_plan` | Yes | The architecture plan text to upgrade |
| `tech_stack` | No | e.g. `"SvelteKit, Cloudflare Workers, D1"` |
| `context_constraints` | No | e.g. `"Must run on Edge Runtime"` |
| `model_choice` | No | OpenRouter model ID for the Lead Architect |

**Returns:** A structured blueprint with Architecture Directives, Edge Cases, Constraints, Patterns, and numbered Next Steps for your IDE agent to execute.

### `auto_select_personas`

Analyze a plan and recommend which expert personas are most relevant.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `draft_plan` | Yes | The plan to analyze |
| `available_personas` | No | Custom persona list (defaults to 4 built-in experts) |

---

## Modes

### Proxy Mode (Recommended)

Uses your DeepPlan API key (`dpk_...`). Requests are routed through the DeepPlan backend which provides:
- Custom personas and councils
- Advanced orchestration (debate mode, AI+IDE refinement)
- AI-powered search context (Librarian)
- Usage tracking and credit management

```
DEEPPLAN_API_KEY=dpk_your-key-here
```

### Direct Mode (Fallback)

Uses your own OpenRouter API key. The council runs locally with 4 built-in expert personas. No DeepPlan account needed.

```
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

---

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `DEEPPLAN_API_KEY` | — | DeepPlan API key (enables proxy mode) |
| `DEEPPLAN_API_URL` | `https://deepplan.dev/api/mcp/council` | API endpoint |
| `OPENROUTER_API_KEY` | — | OpenRouter key (direct mode fallback) |
| `OPENROUTER_MODEL` | `minimax/minimax-m2.5` | Model for expert analysis |
| `LEAD_ARCHITECT_MODEL` | `google/gemini-3-flash-preview` | Model for synthesis |
| `DRAFT_PLAN_MAX_LENGTH` | `8000` | Max input characters |

Configuration priority: **CLI args** > **environment variables** > **`.env` file**

CLI args example:
```bash
npx deepplan-mcp --api-key=dpk_xxx --api-url=https://custom-endpoint.example.com
```

---

## Built-in Expert Personas

| Persona | Focus Areas |
|---------|-------------|
| 🔒 **Security Architect** | Auth, data exposure, injection, CORS, API abuse, secrets management |
| ⚡ **Performance Engineer** | Latency, caching, token cost, cold starts, DB queries, concurrency |
| 🎨 **UX/DX Designer** | IDE integration, error clarity, onboarding, config simplicity |
| 🔧 **DevOps Engineer** | Deploy strategy, CI/CD, monitoring, disaster recovery, scaling |
| 👑 **Lead Architect** | Synthesizes all reports into a unified, executable blueprint |

> Want custom personas? Create them at [deepplan.dev](https://deepplan.dev) and they'll be available via proxy mode.

---

## Architecture

```
┌─────────────┐     stdio      ┌──────────────┐
│  IDE Agent   │◄──────────────►│  DeepPlan    │
│  (Cursor/    │    MCP         │  MCP Server  │
│   Windsurf)  │    Protocol    │  (this repo) │
└─────────────┘                 └──────┬───────┘
                                       │
                          ┌────────────┴────────────┐
                          │                         │
                    Proxy Mode               Direct Mode
                          │                         │
                   ┌──────▼──────┐           ┌──────▼──────┐
                   │ DeepPlan API │           │  OpenRouter  │
                   │ deepplan.dev │           │    API       │
                   │              │           │              │
                   │ • Custom     │           │ • 4 built-in │
                   │   personas   │           │   personas   │
                   │ • Debate     │           │ • Basic      │
                   │   mode       │           │   council    │
                   │ • AI Search  │           │              │
                   │ • Credits    │           │              │
                   └──────────────┘           └──────────────┘
```

---

## Development

```bash
# Clone
git clone https://github.com/deepplandev/deepplan-mcp.git
cd deepplan-mcp

# Install
npm install

# Dev (with hot reload)
npm run dev

# Build
npm run build

# Type check
npm run typecheck
```

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## Premium Features

The open-source client provides full functionality with 4 built-in personas. For advanced features, visit [deepplan.dev](https://deepplan.dev):

| Feature | Open Source | DeepPlan Pro |
|---------|:----------:|:------------:|
| 4 Built-in Experts | ✅ | ✅ |
| Custom Personas | — | ✅ |
| Council Builder | — | ✅ |
| Debate Mode (Pro/Con) | — | ✅ |
| AI Search (Librarian) | — | ✅ |
| Chair Persona | — | ✅ |
| Constitution Editor | — | ✅ |
| Usage Dashboard | — | ✅ |

---

## License

[MIT](LICENSE) — use it however you want.

---

<p align="center">
  Built with ❤️ by <a href="https://deepplan.dev">DeepPlan</a>
</p>
