<p align="center">
  <img src="https://deepplan.dev/favicon.svg" width="80" height="80" alt="DeepPlan Logo" />
</p>

<h1 align="center">DeepPlan MCP</h1>

<p align="center">
  <strong>Architectural Intelligence Engine for AI-Powered Development</strong>
</p>

<p align="center">
  Turn vague plans into production-ready architecture blueprints —<br/>
  reviewed by a Council of AI Architects before you write a single line of code.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/deepplan-mcp"><img src="https://img.shields.io/npm/v/deepplan-mcp?color=blue&label=npm" alt="npm version" /></a>
  <a href="https://github.com/gapgapweiqi/deepplan-mcp/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License" /></a>
  <a href="https://modelcontextprotocol.io"><img src="https://img.shields.io/badge/MCP-compatible-purple" alt="MCP Compatible" /></a>
  <a href="https://deepplan.dev"><img src="https://img.shields.io/badge/deepplan.dev-website-black" alt="Website" /></a>
</p>

---

## Why DeepPlan?

Every AI coding assistant can generate code — but **architecture is where projects succeed or fail.** DeepPlan catches design flaws, security gaps, and performance bottlenecks *before* they become expensive rewrites.

| | Without DeepPlan | With DeepPlan |
|---|---|---|
| **Planning** | AI gives generic, shallow plans | 4 expert architects analyze in parallel |
| **Quality** | No guardrails — hallucination drift | Constitution enforces architectural correctness |
| **Perspective** | Single viewpoint | Security + Performance + UX/DX + DevOps |
| **Output** | Vague suggestions | Numbered, executable steps for your AI agent |

```
Your Draft Plan → 🔒 Security · ⚡ Performance · 🎨 UX/DX · 🔧 DevOps → 👑 Lead Architect → Blueprint
```

---

## Works With

DeepPlan uses the **Model Context Protocol (MCP)** — it works with any MCP-compatible client, not just IDEs:

| | Client | Use Case |
|---|---|---|
| 🖥️ | **Cursor, Windsurf, VS Code Copilot** | Architecture review while coding |
| 💻 | **Claude Code** | Terminal-based planning and brainstorming |
| 🤖 | **Claude Desktop, ChatGPT** | Conversational architecture consulting |
| 🔧 | **Custom MCP Clients** | Build your own AI-powered architecture tools |
| 📡 | **CI/CD & Automation** | Automated architecture linting in pipelines |

---

## Quick Start

### Cursor

Add to `~/.cursor/mcp.json`:

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

