import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const ResponsiveDesignSchema = z.object({
  tablet: z.object({
    width: z.number(),
    height: z.number(),
    changes: z.record(z.string(), z.any()).optional(),
  }),
  desktop: z.object({
    width: z.number(),
    height: z.number(),
    changes: z.record(z.string(), z.any()).optional(),
  }),
});

/**
 * API route to generate responsive designs for tablet and desktop
 * Takes a mobile design and uses Gemini API to adapt it for other breakpoints
 */
export async function POST(request: Request) {
  try {
    const { mobileDesign, componentName, description } = await request.json();

    if (!mobileDesign || !componentName) {
      return Response.json(
        { error: "Missing required fields: mobileDesign, componentName" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API;
    if (!apiKey) {
      return Response.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a responsive web design expert. Given a mobile design, generate adaptive designs for tablet (768px) and desktop (1024px+) breakpoints.

Mobile Design:
${JSON.stringify(mobileDesign, null, 2)}

Component Name: ${componentName}
Description: ${description || ""}

Generate ONLY a valid JSON object with this structure:
{
  "tablet": {
    "width": <new width>,
    "height": <new height>,
    "changes": {
      "fontSize": <adjusted value if applicable>,
      "padding": <adjusted value if applicable>,
      "layout": "<flex/grid/etc if changed>",
      "columns": <number if grid layout>
    }
  },
  "desktop": {
    "width": <new width>,
    "height": <new height>,
    "changes": {
      "fontSize": <adjusted value if applicable>,
      "padding": <adjusted value if applicable>,
      "layout": "<flex/grid/etc if changed>",
      "columns": <number if grid layout>
    }
  }
}

Consider these principles:
- Tablet: Increase width to ~90% of 768px, adjust spacing proportionally
- Desktop: Increase width to utilize full viewport, optimize layout for larger screens
- Maintain visual hierarchy and readability
- Adapt typography for larger screens
- Reorganize layout elements if needed for better use of space
- Preserve the component's purpose and visual identity`;

    const response = await model.generateContent(prompt);
    const responseText = response.response.text();

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) ||
      responseText.match(/```\n?([\s\S]*?)\n?```/) || [
        ,
        responseText,
      ];
    const jsonString = jsonMatch[1] || responseText;

    const cleanedJson = jsonString
      .replace(/^```json\n?/, "")
      .replace(/\n?```$/, "")
      .trim();
    const parsedResponse = JSON.parse(cleanedJson);

    // Validate the response structure
    const validated = ResponsiveDesignSchema.parse(parsedResponse);

    return Response.json({
      success: true,
      responsive: validated,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Responsive design generation error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return Response.json(
      { error: "Failed to generate responsive design", details: errorMessage },
      { status: 500 }
    );
  }
}
