import type {
  QueryEngineHandle,
  IteratorHandle,
  ProviderHandle,
  ToolRegistryHandle,
  TeamHandle,
} from '@buildev/agent-native';
import type { ClientSideConnection } from '@agentclientprotocol/sdk';
import type { LayoutPhase } from './agent-tool-guard';
import { loadAgentNative } from './agent-native-loader';

export interface NativeAgentSession {
  type: 'native';
  engine?: QueryEngineHandle;
  team?: TeamHandle;
  iter?: IteratorHandle;
  provider: ProviderHandle;
  tools?: ToolRegistryHandle;
  memberHandles?: Array<{ provider: ProviderHandle; tools: ToolRegistryHandle }>;
  createdAt: number;
  lastActivity: number;
  /** toolCallId → memberId — routes async tool results to the correct member engine. */
  toolOwners: Map<string, string>;
  /** toolCallId → tool name — used for session-level tool guards and state updates. */
  toolNames: Map<string, string>;
  /** memberId → role — used for delegation-time skill resolution. */
  memberRoles: Map<string, string>;
  /** Session-local layout progress for builtin single-agent guardrails. */
  layoutPhase: LayoutPhase;
  layoutRootId: string | null;
}

export interface AcpAgentSession {
  type: 'acp';
  acpSessionId: string;
  acpAgentId: string;
  connection: ClientSideConnection;
  createdAt: number;
  lastActivity: number;
  toolNames: Map<string, string>;
  toolOwners: Map<string, string>;
  layoutPhase: LayoutPhase;
  layoutRootId: string | null;
}

export type AgentSession = NativeAgentSession | AcpAgentSession;

/** Create a native session with required defaults. */
export function createSession(
  fields: Omit<
    NativeAgentSession,
    'type' | 'toolOwners' | 'toolNames' | 'memberRoles' | 'layoutPhase' | 'layoutRootId'
  > &
    Partial<
      Pick<
        NativeAgentSession,
        'toolOwners' | 'toolNames' | 'memberRoles' | 'layoutPhase' | 'layoutRootId'
      >
    >,
): NativeAgentSession {
  return {
    type: 'native',
    ...fields,
    toolOwners: fields.toolOwners ?? new Map(),
    toolNames: fields.toolNames ?? new Map(),
    memberRoles: fields.memberRoles ?? new Map(),
    layoutPhase: fields.layoutPhase ?? 'idle',
    layoutRootId: fields.layoutRootId ?? null,
  };
}

/** Create an ACP session with required defaults. */
export function createAcpSession(fields: {
  acpSessionId: string;
  acpAgentId: string;
  connection: ClientSideConnection;
}): AcpAgentSession {
  return {
    type: 'acp',
    ...fields,
    createdAt: Date.now(),
    lastActivity: Date.now(),
    toolNames: new Map(),
    toolOwners: new Map(),
    layoutPhase: 'idle',
    layoutRootId: null,
  };
}

export const agentSessions = new Map<string, AgentSession>();

/** Mark a session as active so long-running external tool callbacks are not expired. */
export function touchSession(session: Pick<AgentSession, 'lastActivity'>, now = Date.now()): void {
  session.lastActivity = now;
}

/** Idempotent cleanup — nullifies handles after destroying to prevent double-free. */
export async function cleanup(session: AgentSession): Promise<void> {
  if (session.type === 'acp') return; // ACP connections managed by acp-connection-manager
  let native: Awaited<ReturnType<typeof loadAgentNative>> | null = null;
  const getNative = async () => {
    if (!native) native = await loadAgentNative();
    return native;
  };
  if (session.iter) {
    (await getNative()).destroyIterator(session.iter);
    session.iter = undefined;
  }
  if (session.team) {
    const n = await getNative();
    n.abortTeam(session.team);
    n.destroyTeam(session.team);
    session.team = undefined;
  }
  if (session.engine) {
    (await getNative()).destroyQueryEngine(session.engine);
    session.engine = undefined;
  }
  if (session.memberHandles) {
    const n = await getNative();
    for (const mh of session.memberHandles) {
      n.destroyToolRegistry(mh.tools);
      n.destroyProvider(mh.provider);
    }
    session.memberHandles = undefined;
  }
  if (session.tools) {
    (await getNative()).destroyToolRegistry(session.tools);
    session.tools = undefined;
  }
  if (session.provider) {
    (await getNative()).destroyProvider(session.provider);
    (session as any).provider = undefined;
  }
}

/** Abort a session — makes pending nextEvent resolve null. */
export async function abortSession(session: AgentSession): Promise<void> {
  if (session.type === 'acp') {
    try {
      (session.connection as any).cancel?.({ sessionId: session.acpSessionId });
    } catch {}
    return;
  }
  const native = await loadAgentNative();
  if (session.team) native.abortTeam(session.team);
  else if (session.engine) native.abortEngine(session.engine);
}

// Cleanup stale sessions every 60s (5-minute TTL from last activity)
setInterval(() => {
  void (async () => {
    try {
      const now = Date.now();
      for (const [id, session] of agentSessions) {
        if (now - session.lastActivity > 5 * 60_000) {
          await abortSession(session);
          await cleanup(session);
          agentSessions.delete(id);
        }
      }
    } catch {
      /* ignore cleanup errors */
    }
  })();
}, 60_000);
