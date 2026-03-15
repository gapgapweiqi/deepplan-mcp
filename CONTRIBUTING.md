# Contributing to DeepPlan MCP

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

```bash
git clone https://github.com/deepplandev/deepplan-mcp.git
cd deepplan-mcp
npm install
cp .env.example .env
# Add your API key(s) to .env
npm run dev
```

## Code Style

- **TypeScript strict mode** — no `any` types
- **ES Modules** — use `.js` extensions in imports
- **No runtime dependencies** beyond `@modelcontextprotocol/sdk` and `zod`
- Keep functions small and focused

## Making Changes

1. **Fork** the repo and create a branch from `main`
2. Make your changes
3. Run `npm run typecheck` to ensure no type errors
4. Run `npm run build` to verify the build succeeds
5. Update `CHANGELOG.md` with your changes
6. Submit a **Pull Request**

## What We're Looking For

- New expert personas (add to `src/prompts/personas.ts`)
- Search provider implementations (see `src/search/types.ts`)
- Better error messages and edge case handling
- Documentation improvements
- Bug fixes

## What We're NOT Looking For

- Changes that add heavy dependencies
- Features that duplicate the DeepPlan backend (debate mode, librarian, etc.)
- Code that includes hardcoded API keys or secrets

## Commit Messages

Use conventional commits:
- `feat: add new persona for database architecture`
- `fix: handle timeout in direct mode`
- `docs: improve Quick Start section`

## Questions?

Open an issue or reach out at [deepplan.dev](https://deepplan.dev).
