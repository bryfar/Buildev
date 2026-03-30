import type { BSBlock, BSPage } from "@buildersite/sdk";

export function exportToHTML(page: BSPage): string {
    const styles: string[] = [];
    const html = renderBlocks(page.blocks, styles);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.title || page.name}</title>
  <meta name="description" content="${page.description || ''}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: 'Inter', sans-serif; color: #111; line-height: 1.5; }
    img { max-width: 100%; height: auto; display: block; }
    ${styles.join('\n')}
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
}

function renderBlocks(blocks: BSBlock[], styles: string[]): string {
    return blocks.map(block => {
        const className = `bs-${block.id.slice(0, 8)}`;
        const blockStyles = generateCSS(className, block.props);
        styles.push(blockStyles);

        const childrenHtml = block.children?.length ? renderBlocks(block.children, styles) : '';

        switch (block.type) {
            case 'section': return `<section class="${className}">${childrenHtml}</section>`;
            case 'container': return `<div class="container ${className}">${childrenHtml}</div>`;
            case 'heading': return `<h${block.props.level || 2} class="${className}">${block.props.content}</h${block.props.level || 2}>`;
            case 'text': return `<p class="${className}">${block.props.content}</p>`;
            case 'button': return `<a href="${block.props.href || '#'}" class="btn ${className}">${block.props.label}</a>`;
            case 'image': return `<img src="${block.props.src}" alt="${block.props.alt || ''}" class="${className}" />`;
            case 'divider': return `<hr class="${className}" />`;
            case 'spacer': return `<div class="${className}"></div>`;
            case 'columns': {
                const cols = (block.props.columns as number) || 2;
                let content = '';
                for (let i = 0; i < cols; i++) {
                    const colChildren = block.children?.filter(c => (c.props as any).column === i) || [];
                    content += `<div class="col">${renderBlocks(colChildren, styles)}</div>`;
                }
                return `<div class="columns ${className}">${content}</div>`;
            }
            default: return `<div class="${className}">${childrenHtml}</div>`;
        }
    }).join('\n');
}

function generateCSS(className: string, props: any): string {
    const base = `.${className} { 
    ${props.padding ? `padding: ${props.padding};` : ''}
    ${props.background ? `background: ${props.background};` : ''}
    ${props.color ? `color: ${props.color};` : ''}
    ${props.fontSize ? `font-size: ${props.fontSize}px;` : ''}
    ${props.gap ? `gap: ${props.gap}px;` : ''}
    ${props.height ? `height: ${props.height}px;` : ''}
    ${props.flexDirection ? `display: flex; flex-direction: ${props.flexDirection};` : ''}
  }`;

    // Responsive breakpoints
    let responsive = '';
    if (props.responsive?.mobile) {
        const m = props.responsive.mobile;
        responsive += `@media (max-width: 600px) { .${className} { 
        ${m.padding ? `padding: ${m.padding};` : ''}
        ${m.fontSize ? `font-size: ${m.fontSize}px;` : ''}
        ${m.flexDirection ? `flex-direction: ${m.flexDirection};` : ''}
    } }`;
    }

    return base + '\n' + responsive;
}
