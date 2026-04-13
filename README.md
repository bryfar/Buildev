# Buildev — Open Source AI Web Builder ✨

![Buildev Banner](/Portada.png)

> The VS Code of web builders. Design visually. Export clean code.
> **Open source, AI-native, multi-framework, zero vendor lock-in.**

[![CI Status](https://img.shields.io/badge/CI-passing-success?style=flat-square)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Stars](https://img.shields.io/github/stars/bryfar/buildev?style=flat-square)](#)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue?style=flat-square)](./SECURITY.md)
[![Code of Conduct](https://img.shields.io/badge/Community-Code%20of%20Conduct-green?style=flat-square)](./CODE_OF_CONDUCT.md)

## ⚡ Why Buildev?

| Feature | Webflow | Framer | V0 / Lovable | **Buildev** |
| :--- | :---: | :---: | :---: | :---: |
| **Open Source** | ✗ | ✗ | ✗ | **✅ MIT** |
| **Visual Editor** | ✅ | ✅ | ✗ | **✅** |
| **AI Vision (Img-to-Code)** | ✗ | ✗ | ✅ | **✅** |
| **Clean Export** | ✗ | ✗ | ✅ (React) | **✅ (React/Vue/HTML)** |
| **BYOK AI** | ✗ | ✗ | ✗ | **✅** |
| **GitHub Sync** | Parcial | ✗ | ✗ | **✅ Native** |
| **Price** | $29+/mo | $15+/mo | $20+/mo | **$0 (Self-host)** |

---

## 🚀 Quick Start

```bash
# Clone and install in < 2 minutes
git clone https://github.com/bryfar/buildev.git
cd buildev
corepack yarn install

# Terminal 1 (frontend)
corepack yarn dev:editor

# Terminal 2 (backend)
corepack yarn dev:backend
```

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fbryfar%2Fbuildev)
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com)

---

## ▲ Deploy Frontend on Vercel

The repo includes a root [`vercel.json`](./vercel.json) so Vercel can build from the **repository root** (Vite needs `index.html` inside `apps/buildev-frontend`).

**Option A — Root directory = repo root (default)**

1. Import the repository in Vercel and leave **Root Directory** empty (or `.`).
2. Do not override Install / Build / Output in the dashboard (the root `vercel.json` sets them).
3. Add `VITE_API_URL` = your deployed backend URL, then redeploy.

**Option B — Root directory = `apps/buildev-frontend`**

1. Set **Root Directory** to `apps/buildev-frontend`.
2. **Build Command**: `corepack yarn build` · **Output Directory**: `dist`
3. Add `VITE_API_URL` as above.

You can copy `apps/buildev-frontend/.env.example` for local development.

---

## 🧭 Understand Buildev Fast

If you are new, read in this order:

1. [CONTRIBUTING.md](./CONTRIBUTING.md) for setup and project flow map
2. [AGENTS.md](./AGENTS.md) for coding constraints and architecture context
3. [CLAUDE.md](./CLAUDE.md) for workspace structure and standards
4. `docs/agent/*.md` for deep architecture details

---

## 🛠️ Key Capabilities

- **✨ AI Vision Scanner**: Drop a screenshot and convert it into editable `BuildevNode` AST nodes instantly.
- **🏗️ Multi-Framework Codegen**: Generate high-fidelity code for **React**, **Vue 3**, or plain **HTML/CSS**.
- **🧩 Project-Type Dashboard**: Each project opens dashboard mode by type (`landing`, `multisite`, `cms`).
- **📰 CMS Sidebar Navigation**: CMS projects include grouped navigation for Content, Manage, and Admin sections.
- **🎨 Reusable Design Systems**: Create a design system once, reuse it across projects, and preview components before publishing.
- **🔌 Marketing and CRM Plugins**: Install integrations for Google marketing apps and CRM platforms per project.
- **📡 Developer Sync**: Native GitHub integration. Sync your design directly as code in your favorite repository.
- **🤖 Agent-First Architecture**: Built for humans and AIs. Includes `.claude/`, `.opencode/`, and standardized `skills/` for AI agents.
- **🔌 MCP Ready**: Model Context Protocol server integrated for automated site building via natural language.

---

## 📦 Monorepo Structure

- `apps/editor`: The core visual builder (Vue 3, Pinia, Monaco).
- `apps/api`: The orchestration layer (Express, Prisma, GitHub OAuth).
- `packages/core`: The single source of truth (AST Schema, Zod).
- `packages/codegen`: The translation engine (AST -> Framework).
- `packages/ai-engine`: High-fidelity vision and chat processing (BYOK).
- `packages/mcp-server`: AI-to-Editor automation interface.

---

## 🤝 Contributing

We are an "Agent-First" project. Whether you are a human or an AI agent, please check our [AGENTS.md](./AGENTS.md) and [CONTRIBUTING.md](./CONTRIBUTING.md) to get started.

The contributing guide now includes:
- quick path for users that only want to run Buildev
- quick path for contributors
- installation and project flow diagram (Landing page, Multisitio, CMS, and CMS Astro policy)

### AI Agent Onboarding
If you are an AI assistant, start by reading the [skills/](./skills/) directory to learn about our architecture and how to create new components.

### Open Source Project Docs
- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Security Policy](./SECURITY.md)
- [Governance](./GOVERNANCE.md)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Built with ❤️ by the Buildev Team**
