import type { BSBlock } from "@buildersite/sdk";

type ParseBlocksSuccess = { ok: true; blocks: BSBlock[] };
type ParseBlocksFailure = { ok: false; error: string };
export type ParseBlocksResult = ParseBlocksSuccess | ParseBlocksFailure;

function createBlockId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `blk-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toCamelCase(input: string): string {
  return input.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
}

function parseInlineStyle(styleValue: string | null): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  if (!styleValue) return props;
  const pairs = styleValue
    .split(";")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
  for (const pair of pairs) {
    const separator = pair.indexOf(":");
    if (separator < 0) continue;
    const rawKey = pair.slice(0, separator).trim();
    const rawValue = pair.slice(separator + 1).trim();
    if (rawKey.length === 0 || rawValue.length === 0) continue;
    if (rawKey === "grid-column") {
      props.column = rawValue;
      continue;
    }
    props[toCamelCase(rawKey)] = rawValue;
  }
  return props;
}

function parseElementChildren(element: Element): BSBlock[] {
  return Array.from(element.children)
    .map((child) => parseElementToBlock(child))
    .filter((child): child is BSBlock => child !== null);
}

function parseLabelAsInput(element: HTMLLabelElement): BSBlock {
  const input = element.querySelector("input");
  const labelText = element.querySelector("span")?.textContent?.trim() ?? "Field";
  const placeholder = input?.getAttribute("placeholder") ?? "";
  const type = input?.getAttribute("type") ?? "text";
  return {
    id: createBlockId(),
    type: "input",
    props: {
      ...parseInlineStyle(element.getAttribute("style")),
      label: labelText,
      placeholder,
      type,
    },
    children: [],
  };
}

function parseElementToBlock(element: Element): BSBlock | null {
  const tag = element.tagName.toLowerCase();
  const styleProps = parseInlineStyle(element.getAttribute("style"));

  if (tag === "label" && element.querySelector("input")) {
    return parseLabelAsInput(element as HTMLLabelElement);
  }

  if (tag === "h1" || tag === "h2" || tag === "h3" || tag === "h4" || tag === "h5" || tag === "h6") {
    const level = Number(tag.slice(1));
    const content = element.textContent?.trim() ?? "Heading";
    return {
      id: createBlockId(),
      type: "heading",
      props: { ...styleProps, content, level },
      children: [],
    };
  }

  if (tag === "p") {
    return {
      id: createBlockId(),
      type: "text",
      props: { ...styleProps, content: element.textContent?.trim() ?? "Text" },
      children: [],
    };
  }

  if (tag === "img") {
    return {
      id: createBlockId(),
      type: "image",
      props: {
        ...styleProps,
        src: element.getAttribute("src") ?? "",
        alt: element.getAttribute("alt") ?? "",
      },
      children: [],
    };
  }

  if (tag === "a" || tag === "button") {
    return {
      id: createBlockId(),
      type: "button",
      props: {
        ...styleProps,
        label: element.textContent?.trim() ?? "Button",
        href: element.getAttribute("href") ?? "#",
        variant: "primary",
      },
      children: [],
    };
  }

  if (tag === "input") {
    return {
      id: createBlockId(),
      type: "input",
      props: {
        ...styleProps,
        label: element.getAttribute("name") ?? "Field",
        placeholder: element.getAttribute("placeholder") ?? "",
        type: element.getAttribute("type") ?? "text",
      },
      children: [],
    };
  }

  if (tag === "form") {
    const submitButton = Array.from(element.querySelectorAll("button")).find((btn) => btn.getAttribute("type") === "submit");
    const children = parseElementChildren(element).filter((child) => child.type !== "button");
    return {
      id: createBlockId(),
      type: "form",
      props: {
        ...styleProps,
        showSubmit: true,
        submitLabel: submitButton?.textContent?.trim() ?? "Submit",
      },
      children,
    };
  }

  if (tag === "hr") {
    return { id: createBlockId(), type: "divider", props: styleProps, children: [] };
  }

  if (tag === "iframe") {
    return {
      id: createBlockId(),
      type: "video",
      props: { ...styleProps, url: element.getAttribute("src") ?? "" },
      children: [],
    };
  }

  const children = parseElementChildren(element);
  if (tag === "section") {
    return { id: createBlockId(), type: "section", props: styleProps, children };
  }
  return { id: createBlockId(), type: "container", props: styleProps, children };
}

/**
 * Convierte el contenido de `App.vue` (SFC) en bloques del builder.
 *
 * @param source Código completo del archivo Vue.
 * @returns Resultado con bloques parseados o un error de parseo.
 */
export function parseVueSfcToBlocks(source: string): ParseBlocksResult {
  const match = source.match(/<template>([\s\S]*?)<\/template>/i);
  if (!match || !match[1]) {
    return { ok: false, error: "No se encontró <template> en App.vue." };
  }

  const templateContent = match[1];
  const parser = new DOMParser();
  const doc = parser.parseFromString(templateContent, "text/html");
  const roots = Array.from(doc.body.children);
  if (roots.length === 0) {
    return { ok: true, blocks: [] };
  }

  let sourceElements: Element[] = roots;
  if (roots.length === 1) {
    const root = roots[0]!;
    if (root.tagName.toLowerCase() === "main") {
      sourceElements = Array.from(root.children);
    }
  }

  const blocks = sourceElements
    .map((element) => parseElementToBlock(element))
    .filter((block): block is BSBlock => block !== null);

  return { ok: true, blocks };
}
