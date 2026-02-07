import { SiteElement } from './types';

/**
 * AI Component Generator
 * Uses the Vercel AI Gateway to generate UI components from natural language prompts
 */

export interface GeneratedComponent {
  name: string;
  type: SiteElement['type'];
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundColor?: string;
  textContent?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  textColor?: string;
}

/**
 * Generates a UI component description from a prompt using Claude
 */
export async function generateComponentWithAI(
  prompt: string
): Promise<GeneratedComponent> {
  try {
    const response = await fetch('/api/generate-component', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate component: ${response.statusText}`);
    }

    const component: GeneratedComponent = await response.json();
    return component;
  } catch (error) {
    console.error('AI generation error:', error);
    // Return a default component on error
    return {
      name: 'AI Generated Component',
      type: 'rectangle',
      x: 20,
      y: 20,
      width: 300,
      height: 200,
      backgroundColor: '#e5e5e5',
    };
  }
}

/**
 * Generates multiple components from a prompt
 */
export async function generateMultipleComponents(
  prompt: string,
  count: number = 1
): Promise<GeneratedComponent[]> {
  const components: GeneratedComponent[] = [];

  for (let i = 0; i < count; i++) {
    const component = await generateComponentWithAI(prompt);
    component.x = 20 + i * 320; // Offset components horizontally
    components.push(component);
  }

  return components;
}

/**
 * Pre-configured component templates for quick generation
 */
export const componentTemplates = {
  button: {
    name: 'Button',
    type: 'rectangle' as const,
    x: 20,
    y: 20,
    width: 120,
    height: 44,
    backgroundColor: '#0D99FF',
    textContent: 'Click me',
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: 600,
    textColor: '#ffffff',
  },
  card: {
    name: 'Card',
    type: 'rectangle' as const,
    x: 20,
    y: 20,
    width: 280,
    height: 320,
    backgroundColor: '#f5f5f5',
  },
  hero: {
    name: 'Hero Section',
    type: 'rectangle' as const,
    x: 0,
    y: 0,
    width: 375,
    height: 500,
    backgroundColor: '#0D99FF',
    textContent: 'Welcome',
    fontSize: 32,
    fontFamily: 'Inter',
    fontWeight: 700,
    textColor: '#ffffff',
  },
  textInput: {
    name: 'Input Field',
    type: 'rectangle' as const,
    x: 20,
    y: 20,
    width: 300,
    height: 44,
    backgroundColor: '#ffffff',
    textColor: '#999999',
  },
  header: {
    name: 'Header',
    type: 'rectangle' as const,
    x: 0,
    y: 0,
    width: 375,
    height: 60,
    backgroundColor: '#1e1e1e',
  },
};
