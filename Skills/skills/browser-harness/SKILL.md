---
name: browser-harness
description: Use when testing Buildev-generated codegen output in real browsers — simulating clicks, verifying responsive layouts, and capturing screenshots via CDP.
---

# Browser Harness

Integrate [Browser Harness](https://github.com/browser-use/browser-harness) (15k ★) for browser-based QA of Buildev codegen output. Controls real browser instances via Chrome DevTools Protocol (CDP) to verify that generated React/HTML renders correctly across viewports.

## When to Use

- After `op codegen:assemble` — verify output renders correctly
- Responsive design testing (mobile, tablet, desktop breakpoints)
- Interaction testing (button hover, form focus, navigation clicks)
- Screenshot capture for regression baselines

## Integration

```bash
pip install browser-harness
# or
go install github.com/browser-use/browser-harness@latest
# or
npm install browser-harness
```

```typescript
import { Harness } from "browser-harness";

const browser = await Harness.launch({
  headless: false,
  viewport: { width: 375, height: 812 }, // mobile
  cdpPort: 9222,
});

// Navigate to Buildev codegen preview
await browser.navigate("http://localhost:3000/preview");

// Verify responsive behavior
const desktop = await browser.screenshot({ viewport: { width: 1200, height: 900 }});
const mobile = await browser.screenshot({ viewport: { width: 375, height: 812 }});
const tablet = await browser.screenshot({ viewport: { width: 768, height: 1024 }});

// Interaction tests
await browser.click('[role="button"]:contains("Get Started")');
await browser.waitFor('[role="dialog"]');
const modalVisible = await browser.isVisible('[role="dialog"]');

console.log({ desktop, mobile, tablet, modalVisible });
```

## Buildev × Browser Harness Workflow

```
op codegen:assemble --framework react
      │
      ▼
Browser Harness open "http://localhost:3000/preview"
      │
      ├── Screenshot: desktop (1200px)
      ├── Screenshot: tablet  (768px)
      ├── Screenshot: mobile  (375px)
      │
      ├── Click CTA → verify modal opens
      ├── Tab through form → verify focus order
      ├── Resize → verify responsive breakpoints
      │
      └── ❌ Any failure → report to agent for fix
```

### Example: Codegen QA Script

```bash
#!/bin/bash
# Generate code
op codegen:plan '{"framework":"react","rootIds":["$ROOT"],"options":{"tailwind":true}}'
op codegen:assemble --framework react > output.html

# Open in browser harness
browser-harness open output.html --viewport 1200x900
browser-harness screenshot --output desktop.png

# Test interactivity
browser-harness click "button:contains('Sign In')"
browser-harness assert visible ".error-message" --expect false

# Responsive check
browser-harness resize 375 812
browser-harness screenshot --output mobile.png

# Compare with lastest baseline
lastest compare --baseline mobile-baseline.png --current mobile.png
```

## Configuration

```json
{
  "browser-harness": {
    "viewport": { "width": 1200, "height": 900 },
    "breakpoints": [
      { "name": "desktop", "width": 1200, "height": 900 },
      { "name": "tablet",  "width": 768,  "height": 1024 },
      { "name": "mobile",  "width": 375,  "height": 812 }
    ],
    "cdpPort": 9222,
    "screenshotDir": "./browser-screenshots"
  }
}
```

## Reference

- Repository: https://github.com/browser-use/browser-harness
- Use after codegen to verify rendered output before deploying
- Pairs with Lastest for visual regression baselines
