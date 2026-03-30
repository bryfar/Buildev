import { v4 as uuid } from "uuid";
import type { BSBlock } from "@buildersite/sdk";

export interface BlockDefinition {
    type: string;
    label: string;
    icon: string;
    defaultProps: Record<string, any>;
}

export const blockTypes: BlockDefinition[] = [
    { type: "section", label: "Section", icon: "▭", defaultProps: { padding: "40px 20px", background: "#ffffff" } },
    { type: "container", label: "Container", icon: "📦", defaultProps: { padding: "20px", background: "transparent", flexDirection: "column", gap: 16 } },
    { type: "columns", label: "Columns", icon: "‖", defaultProps: { columns: 2, gap: 20, padding: "0px" } },
    { type: "heading", label: "Heading", icon: "H", defaultProps: { content: "Heading", level: 2, color: "#111111" } },
    { type: "text", label: "Text", icon: "T", defaultProps: { content: "Hello world", fontSize: 16 } },
    { type: "image", label: "Image", icon: "🖼", defaultProps: { src: "https://picsum.photos/400/300", alt: "Image", width: "100%" } },
    { type: "button", label: "Button", icon: "🔲", defaultProps: { label: "Click me", href: "#", variant: "primary" } },
    { type: "video", label: "Video", icon: "▶", defaultProps: { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", width: "100%", aspectRatio: "16 / 9" } },
    { type: "divider", label: "Divider", icon: "―", defaultProps: { thickness: 1, style: "solid", color: "#e2e8f0", marginTop: "16px", marginBottom: "16px" } },
    { type: "spacer", label: "Spacer", icon: "↕", defaultProps: { height: 40 } },
    { type: "form", label: "Form", icon: "📋", defaultProps: { showSubmit: true, submitLabel: "Submit", submitVariant: "primary", gap: 16, padding: "20px" } },
    { type: "input", label: "Input", icon: "⌨", defaultProps: { label: "Label", placeholder: "Type here...", type: "text" } },
];

export function createBlock(type: string, overrides: Record<string, any> = {}): BSBlock {
    const bt = blockTypes.find(b => b.type === type);
    if (!bt) throw new Error(`Invalid block type: ${type}`);

    return {
        id: uuid(),
        type,
        props: { ...bt.defaultProps, ...overrides },
        children: []
    };
}
