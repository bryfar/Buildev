import OpenAI from "openai";
import { SYSTEM_PROMPT_VISION, getVisionUserPrompt } from "./prompts/vision";
import type { BuildevNode } from "@buildev/core";

const EDITOR_CHAT_SYSTEM =
  "Eres el asistente de diseño del editor visual Buildev. Responde en el mismo idioma que el usuario, " +
  "de forma breve y accionable. Prioriza consejos de layout, jerarquía visual, tipografía, CTAs, espaciado y accesibilidad. " +
  "No inventes bloques JSON ni código salvo que el usuario lo pida explícitamente.";

export interface AIEngineConfig {
  apiKey: string;
  model?: string;
}

export class BuildevAIEngine {
  private client: OpenAI;
  private model: string;

  constructor(config: AIEngineConfig) {
    this.client = new OpenAI({ apiKey: config.apiKey });
    this.model = config.model || "gpt-4o";
  }

  /**
   * Convierte una imagen (vía URL o Base64) en un árbol de nodos de Buildev.
   * @param imageUrl URL de la imagen o string Base64 (data:image/jpeg;base64,...)
   * @param context Contexto opcional para guiar a la IA
   * @returns Array de BuildevNodes generados
   */
  async imageToNodes(imageUrl: string, context?: string): Promise<BuildevNode[]> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT_VISION },
          {
            role: "user",
            content: [
              { type: "text", text: getVisionUserPrompt(context) },
              {
                type: "image_url",
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error("IA returned empty content");

      const data = JSON.parse(content) as { nodes?: unknown };
      return Array.isArray(data.nodes) ? (data.nodes as BuildevNode[]) : [];
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`AI processing failed: ${message}`);
    }
  }

  /**
   * Chat del editor: conversación con el modelo (BYOK).
   *
   * @param turns Mensajes user/assistant/system en orden (sin incluir el system fijo de Buildev).
   * @returns Texto de respuesta del asistente.
   */
  async editorChat(
    turns: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  ): Promise<string> {
    if (turns.length === 0) {
      throw new Error("Se requiere al menos un mensaje");
    }
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: EDITOR_CHAT_SYSTEM },
      ...turns.map(
        (t): OpenAI.Chat.ChatCompletionMessageParam => ({
          role: t.role,
          content: t.content,
        }),
      ),
    ];
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      temperature: 0.55,
    });
    const text = response.choices[0]?.message?.content?.trim();
    if (!text) {
      throw new Error("La IA no devolvió contenido");
    }
    return text;
  }

  /**
   * Genera sugerencias de diseño basadas en una instrucción de chat (edición de nodos; roadmap).
   *
   * @param _nodes Árbol actual (reservado para futuras mutaciones).
   * @param _instruction Instrucción del usuario.
   * @returns Parches parciales de nodos (vacío hasta Sprint 3.5).
   */
  async chatToStyle(_nodes: BuildevNode[], _instruction: string): Promise<Partial<BuildevNode>[]> {
    return [];
  }
}
