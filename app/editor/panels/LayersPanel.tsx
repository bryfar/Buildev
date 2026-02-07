'use client';

import { useAppStore } from '@/lib/store';
import { ChevronRight, ChevronDown, Eye, EyeOff, Trash2, Box, Type, Image, Circle, Square } from 'lucide-react';
import { SiteElement } from '@/lib/types';
import { useState } from 'react';

export default function LayersPanel() {
  const { currentPage, selectedElementId, selectElement, deleteElement, updateElement } = useAppStore();
  const [expandedElements, setExpandedElements] = useState<Set<string>>(new Set());

  const toggleExpanded = (elementId: string) => {
    const newExpanded = new Set(expandedElements);
    if (newExpanded.has(elementId)) {
      newExpanded.delete(elementId);
    } else {
      newExpanded.add(elementId);
    }
    setExpandedElements(newExpanded);
  };

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <Type size={14} />;
      case 'image':
        return <Image size={14} />;
      case 'circle':
        return <Circle size={14} />;
      case 'rectangle':
        return <Square size={14} />;
      case 'frame':
        return <Box size={14} />;
      default:
        return <Box size={14} />;
    }
  };

  const renderLayerTree = (elements: SiteElement[], depth = 0) => {
    return elements.map((element) => {
      const hasChildren = element.children && element.children.length > 0;
      const isExpanded = expandedElements.has(element.id);
      const isVisible = element.isVisible !== false;

      return (
        <div key={element.id} className="select-none">
          <div
            onClick={() => selectElement(element.id)}
            className={`flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer transition-colors group ${
              selectedElementId === element.id
                ? 'bg-[#0D99FF] text-white'
                : 'text-[#ddd] hover:bg-[#2a2a2a]'
            }`}
            style={{ paddingLeft: `${8 + depth * 16}px` }}
          >
            {/* Expand/Collapse icon */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (hasChildren) {
                  toggleExpanded(element.id);
                }
              }}
              className="flex-shrink-0 p-0.5 hover:bg-white/10 rounded"
              disabled={!hasChildren}
            >
              {hasChildren ? (
                isExpanded ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )
              ) : (
                <div className="w-[14px]" />
              )}
            </button>

            {/* Element icon */}
            <div className="flex-shrink-0 text-[#999] group-hover:text-white">
              {getElementIcon(element.type)}
            </div>

            {/* Element name */}
            <span className="flex-1 truncate font-medium text-xs">{element.name}</span>

            {/* Action buttons */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateElement(element.id, {
                    isVisible: !isVisible,
                  });
                }}
                className="p-0.5 text-[#999] hover:text-white hover:bg-white/10 rounded"
              >
                {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteElement(element.id);
                }}
                className="p-0.5 text-[#999] hover:text-red-400 hover:bg-white/10 rounded"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Render children if expanded */}
          {hasChildren && isExpanded && (
            <div className="">
              {renderLayerTree(element.children!, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="p-3">
      <h3 className="text-xs font-semibold text-[#999] uppercase mb-2 tracking-wide">Layers</h3>
      <div className="space-y-0.5">
        {currentPage?.elements && currentPage.elements.length > 0 ? (
          renderLayerTree(currentPage.elements)
        ) : (
          <p className="text-xs text-[#666] text-center py-8">No elements yet</p>
        )}
      </div>
    </div>
  );
}
