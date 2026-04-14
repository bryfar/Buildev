/**
 * Catálogo tipo Relume: 12 familias de secciones × 10 variantes = 120 plantillas.
 * Inspirado en el enfoque de librería + variantes de https://www.relume.io/
 */
import type { BSBlock } from "@buildersite/sdk";
import { createBlock } from "./blocks";
import type { ComponentLibraryPreset } from "./componentLibraryPresets";

interface Palette {
    bg: string;
    surface: string;
    text: string;
    mut: string;
    accent: string;
}

const PALETTES: Palette[] = [
    { bg: "#0f172a", surface: "#1e293b", text: "#f8fafc", mut: "#94a3b8", accent: "#818cf8" },
    { bg: "#fafafa", surface: "#ffffff", text: "#0a0a0a", mut: "#525252", accent: "#2563eb" },
    { bg: "#ecfdf5", surface: "#d1fae5", text: "#022c22", mut: "#047857", accent: "#059669" },
    { bg: "#fff7ed", surface: "#ffedd5", text: "#431407", mut: "#9a3412", accent: "#ea580c" },
    { bg: "#eff6ff", surface: "#dbeafe", text: "#172554", mut: "#1d4ed8", accent: "#2563eb" },
    { bg: "#faf5ff", surface: "#f3e8ff", text: "#3b0764", mut: "#7e22ce", accent: "#9333ea" },
    { bg: "#fef2f2", surface: "#fee2e2", text: "#450a0a", mut: "#991b1b", accent: "#dc2626" },
    { bg: "#f8fafc", surface: "#e2e8f0", text: "#0f172a", mut: "#64748b", accent: "#0ea5e9" },
    { bg: "#18181b", surface: "#27272a", text: "#fafafa", mut: "#a1a1aa", accent: "#eab308" },
    { bg: "#fdf4ff", surface: "#fae8ff", text: "#701a75", mut: "#a21caf", accent: "#c026d3" },
];

function pal(v: number): Palette {
    return PALETTES[v % PALETTES.length]!;
}

function wrapMax(inner: BSBlock[], p: Palette, padY: string, gap: number): BSBlock {
    const section = createBlock("section", { padding: padY, background: p.bg });
    const container = createBlock("container", {
        maxWidth: "1120px",
        margin: "0 auto",
        flexDirection: "column",
        gap,
        padding: "0",
    });
    container.children = inner;
    section.children = [container];
    return section;
}

function buildHero(v: number): BSBlock {
    const p = pal(v);
    const pad = `${48 + (v % 5) * 8}px 24px`;
    const align = v % 2 === 0 ? "center" : "flex-start";
    const h = createBlock("heading", {
        content: ["Tu producto, explicado en segundos", "Marca líder en tu categoría", "Diseño que convierte visitas"][v % 3]!,
        level: 1,
        color: p.text,
        textAlign: align === "center" ? "center" : "left",
    });
    const t = createBlock("text", {
        content:
            "Subtítulo orientado a beneficio. Ajusta copy y tokens según tu design system activo en el dashboard.",
        fontSize: 17 + (v % 3),
        color: p.mut,
        textAlign: align === "center" ? "center" : "left",
    });
    const row = createBlock("container", {
        flexDirection: "row",
        gap: 12 + v,
        padding: "0",
        justifyContent: align === "center" ? "center" : "flex-start",
    });
    const b1 = createBlock("button", { label: "Empezar", href: "#", variant: "primary" });
    const b2 = createBlock("button", { label: "Ver planes", href: "#", variant: "secondary" });
    row.children = [b1, b2];
    const inner = createBlock("container", {
        maxWidth: "720px",
        margin: align === "center" ? "0 auto" : "0",
        flexDirection: "column",
        gap: 18,
        padding: "0",
        alignItems: align,
    });
    inner.children = [h, t, row];
    return wrapMax([inner], p, pad, 0);
}

function buildLogos(v: number): BSBlock {
    const p = pal(v);
    const title = createBlock("heading", {
        content: "Confían en nosotros",
        level: 3,
        color: p.text,
        textAlign: "center",
    });
    const row = createBlock("container", {
        flexDirection: "row",
        gap: 20 + v * 2,
        padding: "16px 0",
        justifyContent: "center",
        flexWrap: "wrap",
    });
    const n = 4 + (v % 3);
    for (let i = 0; i < n; i += 1) {
        const logo = createBlock("container", {
            padding: "12px 20px",
            background: p.surface,
            borderRadius: "8px",
            minWidth: "100px",
            textAlign: "center",
        });
        logo.children = [
            createBlock("text", {
                content: `LOGO ${i + 1}`,
                fontSize: 11,
                color: p.mut,
            }),
        ];
        row.children!.push(logo);
    }
    return wrapMax([title, row], p, `${40 + v * 4}px 24px`, 20);
}

