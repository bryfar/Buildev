---
name: deep-agents
description: Use when managing long context windows, compressing design sessions, or implementing memory-paginated workflows for Buildev agents.
---

# Deep Agents SDK

Integrate [Deep Agents SDK](https://github.com/langchain-ai/deepagents) (24.7k ★) from LangChain for context compression and memory pagination in Buildev design sessions. Essential for maintaining coherence across long-running, multi-turn design conversations.

## When to Use

- Design sessions exceeding 50+ agent turns (compression needed)
- Multi-page document designs requiring cross-page context
- Long-running iterative refine loops (skeleton → content → refine × N cycles)
- Maintaining design intent across agent handoffs or pipeline restarts

## Integration

```bash
pip install deep-agents-sdk
# or
npm install @langchain/deep-agents
```

Configure Deep Agents to compress Buildev context:

```typescript
import { Compressor, MemoryPaginator } from "deep-agents-sdk";

const compressor = new Compressor({
  strategy: "semantic-chunk",
  maxTokens: 128000,
  onCompress: (session) => {
    // Preserve Buildev node IDs and layout state
    return session.summarize({
      keepKeys: ["_buildev", "nodeIds", "latestRefine", "pageTree"]
    });
  }
});
```

## Buildev × Deep Agents Patterns

### Pattern 1: Session Compression After Refine

```bash
# After each design:refine, compress the conversation
op design:refine --root-id "$ROOT"
deep-agents compress --strategy semantic --preserve nodeIds,pageTree
```

### Pattern 2: Cross-Page Memory

When designing multi-page documents with `op page`, Deep Agents paginates context per page:

```
Page 1 (Landing)  ← context window 1
Page 2 (Pricing)  ← context window 2
Page 3 (Contact)  ← context window 3
     ↓
Deep Agents paginates, only loads active page context
```

### Pattern 3: Iterative Refine Loops

```python
from deep_agents import Session
from buildex import BuildevCLI

session = Session(max_turns=100)
cli = BuildevCLI("http://127.0.0.1:59080")

for iteration in range(10):
    skeleton = cli.design_skeleton(sections)
    content = cli.design_content(skeleton.root_id, ...)
    result = cli.design_refine(skeleton.root_id)
    session.compress()  # Reduces context after each iteration
```

## Reference

- Repository: https://github.com/langchain-ai/deepagents
- NuGet/GitHub: `@langchain/deep-agents` / `pip install deep-agents-sdk`
