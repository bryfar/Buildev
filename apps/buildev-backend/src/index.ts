import "dotenv/config";
import express from "express";
import cors from "cors";

import { authRouter } from "./routes/auth";
import { pagesRouter } from "./routes/pages";
import { componentsRouter } from "./routes/components";
import { assetsRouter } from "./routes/assets";
import { sitesRouter } from "./routes/sites";
import { contentModelRouter } from "./routes/content-model";
import { publicRouter } from "./routes/public";

const app = express();

// ─── Middlewares globales ──────────────────────────────────────────────────────
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "5mb" }));

// ─── Rutas privadas (requieren JWT) ───────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/pages", pagesRouter);
app.use("/api/sites", sitesRouter);
app.use("/api/components", componentsRouter);
app.use("/api/assets", assetsRouter);
app.use("/api/content-models", contentModelRouter);

// ─── Rutas públicas del SDK (requieren API Key) ───────────────────────────────
app.use("/api/public", publicRouter);

// ─── Healthcheck ──────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "buildersite-backend", version: "0.2.0" });
});

// ─── Arranque ─────────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`[Buildersite Backend] ▶  http://localhost:${PORT}`);
  console.log("  Rutas privadas: /api/auth | /api/pages | /api/sites | /api/components | /api/content-models");
  console.log("  Rutas SDK:      /api/public/page | /api/public/events | /api/public/page/:id/publications");
});
