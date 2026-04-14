import { Router, Request, Response } from "express";
import { z } from "zod";
import { BuildevAIEngine } from "@buildev/ai-engine";

export const aiRouter = Router();

const VisionSchema = z.object({
  imageUrl: z.string(),
  context: z.string().optional(),
});

const AutoResponsiveSchema = z.object({
  page: z.record(z.unknown()),
  targetBreakpoint: z.enum(["tablet", "mobile"]),
});

const PromptSchema = z.object({
  prompt: z.string().min(1),
});

/** Cuerpo mínimo para el chat de edición (extensible cuando se conecte ai-engine). */
const AiChatSchema = z
  .object({
    prompt: z.string().min(1).optional(),
    messages: z.array(z.object({ role: z.string(), content: z.string() })).optional(),
    pageId: z.string().optional(),
    siteId: z.string().optional(),
  })
  .passthrough();

type AiChatBody = z.infer<typeof AiChatSchema>;

/**
 * Construye turnos de chat y texto corto para `echo` a partir del cuerpo validado.
 *
 * @param data Cuerpo `/api/ai/chat`.
 * @returns Turnos para el motor o `null` si falta contenido usable.
 */
function buildEditorChatTurns(data: AiChatBody): {
  turns: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  echo: string;
} | null {
  if (data.messages && data.messages.length > 0) {
    const turns: Array<{ role: "user" | "assistant" | "system"; content: string }> = [];
    for (const m of data.messages) {
      const content = m.content.trim();
      if (content.length === 0) continue;
      const r = m.role.toLowerCase();
      if (r === "assistant") {
        turns.push({ role: "assistant", content });
      } else if (r === "system") {
        turns.push({ role: "system", content });
      } else {
        turns.push({ role: "user", content });
      }
    }
    if (!turns.some((t) => t.role === "user")) {
      return null;
    }
    const lastUser = [...turns].reverse().find((t) => t.role === "user")?.content ?? "";
    const echo = lastUser.length > 120 ? `${lastUser.slice(0, 120)}…` : lastUser;
    return { turns, echo };
  }
  const p = data.prompt?.trim() ?? "";
  if (p.length === 0) {
    return null;
  }
  const echo = p.length > 120 ? `${p.slice(0, 120)}…` : p;
  return { turns: [{ role: "user", content: p }], echo };
}

/**
 * ─── POST /api/ai/vision ──────────────────────────────────────────────────────
 * Procesa una imagen y devuelve una estructura de BuildevNodes.
 */
aiRouter.post("/vision", async (req: Request, res: Response) => {
  const parsed = VisionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.flatten() });
  }

  try {
    const fallbackNodes = [
      {
        id: "ai-node-1",
        type: "section",
        props: {
          title: "AI parsing fallback",
          source: parsed.data.imageUrl,
          context: parsed.data.context ?? "",
        },
      },
    ];
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.json({
        ok: true,
        data: fallbackNodes,
        note: "OPENAI_API_KEY no definido; respuesta de demostración. Configura la clave en el backend para visión real.",
      });
    }
    res.json({ ok: true, data: fallbackNodes, note: "AI engine package is not linked in this environment." });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    res.status(500).json({ ok: false, error: message });
  }
});

/** Rutas que el editor llama; la lógica completa vive en paquetes AI / roadmap. */
aiRouter.post("/auto-responsive", (req: Request, res: Response) => {
  const parsed = AutoResponsiveSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: parsed.error.flatten() });
    return;
  }
  const page = parsed.data.page;
  const next = {
    ...page,
    meta: {
      ...(typeof page.meta === "object" && page.meta !== null ? page.meta : {}),
      autoResponsiveApplied: parsed.data.targetBreakpoint,
      generatedAt: new Date().toISOString(),
    },
  };
  res.json({ ok: true, data: next, note: "Respuesta base; conecta ai-engine para transformación real." });
});

aiRouter.post("/reverse-ui", (_req: Request, res: Response) => {
  res.json({
    ok: true,
    data: {
      blocks: [
        {
          id: "reverse-ui-section-1",
          type: "section",
          props: {
            title: "Resultado base de reverse UI",
            description: "Conecta el motor AI real para análisis de imagen completo.",
          },
        },
      ],
    },
    note: "Fallback activo.",
  });
});

aiRouter.post("/architecture", (req: Request, res: Response) => {
  const parsed = PromptSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: parsed.error.flatten() });
    return;
  }
  const prompt = parsed.data.prompt.trim();
  res.json({
    ok: true,
    data: {
      name: "Arquitectura sugerida",
      prompt,
      sections: [
        "Hero con CTA",
        "Beneficios",
        "Prueba social",
        "FAQ",
        "Footer",
      ],
    },
    note: "Respuesta base; sustituir por ai-engine para generación avanzada.",
  });
});

aiRouter.post("/suggestions", (req: Request, res: Response) => {
  const parsed = PromptSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: parsed.error.flatten() });
    return;
  }
  const prompt = parsed.data.prompt.toLowerCase();
  const suggestions = [
    "Añade un CTA primario por encima del fold.",
    "Reduce bloques de texto largos y usa bullets.",
    "Verifica contraste de color en títulos y botones.",
  ];
  if (prompt.includes("saas")) {
    suggestions.unshift("Incluye un bloque de pricing con comparación de planes.");
  }
  if (prompt.includes("ecommerce")) {
    suggestions.unshift("Destaca garantía/envíos y badges de confianza junto al CTA.");
  }
  res.json({ ok: true, data: suggestions });
});

/**
 * ─── POST /api/ai/chat ────────────────────────────────────────────────────────
 * Chat de edición: `@buildev/ai-engine` + OpenAI si `OPENAI_API_KEY` está definida.
 */
aiRouter.post("/chat", async (req: Request, res: Response) => {
  const parsed = AiChatSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: parsed.error.flatten() });
    return;
  }
  const built = buildEditorChatTurns(parsed.data);
  if (!built) {
    res.status(400).json({
      ok: false,
      error: "Indica `prompt` o `messages` con al menos un mensaje de usuario con texto.",
    });
    return;
  }
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (apiKey) {
    try {
      const model = (process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini").trim();
      const engine = new BuildevAIEngine({ apiKey, model });
      const reply = await engine.editorChat(built.turns);
      res.json({
        ok: true,
        data: {
          reply,
          echo: built.echo,
          actions: [] as Array<{ type: string; description: string }>,
        },
        note: "openai",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(502).json({ ok: false, error: message });
    }
    return;
  }
  res.json({
    ok: true,
    data: {
      reply:
        "Define OPENAI_API_KEY en el entorno del backend para respuestas reales del asistente. " +
        "Opcional: OPENAI_CHAT_MODEL (por defecto gpt-4o-mini).",
      echo: built.echo,
      actions: [] as Array<{ type: string; description: string }>,
    },
    note: "demo_sin_OPENAI_API_KEY",
  });
});
