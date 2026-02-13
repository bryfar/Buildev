'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import {
  ZoomIn, ZoomOut, Move, Square, Type,
  Copy, Trash2, Layers, Lock, Eye,
  Wand2, ArrowRight, Loader2
} from 'lucide-react';
import { SiteElement, BreakpointName } from '@/lib/types';

// Resize handles positions
const HANDLES = ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'] as const;
type HandlePosition = typeof HANDLES[number];

interface DragState {
  type: 'move' | 'resize';
  handle?: HandlePosition;
  startX: number;
  startY: number;
  originalX: number;
  originalY: number;
  originalWidth: number;
  originalHeight: number;
}

/**
 * CanvasPRO Component
 * 
 * The main design area where users drag, zoom, and interact with elements.
 * Handles:
 * - Rendering the current page elements recursively
 * - Drag and drop logic (move, resize)
 * - Zoom and Pan controls
 * - Selection highlighting
 * - AI Refinement overlay
 */
export default function CanvasPRO() {
  const {
    currentPage,
    zoom,
    setZoom,
    selectElement,
    selectedElementId,
    activeBreakpoint,
    updateElement,
    deleteElement,
  } = useAppStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [canvasColor, setCanvasColor] = useState('#0f0f0f');
  const [showResizeHandles, setShowResizeHandles] = useState(true);
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);

  // Get viewport dimensions for current breakpoint
  const getViewportSize = () => {
    const sizes: Record<BreakpointName, { width: number; height: number }> = {
      mobile: { width: 375, height: 812 },
      tablet: { width: 768, height: 1024 },
      desktop: { width: 1440, height: 900 },
    };
    return sizes[activeBreakpoint];
  };

  const viewportSize = getViewportSize();

  if (!currentPage) return null;

  // Get responsive properties for element
  const getElementStyle = (element: SiteElement) => {
    const responsive = element.responsive?.[activeBreakpoint];
    const x = typeof responsive?.x === 'number' ? responsive.x : element.x;
    const y = typeof responsive?.y === 'number' ? responsive.y : element.y;
    const width = typeof responsive?.width === 'number' ? responsive.width : element.width;
    const height = typeof responsive?.height === 'number' ? responsive.height : element.height;

    return { x, y, width, height };
  };

  // Handle element selection
  const handleElementMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    selectElement(elementId);

    // Start move drag
    setDragState({
      type: 'move',
      startX: e.clientX,
      startY: e.clientY,
      originalX: 0,
      originalY: 0,
      originalWidth: 0,
      originalHeight: 0,
    });
  };

  // Handle resize handle
  const handleResizeStart = (
    e: React.MouseEvent,
    elementId: string,
    handle: HandlePosition
  ) => {
    e.stopPropagation();
    selectElement(elementId);

    const element = currentPage?.elements.find((el) => el.id === elementId);
    if (!element) return;

    const style = getElementStyle(element);

    setDragState({
      type: 'resize',
      handle,
      startX: e.clientX,
      startY: e.clientY,
      originalX: style.x,
      originalY: style.y,
      originalWidth: style.width,
      originalHeight: style.height,
    });
  };

  // Handle mouse move
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState || !selectedElementId) return;

      const deltaX = (e.clientX - dragState.startX) / zoom;
      const deltaY = (e.clientY - dragState.startY) / zoom;

      const element = currentPage?.elements.find((el) => el.id === selectedElementId);
      if (!element) return;

      const updates: Partial<SiteElement> = {};

      if (dragState.type === 'move') {
        // Update position for current breakpoint
        if (activeBreakpoint === 'mobile') {
          updates.x = Math.round(dragState.originalX + deltaX);
          updates.y = Math.round(dragState.originalY + deltaY);
        } else {
          updates.responsive = {
            ...element.responsive,
            [activeBreakpoint]: {
              ...(element.responsive?.[activeBreakpoint] || {}),
              x: Math.round(dragState.originalX + deltaX),
              y: Math.round(dragState.originalY + deltaY),
            },
          };
        }
      } else if (dragState.type === 'resize' && dragState.handle) {
        // Handle resize based on which handle was dragged
        let newX = dragState.originalX;
        let newY = dragState.originalY;
        let newWidth = dragState.originalWidth;
        let newHeight = dragState.originalHeight;

        const handle = dragState.handle;

        // Horizontal resize
        if (handle.includes('w')) {
          newX = dragState.originalX + deltaX;
          newWidth = dragState.originalWidth - deltaX;
        } else if (handle.includes('e')) {
          newWidth = dragState.originalWidth + deltaX;
        }

        // Vertical resize
        if (handle.includes('n')) {
          newY = dragState.originalY + deltaY;
          newHeight = dragState.originalHeight - deltaY;
        } else if (handle.includes('s')) {
          newHeight = dragState.originalHeight + deltaY;
        }

        // Ensure minimum size
        if (newWidth < 20) newWidth = 20;
        if (newHeight < 20) newHeight = 20;

        if (activeBreakpoint === 'mobile') {
          updates.x = Math.round(newX);
          updates.y = Math.round(newY);
          updates.width = Math.round(newWidth);
          updates.height = Math.round(newHeight);
        } else {
          updates.responsive = {
            ...element.responsive,
            [activeBreakpoint]: {
              ...(element.responsive?.[activeBreakpoint] || {}),
              x: Math.round(newX),
              y: Math.round(newY),
              width: Math.round(newWidth),
              height: Math.round(newHeight),
            },
          };
        }
      }

      updateElement(selectedElementId, updates);
    },
    [dragState, selectedElementId, zoom, currentPage, updateElement, activeBreakpoint]
  );

  // Handle mouse up
  const handleMouseUp = () => {
    setDragState(null);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove]);

  // Render resize handles
  const renderResizeHandles = (element: SiteElement) => {
    if (selectedElementId !== element.id || !showResizeHandles) return null;

    const style = getElementStyle(element);
    const handleSize = 8;
    const offset = -4; // Offset to center the handle

    const positions: Record<HandlePosition, { top: number; left: number; cursor: string }> = {
      nw: { top: offset, left: offset, cursor: 'nwse-resize' },
      n: { top: offset, left: `calc(50% - 4px)` as any, cursor: 'ns-resize' },
      ne: { top: offset, left: `calc(100% - 4px)` as any, cursor: 'nesw-resize' },
      w: { top: `calc(50% - 4px)` as any, left: offset, cursor: 'ew-resize' },
      e: { top: `calc(50% - 4px)` as any, left: `calc(100% - 4px)` as any, cursor: 'ew-resize' },
      sw: { top: `calc(100% - 4px)` as any, left: offset, cursor: 'nesw-resize' },
      s: { top: `calc(100% - 4px)` as any, left: `calc(50% - 4px)` as any, cursor: 'ns-resize' },
      se: { top: `calc(100% - 4px)` as any, left: `calc(100% - 4px)` as any, cursor: 'nwse-resize' },
    };

    return HANDLES.map((handle) => {
      const pos = positions[handle];
      return (
        <div
          key={handle}
          onMouseDown={(e) => handleResizeStart(e, element.id, handle)}
          style={{
            position: 'absolute',
            top: typeof pos.top === 'number' ? `${pos.top}px` : pos.top,
            left: typeof pos.left === 'number' ? `${pos.left}px` : pos.left,
            width: `${handleSize}px`,
            height: `${handleSize}px`,
            background: '#FFFFFF',
            border: '1px solid #0D99FF',
            borderRadius: '2px', // Square with slight radius
            cursor: pos.cursor,
            transform: 'translate(-50%, -50%)',
            zIndex: 100,
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
          }}
        />
      );
    });
  };

  /**
   * Recursively renders a SiteElement and its children.
   * Handles absolute positioning, styling, and event listeners (click, hover).
   * 
   * @param element - The element to render
   */
  const renderElement = (element: SiteElement): React.ReactNode => {
    if (!element.isVisible) return null;

    const style = getElementStyle(element);
    const isSelected = selectedElementId === element.id;
    const isHovered = hoveredElementId === element.id && !isSelected;

    return (
      <div
        key={element.id}
        id={`element-${element.id}`}
        onMouseDown={(e) => handleElementMouseDown(e, element.id)}
        onMouseEnter={(e) => {
          e.stopPropagation();
          setHoveredElementId(element.id);
        }}
        onMouseLeave={(e) => {
          e.stopPropagation();
          setHoveredElementId(null);
        }}
        style={{
          position: 'absolute',
          left: `${style.x}px`,
          top: `${style.y}px`,
          width: `${style.width}px`,
          height: `${style.height}px`,
          backgroundColor: element.backgroundColor || (element.type === 'frame' ? 'transparent' : '#e5e5e5'),
          opacity: element.opacity,
          outline: isSelected ? '2px solid #0D99FF' : isHovered ? '2px solid #0D99FF80' : 'none',
          cursor: 'default',
          userSelect: 'none',
          overflow: 'hidden',
          transition: 'outline 0.1s ease',
          zIndex: isSelected ? 50 : isHovered ? 40 : 1
        }}
        className="group"
      >
        {/* Render resize handles */}
        {renderResizeHandles(element)}

        {/* Hover Label */}
        {isHovered && (
          <div className="absolute top-0 left-0 -translate-y-full bg-[#0D99FF] text-white text-[10px] px-1.5 py-0.5 rounded-t font-medium whitespace-nowrap z-50 pointer-events-none shadow-sm">
            {element.name}
          </div>
        )}
        {/* Selection Label */}
        {isSelected && (
          <div className="absolute top-0 left-0 -translate-y-full bg-[#0D99FF] text-white text-[10px] px-1.5 py-0.5 rounded-t font-medium whitespace-nowrap z-50 pointer-events-none shadow-sm flex gap-1">
            <span>{element.name}</span>
            <span className="opacity-75">| {Math.round(style.width)}×{Math.round(style.height)}</span>
          </div>
        )}

        {/* Render children */}
        {element.children?.map((child) => renderElement(child))}

        {/* Render text content */}
        {element.type === 'text' && (
          <div
            style={{
              fontSize: element.fontSize,
              fontFamily: element.fontFamily,
              fontWeight: element.fontWeight,
              color: element.textColor,
              textAlign: element.textAlign,
              padding: '8px',
              width: '100%',
              height: '100%',
              wordWrap: 'break-word',
              display: 'flex',
              alignItems: 'flex-start'
            }}
          >
            {element.textContent}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0f0f0f] overflow-hidden">
      {/* Toolbar */}
      <div className="h-10 border-b border-[#2a2a2a] bg-[#1e1e1e] flex items-center justify-between px-4 gap-4">
        <div className="flex gap-1">
          <button
            onClick={() => setZoom(zoom * 1.2)}
            className="p-1.5 text-[#999] hover:text-white hover:bg-[#2a2a2a] rounded transition-colors"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={() => setZoom(zoom / 1.2)}
            className="p-1.5 text-[#999] hover:text-white hover:bg-[#2a2a2a] rounded transition-colors"
          >
            <ZoomOut size={16} />
          </button>
          <span className="px-2 py-1 text-xs text-[#999] border border-[#2a2a2a] rounded min-w-[40px] text-center bg-[#252525]">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {/* Breakpoint info */}
        <div className="text-[10px] font-bold tracking-wider text-[#666] uppercase">
          {activeBreakpoint} · {viewportSize.width}×{viewportSize.height}
        </div>

        {/* Canvas color picker */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border border-[#333] overflow-hidden relative">
            <input
              type="color"
              value={canvasColor}
              onChange={(e) => setCanvasColor(e.target.value)}
              className="absolute -top-2 -left-2 w-8 h-8 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        style={{
          backgroundColor: canvasColor,
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '60px 20px',
        }}
        onClick={() => selectElement(null)}
        className="scrollbar-hide"
      >
        {/* Viewport */}
        <div
          style={{
            position: 'relative',
            width: `${viewportSize.width * zoom}px`,
            height: `${viewportSize.height * zoom}px`,
            backgroundColor: '#ffffff',
            boxShadow: '0 0 0 1px #333, 0 20px 50px -10px rgba(0,0,0,0.5)',
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            overflow: 'hidden',
          }}
        >
          {/* Elements */}
          {currentPage?.elements.map((element) => renderElement(element))}
        </div>
      </div>

      {/* Bottom info */}
      <div className="h-8 border-t border-[#2a2a2a] bg-[#1e1e1e] px-4 flex items-center justify-between text-[10px] text-[#666]">
        <div className="flex gap-4">
          {selectedElementId ? (
            <>
              <span>Selected: <span className="text-white">{selectedElementId}</span></span>
              <span>Pos: {Math.round(getElementStyle(currentPage.elements.find(el => el.id === selectedElementId)!).x)}, {Math.round(getElementStyle(currentPage.elements.find(el => el.id === selectedElementId)!).y)}</span>
            </>
          ) : (
            <span>No selection</span>
          )}
        </div>
      </div>

      {/* Selection Overlay (Global) */}
      <SelectionOverlay
        selectedId={selectedElementId}
        zoom={zoom}
        onRefine={async (id, prompt) => {
          const element = currentPage?.elements.find(el => el.id === id) || findElementRecursive(currentPage?.elements || [], id);
          if (element) {
            const { refineElementAction } = await import('@/app/actions/ai-refine');
            const result = await refineElementAction(element, prompt);
            if (result.success && result.element) {
              updateElement(id, result.element);
            }
          }
        }}
      />
    </div>
  );
}

// Helper to find deep elements
function findElementRecursive(elements: SiteElement[], id: string): SiteElement | undefined {
  for (const el of elements) {
    if (el.id === id) return el;
    if (el.children) {
      const found = findElementRecursive(el.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

function SelectionOverlay({ selectedId, zoom, onRefine }: { selectedId: string | null, zoom: number, onRefine: (id: string, prompt: string) => Promise<void> }) {
  const [rect, setRect] = useState<{ top: number, left: number, width: number } | null>(null);
  const [showMagicInput, setShowMagicInput] = useState(false);
  const [magicPrompt, setMagicPrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update position on selection change, zoom, or scroll
  useEffect(() => {
    if (!selectedId) {
      setRect(null);
      return;
    }

    const updatePos = () => {
      const el = document.getElementById(`element-${selectedId}`);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width });
      }
    };

    updatePos();
    // Poll for movement/resize
    const interval = setInterval(updatePos, 100);
    window.addEventListener('scroll', updatePos);
    window.addEventListener('resize', updatePos);

    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', updatePos);
      window.removeEventListener('resize', updatePos);
    };
  }, [selectedId, zoom]); // Zoom changes affect rect

  if (!selectedId) return null;
  if (!rect) return null;

  const handleRefine = async () => {
    if (!magicPrompt.trim()) return;
    setIsRefining(true);
    await onRefine(selectedId, magicPrompt);
    setIsRefining(false);
    setShowMagicInput(false);
    setMagicPrompt('');
  };

  return (
    <div
      className="fixed flex items-center gap-2 z-[9999]"
      style={{
        top: `${rect.top - 48}px`,
        left: `${rect.left}px`,
        // Make sure it doesn't go off screen top
        transform: rect.top < 50 ? `translateY(${rect.top + 50}px)` : 'none'
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="bg-[#1e1e1e] border border-[#333] rounded-lg shadow-xl flex items-center p-1 gap-1">
        {!showMagicInput ? (
          <button
            onClick={() => {
              setShowMagicInput(true);
              setTimeout(() => inputRef.current?.focus(), 50);
            }}
            className="flex items-center gap-2 px-2 py-1 text-blue-400 hover:text-blue-300 hover:bg-white/5 rounded transition-colors"
          >
            <Wand2 size={14} />
            <span className="text-xs font-medium">AI Edit</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-1">
            <Wand2 size={14} className="text-blue-400" />
            <input
              ref={inputRef}
              type="text"
              value={magicPrompt}
              onChange={(e) => setMagicPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRefine();
                if (e.key === 'Escape') setShowMagicInput(false);
              }}
              placeholder="Describe changes..."
              className="bg-transparent border-none text-xs text-white placeholder-gray-500 focus:ring-0 w-48 outline-none"
              disabled={isRefining}
            />
            {isRefining ? (
              <Loader2 size={14} className="animate-spin text-blue-400" />
            ) : (
              <button onClick={handleRefine} className="p-1 hover:bg-white/10 rounded">
                <ArrowRight size={14} className="text-blue-400" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
