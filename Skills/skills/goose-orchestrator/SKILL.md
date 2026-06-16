---
name: goose-orchestrator
description: Use when orchestrating multi-agent design workflows with Goose — running agents in parallel, chaining Buildev design passes, or coordinating MCP tool calls across sub-agents.
---

# Goose Orchestrator

Integrate [Goose](https://github.com/aaif-goose/goose) (49.6k ★) as the orchestration layer for Buildev design pipelines. Goose manages sub-agent lifecycles, MCP-based tool routing, and parallel task execution — making it the ideal conductor for complex multi-step design workflows.

## When to Use

- Running multiple design agents in parallel (e.g., hero, footer, form simultaneously)
- Chaining Buildev CLI commands across agent handoffs
- Coordinating MCP tools from `buildev-design` with external tool calls
- Managing long-running design sessions with state persistence

## Integration Setup

```bash
# Install Goose (standalone binary)
go install github.com/aaif-goose/goose@latest

# Or via npm (if published)
npm install -g @aaif-goose/goose
```

Configure Goose to discover Buildev MCP servers:

```json
{
  "mcpServers": {
    "buildev-design": {
      "command": "op",
      "args": ["mcp"],
      "env": {
        "BUILDEV_HOST": "http://127.0.0.1:59080"
      }
    }
  }
}
```

## Buildev × Goose Workflow

```
                  ┌──────────────────┐
                  │  Goose Orchestrator  │
                  └────────┬─────────┘
                           │
          ┌────────┬───────┼───────┬────────┐
          ▼        ▼       ▼       ▼        ▼
      Agent 1   Agent 2  Agent 3  ...   Agent N
    (skeleton) (content) (refine)     (codegen)
          │        │       │       │        │
          └────────┴───────┼───────┴────────┘
                           │
                    ┌──────▼──────┐
                    │  Buildev MCP │
                    │  (port 59080)│
                    └─────────────┘
```

### Example: Parallel Design Pipeline

```yaml
# goose-pipeline.yaml
pipeline:
  - step: "Generate skeleton"
    agent: skeleton-agent
    tool: "buildev-design"
    action: "design_skeleton"
    params:
      sections: ["hero", "features", "footer"]

  - step: "Populate content (parallel)"
    agents:
      - name: hero-content
        tool: "buildev-design"
        action: "design_content"
        params: { section: "hero", tone: "bold" }
      - name: features-content
        tool: "buildev-design"
        action: "design_content"
        params: { section: "features", tone: "informative" }
      - name: footer-content
        tool: "buildev-design"
        action: "design_content"
        params: { section: "footer", tone: "minimal" }

  - step: "Validate and fix"
    agent: refine-agent
    tool: "buildev-design"
    action: "design_refine"

  - step: "Codegen"
    agent: codegen-agent
    tool: "buildev-design"
    action: "codegen_assemble"
    params: { framework: "react" }
```

## Key Benefits for Buildev

| Capability | Without Goose | With Goose |
|---|---|---|
| Parallel design passes | Manual sequential | Auto-parallel across agents |
| Error recovery | Manual retry | Automatic retry + rollback |
| State persistence | Ephemeral session | Persistent orchestration state |
| Multi-tool coordination | Manual | Declarative pipeline YAML |

## Reference

- Repository: https://github.com/aaif-goose/goose
- Buildev MCP port: `59080`
- Buildev CLI binary: `apps/cli/dist/buildev-cli.cjs`
