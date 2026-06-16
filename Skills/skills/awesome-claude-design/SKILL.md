---
name: awesome-claude-design
description: Use when scaffolding new design systems, referencing DESIGN.md patterns, or generating production-ready design specs for Buildev.
---

# Awesome Claude Design

Integrate [Awesome Claude Design](https://github.com/VoltAgent/awesome-claude-design) (2.7k ★) — a library of 68 `DESIGN.md` templates covering every UI pattern from landing pages to data dashboards. Use as the design intelligence source for Buildev agent prompts.

## When to Use

- Scaffolding a new design system from scratch (DESIGN.md as seed)
- Generating production-ready design specs for Buildev agents
- Need battle-tested layout patterns (auth flows, pricing tables, data grids)
- Creating consistent multi-page design systems

## Integration

```bash
git clone https://github.com/VoltAgent/awesome-claude-design.git
# Or reference directly in agent prompts
```

### Seed a Buildev Design from a DESIGN.md Template

```
1. Pick a template from awesome-claude-design/templates/
2. Feed the DESIGN.md content to the agent
3. Agent translates layout specs into Buildev PenNode JSON
4. Execute via `op insert --parent` or batch DSL
```

### Example: Pricing Page from DESIGN.md

```markdown
---
design: pricing-page
layout: 1200px, vertical sections
sections:
  - header: h1 + subtitle
  - toggle: monthly/yearly (optional)
  - grid: 3 cards, horizontal, equal width
---

Agent, translate this into Buildev:

ROOT=$(op insert '{"type":"frame","width":1200,"layout":"vertical"}' | ID)
HEADER=$(op insert --parent "$ROOT" '{"type":"frame","role":"section","layout":"vertical","padding":[80,80,48],"gap":16,"alignItems":"center"}' | ID)
op insert --parent "$HEADER" '{"type":"text","role":"heading","content":"Simple Pricing"}'
op insert --parent "$HEADER" '{"type":"text","role":"body-text","content":"Start free, scale as you grow."}'
GRID=$(op insert --parent "$ROOT" '{"type":"frame","layout":"horizontal","padding":[0,80],"gap":24}' | ID)
# ... insert 3 pricing cards
```

## Reference

- Repository: https://github.com/VoltAgent/awesome-claude-design
- 68 design templates organized by category (landing, dashboard, auth, e-commerce, etc.)
- Each template is a standalone `DESIGN.md` consumable by any AI agent
