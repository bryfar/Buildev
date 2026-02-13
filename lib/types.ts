// Core types for AetherSite Builder Pro

export type ElementType = 'rectangle' | 'circle' | 'text' | 'image' | 'frame';
export type BreakpointName = 'mobile' | 'tablet' | 'desktop';
export type ActiveTool = 'select' | 'frame' | 'text' | 'rectangle';

export interface ResponsiveDelta {
  [key: string]: number | string | boolean;
}

export interface Breakpoint {
  name: BreakpointName;
  width: number;
  isCustom?: boolean;
}

/**
 * Represents a single element on the canvas (Node).
 * Can be a primitive (rectangle, text) or a container (frame).
 * Supports responsive overrides via the `responsive` property.
 */
export interface SiteElement {
  id: string;
  name: string;
  type: ElementType;

  // Base properties (Mobile - default)
  x: number;
  y: number;
  width: number;
  height: number;

  // Styling
  backgroundColor?: string;
  opacity: number;
  blendMode?: string;

  // Typography (for text elements)
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  lineHeight?: number;
  letterSpacing?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textContent?: string;
  textColor?: string;

  // Responsive overrides
  responsive: {
    [key in BreakpointName]?: ResponsiveDelta;
  };

  // Hierarchy
  children?: SiteElement[];
  parentId?: string;

  // UI state
  isExpanded?: boolean;
  isVisible?: boolean;
}

export interface Page {
  id: string;
  name: string;
  elements: SiteElement[];
  breakpoints: Breakpoint[];
}

export interface ReusableComponent {
  id: string;
  name: string;
  element: SiteElement;
  thumbnail?: string;
  createdAt: Date;
}

/**
 * Root entity for a website project.
 * Contains multiple pages and global project settings.
 */
export interface Project {
  id: string;
  name: string;
  pages: Page[];
  createdAt: Date;
  updatedAt: Date;
  techStack: 'nextjs' | 'react' | 'vue' | 'svelte' | 'html';
  animationEngine: 'framer-motion' | 'gsap' | 'css' | 'anime';
  colorPalette?: string[];
  reusableComponents?: ReusableComponent[];
}

export interface EditorState {
  currentProject: Project | null;
  currentPage: Page | null;
  selectedElementId: string | null;
  activeBreakpoint: BreakpointName;
  activeTool: ActiveTool;
  zoom: number;
  panX: number;
  panY: number;
  showGrid: boolean;
  colorPalette: string[];
  reusableComponents: ReusableComponent[];
}
