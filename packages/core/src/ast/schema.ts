import { z } from "zod";
 
/**
 * ─── Esquemas de Soporte ──────────────────────────────────────────────────────
 */
 
export const StylesSchema = z.record(z.string()).optional();
 
export const ResponsiveStylesSchema = z.object({
  base: StylesSchema,
  tablet: StylesSchema,
  mobile: StylesSchema,
}).optional();
 
/**
 * ─── Definiciones de Nodos ─────────────────────────────────────────────────────
 */
 
export const BaseNodeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().optional(),
  type: z.enum(["element", "text", "slot", "component"]),
  styles: ResponsiveStylesSchema,
});
 
// Nodo de Elemento (HTML tags o bloques contenedores)
export const ElementNodeSchema = BaseNodeSchema.extend({
  type: z.literal("element"),
  tag: z.string().default("div"),
  props: z.record(z.unknown()).default({}),
  children: z.array(z.lazy(() => BuildevNodeSchema)).default([]),
});
 
// Nodo de Texto
export const TextNodeSchema = BaseNodeSchema.extend({
  type: z.literal("text"),
  content: z.string().default(""),
});
 
// Nodo de Slot (espacios para inyectar contenido en componentes)
export const SlotNodeSchema = BaseNodeSchema.extend({
  type: z.literal("slot"),
  slotName: z.string(),
});
 
/**
 * ─── Árbol de Nodo Unificado (AST) ───────────────────────────────────────────────
 */
 
export const BuildevNodeSchema: z.ZodType<any> = z.lazy(() =>
  z.discriminatedUnion("type", [
    ElementNodeSchema,
    TextNodeSchema,
    SlotNodeSchema,
  ])
);
 
/**
 * ─── Tipos Derivados ────────────────────────────────────────────────────────
 */
 
export type BuildevNode = z.infer<typeof BuildevNodeSchema>;
export type ElementNode = z.infer<typeof ElementNodeSchema>;
export type TextNode = z.infer<typeof TextNodeSchema>;
export type SlotNode = z.infer<typeof SlotNodeSchema>;
export type ResponsiveStyles = z.infer<typeof ResponsiveStylesSchema>;
export type BuildevStyles = z.infer<typeof StylesSchema>;
