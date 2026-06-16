---
name: impeccable
description: Use when validating Buildev designs against design system rules — checking spacing, color contrast, typography scale, and layout consistency with 44 deterministic detectors.
---

# Impeccable

Integrate [Impeccable](https://github.com/pbakaus/impeccable) (38.9k ★) — a behavioral design system checker with 44 deterministic detectors. Acts as a linting layer for Buildev designs, catching spacing violations, color contrast issues, typography drift, and layout inconsistencies before they ship.

## When to Use

- Post-refine validation: after `op design:refine`, run Impeccable
- CI gate: prevent designs with design system violations from merging
- Design token audit: verify that all nodes use defined variables and roles
- Preventing "design slop" — inconsistent spacing, wrong colors, broken layouts

## Integration

```bash
npm install -D impeccable
# or
pip install impeccable
```

```typescript
import { Impeccable } from "impeccable";

const checker = new Impeccable({
  // Buildev design system tokens
  tokens: {
    spacing: [4, 8, 12, 16, 24, 32, 48, 64, 80],
    colors: {
      primary: "#111111",
      secondary: "#6B7280",
      background: "#FFFFFF",
      surface: "#F9FAFB",
      border: "#E5E7EB",
    },
    fontSizes: [13, 14, 15, 16, 18, 20, 24, 28, 36, 40, 56],
    cornerRadii: [0, 4, 8, 10, 12, 16, 24],
  },
  detectors: {
    spacing: true,      // Are gaps/padding on 8px grid?
    contrast: true,     // WCAG AA minimum (4.5:1)
    typography: true,   // Font sizes in scale?
    colors: true,       // All colors from token set?
    layout: true,       // No orphaned nodes?
  },
});

// Export Buildev tree and check
const tree = await cli.get({ depth: 10 });
const results = checker.run(tree);

results.violations.forEach(v => {
  console.log(`[${v.severity}] ${v.detector}: ${v.message}`);
  // Example: [error] spacing: Button "cta" has gap=18, nearest token is 16 or 24
});
```

## Buildev × Impeccable Workflow

```
op insert ... → op design:refine
                    │
                    ▼
              impeccable run
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
    No violations          Violations found
         │                     │
    deploy              agent re-design
                        with violation context
                              │
                              ▼
                        op design:refine
                              │
                              ▼
                        impeccable run (retry)
```

### Example: Loop Until Clean

```bash
#!/bin/bash
MAX_RETRIES=3
for i in $(seq 1 $MAX_RETRIES); do
  op design:refine --root-id "$ROOT"
  npx impeccable run --json > violations.json
  if [ "$(cat violations.json | jq '.violations | length')" -eq "0" ]; then
    echo "Design passed impeccable!"
    exit 0
  fi
  echo "Retry $i: $(jq '.violations | length' violations.json) violations"
  cat violations.json | op design:refine --root-id "$ROOT" --fix-violations
done
```

## 44 Detectors Overview

| Category | Detectors |
|---|---|
| **Spacing** | 8px grid alignment, consistent gap siblings, padding symmetry |
| **Color** | Token-only usage, WCAG contrast ratio, background/text pairing |
| **Typography** | Font size scale membership, line-height ratios, weight + size pairing |
| **Layout** | No overlapping nodes, fill_container sibling consistency, max width caps |
| **Interactive** | Min touch target (44px), hover state present, focus indicator |
| **Accessibility** | Alt text on images, label-for-input associations, color-not-only-indicator |

## Reference

- Repository: https://github.com/pbakaus/impeccable
- Run after every `op design:refine` before marking design complete
