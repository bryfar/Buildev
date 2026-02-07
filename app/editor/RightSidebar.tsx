"use client";

import { useAppStore } from "@/lib/store";
import { Smartphone, TabletSmartphone, Monitor } from "lucide-react";

export default function RightSidebar() {
  const {
    activeBreakpoint,
    setActiveBreakpoint,
    selectedElementId,
    updateElement,
    currentPage,
  } = useAppStore();

  const findElementById = (elements: any[], id: string): any | undefined => {
    for (const el of elements) {
      if (el.id === id) return el;
      if (el.children?.length) {
        const found = findElementById(el.children, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  const selectedElement = selectedElementId
    ? findElementById(currentPage?.elements || [], selectedElementId)
    : undefined;

  return (
    <div className="w-64 bg-[#1e1e1e] border-l border-[#2a2a2a] flex flex-col overflow-hidden">
      {/* Breakpoint Control */}
      <div className="p-4 border-b border-[#2a2a2a]">
        <h3 className="text-xs font-semibold text-[#999] uppercase mb-3">
          Breakpoints
        </h3>
        <div className="flex gap-1">
          <div className="relative group">
            <button
              onClick={() => setActiveBreakpoint("mobile")}
              className={`p-2.5 rounded ${
                activeBreakpoint === "mobile"
                  ? "bg-[#0D99FF] text-white"
                  : "bg-[#0f0f0f] text-[#999] hover:text-white"
              }`}
            >
              <Smartphone size={18} />
            </button>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[11px] text-white bg-[#333] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none">
              Mobile — 375px
            </span>
          </div>
          <div className="relative group">
            <button
              onClick={() => setActiveBreakpoint("tablet")}
              className={`p-2.5 rounded ${
                activeBreakpoint === "tablet"
                  ? "bg-[#0D99FF] text-white"
                  : "bg-[#0f0f0f] text-[#999] hover:text-white"
              }`}
            >
              <TabletSmartphone size={18} />
            </button>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[11px] text-white bg-[#333] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none">
              Tablet — 768px
            </span>
          </div>
          <div className="relative group">
            <button
              onClick={() => setActiveBreakpoint("desktop")}
              className={`p-2.5 rounded ${
                activeBreakpoint === "desktop"
                  ? "bg-[#0D99FF] text-white"
                  : "bg-[#0f0f0f] text-[#999] hover:text-white"
              }`}
            >
              <Monitor size={18} />
            </button>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[11px] text-white bg-[#333] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none">
              Desktop — 1440px
            </span>
          </div>
        </div>
      </div>

      {/* Inspector */}
      <div className="flex-1 overflow-y-auto p-4">
        {selectedElement ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#999] uppercase mb-1 block">
                Element Name
              </label>
              <input
                type="text"
                value={selectedElement.name}
                onChange={(e) =>
                  updateElement(selectedElement.id, { name: e.target.value })
                }
                className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded px-3 py-2 text-sm text-white placeholder-[#666] focus:border-[#0D99FF] focus:outline-none"
              />
            </div>

            {/* Layout */}
            <div className="p-3 bg-[#0f0f0f] rounded border border-[#2a2a2a]">
              <h4 className="text-xs font-semibold text-[#999] uppercase mb-3">
                Layout
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-[#999] mb-1 block">X</label>
                  <input
                    type="number"
                    value={selectedElement.x}
                    onChange={(e) =>
                      updateElement(selectedElement.id, {
                        x: parseInt(e.target.value),
                      })
                    }
                    className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded px-2 py-1 text-sm text-white focus:border-[#0D99FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#999] mb-1 block">Y</label>
                  <input
                    type="number"
                    value={selectedElement.y}
                    onChange={(e) =>
                      updateElement(selectedElement.id, {
                        y: parseInt(e.target.value),
                      })
                    }
                    className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded px-2 py-1 text-sm text-white focus:border-[#0D99FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#999] mb-1 block">
                    Width
                  </label>
                  <input
                    type="number"
                    value={selectedElement.width}
                    onChange={(e) =>
                      updateElement(selectedElement.id, {
                        width: parseInt(e.target.value),
                      })
                    }
                    className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded px-2 py-1 text-sm text-white focus:border-[#0D99FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#999] mb-1 block">
                    Height
                  </label>
                  <input
                    type="number"
                    value={selectedElement.height}
                    onChange={(e) =>
                      updateElement(selectedElement.id, {
                        height: parseInt(e.target.value),
                      })
                    }
                    className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded px-2 py-1 text-sm text-white focus:border-[#0D99FF] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Appearance */}
            <div className="p-3 bg-[#0f0f0f] rounded border border-[#2a2a2a]">
              <h4 className="text-xs font-semibold text-[#999] uppercase mb-3">
                Appearance
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-[#999] mb-1 block">
                    Background Color
                  </label>
                  <input
                    type="color"
                    value={selectedElement.backgroundColor || "#e5e5e5"}
                    onChange={(e) =>
                      updateElement(selectedElement.id, {
                        backgroundColor: e.target.value,
                      })
                    }
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>
                {selectedElement.type === "text" && (
                  <div>
                    <label className="text-xs text-[#999] mb-1 block">
                      Text Color
                    </label>
                    <input
                      type="color"
                      value={selectedElement.textColor || "#000000"}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          textColor: e.target.value,
                        })
                      }
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-[#999] text-sm py-8">
            <p>Select an element to edit</p>
          </div>
        )}
      </div>
    </div>
  );
}
