# Buildev Skills

<p>
  <a href="./README.md"><b>English</b></a> · <a href="./README.zh.md">简体中文</a> · <a href="./README.zh-TW.md">繁體中文</a> · <a href="./README.ja.md">日本語</a> · <a href="./README.ko.md">한국어</a> · <a href="./README.fr.md">Français</a> · <a href="./README.es.md">Español</a> · <a href="./README.de.md">Deutsch</a> · <a href="./README.pt.md">Português</a> · <a href="./README.ru.md">Русский</a>
</p>

LLM skill for designing with Buildev — teaches AI agents to use the `op` CLI, batch design DSL, MCP tools, and design best practices.

Follows the [agentskills.io](https://agentskills.io/specification) specification.

## Prerequisites

Install the `op` CLI before using this skill:

```bash
npm install -g @bryfar/buildev
```

Ensure a running Buildev instance (desktop app or web server) for `op` to connect to.

## Installation

> **Note:** Installation differs by platform. Claude Code and Cursor have built-in plugin systems. Codex and OpenCode require manual setup.

### Claude Code (Plugin Marketplace)

Register the marketplace, then install the plugin:

```
/plugin marketplace add bryfar/buildev-skills
/plugin install buildev-skills@buildev-skills
```

### Cursor

In Cursor Agent chat:

```
/add-plugin buildev-skills
```

Or search for "buildev" in the plugin marketplace.

### Codex

Tell Codex:

```
Fetch and follow instructions from https://raw.githubusercontent.com/bryfar/buildev-skills/main/.codex/INSTALL.md
```

### OpenCode

Tell OpenCode:

```
Fetch and follow instructions from https://raw.githubusercontent.com/bryfar/buildev-skills/main/.opencode/INSTALL.md
```

### Gemini CLI

```bash
gemini extensions install https://github.com/bryfar/buildev-skills
```

To update:

```bash
gemini extensions update buildev-skills
```

## Verify Installation

Start a new session and ask to design something with Buildev (e.g., "design a landing page using op CLI"). The agent should automatically use the skill to generate PenNode JSON via the `op` CLI or MCP tools.

## What's Included

- `op` CLI command reference (app control, document ops, nodes, import, layout, pages, variables, codegen)
- Batch Design DSL syntax with full landing page example
- PenNode schema — all node types (frame, rectangle, ellipse, polygon, text, path, image, icon_font, ref, line, group), properties, fills
- 40+ semantic roles with smart defaults
- Design principles — typography, color, spacing, shadows
- Layout engine rules and sizing decisions
- Layered MCP workflow (skeleton → content → refine)
- Codegen pipeline (plan → submit → assemble → clean)
- Import support (SVG, Figma .fig files)
- Common patterns — navbar, hero, cards, forms, footer
- Common mistakes table

## License

MIT