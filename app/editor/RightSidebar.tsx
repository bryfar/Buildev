"use client";

import { useAppStore } from "@/lib/store";
import { Smartphone, TabletSmartphone, Monitor, Layers, Grid, Palette } from "lucide-react";
import { useState } from "react";
import PropertiesPanelPRO from "./panels/PropertiesPanel_PRO";
import AssetsManagerPRO from "./panels/AssetsManager_PRO";
import TokensPanelPRO from "./panels/TokensPanel_PRO";

type SidebarTab = "inspector" | "assets" | "tokens";

export default function RightSidebar() {
  const {
    activeBreakpoint,
    setActiveBreakpoint,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<SidebarTab>("inspector");

  return (
    <div className="w-80 bg-[#1e1e1e] border-l border-[#2a2a2a] flex flex-col overflow-hidden transition-all duration-300">
      {/* Breakpoint Control */}
      <div className="p-3 border-b border-[#2a2a2a] flex items-center justify-between bg-[#1a1a1a]">
        <div className="flex gap-1">
          <BreakpointButton
            active={activeBreakpoint === "mobile"}
            onClick={() => setActiveBreakpoint("mobile")}
            icon={<Smartphone size={16} />}
            label="Mobile"
          />
          <BreakpointButton
            active={activeBreakpoint === "tablet"}
            onClick={() => setActiveBreakpoint("tablet")}
            icon={<TabletSmartphone size={16} />}
            label="Tablet"
          />
          <BreakpointButton
            active={activeBreakpoint === "desktop"}
            onClick={() => setActiveBreakpoint("desktop")}
            icon={<Monitor size={16} />}
            label="Desktop"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2a2a2a] bg-[#1e1e1e]">
        <TabButton
          active={activeTab === "inspector"}
          onClick={() => setActiveTab("inspector")}
          icon={<Layers size={14} />}
          label="Design"
        />
        <TabButton
          active={activeTab === "assets"}
          onClick={() => setActiveTab("assets")}
          icon={<Grid size={14} />}
          label="Assets"
        />
        <TabButton
          active={activeTab === "tokens"}
          onClick={() => setActiveTab("tokens")}
          icon={<Palette size={14} />}
          label="Tokens"
        />
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === "inspector" && <PropertiesPanelPRO />}
        {activeTab === "assets" && <AssetsManagerPRO />}
        {activeTab === "tokens" && <TokensPanelPRO />}
      </div>
    </div>
  );
}

function BreakpointButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded transition-colors relative group ${active ? "bg-[#0D99FF] text-white" : "text-[#999] hover:text-white hover:bg-[#2a2a2a]"}`}
      title={label}
    >
      {icon}
    </button>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium border-b-2 transition-colors ${active
          ? "border-[#0D99FF] text-white bg-[#252526]"
          : "border-transparent text-[#999] hover:text-white hover:bg-[#252526]"
        }`}
    >
      {icon}
      {label}
    </button>
  );
}
