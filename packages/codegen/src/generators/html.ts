import type { BuildevNode, ElementNode, TextNode } from "@buildev/core";

/**
 * Convierte un objeto de estilos de Buildev (camelCase) en un string de CSS (kebab-case).
 */
export function stringifyStyles(styles: Record<string, string>): string {
  return Object.entries(styles)
    .map(([key, value]) => {
      const kebabName = key.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
      return `${kebabName}: ${value};`;
    })
    .join(" ");
}

/**
 * Genera el HTML limpio de un nodo y sus hijos de forma recursiva.
 */
export function generateHTML(node: BuildevNode, indent: number = 0): string {
  const spaces = " ".repeat(indent);

  if (node.type === "text") {
    return `${spaces}${(node as TextNode).content}`;
  }

  if (node.type === "element") {
    const element = node as ElementNode;
    const styleStr = element.styles?.base ? ` style="${stringifyStyles(element.styles.base)}"` : "";
    
    // Props adicionales (src, href, etc)
    const propsStr = Object.entries(element.props || {})
      .map(([k, v]) => ` ${k}="${v}"`)
      .join("");

    const tag = element.tag || "div";
    const openingTag = `<${tag}${propsStr}${styleStr}>`;
    const closingTag = `</${tag}>`;

    if (!element.children || element.children.length === 0) {
      // Tags auto-concluidos o vacíos
      if (["img", "br", "hr", "input"].includes(tag)) {
        return `${spaces}<${tag}${propsStr}${styleStr} />`;
      }
      return `${spaces}${openingTag}${closingTag}`;
    }

    const childrenHtml = element.children
      .map((child) => generateHTML(child, indent + 2))
      .join("\n");

    return `${spaces}${openingTag}\n${childrenHtml}\n${spaces}${closingTag}`;
  }

  return "";
}

/**
 * Genera un documento HTML completo listo para previsualizar.
 */
export function generateFullHTML(nodes: BuildevNode[]): string {
  const body = nodes.map((n) => generateHTML(n)).join("\n");
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Buildev Preview</title>
  <style>
    body { font-family: sans-serif; margin: 0; padding: 0; }
  </style>
</head>
<body>
${body}
</body>
</html>
  `.trim();
}
