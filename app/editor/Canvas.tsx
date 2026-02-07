'use client';

import React from "react"

import { useAppStore } from '@/lib/store';
import { useEffect, useRef, useState } from 'react';
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
  } = useAppStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0f0f0f] overflow-hidden relative">
      {/* Toolbar */}
      <div className="h-12 border-b border-[#2a2a2a] bg-[#1e1e1e] flex items-center justify-between px-4">
        <div className="flex gap-2">
          <button
            onClick={() => setZoom(zoom * 1.2)}
            className="p-2 text-[#999] hover:text-white hover:bg-[#2a2a2a] rounded transition-colors"
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={() => setZoom(zoom / 1.2)}
            className="p-2 text-[#999] hover:text-white hover:bg-[#2a2a2a] rounded transition-colors"
          >
            <ZoomOut size={18} />
          </button>
          <button className="p-2 text-[#999] hover:text-white hover:bg-[#2a2a2a] rounded transition-colors">
            <span className="text-xs font-medium">{Math.round(zoom * 100)}%</span>
          </button>
        </div>

        <button className="p-2 text-[#999] hover:text-white hover:bg-[#2a2a2a] rounded transition-colors">
          <Grid3x3 size={18} />
        </button>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 relative overflow-hidden bg-[#0f0f0f] cursor-move"
        style={{
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
          style={{
            transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
          className="absolute top-0 left-0"
        >
          {/* Mobile Viewport */}
          <div className="w-[375px] h-[812px] bg-white rounded-3xl shadow-2xl overflow-hidden border-[12px] border-black">
            {/* Notch */}
            <div className="h-6 bg-black rounded-b-3xl absolute top-0 left-1/2 transform -translate-x-1/2 w-40 z-10" />

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
