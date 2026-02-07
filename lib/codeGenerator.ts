import { Page, SiteElement, BreakpointName } from './types';

/**
 * Generates inline CSS for an element based on its properties and active breakpoint
 */
export function generateElementCSS(
  element: SiteElement,
  activeBreakpoint: BreakpointName = 'mobile'
): string {
  const styles: Record<string, string | number> = {
    position: 'absolute',
    left: `${element.x}px`,
    top: `${element.y}px`,
    width: `${element.width}px`,
    height: `${element.height}px`,
    backgroundColor: element.backgroundColor || 'transparent',
    opacity: element.opacity,
  };

  if (element.blendMode) {
    styles.mixBlendMode = element.blendMode;
  }

  // Apply responsive overrides
  if (element.responsive[activeBreakpoint]) {
    const overrides = element.responsive[activeBreakpoint];
    Object.assign(styles, overrides);
  }

  return Object.entries(styles)
    .map(([key, value]) => `${camelToKebab(key)}: ${value};`)
    .join(' ');
}

/**
 * Generates CSS media queries for responsive breakpoints
 */
export function generateMediaQueries(
  page: Page,
  elements: SiteElement[]
): string {
  const mediaQueries: string[] = [];
  const breakpoints = page.breakpoints.sort((a, b) => a.width - b.width);

  for (let i = 1; i < breakpoints.length; i++) {
    const bp = breakpoints[i];
    const css: string[] = [];

    elements.forEach((element) => {
      if (element.responsive[bp.name as BreakpointName]) {
        const overrides = element.responsive[bp.name as BreakpointName];
        const overrideCss = Object.entries(overrides)
          .map(([key, value]) => `${camelToKebab(key)}: ${value};`)
          .join(' ');
        css.push(`#${element.id} { ${overrideCss} }`);
      }
    });

    if (css.length > 0) {
      mediaQueries.push(
        `@media (min-width: ${bp.width}px) {\n  ${css.join('\n  ')}\n}`
      );
    }
  }

  return mediaQueries.join('\n\n');
}

/**
 * Generates complete HTML for a page
 */
export function generateHTML(
  page: Page,
  projectName: string,
  techStack: string = 'html'
): string {
  const viewport = page.breakpoints.find((bp) => bp.name === 'mobile');
  const viewportWidth = viewport?.width || 375;

  const elementHTMLs = page.elements
    .map((el) => generateElementHTML(el))
    .join('\n    ');

  const mediaQueries = generateMediaQueries(page, page.elements);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background-color: #ffffff;
    }

    .viewport {
      width: ${viewportWidth}px;
      height: auto;
      position: relative;
      margin: 0 auto;
      background-color: white;
    }

    .element {
      position: absolute;
    }

    /* Element Styles */
    ${page.elements.map((el) => `#${el.id} { ${generateElementCSS(el)} }`).join('\n    ')}

    /* Responsive Styles */
    ${mediaQueries}
  </style>
</head>
<body>
  <div class="viewport">
    ${elementHTMLs}
  </div>
</body>
</html>`;

  return html;
}

/**
 * Generates HTML for a single element
 */
export function generateElementHTML(element: SiteElement): string {
  const attrs = `id="${element.id}" class="element" style="${generateElementCSS(element)}"`;

  switch (element.type) {
    case 'text':
      return `<div ${attrs}>${element.textContent || 'Text'}</div>`;
    case 'image':
      return `<img ${attrs} src="placeholder.jpg" alt="${element.name}" />`;
    case 'rectangle':
    case 'frame':
    default:
      const childHTML = element.children
        ?.map((child) => generateElementHTML(child))
        .join('\n    ');
      return `<div ${attrs}>${childHTML || ''}</div>`;
  }
}

/**
 * Generates Next.js component code
 */
export function generateNextJSComponent(
  page: Page,
  projectName: string
): string {
  const componentName = projectName.replace(/\s+/g, '');

  return `'use client';

import React from 'react';

export default function ${componentName}() {
  return (
    <div className="w-full min-h-screen bg-white">
      {/* Page: ${page.name} */}
      ${page.elements
        .map((el) => generateReactComponent(el))
        .join('\n      ')}
    </div>
  );
}
`;
}

/**
 * Generates a React component for an element
 */
function generateReactComponent(element: SiteElement): string {
  const style = {
    position: 'absolute',
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    backgroundColor: element.backgroundColor,
    opacity: element.opacity,
  };

  const styleStr = Object.entries(style)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}: ${typeof v === 'string' ? `'${v}'` : v}`)
    .join(', ');

  switch (element.type) {
    case 'text':
      return `<div style={{${styleStr}}}>${element.textContent}</div>`;
    case 'image':
      return `<img style={{${styleStr}}} src="placeholder.jpg" alt="${element.name}" />`;
    default:
      return `<div style={{${styleStr}}} />`;
  }
}

/**
 * Helper function to convert camelCase to kebab-case
 */
function camelToKebab(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Main export function - generates code based on tech stack
 */
export function generateCode(
  page: Page,
  projectName: string,
  techStack: string = 'html'
): { code: string; language: string } {
  switch (techStack) {
    case 'nextjs':
    case 'react':
      return {
        code: generateNextJSComponent(page, projectName),
        language: 'jsx',
      };
    case 'html':
    default:
      return {
        code: generateHTML(page, projectName, techStack),
        language: 'html',
      };
  }
}
