# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2025-05-15

### Added
- Proxy mode (recommended): Route requests through DeepPlan API with your `dpk_` key
- Direct mode (fallback): Call OpenRouter directly with your own API key
- `upgrade_architecture_blueprint` tool — upgrade shallow plans into production-ready blueprints
- `auto_select_personas` tool — AI-powered persona recommendation for your plan
- 4 built-in expert personas: Security, Performance, UX/DX, DevOps
- Lead Architect synthesis with Constitution guardrails
- First-run auth helper with browser auto-open
- CLI args support (`--api-key`, `--api-url`)

## [0.1.0] - 2025-05-10

### Added
- Initial release
- MCP server with stdio transport
- Basic council runner with OpenRouter integration
