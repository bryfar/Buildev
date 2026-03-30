import type { BSBlock, BSPage } from "@buildersite/sdk";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

class AIService {
  /**
   * Generates a responsive version of a page or specific block.
   */
  async generateResponsiveVariant(page: BSPage, targetBreakpoint: 'tablet' | 'mobile'): Promise<BSPage> {
    const res = await fetch(`${API}/api/ai/auto-responsive`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page, targetBreakpoint }),
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || "Failed to generate responsive variant");
    return json.data;
  }

  /**
   * Reverse UI: Converts an image file into a set of Buildev blocks.
   */
  async reverseUI(file: File): Promise<BSBlock[]> {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`${API}/api/ai/reverse-ui`, {
      method: "POST",
      body: formData,
    });

    const json = await res.json();
    if (!json.ok) throw new Error(json.error || "Failed to analyze image");
    return json.data.blocks;
  }

  /**
   * Conversations: Generates architecture from a textual prompt.
   */
  async generateArchitecture(prompt: string): Promise<any> {
    const res = await fetch(`${API}/api/ai/architecture`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const json = await res.json();
    if (!json.ok) throw new Error(json.error || "Failed to generate architecture");
    return json.data;
  }

  /**
   * Enhances a prompt or provides design suggestions.
   */
  async getDesignSuggestions(prompt: string): Promise<string[]> {
    const res = await fetch(`${API}/api/ai/suggestions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const json = await res.json();
    return json.data || [];
  }
}

export const aiService = new AIService();
