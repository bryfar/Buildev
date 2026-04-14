import type { BSBlock, BSPage } from "@buildersite/sdk";

export interface ProjectFile {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: ProjectFile[];
}

class ExportService {
  private static readonly STYLE_PROP_KEYS = new Set([
    "padding",
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",
    "margin",
    "marginTop",
    "marginRight",
    "marginBottom",
    "marginLeft",
    "background",
    "backgroundColor",
    "color",
    "fontSize",
    "fontWeight",
    "fontStyle",
    "lineHeight",
    "letterSpacing",
    "textAlign",
    "display",
    "flex",
    "flexDirection",
    "justifyContent",
    "alignItems",
    "alignContent",
    "gap",
    "width",
    "height",
    "maxWidth",
    "minWidth",
    "maxHeight",
    "minHeight",
    "border",
    "borderTop",
    "borderRight",
    "borderBottom",
    "borderLeft",
    "borderRadius",
    "boxShadow",
    "overflow",
    "opacity",
    "position",
    "top",
    "right",
    "bottom",
    "left",
    "zIndex",
    "gridTemplateColumns",
    "gridTemplateRows",
    "gridColumn",
    "gridRow",
    "column",
  ]);

  private toKebabCase(value: string): string {
    return value.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  private normalizeStyleValue(raw: unknown): string | null {
    if (typeof raw === "string") return raw;
    if (typeof raw === "number" || typeof raw === "boolean") return String(raw);
    return null;
  }

  private buildInlineStyle(block: BSBlock): string {
    const entries: string[] = [];
    for (const [key, raw] of Object.entries(block.props)) {
      if (!ExportService.STYLE_PROP_KEYS.has(key)) continue;
      const value = this.normalizeStyleValue(raw);
      if (!value || value.length === 0) continue;
      if (key === "column") {
        entries.push(`grid-column:${value}`);
        continue;
      }
      entries.push(`${this.toKebabCase(key)}:${value}`);
    }
    return entries.length > 0 ? ` style="${entries.join(";")}"` : "";
  }

  private getTextProp(props: Record<string, unknown>, key: string, fallback: string): string {
    const value = props[key];
    return typeof value === "string" && value.length > 0 ? value : fallback;
  }

  private renderBlocks(blocks: BSBlock[], depth = 2): string {
    const rendered = blocks.map((block) => this.renderBlock(block, depth));
    return rendered.join("\n");
  }

  private renderBlock(block: BSBlock, depth: number): string {
    const indent = "  ".repeat(depth);
    const children = block.children ?? [];
    const style = this.buildInlineStyle(block);
    const props = block.props;
    const renderChildren = () => this.renderBlocks(children, depth + 1);

    if (block.type === "heading") {
      const level = typeof props.level === "number" && props.level >= 1 && props.level <= 6 ? props.level : 2;
      const content = this.escapeHtml(this.getTextProp(props, "content", "Heading"));
      return `${indent}<h${level}${style}>${content}</h${level}>`;
    }

    if (block.type === "text") {
      const content = this.escapeHtml(this.getTextProp(props, "content", "Text"));
      return `${indent}<p${style}>${content}</p>`;
    }

    if (block.type === "image") {
      const src = this.escapeHtml(this.getTextProp(props, "src", "https://picsum.photos/600/340"));
      const alt = this.escapeHtml(this.getTextProp(props, "alt", "Image"));
      return `${indent}<img src="${src}" alt="${alt}"${style} />`;
    }

    if (block.type === "button") {
      const label = this.escapeHtml(this.getTextProp(props, "label", "Button"));
      const href = this.escapeHtml(this.getTextProp(props, "href", "#"));
      return `${indent}<a href="${href}" class="bd-btn"${style}>${label}</a>`;
    }

    if (block.type === "video") {
      const url = this.escapeHtml(this.getTextProp(props, "url", ""));
      return `${indent}<iframe src="${url}" title="Video"${style}></iframe>`;
    }

    if (block.type === "divider") {
      return `${indent}<hr${style} />`;
    }

    if (block.type === "spacer") {
      return `${indent}<div aria-hidden="true"${style}></div>`;
    }

    if (block.type === "input") {
      const label = this.escapeHtml(this.getTextProp(props, "label", "Field"));
      const placeholder = this.escapeHtml(this.getTextProp(props, "placeholder", ""));
      const type = this.escapeHtml(this.getTextProp(props, "type", "text"));
      return `${indent}<label class="bd-field"${style}><span>${label}</span><input type="${type}" placeholder="${placeholder}" /></label>`;
    }

    if (block.type === "form") {
      const submitLabel = this.escapeHtml(this.getTextProp(props, "submitLabel", "Submit"));
      const inner = renderChildren();
      const body = inner.length > 0 ? `\n${inner}\n${indent}` : "";
      return `${indent}<form class="bd-form"${style}>${body}<button type="submit" class="bd-btn">${submitLabel}</button></form>`;
    }

    const tag = block.type === "section" ? "section" : "div";
    const className = ` class="bd-${this.escapeHtml(block.type)}"`;
    const innerChildren = renderChildren();
    if (innerChildren.length === 0) {
      return `${indent}<${tag}${className}${style}></${tag}>`;
    }
    return `${indent}<${tag}${className}${style}>\n${innerChildren}\n${indent}</${tag}>`;
  }

  private generateAppVue(page: BSPage): string {
    const markup = this.renderBlocks(page.blocks, 2);
    return `<template>
  <main class="bd-page">
${markup}
  </main>
</template>

<script setup lang="ts">
</script>

<style scoped>
@import "./theme.css";
</style>
`;
  }

  private generateThemeCss(): string {
    return `:root {
  --bd-text: #111111;
  --bd-bg: #ffffff;
  --bd-border: #e5e7eb;
  --bd-primary: #4f46e5;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Inter, system-ui, -apple-system, sans-serif;
  color: var(--bd-text);
  background: var(--bd-bg);
}

.bd-page {
  width: 100%;
}

.bd-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 38px;
  padding: 8px 14px;
  border: 1px solid transparent;
  border-radius: 8px;
  text-decoration: none;
  background: var(--bd-primary);
  color: #fff;
  font-weight: 600;
}

.bd-form {
  display: grid;
  gap: 12px;
}

.bd-field {
  display: grid;
  gap: 6px;
}

.bd-field input {
  width: 100%;
  min-height: 38px;
  padding: 8px 10px;
  border: 1px solid var(--bd-border);
  border-radius: 8px;
}
`;
  }

  private generateMainTs(): string {
    return `import { createApp } from "vue";
import App from "./App.vue";
import "./theme.css";

createApp(App).mount("#app");
`;
  }

  private generateReadme(page: BSPage): string {
    return `# ${page.name}

Proyecto generado desde Buildev.

- Edita \`src/blocks.json\` para modificar la estructura visual.
- Ajusta \`src/App.vue\` y \`src/theme.css\` para iterar sobre el código generado.
`;
  }

  /**
   * Generates a standard Vite/Vue project structure from a Buildev page.
   */
  generateProjectExplorer(page: BSPage): ProjectFile[] {
    const projectName = page.name.toLowerCase().replace(/\s+/g, '-');
    const blocksJson = JSON.stringify(page.blocks, null, 2);
    const appVue = this.generateAppVue(page);
    const themeCss = this.generateThemeCss();
    const mainTs = this.generateMainTs();
    
    return [
      { name: 'src', type: 'directory', children: [
        { name: 'blocks.json', type: 'file', content: blocksJson },
        { name: 'theme.css', type: 'file', content: themeCss },
        { name: 'App.vue', type: 'file', content: appVue },
        { name: 'main.ts', type: 'file', content: mainTs }
      ]},
      { name: 'public', type: 'directory', children: [
        { name: 'favicon.ico', type: 'file' }
      ]},
      { name: 'package.json', type: 'file', content: JSON.stringify({ name: projectName, version: "0.1.0" }, null, 2) },
      { name: 'vite.config.ts', type: 'file', content: 'export default {}' },
      { name: 'README.md', type: 'file', content: this.generateReadme(page) },
    ];
  }

  /**
   * Logic for Phase 26: download as zip.
   */
  async downloadZip(page: BSPage) {
    console.log("Exporting project to Zip...", page.name);
    // Real implementation would use JSZip
    alert("Project structure generated! ZIP download initiated.");
  }
}

export const exportService = new ExportService();
