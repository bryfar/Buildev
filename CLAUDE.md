# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AetherSite Builder Pro — an AI-powered responsive web builder (similar to Figma/v0). Users create projects, add visual elements to a canvas, edit properties via an inspector, and export generated code (HTML or React/Next.js).

## Commands

- `pnpm dev` — start Next.js dev server
- `pnpm build` — production build (TypeScript errors are ignored via `next.config.mjs`)
- `pnpm lint` — run ESLint
- `pnpm start` — serve production build

Package manager is **pnpm** (see `pnpm-lock.yaml`).

## Tech Stack

- **Next.js 16** (App Router) with React 19, TypeScript (strict mode off)
- **Tailwind CSS v4** with `tw-animate-css`, configured via `@tailwindcss/postcss`
- **Zustand** for client-side state management (single store)
- **Vercel AI SDK** (`ai` + `@ai-sdk/anthropic`) for AI component generation
- **Zod** for schema validation (API route)
- **Radix UI** primitives + **shadcn/ui** pattern (CSS variables in `globals.css`, `cn()` utility)
- **lucide-react** for icons
- Dark theme by default (`<html class="dark">`)

## Architecture

### Data Flow

All client state lives in a single Zustand store ([lib/store.ts](lib/store.ts)). There is no persistence layer — state resets on refresh. The store manages:
- **Projects** → each has **Pages** → each has **SiteElements** (tree with `children`/`parentId`)
- Editor state: selected element, active breakpoint, zoom, pan

### Key Layers

1. **Dashboard** ([app/dashboard.tsx](app/dashboard.tsx)) — project list/creation. When a project is open, renders the Editor.
2. **Editor** ([app/editor/EditorView.tsx](app/editor/EditorView.tsx)) — main workspace with four view modes: design, prototype, code, preview. Only design and code are implemented.
   - [Canvas.tsx](app/editor/Canvas.tsx) — renders elements on a mobile-viewport canvas with zoom/pan
   - [LeftSidebar.tsx](app/editor/LeftSidebar.tsx) — panels: Layers, Config (renders AssetsPanel), Assets, AI Assistant
   - [RightSidebar.tsx](app/editor/RightSidebar.tsx) — breakpoint switcher + element inspector
   - [CodePreview.tsx](app/editor/CodePreview.tsx) — displays generated HTML/JSX from current page
3. **Code Generation** ([lib/codeGenerator.ts](lib/codeGenerator.ts)) — converts `Page`/`SiteElement` trees to HTML or React components, generates CSS with responsive media queries
4. **AI Service** ([lib/aiService.ts](lib/aiService.ts)) — client-side helper that calls the API route. Includes pre-built `componentTemplates`.
5. **API Route** ([app/api/generate-component/route.ts](app/api/generate-component/route.ts)) — uses `generateObject` from Vercel AI SDK with Claude to produce structured component specs from natural language prompts. Requires `ANTHROPIC_API_KEY` env var.

### Type System

All domain types are in [lib/types.ts](lib/types.ts): `SiteElement`, `Page`, `Project`, `EditorState`, `BreakpointName` (mobile/tablet/desktop), `ResponsiveDelta`.

### Routing

Single-page app — `app/page.tsx` renders `Dashboard`, which conditionally shows `EditorView` when a project is open. No file-based routing beyond the root page and the API route.

## Conventions

- All UI components use `'use client'` directive
- Inline Tailwind classes with hardcoded dark-theme hex colors (`#0f0f0f`, `#1e1e1e`, `#2a2a2a`, `#0D99FF`)
- Path alias: `@/` maps to project root
- `cn()` utility in [lib/utils.ts](lib/utils.ts) for conditional class merging
