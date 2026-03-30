import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';

// ─── Types ─────────────────────────────────────────────────────────────────
export interface ColorToken {
  id: string;
  name: string;
  value: string;
  description?: string;
}

export interface TypographyToken {
  id: string;
  name: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing?: string;
}

export interface SpacingToken {
  id: string;
  name: string;
  value: string;
}

export interface BreakpointToken {
  id: string;
  name: string;
  minWidth: string;
}

export interface DesignSystemTokens {
  colors: ColorToken[];
  typography: TypographyToken[];
  spacing: SpacingToken[];
  breakpoints: BreakpointToken[];
}

// ─── defaults mirroring Builder.io defaults ────────────────────────────────
const DEFAULT_TOKENS: DesignSystemTokens = {
  colors: [
    { id: 'primary', name: 'Primary', value: '#6366f1' },
    { id: 'secondary', name: 'Secondary', value: '#8b5cf6' },
    { id: 'accent', name: 'Accent', value: '#06b6d4' },
    { id: 'success', name: 'Success', value: '#10b981' },
    { id: 'warning', name: 'Warning', value: '#f59e0b' },
    { id: 'danger', name: 'Danger', value: '#ef4444' },
    { id: 'neutral-100', name: 'Neutral 100', value: '#f8fafc' },
    { id: 'neutral-200', name: 'Neutral 200', value: '#e2e8f0' },
    { id: 'neutral-400', name: 'Neutral 400', value: '#94a3b8' },
    { id: 'neutral-600', name: 'Neutral 600', value: '#475569' },
    { id: 'neutral-800', name: 'Neutral 800', value: '#1e293b' },
    { id: 'neutral-900', name: 'Neutral 900', value: '#0f172a' },
  ],
  typography: [
    { id: 'display', name: 'Display', fontFamily: 'Inter', fontSize: '4rem', fontWeight: '700', lineHeight: '1.1' },
    { id: 'h1', name: 'Heading 1', fontFamily: 'Inter', fontSize: '2.25rem', fontWeight: '700', lineHeight: '1.2' },
    { id: 'h2', name: 'Heading 2', fontFamily: 'Inter', fontSize: '1.875rem', fontWeight: '600', lineHeight: '1.25' },
    { id: 'h3', name: 'Heading 3', fontFamily: 'Inter', fontSize: '1.5rem', fontWeight: '600', lineHeight: '1.3' },
    { id: 'body-lg', name: 'Body Large', fontFamily: 'Inter', fontSize: '1.125rem', fontWeight: '400', lineHeight: '1.75' },
    { id: 'body', name: 'Body', fontFamily: 'Inter', fontSize: '1rem', fontWeight: '400', lineHeight: '1.5' },
    { id: 'small', name: 'Small', fontFamily: 'Inter', fontSize: '0.875rem', fontWeight: '400', lineHeight: '1.5' },
    { id: 'caption', name: 'Caption', fontFamily: 'Inter', fontSize: '0.75rem', fontWeight: '500', lineHeight: '1.4' },
  ],
  spacing: [
    { id: 'xs', name: 'xs', value: '4px' },
    { id: 'sm', name: 'sm', value: '8px' },
    { id: 'md', name: 'md', value: '16px' },
    { id: 'lg', name: 'lg', value: '24px' },
    { id: 'xl', name: 'xl', value: '32px' },
    { id: '2xl', name: '2xl', value: '48px' },
    { id: '3xl', name: '3xl', value: '64px' },
    { id: '4xl', name: '4xl', value: '96px' },
  ],
  breakpoints: [
    { id: 'mobile', name: 'Mobile', minWidth: '0px' },
    { id: 'tablet', name: 'Tablet', minWidth: '768px' },
    { id: 'desktop', name: 'Desktop', minWidth: '1024px' },
    { id: 'wide', name: 'Wide', minWidth: '1280px' },
  ],
};

const STORAGE_KEY = 'bs_design_tokens';