function buildFeatures(v: number): BSBlock {
    const p = pal(v);
    const h = createBlock("heading", {
        content: "Características principales",
        level: 2,
        color: p.text,
        textAlign: "center",
    });
    const sub = createBlock("text", {
        content: "Tres columnas listas para mapear a tu sistema de diseño.",
        fontSize: 15,
        color: p.mut,
        textAlign: "center",
    });
    const cols = createBlock("columns", { columns: 3, gap: 20 + v, padding: "8px 0" });
    for (let c = 0; c < 3; c += 1) {
        const card = createBlock("container", {
            padding: "20px",
            background: p.surface,
            borderRadius: "12px",
            flexDirection: "column",
            gap: 10,
            column: c,
        });
        card.children = [
            createBlock("heading", { content: `Feature ${c + 1}`, level: 4, color: p.text }),
            createBlock("text", {
                content: "Descripción breve del valor para el usuario final.",
                fontSize: 14,
                color: p.mut,
            }),
            createBlock("button", { label: "Saber más", href: "#", variant: "secondary" }),
        ];
        cols.children!.push(card);
    }
    return wrapMax([h, sub, cols], p, `${56 + v * 2}px 24px`, 16);
}

function buildStats(v: number): BSBlock {
    const p = pal(v);
    const h = createBlock("heading", { content: "Resultados en números", level: 3, color: p.text });
    const row = createBlock("container", {
        flexDirection: "row",
        gap: 16,
        padding: "12px 0",
        flexWrap: "wrap",
        justifyContent: "space-between",
    });
    const stats = [
        { n: `${120 + v * 11}%`, l: "Más velocidad" },
        { n: `${8 + v}k`, l: "Usuarios activos" },
        { n: `${40 + v}`, l: "Países" },
        { n: `${99 - (v % 5)}%`, l: "Satisfacción" },
    ];
    for (const s of stats) {
        const cell = createBlock("container", {
            padding: "16px",
            background: p.surface,
            borderRadius: "10px",
            minWidth: "140px",
            flex: "1",
        });
        cell.children = [
            createBlock("heading", { content: s.n, level: 2, color: p.accent }),
            createBlock("text", { content: s.l, fontSize: 13, color: p.mut }),
        ];
        row.children!.push(cell);
    }
    return wrapMax([h, row], p, `${44 + v * 3}px 24px`, 14);
}

function buildTestimonials(v: number): BSBlock {
    const p = pal(v);
    const quote = createBlock("text", {
        content:
            "“El flujo de trabajo con plantillas por variante nos permitió entregar en la mitad de tiempo, sin sacrificar calidad.”",
        fontSize: 17 + (v % 2),
        color: p.text,
        fontStyle: "italic",
    });
    const author = createBlock("text", {
        content: `— Cliente ${v + 1}, ${["Product", "Marketing", "Ops"][v % 3]}`,
        fontSize: 14,
        color: p.mut,
    });
    const card = createBlock("container", {
        padding: "28px",
        background: p.surface,
        borderRadius: "14px",
        flexDirection: "column",
        gap: 14,
        border: `1px solid ${p.mut}33`,
    });
    card.children = [quote, author];
    return wrapMax([card], p, `${52 + v * 2}px 24px`, 0);
}

function buildFaq(v: number): BSBlock {
    const p = pal(v);
    const h = createBlock("heading", { content: "Preguntas frecuentes", level: 2, color: p.text });
    const items: BSBlock[] = [h];
    for (let i = 0; i < 4; i += 1) {
        const box = createBlock("container", {
            padding: "14px 0",
            background: "transparent",
            flexDirection: "column",
            gap: 6,
            borderBottom: `1px solid ${p.mut}44`,
        });
        box.children = [
            createBlock("heading", {
                content: `¿Pregunta típica ${i + 1 + v}?`,
                level: 4,
                color: p.text,
            }),
            createBlock("text", {
                content: "Respuesta corta editable. Conecta con tu CMS o deja copy estático.",
                fontSize: 14,
                color: p.mut,
            }),
        ];
        items.push(box);
    }
    return wrapMax(items, p, `${48 + v}px 24px`, 12);
}

