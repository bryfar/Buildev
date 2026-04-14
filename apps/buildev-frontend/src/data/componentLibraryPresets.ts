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

interface NavbarTheme {
    sectionBg: string;
    logoColor: string;
    linkColor: string;
    buttonVariant: "primary" | "secondary";
}

function buildNavbarVariant(variant: number): BSBlock {
    const themes: NavbarTheme[] = [
        { sectionBg: "#ffffff", logoColor: "#0f172a", linkColor: "#334155", buttonVariant: "primary" },
        { sectionBg: "#0f172a", logoColor: "#f8fafc", linkColor: "#cbd5e1", buttonVariant: "secondary" },
        { sectionBg: "#eff6ff", logoColor: "#1e3a8a", linkColor: "#1d4ed8", buttonVariant: "primary" },
        { sectionBg: "#f8fafc", logoColor: "#111827", linkColor: "#475569", buttonVariant: "secondary" },
        { sectionBg: "#ecfdf5", logoColor: "#064e3b", linkColor: "#047857", buttonVariant: "primary" },
        { sectionBg: "#fff7ed", logoColor: "#7c2d12", linkColor: "#c2410c", buttonVariant: "secondary" },
        { sectionBg: "#18181b", logoColor: "#fafafa", linkColor: "#d4d4d8", buttonVariant: "primary" },
        { sectionBg: "#faf5ff", logoColor: "#581c87", linkColor: "#7e22ce", buttonVariant: "secondary" },
        { sectionBg: "#fef2f2", logoColor: "#7f1d1d", linkColor: "#b91c1c", buttonVariant: "primary" },
        { sectionBg: "#f0f9ff", logoColor: "#0c4a6e", linkColor: "#0369a1", buttonVariant: "secondary" },
    ];
    const alignments = ["space-between", "center", "flex-start"] as const;
    const theme = themes[variant]!;
    const justifyContent = alignments[variant % alignments.length]!;
    const section = createBlock("section", {
        padding: `${16 + (variant % 3) * 4}px 24px`,
        background: theme.sectionBg,
    });
    const container = createBlock("container", {
        maxWidth: "1120px",
        margin: "0 auto",
        flexDirection: "row",
        alignItems: "center",
        justifyContent,
        gap: 16 + variant,
        padding: "0",
        flexWrap: "wrap",
    });
    const brand = createBlock("heading", {
        content: `Marca ${variant + 1}`,
        level: 4,
        color: theme.logoColor,
    });
    const links = createBlock("container", {
        flexDirection: "row",
        gap: 10 + (variant % 4) * 2,
        padding: "0",
        flexWrap: "wrap",
        justifyContent: justifyContent === "center" ? "center" : "flex-start",
    });
    const labels = ["Inicio", "Producto", "Precios", "Contacto"];
    links.children = labels.map((label) =>
        createBlock("button", {
            label,
            href: "#",
            variant: "secondary",
            color: theme.linkColor,
        }),
    );
    const cta = createBlock("button", {
        label: variant % 2 === 0 ? "Empezar" : "Solicitar demo",
        href: "#",
        variant: theme.buttonVariant,
    });
    container.children = [brand, links, cta];
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
    ...Array.from({ length: 10 }, (_, i) => {
        const n = String(i + 1).padStart(2, "0");
        return {
            id: `preset-navbar-${n}`,
            name: `Navbar / ${n}`,
            description: `Barra de navegación variante ${n} con estilos y alineación distintos.`,
            category: "Navbar",
            rootBlock: buildNavbarVariant(i),
        };
    }),
];
