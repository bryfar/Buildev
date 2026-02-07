import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';

// Schema for component generation
const ComponentSchema = z.object({
  name: z.string().describe('Component name'),
  type: z.enum(['rectangle', 'text', 'button', 'card']).describe('Component type'),
  x: z.number().describe('X coordinate'),
  y: z.number().describe('Y coordinate'),
  width: z.number().describe('Width in pixels'),
  height: z.number().describe('Height in pixels'),
  backgroundColor: z.string().optional().describe('Background color in hex'),
  textContent: z.string().optional().describe('Text content if applicable'),
  fontSize: z.number().optional().describe('Font size if text'),
  fontFamily: z.string().optional().describe('Font family'),
  fontWeight: z.number().optional().describe('Font weight'),
  textColor: z.string().optional().describe('Text color in hex'),
});

/**
 * API route handler for AI component generation
 * Uses Claude to interpret natural language and generate component specifications
 */
export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return Response.json(
        { error: 'Invalid prompt' },
        { status: 400 }
      );
    }

    // Generate component using Claude
    const result = await generateObject({
      model: anthropic('claude-3-5-sonnet-20241022'),
      schema: ComponentSchema,
      prompt: `You are a UI component designer. Based on this description, generate a UI component specification for a web builder.

Description: "${prompt}"

Create a component that would work well in a responsive web design. Position it at reasonable coordinates (x: 20-50, y: 20-50 for starting position). Use modern design standards:
- For buttons: width 100-200px, height 40-50px
- For cards: width 250-400px, height 200-400px
- For hero sections: full width (375px), height 300-600px
- Use colors that are visually appealing and professional

Ensure all measurements are in pixels and colors are in hex format.`,
    });

    return Response.json(result.object);
  } catch (error) {
    console.error('Component generation error:', error);
    return Response.json(
      { error: 'Failed to generate component' },
      { status: 500 }
    );
  }
}
