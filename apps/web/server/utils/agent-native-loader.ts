import { createError } from 'h3';

export const AGENT_NATIVE_BUILD_HINT =
  'Build the agent runtime from the repo root: `bun run agent:build` (requires Zig 0.15.2 on Windows; Zig 0.16 is not supported yet). If Defender blocks the build, run `bun run agent:defender-exclusions` as Administrator, or use `bun run agent:fetch-native` with a prebuilt .node URL.';

export function isAgentNativeMissingError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes('agent_napi.node') || msg.includes('@buildev/agent-native');
}

export async function loadAgentNative() {
  try {
    return await import('@buildev/agent-native');
  } catch (err) {
    if (isAgentNativeMissingError(err)) {
      throw createError({
        statusCode: 503,
        message: `Agent runtime is not built. ${AGENT_NATIVE_BUILD_HINT}`,
      });
    }
    throw err;
  }
}
