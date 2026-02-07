import {
  SiteElement,
  ResponsiveDelta,
  BreakpointName,
} from "./types";
import {
  GeneratedComponent,
  ResponsiveDesignOutput,
} from "./aiService";

/**
 * Converts responsive design output from Gemini into responsive deltas for a SiteElement
 */
export function convertResponsiveDesignToDeltas(
  responsiveDesign: ResponsiveDesignOutput
): Record<BreakpointName, ResponsiveDelta> {
  const deltas: Record<BreakpointName, ResponsiveDelta> = {};

  // Process tablet breakpoint
  if (responsiveDesign.tablet) {
    deltas.tablet = {
      width: responsiveDesign.tablet.width,
      height: responsiveDesign.tablet.height,
      ...responsiveDesign.tablet.changes,
    };
  }

  // Process desktop breakpoint
  if (responsiveDesign.desktop) {
    deltas.desktop = {
      width: responsiveDesign.desktop.width,
      height: responsiveDesign.desktop.height,
      ...responsiveDesign.desktop.changes,
    };
  }

  return deltas;
}

/**
 * Creates a SiteElement from a GeneratedComponent with responsive variants
 */
export function createSiteElementFromComponent(
  component: GeneratedComponent,
  responsiveDesign?: ResponsiveDesignOutput
): Omit<SiteElement, "id"> {
  const responsive: Record<BreakpointName, ResponsiveDelta> = {};

  // Add responsive variants if available
  if (responsiveDesign) {
    const deltas = convertResponsiveDesignToDeltas(responsiveDesign);
    Object.assign(responsive, deltas);
  }

  return {
    name: component.name,
    type: component.type,
    x: component.x,
    y: component.y,
    width: component.width,
    height: component.height,
    backgroundColor: component.backgroundColor || "transparent",
    textContent: component.textContent,
    fontSize: component.fontSize,
    fontFamily: component.fontFamily || "Inter, sans-serif",
    fontWeight: component.fontWeight,
    textColor: component.textColor,
    opacity: 1,
    responsive,
    isVisible: true,
  };
}

/**
 * Applies responsive overrides to an element based on the active breakpoint
 * Returns computed properties for rendering
 */
export function getResponsiveElementProperties(
  element: SiteElement,
  activeBreakpoint: BreakpointName
): Partial<SiteElement> {
  const baseProperties: Partial<SiteElement> = {
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
    fontSize: element.fontSize,
    lineHeight: element.lineHeight,
    letterSpacing: element.letterSpacing,
  };

  // If viewing mobile (default), return base properties
  if (activeBreakpoint === "mobile") {
    return baseProperties;
  }

  // Apply responsive overrides for the active breakpoint
  const overrides = element.responsive?.[activeBreakpoint];
  if (overrides) {
    return {
      ...baseProperties,
      ...overrides,
    };
  }

  return baseProperties;
}

/**
 * Validates responsive design output structure
 */
export function isValidResponsiveDesign(
  design: any
): design is ResponsiveDesignOutput {
  return (
    design &&
    design.tablet &&
    typeof design.tablet.width === "number" &&
    typeof design.tablet.height === "number" &&
    design.desktop &&
    typeof design.desktop.width === "number" &&
    typeof design.desktop.height === "number"
  );
}

/**
 * Creates responsive breakpoint configuration for a new page
 * Mobile-first approach: mobile is the primary/base design
 */
export const MOBILE_FIRST_BREAKPOINTS = [
  {
    name: "mobile" as const,
    width: 375,
    description: "Primary breakpoint - Mobile devices (375px)",
  },
  {
    name: "tablet" as const,
    width: 768,
    description: "Secondary breakpoint - Tablets (768px)",
  },
  {
    name: "desktop" as const,
    width: 1024,
    description: "Tertiary breakpoint - Desktops (1024px+)",
  },
];

/**
 * Scales element dimensions and positions for different breakpoints
 * Useful for rough responsive adjustments if Gemini API is unavailable
 */
export function scaleElementForBreakpoint(
  element: SiteElement,
  targetBreakpoint: BreakpointName
): Partial<SiteElement> {
  const scales: Record<BreakpointName, number> = {
    mobile: 1, // Base scale
    tablet: 1.6, // Approximately 768/375 ≈ 2.05, but keeping it subtle
    desktop: 2, // Approximately 1024/375 ≈ 2.73, but keeping it proportional
  };

  const scale = scales[targetBreakpoint];

  return {
    width: Math.round(element.width * scale),
    height: Math.round(element.height * scale),
    fontSize: element.fontSize ? Math.round(element.fontSize * scale * 0.8) : undefined,
    letterSpacing: element.letterSpacing
      ? Math.round(element.letterSpacing * scale * 0.8)
      : undefined,
  };
}
