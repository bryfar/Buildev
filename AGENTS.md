# Buildev — Agent Instructions
 
You are working on Buildev, an open-source AI-powered visual web builder.
Follow these rules strictly in every code generation and modification.
 
## Tech Stack
Vue 3 (Composition API), TypeScript strict, Vite, Express, Prisma,
Zod, Monaco Editor, Y.js, Vitest, Playwright.
 
## Critical Rules
- TypeScript strict mode. NEVER use `any` type.
- Named exports only. No default exports.
- No console.log in production code.
- Vue components: <script setup lang="ts"> exclusively.
- API routes: Zod validation on all inputs.
- Max 300 lines per file. Extract into modules.
- All functions: JSDoc with @param and @returns.
- Conventional Commits: feat:, fix:, docs:, chore:, refactor:, test:
 
## Architecture
Monorepo (Yarn 4 workspaces):
- apps/buildev-frontend → @buildev/editor (Vue 3 visual builder)
- apps/buildev-backend  → @buildev/api (Express REST API)
- packages/core         → @buildev/core (Shared types, Zod schemas, AST)
- packages/sdk          → @buildev/sdk (Client SDK)
- packages/codegen      → @buildev/codegen (AST to framework generator)
- packages/ai-engine    → @buildev/ai-engine (AI BYOK integration)
- packages/collab       → @buildev/collab (Y.js sync)
 
## Commands
- `yarn dev` | `yarn build` | `yarn lint` | `yarn typecheck` | `yarn test`
 
## Safety
- NEVER modify AST schema without updating codegen targets.
- NEVER commit secrets, API keys, or .env files.
- Always run lint + typecheck + test before suggesting a commit.