function buildCta(v: number): BSBlock {
    const p = pal(v);
    const row = createBlock("container", {
        flexDirection: "row",
        gap: 24,
        padding: "0",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
    });
    const left = createBlock("container", { flexDirection: "column", gap: 8, padding: "0", flex: "1" });
    left.children = [
        createBlock("heading", {
            content: ["¿Listo para lanzar?", "Agenda una demo", "Únete hoy"][v % 3]!,
            level: 2,
            color: p.text,
        }),
        createBlock("text", {
            content: "Banda CTA reutilizable con 10 variantes de color y densidad.",
            fontSize: 15,
            color: p.mut,
        }),
    ];
    const btn = createBlock("button", { label: "Comenzar", href: "#", variant: "primary" });
    row.children = [left, btn];
    return wrapMax([row], p, `${36 + v * 4}px 28px`, 0);
}

function buildPricing(v: number): BSBlock {
    const p = pal(v);
    const h = createBlock("heading", { content: "Planes simples", level: 2, color: p.text, textAlign: "center" });
    const cols = createBlock("columns", { columns: 3, gap: 18 + v, padding: "12px 0" });
    const tiers = ["Starter", "Pro", "Enterprise"];
    const prices = ["$19", "$49", "$99"];
    for (let c = 0; c < 3; c += 1) {
        const card = createBlock("container", {
            padding: "22px",
            background: c === 1 ? p.accent + "18" : p.surface,
            borderRadius: "12px",
            flexDirection: "column",
            gap: 10,
            column: c,
            border: c === 1 ? `2px solid ${p.accent}` : `1px solid ${p.mut}33`,
        });
        card.children = [
            createBlock("heading", { content: tiers[c]!, level: 4, color: p.text }),
            createBlock("heading", { content: prices[c]!, level: 2, color: p.accent }),
            createBlock("text", { content: "Ideal para equipos en crecimiento.", fontSize: 13, color: p.mut }),
            createBlock("button", { label: "Elegir", href: "#", variant: c === 1 ? "primary" : "secondary" }),
        ];
        cols.children!.push(card);
    }
    return wrapMax([h, cols], p, `${56 + v * 2}px 24px`, 16);
}

function buildTeam(v: number): BSBlock {
    const p = pal(v);
    const h = createBlock("heading", { content: "Equipo", level: 2, color: p.text, textAlign: "center" });
    const cols = createBlock("columns", { columns: 4, gap: 14 + v, padding: "8px 0" });
    for (let c = 0; c < 4; c += 1) {
        const card = createBlock("container", {
            padding: "12px",
            background: p.surface,
            borderRadius: "10px",
            flexDirection: "column",
            gap: 8,
            alignItems: "center",
            column: c,
        });
        card.children = [
            createBlock("image", {
                src: `https://picsum.photos/seed/${v * 10 + c}/120/120`,
                alt: "Miembro",
                width: "120px",
            }),
            createBlock("heading", { content: `Nombre ${c + 1}`, level: 4, color: p.text }),
            createBlock("text", { content: ["Engineering", "Design", "Growth", "Success"][c]!, fontSize: 12, color: p.mut }),
        ];
        cols.children!.push(card);
    }
    return wrapMax([h, cols], p, `${50 + v * 2}px 24px`, 14);
}

function buildContact(v: number): BSBlock {
    const p = pal(v);
    const h = createBlock("heading", { content: "Contacto", level: 2, color: p.text });
    const cols = createBlock("columns", { columns: 2, gap: 28 + v, padding: "8px 0" });
    const formCol = createBlock("container", {
        padding: "0",
        flexDirection: "column",
        gap: 10,
        column: 0,
    });
    const form = createBlock("form", { showSubmit: true, submitLabel: "Enviar", gap: 12, padding: "0" });
    form.children = [
        createBlock("input", { label: "Nombre", placeholder: "Tu nombre", type: "text" }),
        createBlock("input", { label: "Email", placeholder: "tu@email.com", type: "email" }),
    ];
    formCol.children = [form];
    const textCol = createBlock("container", {
        padding: "0",
        flexDirection: "column",
        gap: 10,
        column: 1,
    });
    textCol.children = [
        createBlock("text", {
            content: "Cuéntanos tu proyecto. Esta sección combina formulario + copy lateral como en sitios marketing.",
            fontSize: 15,
            color: p.mut,
        }),
        createBlock("button", { label: "Agendar llamada", href: "#", variant: "secondary" }),
    ];
    cols.children = [formCol, textCol];
    return wrapMax([h, cols], p, `${48 + v * 3}px 24px`, 12);
}

