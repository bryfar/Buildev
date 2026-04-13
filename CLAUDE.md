# Buildev — Open Source AI-Web Builder
 
## Project Overview
Buildev is an open-source visual web builder with AI capabilities.
Users design visually OR via AI chat, and export clean TypeScript code
to React, Vue, Svelte, or HTML. Monorepo with Yarn 4 workspaces.
 
## Tech Stack
- Frontend: Vue 3 (Composition API, <script setup>), Vite, Pinia
- Backend: Node.js, Express, Prisma ORM (SQLite dev / PostgreSQL prod)
- Language: TypeScript strict mode everywhere. Zero `any` types.
- Editor: Monaco Editor for Code Mode
- Validation: Zod for all runtime schemas
- Real-time: Y.js for collaboration
- Styling: CSS Modules (editor UI), Tailwind (generated code output)
- Testing: Vitest + Vue Test Utils + Playwright (e2e)
 
## Monorepo Structure
- apps/buildev-frontend/ → @buildev/editor (Vue 3 visual builder)
- apps/buildev-backend/  → @buildev/api (Express REST API)
- packages/core/         → @buildev/core (shared types, Zod schemas, AST)
- packages/sdk/          → @buildev/sdk (SDK for external projects)
- packages/codegen/      → @buildev/codegen (AST → React/Vue/Svelte/HTML)
- packages/ai-engine/    → @buildev/ai-engine (multi-LLM BYOK)
- packages/collab/       → @buildev/collab (Y.js real-time)
 
## Commands
- `yarn dev` → starts editor + api concurrently
- `yarn build` → builds all workspaces
- `yarn lint` → linting across all packages
- `yarn typecheck` → tsc --noEmit across all packages
- `yarn test` → Vitest across all packages
- `yarn test:e2e` → Playwright e2e tests
 
## Coding Rules (MUST FOLLOW)
- NEVER use `any`. Use `unknown` + type guards or proper generics.
- NEVER use default exports. Always named exports.
- NEVER commit console.log. Use a telemetry logger if available.
- NEVER modify files in packages/core/src/ast/ without updating the Zod schema AND the codegen targets simultaneously.
- All new components: Vue 3 <script setup lang="ts"> only.
- All new API routes: Zod validation on request body/params.
- All public functions: JSDoc with @param and @returns.
- File max: 300 lines. Extract if longer.
- Imports: group by (1) node builtins (2) deps (3) @buildev/* (4) relative
 
## Git Workflow
- Conventional Commits: feat:, fix:, docs:, chore:, refactor:, test:
- Branch naming: feat/short-desc, fix/short-desc, chore/short-desc
- NEVER commit directly to main. Always PR.
- Run `yarn lint && yarn typecheck && yarn test` before committing.
 
## Architecture Docs (read when relevant)
- docs/agent/ast-schema.md → The AST node types and how codegen uses them
- docs/agent/ai-engine.md → How BYOK multi-LLM integration works
- docs/agent/canvas.md → How the visual canvas renders and handles DnD
- docs/agent/codegen.md → How AST converts to framework-specific code
- docs/agent/testing.md → Testing strategy and patterns
 
## When Compacting
Preserve: current task, list of modified files, test status, open issues.
