import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider } from "./provider";
import { SiteElement } from "../types";

const SYSTEM_PROMPT = `
You are an Expert Web Designer and UI Engineer (The "Reverse UI" Specialist).
Your goal is to analyze a screenshot and reconstruct it into a structured JSON format (SiteElement schema) that perfectly matches the visual hierarchy, styles, and intent.

**CRITICAL OBJECTIVE**: Creates a "Pixel-Perfect" editable canvas representation.

**Schema**:
interface SiteElement {
  id: string; // Valid UUID or readable unique ID
  name: string; // Semantic name (e.g., "Primary Button", "Pricing Card", "Hero Section")
  type: 'rectangle' | 'circle' | 'text' | 'image' | 'frame' | 'video';
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundColor?: string;
  opacity: number;
  borderRadius?: number;
  boxShadow?: string;
  textContent?: string;
  fontSize?: number;
  fontWeight?: number;
  textColor?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  // Advanced Styles (Map these from visual cues to Tailwind-like values if possible, but keep as raw styles for canvas)
  borderWidth?: number;
  borderColor?: string;
  children?: SiteElement[];
}

**Rules for Reconstruction**:
1. **Container Logic**: Identify logical groups (Cards, Navbars, Sections) and use 'frame' type for them.
2. **Text Accuracy**: Transcribe text exactly. Guess font-weight and font-size relative to a standard 16px base.
3. **Hierarchy**: Parent-child relationships MUST be correct. A button's text must be a child of the button rectangle/frame.
4. **Simplification**: Do not over-segment. A solid background with text is just a Frame + Text, not Rectangle + Frame + Text.
5. **Responsiveness Hint**: Assume the screenshot is from a standard Desktop viewport (1440px wide).
6. **Colors**: Extract hex codes precisely.

**Output Format**:
Return ONLY the JSON object. Do not include markdown code blocks.
`;

export class GoogleGeminiProvider implements AIProvider {
    id = 'google';

    async analyzeImage(imageBase64: string, apiKey?: string): Promise<SiteElement[]> {
        const key = apiKey || process.env.GOOGLE_API_KEY;
        if (!key) throw new Error("Missing Google API Key");

        const genAI = new GoogleGenerativeAI(key);
        // Use Gemini 1.5 Flash for speed and vision capabilities
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction: SYSTEM_PROMPT });

        // Clean base64 header if present
        const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|webp);base64,/, "");

        const result = await model.generateContent([
            "Analyze this UI screenshot and turn it into a SiteElement JSON structure.",
            {
                inlineData: {
                    data: cleanBase64,
                    mimeType: "image/png",
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        // Clean potential markdown blocks
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const parsed = JSON.parse(cleanText);
            // Normalize output
            if (Array.isArray(parsed)) return parsed;
            if (parsed.elements) return parsed.elements;
            if (parsed.siteElements) return parsed.siteElements;
            return [parsed];
        } catch (e) {
            console.error("Failed to parse Gemini response", text);
            throw new Error("Failed to parse Gemini response: " + e);
        }
    }

    async generateCode(prompt: string, context: string, apiKey?: string): Promise<string> {
        const key = apiKey || process.env.GOOGLE_API_KEY;
        if (!key) throw new Error("Missing Google API Key");

        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent([
            `Context:\n${context}\n\nInstruction: ${prompt}`
        ]);

        return result.response.text();
    }
}
