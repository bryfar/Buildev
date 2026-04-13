# Contributing to Buildev
 
Thank you for your interest in contributing to Buildev! We are building the most advanced open-source AI-web builder, and your help is invaluable.
 
## Getting Started
 
1. **Fork the repository** on GitHub.
2. **Clone your fork**: `git clone https://github.com/YOUR_USERNAME/Buildev.git`
3. **Install dependencies**: `yarn install`
4. **Create a branch**: `git checkout -b feat/your-feature-name`
5. **Make your changes** and commit using Conventional Commits.
6. **Push and open a PR**.
 
## Development Setup
 
```bash
# Start all packages in development mode
yarn dev
 
# Lint and typecheck
yarn lint
yarn typecheck
 
# Run tests
yarn test
```
 
## Coding Standards
 
We strictly follow the rules defined in [AGENTS.md](file:///c:/Users/bfarfan/buildev/AGENTS.md) and [CLAUDE.md](file:///c:/Users/bfarfan/buildev/CLAUDE.md).
 
- **TypeScript**: Strict mode is required. Avoid `any`.
- **Vue 3**: Use `<script setup lang="ts">` only.
- **Components**: Group by feature and follow the naming convention `BS[Name].vue`.
- **Commits**: Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.
 
## Need Help?
 
Join our Discord community or open a "Discussion" on GitHub. We are happy to help you get started!
