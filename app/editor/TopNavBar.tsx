"use client";

import { useAppStore } from "@/lib/store";
import { ArrowLeft, RotateCcw, RotateCw, Play, Share2, Download } from "lucide-react";

type ViewMode = "design" | "code" | "preview";

interface TopNavBarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export default function TopNavBar({ viewMode, setViewMode }: TopNavBarProps) {
  const { currentProject } = useAppStore();

  const handleBack = () => {
    window.location.href = '/dashboard';
  };

  /* 
   * Handles downloading the current project as a ZIP file.
   * Uses JSZip to bundle project files and FileSaver to trigger download.
   */
  const handleDownload = async () => {
    if (!currentProject) return;

    try {
      // Dynamic import to avoid SSR issues if any
      const JSZip = (await import('jszip')).default;
      const { saveAs } = (await import('file-saver'));

      const zip = new JSZip();

      // Create root folder
      const root = zip.folder(currentProject.name) || zip;

      // Add project metadata
      root.file('project.json', JSON.stringify(currentProject, null, 2));

      // Example: Add a README
      root.file('README.md', `# ${currentProject.name}\n\nExported from Buildev.`);

      // Create a simple index.html
      const indexPage = currentProject.pages[0];
      if (indexPage) {
        root.file('index.html', `<!-- Generated from Buildev -->\n<html>\n<body>\n  <div id="app"></div>\n</body>\n</html>`);
        root.file('styles.css', `body { margin: 0; font-family: sans-serif; }`);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${currentProject.name}.zip`);

      alert("Project downloaded successfully!");
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download project.");
    }
  };

  /*
   * Simulates sharing the project by copying a link to clipboard.
   * In a real backend, this would generate a unique share ID.
   */
  const handleShare = () => {
    const shareUrl = `${window.location.origin}/share/${currentProject?.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert(`Share link copied to clipboard:\n${shareUrl}`);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy link to clipboard');
    });
  };

  return (
    <div className="h-16 bg-[#1e1e1e] border-b border-[#2a2a2a] flex items-center px-6 gap-6">
      {/* Left: Logo, Back, Undo/Redo, Project Name */}
      <div className="flex items-center gap-4">
        <img src="/Union.svg" alt="Logo" className="h-10 w-auto" />
        <button
          onClick={handleBack}
          className="text-[#999] hover:text-white transition-colors p-2 hover:bg-[#2a2a2a] rounded"
          title="Back to Dashboard"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex gap-1">
          <button className="text-[#999] hover:text-white transition-colors p-2 hover:bg-[#2a2a2a] rounded">
            <RotateCcw size={20} />
          </button>
          <button className="text-[#999] hover:text-white transition-colors p-2 hover:bg-[#2a2a2a] rounded">
            <RotateCw size={20} />
          </button>
        </div>

        <div className="ml-4 border-l border-[#2a2a2a] pl-4">
          <h2 className="font-semibold text-white text-lg">
            {currentProject?.name}
          </h2>
          <p className="text-xs text-[#666]">
            {currentProject?.pages[0]?.name}
          </p>
        </div>
      </div>

      {/* Center: Work Mode Switcher */}
      <div className="flex-1 flex justify-center">
        <div className="flex gap-1 bg-[#0f0f0f] rounded-lg p-1">
          {(["design", "code", "preview"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-1.5 text-sm font-medium rounded transition-colors capitalize ${viewMode === mode
                ? "text-white bg-[#0D99FF]"
                : "text-[#999] hover:text-white"
                }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Code Mode Actions */}
        {viewMode === 'code' && (
          <button
            className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] text-white hover:bg-[#333] rounded transition-colors"
            onClick={handleDownload}
          >
            <Download size={16} />
            Download
          </button>
        )}

        {/* Connected Users (Simulated) */}
        <div className="flex -space-x-2">
          <img src="https://i.pravatar.cc/150?u=1" alt="User 1" className="w-8 h-8 rounded-full border-2 border-[#1e1e1e]" title="Alex (You)" />
          <img src="https://i.pravatar.cc/150?u=2" alt="User 2" className="w-8 h-8 rounded-full border-2 border-[#1e1e1e]" title="Sarah" />
          <img src="https://i.pravatar.cc/150?u=3" alt="User 3" className="w-8 h-8 rounded-full border-2 border-[#1e1e1e]" title="Mike" />
          <div className="w-8 h-8 rounded-full border-2 border-[#1e1e1e] bg-[#333] flex items-center justify-center text-[10px] text-white font-medium">
            +2
          </div>
        </div>

        <button
          className="flex items-center gap-2 px-4 py-2 bg-[#0D99FF] hover:bg-[#0a7acc] text-white rounded transition-colors"
          onClick={handleShare}
        >
          <Share2 size={16} />
          Share
        </button>
      </div>
    </div>
  );
}
