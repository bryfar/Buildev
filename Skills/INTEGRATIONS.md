# Buildev Integrations — Ecosystem Map

Buildev design skills integrate with 11 external tools to form a complete design-ops pipeline. Each tool occupies a specific layer:

```
                     ┌─────────────────────────────┐
                     │      Superpowers             │
                     │  (Methodology — PLAN→EXECUTE→│
                     │   VERIFY→REVIEW→SHIP)        │
                     └──────────┬──────────────────┘
                                │
┌───────────────────────────────┼───────────────────────────────┐
│                    DESIGN LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Awesome-Claude│  │  Buildev     │  │  Taste-Skill     │   │
│  │ Design        │──▶│  Design      │──▶│  (Aesthetic QA)  │   │
│  │ (Templates)   │  │  (Core)      │  └──────────────────┘   │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
                                │
┌───────────────────────────────┼───────────────────────────────┐
│                     QA LAYER                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │Impeccable│  │Eval-View │  │ Lastest  │  │Browser-      │ │
│  │(Design   │  │(Visual   │  │(A11y +   │  │Harness       │ │
│  │ Lint)    │  │Regress)  │  │Visual)   │  │(Browser QA)  │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
┌───────────────────────────────┼───────────────────────────────┐
│                INFRA LAYER                                   │
│  ┌──────────────┐  ┌──────────┐  ┌────────┐  ┌──────────┐   │
│  │  Goose       │  │Deep      │  │Graphify│  │CodeBurn  │   │
│  │  (Orchestrate)│  │Agents    │  │(Knowl. │  │(Cost     │   │
│  │              │  │(Memory)  │  │ Graph) │  │ Monitor) │   │
│  └──────────────┘  └──────────┘  └────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Quick Reference

| # | Tool | Layer | Stars | Purpose | When to Use |
|---|------|-------|-------|---------|-------------|
| 1 | **Goose** | Infra | 49.6k | Multi-agent orchestration, MCP routing | Parallel design agents, pipeline automation |
| 2 | **Deep Agents** | Infra | 24.7k | Context compression, memory pagination | Long sessions, multi-page designs, iterative refine |
| 3 | **Eval-View** | QA | 116 | Visual regression testing, screenshot diffs | CI gate, catching agent-induced layout drift |
| 4 | **Lastest** | QA | 8 | Playwright visual + WCAG a11y audits | Accessible designs, cross-browser rendering |
| 5 | **Graphify** | Infra | 68.2k | Knowledge graph for design-code traceability | Design system audits, dependency mapping |
| 6 | **Awesome Claude Design** | Design | 2.7k | 68 DESIGN.md templates for layout patterns | Scaffolding new pages, design system seed |
| 7 | **Impeccable** | QA | 38.9k | 44 deterministic design system detectors | Post-refine validation, design linting |
| 8 | **Taste Skill** | Design | 45.2k | Anti-slop aesthetic rules, visual hierarchy | Final aesthetic gate before shipping |
| 9 | **Superpowers** | All | 230k | Development methodology for agents | Planning sessions, structured design sprints |
| 10 | **CodeBurn** | Infra | 8k | Token usage + cost observability | Production pipelines, budget enforcement |
| 11 | **Browser Harness** | QA | 15k | Browser automation via CDP | Codegen output verification, responsive testing |

## Recommended Agent Workflow (Full Stack)

```
────────────────────────────────────────────────────────────
  STEP  │ TOOL(S)         │ ACTIVITY
────────────────────────────────────────────────────────────
  1     │ Superpowers     │ Write design brief (PLAN phase)
  2     │ Awesome-Claude  │ Pick matching DESIGN.md template
  3     │ Buildev CLI     │ op design:skeleton → content → refine
  4     │ Impeccable      │ Run 44 detectors on design tree
  5     │ Taste-Skill     │ Apply aesthetic rules, check hierarchy
  6     │ Eval-View       │ Compare against visual baseline
  7     │ Lastest         │ WCAG accessibility audit
  8     │ Browser-Harness │ Open codegen output in real browser
  9     │ CodeBurn        │ Review session cost report
  10    │ Superpowers     │ Run REVIEW checklist, then SHIP
────────────────────────────────────────────────────────────
  Throughout:
    Goose       → Orchestrate parallel agents
    Deep Agents → Keep context compressed across long sessions
    Graphify    → Map design → code dependencies
────────────────────────────────────────────────────────────
```

## Installation Priority

1. **Core**: `op` CLI (`apps/cli/dist/buildev-cli.cjs`)
2. **Essential QA**: `impeccable`, `taste-skill` rules
3. **CI Pipeline**: `eval-view`, `lastest`, `browser-harness`
4. **Scale**: `goose`, `deep-agents`, `graphify`
5. **Production**: `codeburn`, `superpowers`
