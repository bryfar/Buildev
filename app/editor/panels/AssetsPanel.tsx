'use client';

import { useAppStore } from '@/lib/store';
import { Plus, Trash2, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AssetsPanel() {
  const { 
    currentProject, 
    colorPalette, 
    extractColorsFromCanvas, 
    addColor, 
    removeColor,
    reusableComponents,
    deleteComponent,
    instantiateComponent,
  } = useAppStore();

  const [newColor, setNewColor] = useState('#000000');

  // Extract colors when component mounts or page changes
  useEffect(() => {
    extractColorsFromCanvas();
  }, [extractColorsFromCanvas]);

  const handleAddColor = () => {
    if (newColor && !colorPalette.includes(newColor)) {
      addColor(newColor);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-[#999] uppercase">Color Palette</h3>
          <button
            onClick={extractColorsFromCanvas}
            className="text-[10px] text-[#0D99FF] hover:text-white transition-colors"
          >
            Refresh
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {colorPalette.length > 0 ? (
            colorPalette.map((color) => (
              <div key={color} className="group relative">
                <div
                  className="w-10 h-10 rounded cursor-pointer border border-[#2a2a2a] hover:border-[#0D99FF] transition-colors"
                  style={{ backgroundColor: color }}
                  title={color}
                />
                <button
                  onClick={() => removeColor(color)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            ))
          ) : (
            <p className="text-xs text-[#666] py-2">No colors detected yet</p>
          )}
        </div>

        {/* Add custom color */}
        <div className="flex gap-2">
          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            className="w-10 h-10 rounded border border-[#2a2a2a] cursor-pointer bg-transparent"
          />
          <button
            onClick={handleAddColor}
            className="flex-1 px-3 py-2 bg-[#0f0f0f] border border-[#2a2a2a] text-[#999] hover:text-white hover:border-[#0D99FF] rounded text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={14} />
            Add Color
          </button>
        </div>
      </div>

      {/* Reusable Components */}
      <div>
        <h3 className="text-xs font-semibold text-[#999] uppercase mb-3">Components</h3>
        
        {reusableComponents.length > 0 ? (
          <div className="space-y-2">
            {reusableComponents.map((component) => (
              <div
                key={component.id}
                className="p-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded hover:border-[#0D99FF] transition-colors group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white font-medium">{component.name}</span>
                  <button
                    onClick={() => deleteComponent(component.id)}
                    className="text-[#666] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => instantiateComponent(component.id)}
                    className="flex-1 px-2 py-1.5 bg-[#0D99FF] hover:bg-[#0a7acc] text-white rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Copy size={12} />
                    Use
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-[#0f0f0f] border border-dashed border-[#2a2a2a] rounded text-center">
            <p className="text-xs text-[#666] mb-2">No components saved yet</p>
            <p className="text-[10px] text-[#555]">
              Select an element and save it as a component
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
