---
name: lastest
description: Use when performing visual regression testing and WCAG accessibility audits on Buildev-generated designs with Playwright.
---

# Lastest

Integrate [Lastest](https://github.com/las-team/lastest) (8 ★) for Playwright-based visual regression and WCAG accessibility audits on Buildev designs. Provides automated QA reviewer that checks pixel-level fidelity and accessibility compliance.

## When to Use

- Verifying Buildev-generated designs match Figma/design-token specs
- WCAG AA/AAA compliance checks on agent-generated layouts
- Automated visual QA in CI/CD after `op design:refine`
- Cross-browser rendering validation for generated HTML/CSS

## Integration

```bash
npm install -D lastest
# or
pip install lastest
```

```typescript
import { lastest } from "lastest";

const qa = await lastest({
  url: "http://127.0.0.1:59080/preview",
  viewport: { width: 1200, height: 900 },
});

// Visual snapshot comparison
const visualDiff = await qa.snapshot("landing-page", {
  threshold: 0.001, // pixel-level
});

// WCAG audit
const a11y = await qa.accessibility({
  standard: "WCAG2AA",
  include: ["#canvas-root"],
});

console.log(`Visual diff: ${visualDiff.pct}%`);
console.log(`A11y violations: ${a11y.violations.length}`);
```

## Buildev × Lastest QA Pipeline

```
op design:refine --root-id "$ROOT"
      │
      ▼
lastest snapshot "design-v1"
      │
      ▼
lastest a11y --standard WCAG2AA
      │
      ├── ✖ Violations found? → Agent fixes specific violations
      └── ✔ Pass → Deploy
```

### Example: Auto-Fix WCAG Violations

```bash
# Run QA
npx lastest a11y --json > violations.json

# Feed violations back to Buildev agent for auto-fix
cat violations.json | op design:refine --root-id "$ROOT" --fix-a11y
```

## Configuration

```json
{
  "lastest": {
    "viewport": { "width": 1200, "height": 900 },
    "snapshotDir": "./visual-baselines",
    "buildevEndpoint": "http://127.0.0.1:59080",
    "a11y": {
      "standard": "WCAG2AA",
      "include": ["#canvas-root"]
    }
  }
}
```

## Reference

- Repository: https://github.com/las-team/lastest
- Combines Playwright visual diffs + axe-core accessibility audits
