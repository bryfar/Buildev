'use client';

import { create } from 'zustand';
import { Project, Page, SiteElement, EditorState, BreakpointName } from './types';

// Simple UUID generation fallback
const generateId = () => Math.random().toString(36).substr(2, 9);

interface AppState extends EditorState {
  // Projects
  projects: Project[];
  createProject: (name: string) => void;
  deleteProject: (id: string) => void;
  openProject: (id: string) => void;
  
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
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  currentProject: null,
  currentPage: null,
  selectedElementId: null,
  activeBreakpoint: 'mobile',
  zoom: 1,
  panX: 0,
  panY: 0,
  showGrid: true,
  projects: [],
  
  // Project management
  createProject: (name: string) => {
    const newProject: Project = {
      id: generateId(),
      name,
      pages: [{
        id: generateId(),
        name: 'Page 1',
        elements: [],
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
      
      const updatedElements = state.currentPage.elements.map(el =>
        el.id === id ? { ...el, ...updates } : el
      );
      
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
      
      const updatedElements = state.currentPage.elements.filter(el => el.id !== id);
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
}));
