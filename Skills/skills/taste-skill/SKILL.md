---
name: taste-skill
description: Use when enforcing aesthetic quality, preventing visual slop, and ensuring Buildev designs meet professional design standards.
---

# Taste Skill

Integrate [Taste Skill](https://github.com/leonxlnx/taste-skill) (45.2k ★) — an anti-slop aesthetic design system that evaluates visual quality of AI-generated interfaces. Provides deterministic rules and reference patterns to prevent common "AI design" artifacts.

## When to Use

- Final aesthetic review before shipping a Buildev design
- Preventing generic or "AI-looking" design patterns
- Enforcing visual hierarchy, rhythm, and polish
- Catching common agent mistakes (muddy hierarchy, dead space, visual noise)

## Integration

Taste Skill is a reference-based system. Include its rules in your agent prompts and validate output against them.

```bash
git clone https://github.com/leonxlnx/taste-skill.git
# Reference the rules directly in agent prompts
```

## Taste Rules Applied to Buildev

### Rule 1: Visual Hierarchy

```
┌─ Buildev check ──────────────────────────────────┐
│ ✓ One primary action per section                  │
│ ✓ Heading sizes differ by ≥8px between levels     │
│ ✓ No more than 3 type scales per page             │
│ ✓ Most important element has highest contrast     │
└───────────────────────────────────────────────────┘
```

### Rule 2: Rhythm & Breathing Room

```json
// Buildev PenNode — good spacing
{
  "padding": [80, 80],   // Section breathing room
  "gap": 48,              // Between sections
  "layout": "vertical"
}

// Avoid:
{
  "padding": [24, 24],   // Too tight for a landing page section
  "gap": 16              // Sections too close
}
```

### Rule 3: No Visual Noise

```
✖ 3+ font weights on same page          → Max 2 weights
✖ More than 2 saturated colors          → Stick to 1 accent + neutrals
✖ Drop shadows on everything            → Reserved for elevated elements only
✖ Icon overload (icon per text line)    → Icons only for actions/features
✖ All sections same layout              → Vary: full-width, grid, split, centered
```

### Rule 4: Button & Interaction Design

```json
// Preferred: clear affordance
{
  "role": "button",
  "fill": [{ "type": "solid", "color": "#111111" }],
  "padding": [14, 32],
  "cornerRadius": 10,
  "width": "fill_container"
}

// Avoid: ghost buttons as primary CTA
```

### Rule 5: Content Sophistication

```
✖ "Welcome to our platform"       → "Ship faster with Acme"
✖ "Lorem ipsum"                   → Realistic, concise copy
✖ "Get Started" on every button   → "Start Free", "View Demo", "See Plans"
✖ Generic stock photo prompts     → Specific, atmospheric descriptions
```

## Example: Aesthetic Gate

```bash
#!/bin/bash
# After design is built, run taste audit

echo "=== Taste Audit ==="

# Check heading hierarchy
HEADING_SIZES=$(op get --depth 3 | jq '[.. | select(.role=="heading") | .fontSize] | unique')
if [ "$(echo $HEADING_SIZES | jq 'length')" -gt 3 ]; then
  echo "✖ Too many heading sizes: $(echo $HEADING_SIZES)"
fi

# Check saturated colors
SATURATED=$(op get --depth 10 | jq '[.. | .color? // empty | select(test("^#[0-9A-F]{6}$")) | select(. != "#111111" and . != "#6B7280" and . != "#FFFFFF" and . != "#F9FAFB" and . != "#E5E7EB" and . != "#9CA3AF")] | unique')
SAT_COUNT=$(echo $SATURATED | jq 'length')
if [ "$SAT_COUNT" -gt 2 ]; then
  echo "✖ Too many saturated colors: $SAT_COUNT (max 2)"
  echo "  Colors: $SATURATED"
fi

# Check layout variety
SECTIONS=$(op get --depth 5 | jq '[.. | select(.role=="section" or .role=="hero" or .role=="feature-grid") | .layout]')
echo "Layout variety: $SECTIONS"
```

## Reference

- Repository: https://github.com/leonxlnx/taste-skill
- Apply taste rules as the final gate before completing any design
