---
name: superpowers
description: Use when structuring agent-based design methodology — planning, executing, and reviewing Buildev designs with disciplined workflow patterns.
---

# Superpowers

Integrate [Superpowers](https://github.com/obra/superpowers) (230k ★) — a development methodology framework that imposes structured discipline on agent-driven workflows. Applies planning-first, test-after, review-before patterns to Buildev design sessions.

## When to Use

- Starting a new Buildev design project (planning phase)
- Imposing quality gates on agent output
- Teaching agents disciplined design methodology
- Running design sprints with formal review stages

## Core Methodology

```
 PLAN  →  EXECUTE  →  VERIFY  →  REVIEW  →  SHIP
  │          │          │          │          │
  │   design:skeleton   │          │          │
  │────────▶ design:content        │          │
  │──────────▶ design:refine       │          │
  │────────────▶ impeccable        │          │
  │────────────────▶ taste-skill   │          │
  │──────────────────▶ eval-view   │          │
  │────────────────────▶ ship      │          │
  ▼          ▼          ▼          ▼          ▼
```

## Superpowers Patterns for Buildev

### Pattern 1: Design Brief (PLAN)

Before any `op` command, write a design brief:

```markdown
## Design Brief
- **Purpose**: Landing page for AI coding tool
- **Tone**: Bold, technical, trustworthy
- **Sections**: Navbar, Hero, Features(3), Testimonials, CTA, Footer
- **Layout**: 1200px centered, vertical stack
- **Variables**: $primaryColor: #6366F1, $bg: #FFFFFF
- **Copy Style**: Direct, benefit-oriented, max 6-word headlines
```

### Pattern 2: One Change at a Time (EXECUTE)

```
✖ Do not: "Build me a full landing page with 6 sections"
✔ Do: "Insert the navbar. Verify. Insert the hero. Verify."
```

```bash
# Superpowers incremental workflow
STEP=1
echo "Step $STEP: Navbar"
NAV=$(op insert --parent "$ROOT" '{"type":"frame","role":"navbar"}' | ID)
op design:refine --root-id "$ROOT"
echo "→ Verified: $(op get --depth 2 | jq '.children[0].role')"

STEP=2
echo "Step $STEP: Hero"
HERO=$(op insert --parent "$ROOT" '{"type":"frame","role":"hero"}' | ID)
op design:refine --root-id "$ROOT"
echo "→ Verified: hero height = $(op read-nodes $HERO | jq '.height')"
```

### Pattern 3: Verify Then Proceed (VERIFY)

```bash
# After any insert/update, immediately verify
op insert --parent "$FORM" '{"type":"rectangle","role":"button","width":"fill_container","height":50}'

# Verify: does the button exist at the right position?
BUTTON_ID=$(op get --depth 3 | jq -r '.. | select(.role=="button") | .id')
if [ -z "$BUTTON_ID" ]; then
  echo "✖ Button not found — re-inserting"
  op insert --parent "$FORM" '{"type":"rectangle","role":"button","width":"fill_container","height":50}'
fi
```

### Pattern 4: Review Checklist (REVIEW)

```
☐ Color contrast ≥ 4.5:1 (impeccable detector)
☐ All fonts from design system scale (impeccable detector)
☐ No fill_container in fit_content parent (impeccable detector)
☐ Max 2 saturated colors (taste-skill rule)
☐ Heading hierarchy clear (taste-skill rule)
☐ Visual regression ≤ 0.1% (eval-view comparison)
☐ WCAG AA violations = 0 (lastest a11y audit)
☐ All icons resolved (op design:refine success)
```

## Reference

- Repository: https://github.com/obra/superpowers
- Method: PLAN → EXECUTE → VERIFY → REVIEW → SHIP
- Applies to every Buildev design session