// ─── Store ──────────────────────────────────────────────────────────────────
export const useDesignSystemStore = defineStore('designSystem', () => {
  const tokens = ref<DesignSystemTokens>(loadFromStorage());

  function loadFromStorage(): DesignSystemTokens {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(DEFAULT_TOKENS));
    } catch {
      return JSON.parse(JSON.stringify(DEFAULT_TOKENS));
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens.value));
    injectCSSVariables();
  }

  // Inject CSS custom properties into the document root for live preview
  function injectCSSVariables() {
    let style = document.getElementById('bs-design-tokens');
    if (!style) {
      style = document.createElement('style');
      style.id = 'bs-design-tokens';
      document.head.appendChild(style);
    }
    const lines: string[] = [':root {'];
    tokens.value.colors.forEach(c => {
      lines.push(`  --color-${c.id}: ${c.value};`);
    });
    tokens.value.spacing.forEach(s => {
      lines.push(`  --space-${s.id}: ${s.value};`);
    });
    tokens.value.typography.forEach(t => {
      lines.push(`  --font-${t.id}-family: ${t.fontFamily};`);
      lines.push(`  --font-${t.id}-size: ${t.fontSize};`);
      lines.push(`  --font-${t.id}-weight: ${t.fontWeight};`);
      lines.push(`  --font-${t.id}-lh: ${t.lineHeight};`);
    });
    lines.push('}');
    (style as HTMLStyleElement).textContent = lines.join('\n');
  }

  // Color operations
  function addColor(token: Omit<ColorToken, 'id'>) {
    const id = `color-${Date.now()}`;
    tokens.value.colors.push({ id, ...token });
    save();
  }
  function updateColor(id: string, patch: Partial<ColorToken>) {
    const idx = tokens.value.colors.findIndex(c => c.id === id);
    if (idx !== -1) { tokens.value.colors[idx] = { ...tokens.value.colors[idx], ...patch }; save(); }
  }
  function removeColor(id: string) {
    tokens.value.colors = tokens.value.colors.filter(c => c.id !== id);
    save();
  }

  // Typography operations
  function addTypography(token: Omit<TypographyToken, 'id'>) {
    tokens.value.typography.push({ id: `type-${Date.now()}`, ...token });
    save();
  }
  function updateTypography(id: string, patch: Partial<TypographyToken>) {
    const idx = tokens.value.typography.findIndex(t => t.id === id);
    if (idx !== -1) { tokens.value.typography[idx] = { ...tokens.value.typography[idx], ...patch }; save(); }
  }
  function removeTypography(id: string) {
    tokens.value.typography = tokens.value.typography.filter(t => t.id !== id);
    save();
  }

  // Spacing operations
  function addSpacing(token: Omit<SpacingToken, 'id'>) {
    tokens.value.spacing.push({ id: `space-${Date.now()}`, ...token });
    save();
  }
  function updateSpacing(id: string, patch: Partial<SpacingToken>) {
    const idx = tokens.value.spacing.findIndex(s => s.id === id);
    if (idx !== -1) { tokens.value.spacing[idx] = { ...tokens.value.spacing[idx], ...patch }; save(); }
  }
  function removeSpacing(id: string) {
    tokens.value.spacing = tokens.value.spacing.filter(s => s.id !== id);
    save();
  }

  function resetToDefaults() {
    tokens.value = JSON.parse(JSON.stringify(DEFAULT_TOKENS));
    save();
  }

  function exportTokensAsCSS(): string {
    const lines: string[] = ['/* Buildev Design Tokens */', ':root {'];
    tokens.value.colors.forEach(c => lines.push(`  --color-${c.id}: ${c.value}; /* ${c.name} */`));
    tokens.value.spacing.forEach(s => lines.push(`  --space-${s.id}: ${s.value}; /* ${s.name} */`));
    tokens.value.typography.forEach(t => {
      lines.push(`  --font-${t.id}-family: ${t.fontFamily};`);
      lines.push(`  --font-${t.id}-size: ${t.fontSize};`);
      lines.push(`  --font-${t.id}-weight: ${t.fontWeight};`);
    });
    lines.push('}');
    return lines.join('\n');
  }

  function exportTokensAsJSON(): string {
    return JSON.stringify(tokens.value, null, 2);
  }

  // Init CSS vars on boot
  injectCSSVariables();

  return {
    tokens,
    addColor, updateColor, removeColor,
    addTypography, updateTypography, removeTypography,
    addSpacing, updateSpacing, removeSpacing,
    resetToDefaults,
    exportTokensAsCSS,
    exportTokensAsJSON,
    save,
  };
});