> **Get your API key** at [deepplan.dev/api-keys](https://deepplan.dev/api-keys) — free tier included.

---

## Use Cases

### 🏗️ Starting a New Project
> *"Build me a SaaS with Stripe billing and multi-tenant auth"*

Get a complete architecture blueprint — data model, API design, auth flow, deployment strategy — reviewed by 4 experts before writing a single line of code.

### 🔄 Major Refactoring
> *"Migrate our REST API to GraphQL"*

Get expert analysis of migration risks, breaking changes, edge cases, and a step-by-step execution plan your AI coding assistant can follow.

### 🛡️ Security Review
> *"Review this authentication flow for vulnerabilities"*

Get a Security Architect's threat model: injection vectors, data exposure risks, and concrete mitigations tied to your tech stack.

### ⚡ Performance Audit
> *"Optimize this data pipeline that's hitting 5s response times"*

Get bottleneck analysis with specific optimizations: caching strategy, query patterns, cold start reduction — all for your actual stack.

### 🧩 API Design
> *"Design a public REST API for our platform"*

Get DX analysis, versioning strategy, error handling patterns, rate limiting architecture, and documentation structure.

### 📋 Architecture Review in CI/CD
> *"Automatically review architecture decisions in pull requests"*

Integrate DeepPlan into your pipeline to catch architectural anti-patterns before they reach production.

---

## Tools

### `upgrade_architecture_blueprint`

Send a draft plan to the Council of Architects for expert-level review.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `draft_plan` | Yes | The architecture plan text to upgrade |
| `tech_stack` | No | e.g. `"SvelteKit, Cloudflare Workers, D1"` |
| `context_constraints` | No | e.g. `"Must run on Edge Runtime"` |
| `model_choice` | No | AI model for the Lead Architect synthesis |

**Returns:** A structured blueprint with Architecture Directives, Edge Cases, Constraints, Patterns, and numbered Next Steps your AI agent can execute immediately.

### `auto_select_personas`

Analyze a plan and recommend which expert personas are most relevant.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `draft_plan` | Yes | The plan to analyze |
| `available_personas` | No | Custom persona list (defaults to 4 built-in experts) |

---

## The Constitution

Every council session enforces **architectural guardrails** called "The Constitution" — rules that prevent AI hallucination drift and ensure high-quality output:

- **Terminology Precision** — Flags misused architectural terms (e.g., "fetch" for a DB query → should be "query")
- **Clean Architecture Metrics** — Enforces low coupling, high cohesion, correct dependency direction
- **No Code Output** — Experts focus on WHAT and WHY, never HOW in code
- **Tech Stack Awareness** — All recommendations must reference your actual stack
- **Impact Prioritization** — Most critical findings first, no filler

---

## Built-in Expert Personas

| Persona | Focus Areas |
|---------|-------------|
| 🔒 **Security Architect** | Auth, data exposure, injection, CORS, API abuse, secrets management |
| ⚡ **Performance Engineer** | Latency, caching, token cost, cold starts, DB queries, concurrency |
| 🎨 **UX/DX Designer** | Integration smoothness, error clarity, onboarding, config simplicity |
| 🔧 **DevOps Engineer** | Deploy strategy, CI/CD, monitoring, disaster recovery, scaling |
| 👑 **Lead Architect** | Synthesizes all expert reports into a unified, executable blueprint |

> Want domain-specific experts? Create custom personas at [deepplan.dev](https://deepplan.dev) — available via proxy mode.

---

## Modes

### Proxy Mode (Recommended)

Uses your DeepPlan API key (`dpk_...`). Requests are analyzed by **DeepPlan Scout** (expert analysis) and synthesized by **DeepPlan Architect** (blueprint generation).

```
DEEPPLAN_API_KEY=dpk_your-key-here
```

Premium features via proxy mode:
- Custom personas and councils
- Advanced orchestration (debate mode, AI+IDE refinement)
- AI-powered search context (Librarian)
- Usage tracking and credit management

### Direct Mode (Fallback)

Uses your own OpenRouter API key. The council runs locally with 4 built-in expert personas. No DeepPlan account needed.

```
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

---

## Configuration

| Variable | Description |
|----------|-------------|
| `DEEPPLAN_API_KEY` | DeepPlan API key — enables proxy mode with full features |
| `OPENROUTER_API_KEY` | OpenRouter key — enables direct mode (fallback) |
| `DRAFT_PLAN_MAX_LENGTH` | Max input characters (default: `8000`) |

Configuration priority: **CLI args** > **environment variables** > **`.env` file**

```bash
npx deepplan-mcp --api-key=dpk_your-key-here
```

---

## Extend & Build

DeepPlan is designed to be extended. The open-source core gives you building blocks to create your own architectural intelligence:

- **Custom Personas** — Add domain-specific experts (Database Architect, ML Engineer, etc.) in `src/prompts/personas.ts`
- **Search Providers** — Plug in your own search backend by implementing the `SearchProvider` interface in `src/search/types.ts`
- **Custom Constitutions** — Define your team's architectural standards and coding conventions
- **Pipeline Integration** — Use as a pre-commit hook, CI/CD step, or automated PR reviewer
- **Build Your Own Client** — The MCP protocol means any client can connect — build custom tools on top of DeepPlan

---

## Architecture

```
┌─────────────────┐    stdio     ┌──────────────┐
│  MCP Client      │◄────────────►│  DeepPlan    │
│                  │    MCP       │  MCP Server  │
│  • AI IDEs       │    Protocol  │  (this repo) │
│  • CLI Tools     │             └──────┬───────┘
│  • Custom Apps   │                    │
└─────────────────┘       ┌─────────────┴──────────────┐
                          │                            │
                    Proxy Mode                   Direct Mode
                          │                            │
                   ┌──────▼──────┐            ┌────────▼────────┐
                   │ DeepPlan API │            │    OpenRouter    │
                   │ deepplan.dev │            │       API        │
                   │              │            │                  │
                   │ • Scout      │            │ • 4 built-in     │
                   │   (analysis) │            │   personas       │
                   │ • Architect  │            │ • Basic council  │
                   │   (synthesis)│            │                  │
                   │ • Debate     │            │                  │
                   │ • AI Search  │            │                  │
                   └──────────────┘            └──────────────────┘
```

---

## Premium Features

The open-source client provides full council functionality with 4 built-in personas. For teams and power users, [deepplan.dev](https://deepplan.dev) offers:

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

## Development

```bash
# Clone
git clone https://github.com/gapgapweiqi/deepplan-mcp.git
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

## License

[MIT](LICENSE) — use it however you want.

---

<p align="center">
  Built with ❤️ by <a href="https://deepplan.dev">DeepPlan</a>
</p>
