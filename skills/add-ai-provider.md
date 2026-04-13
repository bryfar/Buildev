# Skill: Add AI Provider
 
This skill teaches you how to add a new LLM provider (e.g., DeepSeek, Mistral) to the Buildev AI Engine.
 
## Context
The `@buildev/ai-engine` package uses a provider-based architecture with BYOK support.
 
## Steps
1. **Define Config**: Add the new provider's configuration to `packages/ai-engine/src/config.ts`.
2. **Implement Provider**: Create a new class in `packages/ai-engine/src/providers/[name].ts` that implements `AIProvider`.
3. **Handle Streaming**: Ensure the `generate` and `chat` methods support streaming responses.
4. **Register Provider**: Add the new provider to the `providerRegistry` in `packages/ai-engine/src/registry.ts`.
5. **Update UI**: Add the new provider icon and model list to the AI Settings panel in the editor.
 
## Best Practices
- Use `fetch` for API calls to maintain compatibility with different runtimes (Node, Edge, Browser).
- Implement proper error handling for rate limits and invalid API keys.
- Ensure vision models are supported if the provider offers them.
