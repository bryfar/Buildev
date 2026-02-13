'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import {
  AlignLeft, AlignCenter, AlignRight,
  Copy, Trash2, Settings2,
} from 'lucide-react';
import { SiteElement } from '@/lib/types';

export default function AlignmentToolsPRO() {
  const { currentPage, selectedElementId, updateElement, activeBreakpoint } = useAppStore();

  if (!currentPage || !selectedElementId) {
    return (
      <div className="p-4 text-xs text-[#666]">
        Select elements to align
      </div>
    );
  }

  const element = currentPage.elements.find((el) => el.id === selectedElementId);
  if (!element) return null;

  // Get properties for current breakpoint
  const responsive = element.responsive?.[activeBreakpoint];
  const x = typeof responsive?.x === 'number' ? responsive.x : element.x;
  const y = typeof responsive?.y === 'number' ? responsive.y : element.y;
  const width = typeof responsive?.width === 'number' ? responsive.width : element.width;
  const height = typeof responsive?.height === 'number' ? responsive.height : element.height;

  // Helper to update with responsive support
  const updateWithResponsive = (updates: any) => {
    if (activeBreakpoint === 'mobile') {
      updateElement(selectedElementId, updates);
    } else {
      updateElement(selectedElementId, {
        responsive: {
          ...element.responsive,
          [activeBreakpoint]: {
            ...(element.responsive?.[activeBreakpoint] || {}),
            ...updates,
          },
        },
      });
    }
  };

  // Alignment functions
  const alignLeft = () => updateWithResponsive({ x: 0 });
  const alignCenterH = () => {
    const parentWidth = activeBreakpoint === 'mobile' ? 375 : activeBreakpoint === 'tablet' ? 768 : 1440;
    updateWithResponsive({ x: Math.round((parentWidth - width) / 2) });
  };
  const alignRight = () => {
    const parentWidth = activeBreakpoint === 'mobile' ? 375 : activeBreakpoint === 'tablet' ? 768 : 1440;
    updateWithResponsive({ x: parentWidth - width });
  };

  const alignTop = () => updateWithResponsive({ y: 0 });
  const alignCenterV = () => {
    const parentHeight = activeBreakpoint === 'mobile' ? 812 : activeBreakpoint === 'tablet' ? 1024 : 900;
    updateWithResponsive({ y: Math.round((parentHeight - height) / 2) });
  };
  const alignBottom = () => {
    const parentHeight = activeBreakpoint === 'mobile' ? 812 : activeBreakpoint === 'tablet' ? 1024 : 900;
    updateWithResponsive({ y: parentHeight - height });
  };

  return (
    <div className="p-4 space-y-4">
      {/* Horizontal Alignment */}
      <div>
        <p className="text-xs font-semibold text-[#999] uppercase mb-2">Horizontal</p>
        <div className="flex gap-2">
          <button
            onClick={alignLeft}
            className="flex-1 p-2 bg-[#2a2a2a] hover:bg-[#333] text-[#ddd] rounded transition-colors"
            title="Align Left"
          >
            <AlignLeft size={16} className="mx-auto" />
          </button>
          <button
            onClick={alignCenterH}
            className="flex-1 p-2 bg-[#2a2a2a] hover:bg-[#333] text-[#ddd] rounded transition-colors"
            title="Align Center"
          >
            <AlignCenter size={16} className="mx-auto" />
          </button>
          <button
            onClick={alignRight}
            className="flex-1 p-2 bg-[#2a2a2a] hover:bg-[#333] text-[#ddd] rounded transition-colors"
            title="Align Right"
          >
            <AlignRight size={16} className="mx-auto" />
          </button>
        </div>
      </div>

      {/* Vertical Alignment */}
      <div>
        <p className="text-xs font-semibold text-[#999] uppercase mb-2">Vertical</p>
        <div className="flex gap-2">
          <button
            onClick={alignTop}
            className="flex-1 p-2 bg-[#2a2a2a] hover:bg-[#333] text-[#ddd] rounded transition-colors"
            title="Align Top"
          >
            <div className="mx-auto text-sm">↑</div>
          </button>
          <button
            onClick={alignCenterV}
            className="flex-1 p-2 bg-[#2a2a2a] hover:bg-[#333] text-[#ddd] rounded transition-colors"
            title="Align Center"
          >
            <AlignCenter size={16} className="mx-auto" />
          </button>
          <button
            onClick={alignBottom}
            className="flex-1 p-2 bg-[#2a2a2a] hover:bg-[#333] text-[#ddd] rounded transition-colors"
            title="Align Bottom"
          >
            <div className="mx-auto text-sm">↓</div>
          </button>
        </div>
      </div>

      {/* Current Position Info */}
      <div className="text-xs text-[#666] border-t border-[#2a2a2a] pt-3">
        <div className="space-y-1">
          <p>Position: {Math.round(x)}, {Math.round(y)}</p>
          <p>Size: {Math.round(width)} × {Math.round(height)}</p>
        </div>
      </div>
    </div>
  );
}
