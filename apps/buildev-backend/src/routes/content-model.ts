import { Router, Response } from "express";
import { z } from "zod";
import { prisma } from "../services/db";
import { requireAuth, AuthRequest } from "../middleware/auth";
import type { BSFieldDefinition } from "@buildersite/domain";

export const contentModelRouter = Router();

contentModelRouter.use(requireAuth as any);

const FieldDefSchema = z.object({
    name: z.string().min(1),
    type: z.string(),
    required: z.boolean().optional(),
    defaultValue: z.unknown().optional(),
    description: z.string().optional(),
});

const CreateModelSchema = z.object({
    name: z.string().min(1).regex(/^[a-z0-9-]+$/, "slug format only"),
    displayName: z.string().min(1),
    fields: z.array(FieldDefSchema).default([]),
});

// ─── GET /api/content-models ──────────────────────────────────────────────────
contentModelRouter.get("/", async (req: AuthRequest, res: Response) => {
    const models = await prisma.contentModel.findMany({
        where: { siteId: req.auth!.siteId },
        orderBy: { name: "asc" },
    });
    res.json({ ok: true, data: models.map(deserialize) });
});

// ─── POST /api/content-models ─────────────────────────────────────────────────
contentModelRouter.post("/", async (req: AuthRequest, res: Response) => {
    const parsed = CreateModelSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ ok: false, error: parsed.error.flatten() }); return;
    }
    const model = await prisma.contentModel.create({
        data: {
            siteId: req.auth!.siteId,
            name: parsed.data.name,
            displayName: parsed.data.displayName,
            fieldsJson: JSON.stringify(parsed.data.fields),
        },
    });
    res.status(201).json({ ok: true, data: deserialize(model) });
});

// ─── PATCH /api/content-models/:id ───────────────────────────────────────────
const UpdateModelSchema = z.object({
    displayName: z.string().min(1).optional(),
    fields: z.array(FieldDefSchema).optional(),
});

contentModelRouter.patch("/:id", async (req: AuthRequest, res: Response) => {
    const parsed = UpdateModelSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ ok: false, error: parsed.error.flatten() }); return;
    }
    const { fields, ...rest } = parsed.data;
    const data: Record<string, unknown> = { ...rest };
    if (fields !== undefined) data.fieldsJson = JSON.stringify(fields);
    const model = await prisma.contentModel.update({ where: { id: req.params.id }, data });
    res.json({ ok: true, data: deserialize(model) });
});

// ─── DELETE /api/content-models/:id ──────────────────────────────────────────
contentModelRouter.delete("/:id", async (req: AuthRequest, res: Response) => {
    await prisma.contentModel.delete({ where: { id: req.params.id } });
    res.json({ ok: true, data: null });
});

function deserialize(row: {
    id: string; siteId: string; name: string; displayName: string;
    fieldsJson: string; createdAt: Date; updatedAt: Date;
}) {
    return {
        id: row.id,
        siteId: row.siteId,
        name: row.name,
        displayName: row.displayName,
        fields: JSON.parse(row.fieldsJson) as BSFieldDefinition[],
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
    };
}