function buildBlog(v: number): BSBlock {
    const p = pal(v);
    const h = createBlock("heading", { content: "Desde el blog", level: 2, color: p.text });
    const cols = createBlock("columns", { columns: 3, gap: 16 + v, padding: "8px 0" });
    for (let c = 0; c < 3; c += 1) {
        const innerWrap = createBlock("container", {
            padding: "16px",
            flexDirection: "column",
            gap: 8,
            background: "transparent",
        });
        innerWrap.children = [
            createBlock("heading", { content: `Artículo ${c + 1 + v}`, level: 4, color: p.text }),
            createBlock("text", { content: "Resumen de dos líneas para teaser de listado.", fontSize: 13, color: p.mut }),
            createBlock("button", { label: "Leer", href: "#", variant: "secondary" }),
        ];
        const card = createBlock("container", {
            padding: "0",
            background: p.surface,
            borderRadius: "12px",
            overflow: "hidden",
            flexDirection: "column",
            column: c,
        });
        card.children = [
            createBlock("image", {
                src: `https://picsum.photos/seed/blog${v}${c}/400/200`,
                alt: "Post",
                width: "100%",
            }),
            innerWrap,
        ];
        cols.children!.push(card);
    }
    return wrapMax([h, cols], p, `${44 + v * 2}px 24px`, 12);
}

function buildFooter(v: number): BSBlock {
    const p = pal(v);
    const top = createBlock("container", {
        flexDirection: "row",
        gap: 32,
        padding: "0 0 20px",
        flexWrap: "wrap",
        justifyContent: "space-between",
    });
    const brand = createBlock("container", { flexDirection: "column", gap: 6, padding: "0" });
    brand.children = [
        createBlock("heading", { content: "Marca", level: 4, color: p.text }),
        createBlock("text", { content: "Pie minimal con enlaces simulados.", fontSize: 13, color: p.mut }),
    ];
    const links = createBlock("container", { flexDirection: "row", gap: 16, padding: "0", flexWrap: "wrap" });
    links.children = ["Producto", "Recursos", "Legal", "Estado"].map((label) =>
        createBlock("button", { label, href: "#", variant: "secondary" }),
    );
    top.children = [brand, links];
    const copy = createBlock("text", {
        content: `© ${new Date().getFullYear()} Tu empresa · Variante ${v + 1}`,
        fontSize: 12,
        color: p.mut,
    });
    return wrapMax([top, createBlock("divider", { marginTop: "8px", color: p.mut + "55" }), copy], p, `${40 + v * 2}px 24px`, 10);
}

type Builder = (v: number) => BSBlock;

const SECTION_BUILDERS: { slug: string; category: string; build: Builder }[] = [
    { slug: "hero", category: "Hero", build: buildHero },
    { slug: "logos", category: "Logos / prueba social", build: buildLogos },
    { slug: "features", category: "Features", build: buildFeatures },
    { slug: "stats", category: "Stats", build: buildStats },
    { slug: "testimonials", category: "Testimonios", build: buildTestimonials },
    { slug: "faq", category: "FAQ", build: buildFaq },
    { slug: "cta", category: "CTA", build: buildCta },
    { slug: "pricing", category: "Pricing", build: buildPricing },
    { slug: "team", category: "Team", build: buildTeam },
    { slug: "contact", category: "Contacto", build: buildContact },
    { slug: "blog", category: "Blog / recursos", build: buildBlog },
    { slug: "footer", category: "Footer", build: buildFooter },
];

/** 120 plantillas de sección (12 × 10), nombres tipo Relume: «Categoría / 01» … «/ 10». */
export const SECTION_LIBRARY_PRESETS: ComponentLibraryPreset[] = SECTION_BUILDERS.flatMap(({ slug, category, build }) =>
    Array.from({ length: 10 }, (_, i) => {
        const v = i;
        const n = String(v + 1).padStart(2, "0");
        return {
            id: `preset-sec-${slug}-${n}`,
            name: `${category} / ${n}`,
            description: `Sección ${category}. Variante ${n} de 10 (paleta y densidad distintas por número).`,
            category,
            rootBlock: build(v),
        };
    }),
);
