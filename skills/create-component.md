# Skill: Create Component
 
This skill teaches you how to create a new visual component in Buildev.
 
## Context
Buildev uses a custom AST defined in `@buildev/core`. Every component must be serializable and renderable in the canvas.
 
## Steps
1. **Define Schema**: Add the new component type to the Zod schema in `packages/core/src/ast/schema.ts`.
2. **Add Component Data**: Create a new entry in `apps/buildev-frontend/src/data/blocks.ts`.
3. **Register Renderer**: Add the rendering logic to `apps/buildev-frontend/src/components/blocks/BSBlockRenderer.vue`.
4. **Create Vue Component**: Build the visual implementation in `apps/buildev-frontend/src/components/blocks/BS[Name]Block.vue`.
5. **Update Codegen**: Ensure the new component is handled in `packages/codegen` for all frameworks (React, Vue, Svelte, HTML).
 
## Best Practices
- Use Tailwind CSS for styling the generated output.
- Ensure the component is responsive.
- Add properties to the Inspector panel via `apps/buildev-frontend/src/components/props/`.
