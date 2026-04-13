import { Router, Request, Response } from "express";
import { z } from "zod";
import { BuildevAIEngine } from "@buildev/ai-engine";

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
    const engine = new BuildevAIEngine({ apiKey });
    const nodes = await engine.imageToNodes(parsed.data.imageUrl, parsed.data.context);

    res.json({ ok: true, data: nodes });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
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
