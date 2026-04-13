# Contributing to Buildev

Thanks for helping improve Buildev.

## Outline

- [1) Quick paths](#1-quick-paths)
- [2) Installation and project flow map](#2-installation-and-project-flow-map)
- [3) Setup for contributors](#3-setup-for-contributors)
- [4) Contribution workflow](#4-contribution-workflow)
- [5) Coding rules](#5-coding-rules)
- [6) Help](#6-help)

## 1) Quick paths

### I only want to use Buildev

```bash
git clone https://github.com/bryfar/buildev.git
cd buildev
corepack yarn install

# Terminal 1
corepack yarn dev:editor

# Terminal 2
corepack yarn dev:backend
```

Then open the app and create a project from `New Project`.

### I want to contribute code

Use the same setup above, then follow sections 3, 4, and 5.

## 2) Installation and project flow map

This is the current process used in the project creation wizard, including CMS behavior inspired by EmDash.

```mermaid
flowchart TD
    A[Open New Project] --> B[Choose Mode: AI | Normal | Figma | Reverse]
    B --> C[Project Details Step]
    C --> D[Project Type: Landing page | Multisitio | CMS]
    D --> E[Frontend Stack]
    D --> F[Backend Stack]
    D --> G[CMS Provider]
    D --> H{Policy Engine}
    H -->|If type = CMS| I[Force frontend stack = Astro]
    H -->|Otherwise| J[Keep user stack selection]
    I --> K[Create Site Payload]
    J --> K[Create Site Payload]
    K --> L[Store creates site]
    L --> M[Open editor with project configuration]
```

Dashboard behavior by project type:

- `landing` and `multisite` open standard page-focused dashboard.
- `cms` opens CMS-focused dashboard with sidebar groups:
  - Content: Pages, Posts, Media
  - Manage: Menu, Redirects, Widgets, Sections, Categories, Tags, Bylines, Design System
  - Admin: Content Types, Users, Plugins, Import, Settings
- CMS design systems can be shared across projects and applied per project from dashboard.
- CMS plugins include marketing and CRM integrations, installable per project.

## 3) Setup for contributors

```bash
# Install dependencies
corepack yarn install

# Run frontend + backend
corepack yarn dev:editor
corepack yarn dev:backend

# Quality checks
corepack yarn lint
corepack yarn typecheck
corepack yarn test
```

## 4) Contribution workflow

1. Fork the repository.
2. Create a branch: `git checkout -b feat/short-description`
3. Make changes.
4. Run lint, typecheck, and tests.
5. Commit with Conventional Commits, for example:
   - `feat: add CMS project type policy`
   - `fix: enforce Astro stack for CMS flow`
6. Open a PR with a clear summary and test plan.

## 5) Coding rules

Follow [AGENTS.md](./AGENTS.md) and [CLAUDE.md](./CLAUDE.md).

- TypeScript strict mode, no `any`
- Vue components with `<script setup lang="ts">`
- No default exports, use named exports
- Keep files focused and readable
- Use Zod validation in API routes

## 6) Help

If you get stuck, open a GitHub Discussion or Issue with:

- what you were trying to do
- steps to reproduce
- expected result vs current result

## Open Source Standards

- License: [MIT](./LICENSE)
- Community rules: [Code of Conduct](./CODE_OF_CONDUCT.md)
- Security handling: [Security Policy](./SECURITY.md)
- Maintainer model: [Governance](./GOVERNANCE.md)
