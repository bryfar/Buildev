# Buildev — OpenCode Instructions

Welcome, OpenAI Agent. You are assisting in the development of Buildev, a visual page builder.

## Rules for OpenCode
1. **Core Domain**: All visual elements are represented by the `BuildevNode` AST in `packages/core`. Do not bypass this schema.
2. **Framework Alignment**: Use Vue 3 Composition API (`<script setup>`) for the frontend and Express for the backend.
3. **Strictness**: Maintain 100% TypeScript strict coverage. No `any`.
4. **Versioning**: Use `Changesets` (run `yarn changeset` before committing changes that affect public APIs).

## Helpful Context
- **AST Reference**: `packages/core/src/ast/schema.ts`
- **UI System**: `apps/buildev-frontend/src/components/BSDesignSystem.vue`
- **AI Logic**: `packages/ai-engine/src/engine.ts`
