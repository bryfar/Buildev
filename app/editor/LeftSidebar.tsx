"use client";

import { useAppStore } from "@/lib/store";
import { Layers, Settings, Palette, MessageCircle } from "lucide-react";
import { useState } from "react";
import LayersPanel from "./panels/LayersPanel";
import AssetsPanel from "./panels/AssetsPanel";
import AIAssistant from "./panels/AIAssistant";
import ConfigPanel from "./panels/ConfigPanel";

type PanelType = "layers" | "config" | "assets" | "ai";

export default function LeftSidebar() {
  const [activePanel, setActivePanel] = useState<PanelType>("layers");

  return (
    <div className="w-80 bg-[#1e1e1e] border-r border-[#2a2a2a] flex flex-col overflow-hidden">
      {/* Icon Rail */}
      <div className="flex border-b border-[#2a2a2a] px-2 py-4 gap-1">
        <button
          onClick={() => setActivePanel("layers")}
          className={`p-2 rounded transition-colors ${
            activePanel === "layers"
              ? "bg-[#0D99FF] text-white"
              : "text-[#999] hover:text-white hover:bg-[#2a2a2a]"
          }`}
          title="Layers"
        >
          <Layers size={20} />
        </button>
        <button
          onClick={() => setActivePanel("config")}
          className={`p-2 rounded transition-colors ${
            activePanel === "config"
              ? "bg-[#0D99FF] text-white"
              : "text-[#999] hover:text-white hover:bg-[#2a2a2a]"
          }`}
          title="Configuration"
        >
          <Settings size={20} />
        </button>
        <button
          onClick={() => setActivePanel("assets")}
          className={`p-2 rounded transition-colors ${
            activePanel === "assets"
              ? "bg-[#0D99FF] text-white"
              : "text-[#999] hover:text-white hover:bg-[#2a2a2a]"
          }`}
          title="Assets & Tokens"
        >
          <Palette size={20} />
        </button>
        <button
          onClick={() => setActivePanel("ai")}
          className={`p-2 rounded transition-colors ${
            activePanel === "ai"
              ? "bg-[#0D99FF] text-white"
              : "text-[#999] hover:text-white hover:bg-[#2a2a2a]"
          }`}
          title="AI Assistant"
        >
          <MessageCircle size={20} />
        </button>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto">
        {activePanel === "layers" && <LayersPanel />}
        {activePanel === "config" && <ConfigPanel />}
        {activePanel === "assets" && <AssetsPanel />}
        {activePanel === "ai" && <AIAssistant />}
      </div>
    </div>
  );
}
