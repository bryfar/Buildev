# Skill: Add Codegen Target
 
This skill teaches you how to add a new framework target (e.g., SolidJS, Qwik) to the Buildev export system.
 
## Context
The `@buildev/codegen` package handles the conversion from the internal AST to framework-specific code.
 
## Steps
1. **Create Target Folder**: Create a new directory in `packages/codegen/src/targets/[framework]`.
2. **Implement Generator**: Create an `index.ts` that implements the `CodegenTarget` interface.
3. **Map AST Nodes**: Write the mapping logic for each `BuildevNode` type to the target framework's syntax.
4. **Add Snapshot Tests**: Create tests in `__tests__` to verify the output for common design patterns.
5. **Register Target**: Update the main factory in `@buildev/codegen` to include the new framework.
 
## Architecture
- Use `prettier` to format the generated output.
- Follow the framework's idioms (e.g., Hooks for React, Signals for Solid).
- Ensure Tailwind CSS classes are preserved correctly.
