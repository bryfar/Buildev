// Core types for AetherSite Builder Pro

export type ElementType = 'rectangle' | 'circle' | 'text' | 'image' | 'frame';
export type BreakpointName = 'mobile' | 'tablet' | 'desktop';

export interface ResponsiveDelta {
  [key: string]: number | string | boolean;
}

export interface Breakpoint {
  name: BreakpointName;
  width: number;
  isCustom?: boolean;
}

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
  textContent?: string;
  textColor?: string;
  
  // Responsive overrides
  responsive: {
    [key in BreakpointName]?: ResponsiveDelta;
  };
  
  // Hierarchy
  children?: SiteElement[];
  parentId?: string;
}

export interface Page {
  id: string;
  name: string;
  elements: SiteElement[];
  breakpoints: Breakpoint[];
}

export interface Project {
  id: string;
  name: string;
  pages: Page[];
  createdAt: Date;
  updatedAt: Date;
  techStack: 'nextjs' | 'react' | 'vue' | 'svelte' | 'html';
  animationEngine: 'framer-motion' | 'gsap' | 'css' | 'anime';
}

export interface EditorState {
  currentProject: Project | null;
  currentPage: Page | null;
  selectedElementId: string | null;
  activeBreakpoint: BreakpointName;
  zoom: number;
  panX: number;
  panY: number;
  showGrid: boolean;
}
