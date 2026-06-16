---
name: codeburn
description: Use when monitoring token usage, API costs, and agent efficiency across Buildev design sessions to prevent runaway spending.
---

# CodeBurn

Integrate [CodeBurn](https://github.com/getagentseal/codeburn) (8k ★) for token observability and cost tracking across Buildev design sessions. Monitors every CLI command, MCP call, and agent interaction — surfacing cost-per-design and identifying expensive patterns.

## When to Use

- Tracking cost of AI-generated designs (token burn per layout)
- Identifying expensive agent loops (e.g., repeated refine passes)
- Setting budget caps per design session
- Comparing efficiency of design approaches (insert vs DSL vs MCP)

## Integration

```bash
npm install -g codeburn
# or
pip install codeburn
```

```bash
# Start monitoring Buildev CLI
codeburn monitor --watch "op" --log ./codeburn-logs/

# Run your design workflow
op insert --parent "$ROOT" '{"type":"frame","role":"hero"}'
op design:refine --root-id "$ROOT"

# Get cost report
codeburn report --period session --format table
```

## Buildev × CodeBurn Dashboard

```
┌────────────────────────────────────────────┐
│  CodeBurn — Buildev Session Cost Report     │
├────────────────────────────────────────────┤
│  Session: landing-page-v3                   │
│  Duration: 12m 34s                          │
│  Total Tokens: 142,830                      │
│  Estimated Cost: $2.14                      │
│                                             │
│  Top Operations:                            │
│  ┌────────────────────────────┬───────┬────┐│
│  │ Op                         │Tokens │$   ││
│  ├────────────────────────────┼───────┼────┤│
│  │ design:refine (3×)         │ 84,200│$1.26││
│  │ design:content (5×)        │ 38,400│$0.58││
│  │ insert (12×)               │ 12,830│$0.19││
│  │ get / read-nodes (8×)      │  7,400│$0.11││
│  └────────────────────────────┴───────┴────┘│
│                                             │
│  ⚠ Expensive pattern: 3 refine passes       │
│    without content changes between them      │
└────────────────────────────────────────────┘
```

## Budget Alerts

```json
{
  "codeburn": {
    "alerts": {
      "perSession": { "maxTokens": 200000, "action": "warn" },
      "perRefine": { "maxTokens": 50000, "action": "block" },
      "dailyBudget": { "maxUSD": 10.00, "action": "pause" }
    },
    "buildevConfig": {
      "endpoint": "http://127.0.0.1:59080",
      "trackCommands": ["op", "npx impeccable", "eval-view"]
    }
  }
}
```

### Example: Cost-Aware Agent Loop

```bash
#!/bin/bash
MAX_COST=5.00  # $5 budget per session

codeburn monitor --watch "op" --daemon

for iteration in 1 2 3; do
  op design:refine --root-id "$ROOT"
  COST=$(codeburn report --period session --json | jq '.cost')
  
  if (( $(echo "$COST > $MAX_COST" | bc -l) )); then
    echo "✖ Budget exceeded ($COST > $MAX_COST) — stopping"
    codeburn alert "Design session exceeded budget"
    break
  fi
  
  echo "✓ Iteration $iteration complete. Running cost: $COST"
done

codeburn monitor --stop
```

## Reference

- Repository: https://github.com/getagentseal/codeburn
- Critical for production Buildev pipelines with high agent activity
- Add `codeburn monitor --daemon` at the start of every design session
