'use client';

import { useAppStore } from '@/lib/store';
import { ChevronDown, Eye, EyeOff, Trash2 } from 'lucide-react';

export default function LayersPanel() {
  const { currentPage, selectedElementId, selectElement, deleteElement, updateElement } = useAppStore();

  const renderLayerTree = (elements: any[], depth = 0) => {
    return elements.map((element) => (
      <div key={element.id}>
        <div
          onClick={() => selectElement(element.id)}
          className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors ${
            selectedElementId === element.id
              ? 'bg-[#0D99FF] text-white'
              : 'text-[#ddd] hover:bg-[#2a2a2a]'
          }`}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          <ChevronDown size={16} className="flex-shrink-0" />
          <span className="flex-1 truncate">{element.name}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              updateElement(element.id, {
                ...element,
              });
            }}
            className="text-[#999] hover:text-white"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteElement(element.id);
            }}
            className="text-[#999] hover:text-red-400"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="p-4">
      <h3 className="text-xs font-semibold text-[#999] uppercase mb-3">Layers</h3>
      <div className="space-y-0">
        {currentPage?.elements && currentPage.elements.length > 0 ? (
          renderLayerTree(currentPage.elements)
        ) : (
          <p className="text-xs text-[#666] text-center py-4">No elements yet</p>
        )}
      </div>
    </div>
  );
}
