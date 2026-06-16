---
name: graphify
description: Use when mapping codebase architecture to knowledge graphs, tracing component dependencies across Buildev designs and generated code.
---

# Graphify

Integrate [Graphify](https://github.com/safishamsi/graphify) (68.2k ★) to build knowledge graphs of Buildev design systems. Maps relationships between design nodes, code components, variables, and themes — enabling agents to understand architecture context before making design decisions.

## When to Use

- Mapping component dependencies across multi-page designs
- Understanding how design variables propagate through a layout tree
- Tracing codegen output back to source design nodes
- Discovering unused or duplicated components in large design systems
- Onboarding new agents to an existing Buildev design system

## Integration

```bash
pip install graphify
# or
go install github.com/safishamsi/graphify@latest
```

```python
from graphify import KnowledgeGraph
from buildex import BuildevCLI

cli = BuildevCLI("http://127.0.0.1:59080")
graph = KnowledgeGraph()

# Get the entire design tree and build a graph
tree = cli.get(depth=10)  # op get --depth 10
graph.ingest(tree, source="buildev-design")

# Find all components using a specific variable
usages = graph.find_usages("$primaryColor")
# Returns: ["hero/cta-button", "footer/heading", "navbar/brand"]

# Trace: which design nodes generated which React components?
codegen_map = graph.trace("design_node → react_component", latest_codegen)
```

## Buildev × Graphify Use Cases

### 1. Design System Audit

```bash
# Export full design tree
op get --depth 10 --pretty > design-tree.json

# Build knowledge graph
graphify ingest design-tree.json --label "buildev-design-v2"

# Query: which components have no role?
graphify query "match (n:PenNode) WHERE n.role is null RETURN n.name"
```

### 2. Variable Propagation Map

```
$primaryColor (#6366F1)
  ├── hero/cta-button          (fill)
  ├── footer/heading           (fill)
  ├── navbar/nav-link:active   (fill)
  └── features/icon            (fill)
      ↓
  If $primaryColor changes, 4 components affected
```

### 3. Codegen Dependency Graph

```
design: FormInput (frame#form-input)
  ├── codegen: Input.tsx
  ├── codegen: Input.stories.tsx
  └── codegen: input.test.tsx
      ↓
  Changing FormInput affects 3 generated files
```

## Configuration

```json
{
  "graphify": {
    "storage": "./.graphify-db",
    "label": "buildev-design",
    "autoIngest": true,
    "buildevEndpoint": "http://127.0.0.1:59080"
  }
}
```

## Reference

- Repository: https://github.com/safishamsi/graphify
- Use before any large-scale design refactor
