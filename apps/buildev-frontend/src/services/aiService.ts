import type { BSBlock, BSPage } from "@buildersite/sdk";

import { apiBase } from "../utils/apiBase";
import { readBuildevApiJson } from "../utils/apiResponse";

function isBlockArray(v: unknown): v is BSBlock[] {
  return Array.isArray(v);
}

class AIService {
  /**
   * Genera una variante responsive de una página o bloque.
   */
  async generateResponsiveVariant(page: BSPage, targetBreakpoint: "tablet" | "mobile"): Promise<BSPage> {
    const res = await fetch(`${apiBase}/api/ai/auto-responsive`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page, targetBreakpoint }),
    });
    const json = await readBuildevApiJson(res);
    if (!json.ok) throw new Error(json.error ?? "Failed to generate responsive variant");
    return json.data as BSPage;
  }

  /**
   * Reverse UI: convierte una imagen en bloques Buildev.
   */
  async reverseUI(file: File): Promise<BSBlock[]> {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`${apiBase}/api/ai/reverse-ui`, {
      method: "POST",
      body: formData,
    });

    const json = await readBuildevApiJson(res);
    if (!json.ok) throw new Error(json.error ?? "Failed to analyze image");
    const payload = json.data as { blocks?: unknown } | null | undefined;
    const blocks = payload?.blocks;
    if (!isBlockArray(blocks)) {
      throw new Error("Respuesta inválida: falta data.blocks");
    }
    return blocks;
  }

  /**
   * Arquitectura desde prompt (estructura definida por el backend cuando exista).
   */
  async generateArchitecture(prompt: string): Promise<unknown> {
    const res = await fetch(`${apiBase}/api/ai/architecture`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const json = await readBuildevApiJson(res);
    if (!json.ok) throw new Error(json.error ?? "Failed to generate architecture");
    return json.data;
  }

  /**
   * Sugerencias de diseño a partir de un prompt.
   */
  async getDesignSuggestions(prompt: string): Promise<string[]> {
    const res = await fetch(`${apiBase}/api/ai/suggestions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const json = await readBuildevApiJson(res);
    const d = json.data;
    if (Array.isArray(d) && d.every((x): x is string => typeof x === "string")) {
      return d;
    }
    return [];
  }

  /**
   * Convierte una imagen (data URL) en bloques vía API de visión del backend.
   *
   * @param dataUrl Imagen en formato data URL (p. ej. desde FileReader).
   * @returns Lista de bloques Buildev.
   */
  async imageToCode(dataUrl: string): Promise<BSBlock[]> {
    const res = await fetch(`${apiBase}/api/ai/vision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: dataUrl, context: "BSAIActionPanel reverse UI" }),
    });
    const json = await readBuildevApiJson(res);
    if (!json.ok) throw new Error(json.error ?? "Fallo al analizar la imagen");
    if (isBlockArray(json.data)) {
      return json.data;
    }
    throw new Error("Respuesta inválida: se esperaba un array de bloques en data");
  }
}

export const aiService = new AIService();
