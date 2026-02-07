'use client';

import React from "react"

import { useAppStore } from '@/lib/store';
import { useEffect, useRef, useState } from 'react';
import { Move, Palette } from 'lucide-react';
import {
  ZoomIn,
  ZoomOut,
  Grid3x3,
  MousePointer2,
  Hash,
  Type,
  Square,
  MessageCircle,
} from 'lucide-react';

export default function Canvas() {
  const {
    currentPage,
    zoom,
    panX,
    panY,
    setZoom,
    setPan,
    selectElement,
    selectedElementId,
    showGrid,
    activeBreakpoint,
  } = useAppStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [canvasColor, setCanvasColor] = useState('#0f0f0f');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [viewportOffsetX, setViewportOffsetX] = useState(0);
  const [viewportOffsetY, setViewportOffsetY] = useState(0);
  const [isViewportDragging, setIsViewportDragging] = useState(false);
  const [viewportDragStart, setViewportDragStart] = useState({ x: 0, y: 0 });

  // Get breakpoint dimensions
  const breakpointDimensions = {
    mobile: { width: 375, height: 812, showNotch: true },
    tablet: { width: 768, height: 1024, showNotch: false },
    desktop: { width: 1440, height: 900, showNotch: false },
  };

  const currentDimensions = breakpointDimensions[activeBreakpoint];

  // Handle zoom with Ctrl/Cmd + Scroll
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom(zoom * delta);
      }
    };

    const canvas = canvasRef.current;
    canvas?.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas?.removeEventListener('wheel', handleWheel);
  }, [zoom, setZoom]);

  // Handle panning with spacebar + drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan(e.clientX - dragStart.x, e.clientY - dragStart.y);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsViewportDragging(false);
  };

  // Handle viewport dragging
  const handleViewportMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      e.preventDefault();
      e.stopPropagation();
      setIsViewportDragging(true);
      setViewportDragStart({ 
        x: e.clientX - viewportOffsetX, 
        y: e.clientY - viewportOffsetY 
      });
    }
  };

  const handleViewportMouseMove = (e: React.MouseEvent) => {
    if (isViewportDragging) {
      setViewportOffsetX(e.clientX - viewportDragStart.x);
      setViewportOffsetY(e.clientY - viewportDragStart.y);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0f0f0f] overflow-hidden relative">
      {/* Toolbar */}
      <div className="h-12 border-b border-[#2a2a2a] bg-[#1e1e1e] flex items-center justify-between px-4">
        <div className="flex gap-2">
          <button
            onClick={() => setZoom(zoom * 1.2)}
            className="p-2 text-[#999] hover:text-white hover:bg-[#2a2a2a] rounded transition-colors"
            title="Zoom in"
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={() => setZoom(zoom / 1.2)}
            className="p-2 text-[#999] hover:text-white hover:bg-[#2a2a2a] rounded transition-colors"
            title="Zoom out"
          >
            <ZoomOut size={18} />
          </button>
          <button className="p-2 text-[#999] hover:text-white hover:bg-[#2a2a2a] rounded transition-colors">
            <span className="text-xs font-medium">{Math.round(zoom * 100)}%</span>
          </button>
          
          {/* Canvas Color Picker */}
          <div className="relative ml-4 pl-4 border-l border-[#2a2a2a]">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-2 text-[#999] hover:text-white hover:bg-[#2a2a2a] rounded transition-colors flex items-center gap-2"
              title="Change canvas color"
            >
              <Palette size={18} />
            </button>
            {showColorPicker && (
              <div className="absolute top-12 left-0 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg p-3 z-50 shadow-lg">
                <label className="block text-xs text-[#999] mb-2">Canvas Color</label>
                <input
                  type="color"
                  value={canvasColor}
                  onChange={(e) => setCanvasColor(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[#666] text-xs">
          <Move size={14} />
          <span>Drag viewport | Shift+Drag canvas</span>
        </div>

        <button className="p-2 text-[#999] hover:text-white hover:bg-[#2a2a2a] rounded transition-colors" title="Toggle grid">
          <Grid3x3 size={18} />
        </button>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 relative overflow-hidden cursor-move"
        style={{
          backgroundColor: canvasColor,
          backgroundImage: showGrid
            ? `radial-gradient(circle, #222 0.5px, transparent 0.5px)`
            : 'none',
          backgroundSize: '20px 20px',
          backgroundPosition: `${panX}px ${panY}px`,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Viewport Container */}
        <div
          ref={viewportRef}
          style={{
            transform: `translate(calc(${viewportOffsetX}px - 50%), calc(${viewportOffsetY}px - 50%)) scale(${zoom})`,
            transformOrigin: '0 0',
            transition: isViewportDragging ? 'none' : 'transform 0.1s ease-out',
            cursor: isViewportDragging ? 'grabbing' : 'grab',
          }}
          className="absolute top-1/2 left-1/2 select-none"
          onMouseDown={handleViewportMouseDown}
          onMouseMove={handleViewportMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Responsive Viewport */}
          <div
            className={`bg-white shadow-2xl overflow-hidden pointer-events-none ${
              activeBreakpoint === 'mobile' ? 'rounded-3xl border-[12px] border-black' : 'border border-gray-300'
            }`}
            style={{
              width: `${currentDimensions.width}px`,
              height: `${currentDimensions.height}px`,
            }}
          >
            {/* Notch - Only on mobile */}
            {currentDimensions.showNotch && (
              <div className="h-6 bg-black rounded-b-3xl absolute top-0 left-1/2 transform -translate-x-1/2 w-40 z-10" />
            )}

            {/* Viewport Content */}
            <div className="w-full h-full bg-white relative" onClick={(e) => {
              e.stopPropagation();
              selectElement(null);
            }}>
              {currentPage?.elements.map((element) => (
                <div
                  key={element.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectElement(element.id);
                  }}
                  style={{
                    position: 'absolute',
                    left: `${element.x}px`,
                    top: `${element.y}px`,
                    width: `${element.width}px`,
                    height: `${element.height}px`,
                    backgroundColor: element.backgroundColor || '#e5e5e5',
                    opacity: element.opacity,
                    cursor: 'pointer',
                  }}
                  className={`transition-all ${
                    selectedElementId === element.id
                      ? 'ring-2 ring-blue-500 ring-offset-1'
                      : 'hover:ring-1 hover:ring-gray-300'
                  }`}
                >
                  {element.type === 'text' && (
                    <p style={{
                      fontSize: element.fontSize,
                      fontFamily: element.fontFamily,
                      fontWeight: element.fontWeight,
                      lineHeight: element.lineHeight,
                      letterSpacing: element.letterSpacing,
                      color: element.textColor,
                    }}>
                      {element.textContent}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Toolbar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-0.5 bg-[#1e1e1e] rounded-xl px-1.5 py-1.5 shadow-lg border border-[#2a2a2a]">
        {/* Tool group */}
        <button className="p-2 rounded-lg bg-[#0D99FF]/15 text-[#0D99FF] transition-colors" title="Select">
          <MousePointer2 size={18} />
        </button>
        <button className="p-2 rounded-lg text-[#999] hover:text-white hover:bg-[#2a2a2a] transition-colors" title="Frame">
          <Hash size={18} />
        </button>

        <div className="w-px h-5 bg-[#2a2a2a] mx-1" />

        <button className="p-2 rounded-lg text-[#999] hover:text-white hover:bg-[#2a2a2a] transition-colors" title="Text">
          <Type size={18} />
        </button>
        <button className="p-2 rounded-lg text-[#999] hover:text-white hover:bg-[#2a2a2a] transition-colors" title="Rectangle">
          <Square size={18} />
        </button>
        <button className="p-2 rounded-lg text-[#999] hover:text-white hover:bg-[#2a2a2a] transition-colors" title="Comments">
          <MessageCircle size={18} />
        </button>
      </div>
    </div>
  );
}
