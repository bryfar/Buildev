import type { BSBlock } from "@buildersite/sdk";
import { createBlock } from "./blocks";

/** Plantilla reutilizable del catálogo (no es fila en BD hasta que el usuario la importe). */
export interface ComponentLibraryPreset {
    id: string;
    name: string;
    description: string;
    /** Texto libre para filtrar en UI (p. ej. coincide con nombre de tu design system). */
    category: string;
    rootBlock: BSBlock;
}

function buildHero(): BSBlock {
    const section = createBlock("section", { padding: "72px 24px", background: "#0f172a" });
    const container = createBlock("container", {
        maxWidth: "720px",
        margin: "0 auto",
        flexDirection: "column",
        gap: 20,
        padding: "0",
    });
    const heading = createBlock("heading", {
        content: "Construye más rápido",
        level: 1,
        color: "#f8fafc",
    });
    const text = createBlock("text", {
        content: "Arrastra bloques o importa esta plantilla a tu librería del proyecto.",
        fontSize: 17,
        color: "#cbd5e1",
    });
    const row = createBlock("container", { flexDirection: "row", gap: 12, padding: "0" });
    const primary = createBlock("button", { label: "Empezar", href: "#", variant: "primary" });
    const ghost = createBlock("button", { label: "Ver demo", href: "#", variant: "secondary" });
    row.children = [primary, ghost];
    container.children = [heading, text, row];
    section.children = [container];
    return section;
}

function buildFeatureRow(): BSBlock {
    const section = createBlock("section", { padding: "48px 20px", background: "#ffffff" });
    const container = createBlock("container", {
        maxWidth: "960px",
        margin: "0 auto",
        flexDirection: "row",
        gap: 24,
        padding: "0",
    });
    const columns: BSBlock[] = [];
    for (let i = 0; i < 3; i += 1) {
        const card = createBlock("container", {
            flex: "1",
            padding: "20px",
            background: "#f8fafc",
            flexDirection: "column",
            gap: 10,
        });
        const h = createBlock("heading", { content: `Ventaja ${i + 1}`, level: 3, color: "#0f172a" });
        const t = createBlock("text", {
            content: "Descripción breve del beneficio para el visitante.",
            fontSize: 14,
            color: "#475569",
        });
        card.children = [h, t];
        columns.push(card);
    }
    container.children = columns;
    section.children = [container];
    return section;
}

function buildCtaBand(): BSBlock {
    const section = createBlock("section", { padding: "40px 24px", background: "#4f46e5" });
    const container = createBlock("container", {
        maxWidth: "900px",
        margin: "0 auto",
        flexDirection: "row",
        gap: 24,
        padding: "0",
    });
    const text = createBlock("heading", {
        content: "¿Listo para publicar?",
        level: 2,
        color: "#ffffff",
    });
    const btn = createBlock("button", { label: "Crear cuenta", href: "#", variant: "primary" });
    container.children = [text, btn];
    section.children = [container];
    return section;
}

/** Catálogo inicial de plantillas; el usuario puede arrastrarlas o importarlas a la librería del proyecto. */
export const COMPONENT_LIBRARY_PRESETS: ComponentLibraryPreset[] = [
    {
        id: "preset-hero-dark",
        name: "Hero / Oscuro",
        description: "Título, texto y dos botones sobre fondo oscuro.",
        category: "Landing",
        rootBlock: buildHero(),
    },
    {
        id: "preset-features-3",
        name: "Features / Tres columnas",
        description: "Tres tarjetas de beneficios en fila.",
        category: "Marketing",
        rootBlock: buildFeatureRow(),
    },
    {
        id: "preset-cta-band",
        name: "CTA / Banda",
        description: "Llamada a la acción compacta con botón.",
        category: "Conversion",
        rootBlock: buildCtaBand(),
    },
];
