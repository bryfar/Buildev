# Buildev — Open Source AI Web Builder ✨

![Buildev Banner](/Portada.png)

> The VS Code of web builders. Design visually. Export clean code.
> **Open source, AI-native, multi-framework, zero vendor lock-in.**

[![CI Status](https://img.shields.io/badge/CI-passing-success?style=flat-square)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Stars](https://img.shields.io/github/stars/bryfar/buildev?style=flat-square)](#)

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
cd buildev && yarn install
yarn dev
```

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fbryfar%2Fbuildev)
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com)

---

## 🛠️ Key Capabilities

- **✨ AI Vision Scanner**: Drop a screenshot and convert it into editable `BuildevNode` AST nodes instantly.
- **🏗️ Multi-Framework Codegen**: Generate high-fidelity code for **React**, **Vue 3**, or plain **HTML/CSS**.
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

### AI Agent Onboarding
If you are an AI assistant, start by reading the [skills/](./skills/) directory to learn about our architecture and how to create new components.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Built with ❤️ by the Buildev Team**
