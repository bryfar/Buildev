import { useState, useRef, useEffect, useLayoutEffect, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import type { BuiltinProviderPreset } from '@/stores/agent-settings-store';

/** Hardcoded model lists for providers that don't expose /models endpoint */
export const BUILTIN_MODEL_LISTS: Partial<
  Record<BuiltinProviderPreset, Array<{ id: string; name: string }>>
> = {
  anthropic: [
    { id: 'claude-opus-4-6-20250916', name: 'Claude Opus 4.6' },
    { id: 'claude-sonnet-4-6-20250916', name: 'Claude Sonnet 4.6' },
    { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5' },
    { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5' },
    { id: 'claude-opus-4-20250514', name: 'Claude Opus 4' },
    { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
  ],
  gemini: [
    { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro' },
    { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash' },
    { id: 'gemini-3.1-flash-lite-preview', name: 'Gemini 3.1 Flash-Lite' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  ],
  minimax: [
    { id: 'MiniMax-M2.7', name: 'MiniMax M2.7' },
    { id: 'MiniMax-M2.7-highspeed', name: 'MiniMax M2.7 Highspeed' },
    { id: 'MiniMax-M2.5', name: 'MiniMax M2.5' },
    { id: 'MiniMax-M2.5-highspeed', name: 'MiniMax M2.5 Highspeed' },
    { id: 'MiniMax-M2.1', name: 'MiniMax M2.1' },
    { id: 'MiniMax-M1', name: 'MiniMax M1' },
  ],
  'glm-coding': [
    { id: 'glm-5', name: 'GLM-5' },
    { id: 'glm-4.7', name: 'GLM-4.7' },
    { id: 'glm-4.6', name: 'GLM-4.6' },
    { id: 'glm-4.5-air', name: 'GLM-4.5 Air' },
  ],
  doubao: [
    { id: 'doubao-seed-2.0-pro', name: 'Doubao Seed 2.0 Pro' },
    { id: 'doubao-seed-2.0-lite', name: 'Doubao Seed 2.0 Lite' },
    { id: 'doubao-seed-2.0-code', name: 'Doubao Seed 2.0 Code' },
    { id: 'doubao-seed-code', name: 'Doubao Seed Code' },
  ],
  'ark-coding': [
    { id: 'ark-code-latest', name: 'Ark Code Latest' },
    { id: 'doubao-seed-2.0-code', name: 'Doubao Seed 2.0 Code' },
    { id: 'doubao-seed-code', name: 'Doubao Seed Code' },
    { id: 'doubao-seed-2.0-pro', name: 'Doubao Seed 2.0 Pro' },
    { id: 'doubao-seed-2.0-lite', name: 'Doubao Seed 2.0 Lite' },
    { id: 'glm-4.7', name: 'GLM-4.7' },
    { id: 'deepseek-v4-pro', name: 'DeepSeek V4 Pro' },
    { id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash' },
    { id: 'kimi-k2.5', name: 'Kimi K2.5' },
    { id: 'minimax-m2.5', name: 'MiniMax M2.5' },
  ],
};

/** Fetch model list from a provider via our server-side proxy */
export async function fetchProviderModels(
  baseURL: string,
  apiKey?: string,
  apiFormat: 'anthropic' | 'openai-compat' = 'openai-compat',
): Promise<{ models: Array<{ id: string; name: string }>; error?: string }> {
  try {
    const res = await fetch('/api/ai/provider-models', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseURL, apiKey, apiFormat }),
    });
    if (!res.ok) return { models: [], error: `Server error ${res.status}` };
    return await res.json();
  } catch {
    return { models: [], error: 'Request failed' };
  }
}

/* ---------- Model Search Dropdown ---------- */
const MODEL_DROPDOWN_Z = 220;

export default function ModelSearchDropdown({
  models,
  onSelect,
  onClose,
  anchorRef,
}: {
  models: Array<{ id: string; name: string }>;
  onSelect: (model: { id: string; name: string }) => void;
  onClose: () => void;
  anchorRef: RefObject<HTMLDivElement | null>;
}) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ top: 0, left: 0, width: 280, maxListHeight: 192 });

  const filtered = models.filter((m) => {
    const q = filter.toLowerCase();
    return m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q);
  });

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const gap = 6;
    const edge = 10;
    const filterBar = 44;
    const maxPanel = 280;
    let top = rect.bottom + gap;
    let maxList = Math.min(192, window.innerHeight - top - edge - filterBar);
    if (maxList < 96 && rect.top > window.innerHeight - rect.bottom) {
      maxList = Math.min(192, rect.top - gap - edge - filterBar);
      top = rect.top - gap - filterBar - maxList;
    }
    maxList = Math.max(64, maxList);
    setBox({
      top: Math.max(edge, top),
      left: Math.max(edge, rect.left),
      width: Math.max(220, rect.width),
      maxListHeight: maxList,
    });
  }, [anchorRef, models.length]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const node = e.target as Node;
      if (listRef.current?.contains(node)) return;
      if (anchorRef.current?.contains(node)) return;
      onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose, anchorRef]);

  useEffect(() => {
    const cancel = () => onClose();
    window.addEventListener('scroll', cancel, true);
    window.addEventListener('resize', cancel);
    return () => {
      window.removeEventListener('scroll', cancel, true);
      window.removeEventListener('resize', cancel);
    };
  }, [onClose]);

  const panel = (
    <div
      ref={listRef}
      style={{
        position: 'fixed',
        top: box.top,
        left: box.left,
        width: box.width,
        zIndex: MODEL_DROPDOWN_Z,
      }}
      className="flex max-h-[min(280px,calc(100vh-24px))] flex-col overflow-hidden rounded-md border border-border bg-popover shadow-md"
    >
      <div className="shrink-0 border-b border-border p-1.5">
        <input
          autoFocus
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={t('builtin.filterModels')}
          className="h-7 w-full rounded border border-input bg-card px-2 text-[12px] text-foreground outline-none transition-colors focus:border-ring"
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto" style={{ maxHeight: box.maxListHeight }}>
        {filtered.length === 0 && (
          <div className="px-3 py-4 text-center text-[11px] text-muted-foreground">
            {t('builtin.noModels')}
          </div>
        )}
        {filtered.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => {
              onSelect(m);
              onClose();
            }}
            className="flex w-full flex-col px-3 py-1.5 text-left text-[12px] text-foreground transition-colors hover:bg-secondary/50"
          >
            <span className="truncate font-medium">{m.name !== m.id ? m.name : m.id}</span>
            {m.name !== m.id && (
              <span className="truncate font-mono text-[10px] text-muted-foreground">{m.id}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(panel, document.body);
}
