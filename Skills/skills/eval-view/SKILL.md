---
name: eval-view
description: Use when running regression tests against Buildev designs to catch agent-driven visual regressions and layout drift.
---

# Eval-View

Integrate [Eval-View](https://github.com/hidai25/eval-view) (116 ★) for regression testing AI-generated Buildev designs. Captures screenshot baselines of generated designs and flags visual drift introduced by agent edits, layout changes, or styling updates.

## When to Use

- CI/CD gate for Buildev design PRs
- Catching layout drift after refine passes
- Verifying that agent-generated designs match expected visual output
- Preventing regressions when updating design variables or themes

## Integration

```bash
pip install eval-view
# or
npm install eval-view
```

```bash
# Set up a baseline for a Buildev design
eval-view snapshot --name "login-page" \
  --url "http://127.0.0.1:59080/preview" \
  --selector "#canvas-root"

# Compare after agent modifies design
eval-view compare --baseline "login-page" \
  --threshold 0.02 \
  --output diff.png
```

## Buildev × Eval-View Workflow

```
┌──────────┐    ┌──────────┐    ┌──────────┐
│ Agent    │───▶│ Eval-View│───▶│  Pass?   │
│ modifies │    │ snapshot │    │  / Fail  │
│ design   │    │ compare  │    │          │
└──────────┘    └──────────┘    └─────┬────┘
                          ┌───────────┴───────────┐
                          ▼                       ▼
                    ✔ Approved            ✖ Agent retries
                      (deploy)             (re-design)
```

### Example: CI Gate

```yaml
# .github/workflows/design-regression.yml
jobs:
  regression:
    steps:
      - run: op start --web
      - run: op insert '<json>'  # Agent-generated design
      - run: eval-view compare --baseline "staging" --threshold 0.01
      - run: |
          if $FAILED; then
            op design:skeleton '{"sections":["hero"]}'  # Retry
            op design:refine --root-id "$ROOT"
            eval-view compare --baseline "staging"
          fi
```

## Configuration

```json
{
  "eval-view": {
    "threshold": 0.02,
    "baselineDir": "./design-baselines",
    "viewport": { "width": 1200, "height": 900 },
    "buildevEndpoint": "http://127.0.0.1:59080"
  }
}
```

## Reference

- Repository: https://github.com/hidai25/eval-view
- Use as CI gate after every `op design:refine`
