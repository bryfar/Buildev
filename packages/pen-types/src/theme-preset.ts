import type { VariableDefinition } from './variables.js';

export interface ThemePreset {
  id: string;
  name: string;
  themes: Record<string, string[]>;
  variables: Record<string, VariableDefinition>;
  createdAt: number;
}

/** Legacy preset file discriminator string (still accepted when parsing saved files). */
export type ThemePresetFileType = 'buildev-theme-preset' | 'openpencil-theme-preset';

export interface ThemePresetFile {
  type: ThemePresetFileType;
  version: '1.0.0';
  name: string;
  themes: Record<string, string[]>;
  variables: Record<string, VariableDefinition>;
}
