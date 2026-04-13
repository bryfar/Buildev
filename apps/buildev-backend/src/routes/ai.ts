import { Router, Request, Response } from "express";
import { z } from "zod";

export const aiRouter = Router();

const VisionSchema = z.object({
  imageUrl: z.string(),
  context: z.string().optional(),
});

/**
 * ─── POST /api/ai/vision ──────────────────────────────────────────────────────
 * Procesa una imagen y devuelve una estructura de BuildevNodes.
 */
aiRouter.post("/vision", async (req: Request, res: Response) => {
  const parsed = VisionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.flatten() });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ 
      ok: false, 
      error: "AI Config missing: OPENAI_API_KEY is not defined in the backend environment." 
    });
  }

  try {
    const fallbackNodes = [
      {
        id: "ai-node-1",
        type: "section",
        props: {
          title: "AI parsing fallback",
          source: parsed.data.imageUrl,
          context: parsed.data.context ?? ""
        }
      }
    ];
    res.json({ ok: true, data: fallbackNodes, note: "AI engine package is not linked in this environment." });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    res.status(500).json({ ok: false, error: message });
  }
});

/**
 * ─── POST /api/ai/chat ────────────────────────────────────────────────────────
 * Procesa instrucciones de chat para modificar el diseño.
 */
aiRouter.post("/chat", async (req: Request, res: Response) => {
  // Placeholder para Sprint 3.5
  res.status(501).json({ ok: false, error: "AI Chat editing is not implemented yet." });
});
