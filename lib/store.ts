'use client';

import { create } from 'zustand';
import { Project, Page, SiteElement, EditorState, BreakpointName, ActiveTool } from './types';

// Simple UUID generation fallback
const generateId = () => Math.random().toString(36).substr(2, 9);

interface AppState extends EditorState {
  // Projects
  projects: Project[];
  createProject: (name: string) => void;
  deleteProject: (id: string) => void;
  openProject: (id: string) => void;
  updateProjectSettings: (settings: Partial<Pick<Project, 'name' | 'techStack' | 'animationEngine'>>) => void;
  
  // Pages
  createPage: (name: string) => void;
  selectPage: (pageId: string) => void;
  
  // Elements
  addElement: (element: Omit<SiteElement, 'id' | 'responsive'>) => void;
  updateElement: (id: string, updates: Partial<SiteElement>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  
  // Canvas
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  setActiveBreakpoint: (breakpoint: BreakpointName) => void;
  setActiveTool: (tool: ActiveTool) => void;
  
  // Color Palette
  extractColorsFromCanvas: () => void;
  addColor: (color: string) => void;
  removeColor: (color: string) => void;
  
  // Reusable Components
  saveAsComponent: (elementId: string, name: string) => void;
  deleteComponent: (componentId: string) => void;
  instantiateComponent: (componentId: string) => void;
  
  // Breakpoints - Mobile-first approach
  initializeMobileFirstBreakpoints: () => void;
  getDefaultBreakpoints: () => Array<{name: BreakpointName; width: number}>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  currentProject: null,
  currentPage: null,
  selectedElementId: null,
  activeBreakpoint: 'mobile',
  activeTool: 'select',
  zoom: 1,
  panX: 0,
  panY: 0,
  showGrid: true,
  projects: [],
  colorPalette: [],
  reusableComponents: [],
  
  // Project management
  createProject: (name: string) => {
    const newProject: Project = {
      id: generateId(),
      name,
      pages: [{
        id: generateId(),
        name: 'Page 1',
        elements: [
          // Hero Section with nested components
          {
            id: generateId(),
            name: 'Hero Section',
            type: 'frame',
            x: 0,
            y: 0,
            width: 375,
            height: 400,
            backgroundColor: '#0f0f0f',
            opacity: 1,
            responsive: {},
            isExpanded: true,
            isVisible: true,
            children: [
              {
                id: generateId(),
                name: 'Main Heading',
                type: 'text',
                x: 20,
                y: 60,
                width: 335,
                height: 80,
                backgroundColor: 'transparent',
                opacity: 1,
                fontSize: 32,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                lineHeight: 1.2,
                textContent: 'Design at the speed of imagination.',
                textColor: '#ffffff',
                responsive: {},
                isVisible: true,
              },
              {
                id: generateId(),
                name: 'Body Paragraph',
                type: 'text',
                x: 20,
                y: 160,
                width: 335,
                height: 60,
                backgroundColor: 'transparent',
                opacity: 1,
                fontSize: 16,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                lineHeight: 1.5,
                textContent: 'AetherSite Pro gives you the power of code with the simplicity of visual building.',
                textColor: '#999999',
                responsive: {},
                isVisible: true,
              },
              {
                id: generateId(),
                name: 'Primary CTA',
                type: 'rectangle',
                x: 20,
                y: 240,
                width: 140,
                height: 48,
                backgroundColor: '#0D99FF',
                opacity: 1,
                responsive: {},
                isVisible: true,
                children: [
                  {
                    id: generateId(),
                    name: 'Button Text',
                    type: 'text',
                    x: 0,
                    y: 0,
                    width: 140,
                    height: 48,
                    backgroundColor: 'transparent',
                    opacity: 1,
                    fontSize: 14,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    textContent: 'Start Building',
                    textColor: '#ffffff',
                    responsive: {},
                    isVisible: true,
                  },
                ],
              },
              {
                id: generateId(),
                name: 'Features Grid',
                type: 'frame',
                x: 20,
                y: 310,
                width: 335,
                height: 70,
                backgroundColor: 'transparent',
                opacity: 1,
                responsive: {},
                isVisible: true,
                children: [
                  {
                    id: generateId(),
                    name: 'Feature 1',
                    type: 'rectangle',
                    x: 0,
                    y: 0,
                    width: 100,
                    height: 60,
                    backgroundColor: '#1e1e1e',
                    opacity: 1,
                    responsive: {},
                    isVisible: true,
                  },
                  {
                    id: generateId(),
                    name: 'Feature 2',
                    type: 'rectangle',
                    x: 115,
                    y: 0,
                    width: 100,
                    height: 60,
                    backgroundColor: '#1e1e1e',
                    opacity: 1,
                    responsive: {},
                    isVisible: true,
                  },
                  {
                    id: generateId(),
                    name: 'Feature 3',
                    type: 'rectangle',
                    x: 230,
                    y: 0,
                    width: 100,
                    height: 60,
                    backgroundColor: '#1e1e1e',
                    opacity: 1,
                    responsive: {},
                    isVisible: true,
                  },
                ],
              },
            ],
          },
          // Navigation bar
          {
            id: generateId(),
            name: 'Navigation',
            type: 'frame',
            x: 0,
            y: 420,
            width: 375,
            height: 60,
            backgroundColor: '#1e1e1e',
            opacity: 1,
            responsive: {},
            isExpanded: true,
            isVisible: true,
            children: [
              {
                id: generateId(),
                name: 'Logo',
                type: 'text',
                x: 20,
                y: 18,
                width: 120,
                height: 24,
                backgroundColor: 'transparent',
                opacity: 1,
                fontSize: 18,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                textContent: 'AETHERSITE',
                textColor: '#0D99FF',
                responsive: {},
                isVisible: true,
              },
            ],
          },
        ],
        breakpoints: [
          { name: 'mobile', width: 375 },
          { name: 'tablet', width: 768 },
          { name: 'desktop', width: 1440 },
        ],
      }],
      createdAt: new Date(),
      updatedAt: new Date(),
      techStack: 'nextjs',
      animationEngine: 'framer-motion',
    };
    
    set((state) => ({
      projects: [...state.projects, newProject],
      currentProject: newProject,
      currentPage: newProject.pages[0],
    }));
  },
  
  deleteProject: (id: string) => {
    set((state) => ({
      projects: state.projects.filter(p => p.id !== id),
      currentProject: state.currentProject?.id === id ? null : state.currentProject,
    }));
  },
  
  openProject: (id: string) => {
    const project = get().projects.find(p => p.id === id);
    if (project) {
      set({
        currentProject: project,
        currentPage: project.pages[0],
      });
    }
  },
  
  updateProjectSettings: (settings: Partial<Pick<Project, 'name' | 'techStack' | 'animationEngine'>>) => {
    set((state) => {
      if (!state.currentProject) return state;
      
      const updatedProject = {
        ...state.currentProject,
        ...settings,
        updatedAt: new Date(),
      };
      
      return {
        currentProject: updatedProject,
        projects: state.projects.map(p => p.id === updatedProject.id ? updatedProject : p),
      };
    });
  },
  
  // Page management
  createPage: (name: string) => {
    set((state) => {
      if (!state.currentProject) return state;
      
      const newPage: Page = {
        id: generateId(),
        name,
        elements: [],
        breakpoints: state.currentPage?.breakpoints || [
          { name: 'mobile', width: 375 },
          { name: 'tablet', width: 768 },
          { name: 'desktop', width: 1440 },
        ],
      };
      
      const updatedProject = {
        ...state.currentProject,
        pages: [...state.currentProject.pages, newPage],
      };
      
      return {
        currentProject: updatedProject,
        currentPage: newPage,
        projects: state.projects.map(p => p.id === updatedProject.id ? updatedProject : p),
      };
    });
  },
  
  selectPage: (pageId: string) => {
    set((state) => {
      const page = state.currentProject?.pages.find(p => p.id === pageId);
      return page ? { currentPage: page } : state;
    });
  },
  
  // Element management
  addElement: (element) => {
    set((state) => {
      if (!state.currentPage) return state;
      
      const newElement: SiteElement = {
        ...element,
        id: generateId(),
        responsive: {},
      };
      
      const updatedPage = {
        ...state.currentPage,
        elements: [...state.currentPage.elements, newElement],
      };
      
      return {
        currentPage: updatedPage,
        currentProject: state.currentProject ? {
          ...state.currentProject,
          pages: state.currentProject.pages.map(p => p.id === updatedPage.id ? updatedPage : p),
        } : null,
      };
    });
  },
  
  updateElement: (id: string, updates: Partial<SiteElement>) => {
    set((state) => {
      if (!state.currentPage) return state;
      
      // Recursive function to update element in nested structure
      const updateElementRecursive = (elements: SiteElement[]): SiteElement[] => {
        return elements.map(el => {
          if (el.id === id) {
            return { ...el, ...updates };
          }
          if (el.children && el.children.length > 0) {
            return {
              ...el,
              children: updateElementRecursive(el.children),
            };
          }
          return el;
        });
      };
      
      const updatedElements = updateElementRecursive(state.currentPage.elements);
      
      const updatedPage = {
        ...state.currentPage,
        elements: updatedElements,
      };
      
      return {
        currentPage: updatedPage,
        currentProject: state.currentProject ? {
          ...state.currentProject,
          pages: state.currentProject.pages.map(p => p.id === updatedPage.id ? updatedPage : p),
        } : null,
      };
    });
  },
  
  deleteElement: (id: string) => {
    set((state) => {
      if (!state.currentPage) return state;
      
      // Recursive function to delete element from nested structure
      const deleteElementRecursive = (elements: SiteElement[]): SiteElement[] => {
        return elements
          .filter(el => el.id !== id)
          .map(el => {
            if (el.children && el.children.length > 0) {
              return {
                ...el,
                children: deleteElementRecursive(el.children),
              };
            }
            return el;
          });
      };
      
      const updatedElements = deleteElementRecursive(state.currentPage.elements);
      const updatedPage = {
        ...state.currentPage,
        elements: updatedElements,
      };
      
      return {
        currentPage: updatedPage,
        selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
        currentProject: state.currentProject ? {
          ...state.currentProject,
          pages: state.currentProject.pages.map(p => p.id === updatedPage.id ? updatedPage : p),
        } : null,
      };
    });
  },
  
  selectElement: (id: string | null) => {
    set({ selectedElementId: id });
  },
  
  // Canvas
  setZoom: (zoom: number) => {
    set({ zoom: Math.max(0.1, Math.min(zoom, 5)) });
  },
  
  setPan: (x: number, y: number) => {
    set({ panX: x, panY: y });
  },
  
  setActiveBreakpoint: (breakpoint: BreakpointName) => {
    set({ activeBreakpoint: breakpoint });
  },

  setActiveTool: (tool: ActiveTool) => {
    set({ activeTool: tool });
  },

  // Color Palette Management
  extractColorsFromCanvas: () => {
    const state = get();
    if (!state.currentPage) return;

    const colors = new Set<string>();

    // Recursive function to extract colors from elements
    const extractColors = (elements: SiteElement[]) => {
      elements.forEach(element => {
        if (element.backgroundColor && element.backgroundColor !== 'transparent') {
          colors.add(element.backgroundColor);
        }
        if (element.textColor) {
          colors.add(element.textColor);
        }
        if (element.children && element.children.length > 0) {
          extractColors(element.children);
        }
      });
    };

    extractColors(state.currentPage.elements);

    set({ colorPalette: Array.from(colors) });
  },

  addColor: (color: string) => {
    set((state) => {
      if (!state.colorPalette.includes(color)) {
        return { colorPalette: [...state.colorPalette, color] };
      }
      return state;
    });
  },

  removeColor: (color: string) => {
    set((state) => ({
      colorPalette: state.colorPalette.filter(c => c !== color),
    }));
  },

  // Reusable Components Management
  saveAsComponent: (elementId: string, name: string) => {
    const state = get();
    if (!state.currentPage) return;

    // Find element recursively
    const findElement = (elements: SiteElement[]): SiteElement | null => {
      for (const el of elements) {
        if (el.id === elementId) return el;
        if (el.children) {
          const found = findElement(el.children);
          if (found) return found;
        }
      }
      return null;
    };

    const element = findElement(state.currentPage.elements);
    if (!element) return;

    // Create deep copy of element
    const componentCopy = JSON.parse(JSON.stringify(element));

    const newComponent = {
      id: generateId(),
      name,
      element: componentCopy,
      createdAt: new Date(),
    };

    set((state) => ({
      reusableComponents: [...state.reusableComponents, newComponent],
    }));
  },

  deleteComponent: (componentId: string) => {
    set((state) => ({
      reusableComponents: state.reusableComponents.filter(c => c.id !== componentId),
    }));
  },

  instantiateComponent: (componentId: string) => {
    const state = get();
    const component = state.reusableComponents.find(c => c.id === componentId);
    if (!component || !state.currentPage) return;

    // Create new instance with new IDs
    const generateNewIds = (element: SiteElement): SiteElement => {
      const newElement = {
        ...element,
        id: generateId(),
        x: element.x + 20, // Offset position
        y: element.y + 20,
      };

      if (element.children) {
        newElement.children = element.children.map(generateNewIds);
      }

      return newElement;
    };

    const newInstance = generateNewIds(component.element);

    const updatedPage = {
      ...state.currentPage,
      elements: [...state.currentPage.elements, newInstance],
    };

    set({
      currentPage: updatedPage,
      currentProject: state.currentProject ? {
        ...state.currentProject,
        pages: state.currentProject.pages.map(p => p.id === updatedPage.id ? updatedPage : p),
      } : null,
    });
  },

  // Mobile-first breakpoints initialization
  getDefaultBreakpoints: () => [
    { name: 'mobile' as const, width: 375 },     // Primary breakpoint
    { name: 'tablet' as const, width: 768 },     // Secondary
    { name: 'desktop' as const, width: 1024 },   // Tertiary
  ],

  initializeMobileFirstBreakpoints: () => {
    const state = get();
    if (state.currentProject && state.currentPage) {
      const updatedPages = state.currentProject.pages.map(page => {
        if (page.id === state.currentPage!.id) {
          return {
            ...page,
            breakpoints: [
              { name: 'mobile' as const, width: 375 },
              { name: 'tablet' as const, width: 768 },
              { name: 'desktop' as const, width: 1024 },
            ],
          };
        }
        return page;
      });
      
      set(prevState => ({
        currentProject: prevState.currentProject ? {
          ...prevState.currentProject,
          pages: updatedPages,
        } : null,
        currentPage: updatedPages.find(p => p.id === state.currentPage!.id) || null,
      }));
    }
  },
}));
