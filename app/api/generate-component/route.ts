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
 * Mobile-first approach: generates mobile design, optionally triggers responsive variants via Gemini
 */
export async function POST(request: Request) {
  try {
    const { prompt, generateResponsive = false } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return Response.json(
        { error: 'Invalid prompt' },
        { status: 400 }
      );
    }

    // Step 1: Generate mobile component using Claude
    const result = await generateObject({
      model: anthropic('claude-3-5-sonnet-20241022'),
      schema: ComponentSchema,
      prompt: `You are a UI component designer specializing in mobile-first design. Based on this description, generate a UI component specification for a web builder.

Description: "${prompt}"

Create a MOBILE-FIRST component that will serve as the base design. Position it at reasonable coordinates (x: 20-50, y: 20-50 for starting position). Use modern design standards for mobile (375px width):
- For buttons: width 100-200px, height 40-50px
- For cards: width 250-400px, height 200-400px
- For hero sections: full width (375px), height 300-600px
- Use colors that are visually appealing and professional
- Optimize typography and spacing for mobile screens

This is the PRIMARY mobile design. Tablet and desktop variants will be auto-generated.

Ensure all measurements are in pixels and colors are in hex format.`,
    });

    const response: any = {
      ...result.object,
      isMobileFirst: true,
    };

    // Step 2: If requested, trigger responsive design generation via Gemini
    if (generateResponsive) {
      try {
        const responsiveResponse = await fetch(
          new URL('/api/generate-responsive', request.url).toString(),
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              mobileDesign: result.object,
              componentName: result.object.name,
              description: prompt,
            }),
          }
        );

        if (responsiveResponse.ok) {
          const responsiveData = await responsiveResponse.json();
          response.responsive = responsiveData.responsive;
          response.generatedVariants = ['mobile', 'tablet', 'desktop'];
        }
      } catch (error) {
        console.warn('Failed to generate responsive variants:', error);
        // Continue with just the mobile design
      }
    }

    return Response.json(response);
  } catch (error) {
    console.error('Component generation error:', error);
    return Response.json(
      { error: 'Failed to generate component' },
      { status: 500 }
    );
  }
}
