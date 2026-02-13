'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Smartphone, Tablet, Monitor, ZoomIn, ZoomOut, Download, Share2, Info, Eye } from 'lucide-react';
import type { SiteElement, BreakpointName } from '@/lib/types';

export default function PreviewMode() {
  const { currentPage } = useAppStore();
  const [previewBreakpoint, setPreviewBreakpoint] = useState<BreakpointName>('desktop');
  const [previewZoom, setPreviewZoom] = useState(100);
  const [showInfoPanel, setShowInfoPanel] = useState(true);

  const breakpointDimensions = {
    mobile: { width: 375, height: 812, showNotch: true },
    tablet: { width: 768, height: 1024, showNotch: false },
    desktop: { width: 1440, height: 900, showNotch: false },
  };

  const currentDimensions = breakpointDimensions[previewBreakpoint];

  if (!currentPage || !currentPage.elements || currentPage.elements.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0f0f0f]">
        <div className="text-center">
          <Eye size={48} className="mx-auto mb-4 text-[#666]" />
          <p className="text-[#999] mb-2">No hay elementos para mostrar en la vista previa</p>
          <p className="text-[#666] text-sm">Crea algunos elementos en el editor de diseño para verlos aquí</p>
        </div>
      </div>
    );
  }

  // Render element for preview (user view)
  const renderPreviewElement = (element: SiteElement): React.ReactNode => {
    const isVisible = element.isVisible !== false;
    
    if (!isVisible) return null;

    // Get responsive styles for current breakpoint
    const getResponsiveValue = (key: string, defaultValue: any) => {
      const breakpointOverrides = element.responsive?.[previewBreakpoint];
      if (breakpointOverrides && key in breakpointOverrides) {
        return breakpointOverrides[key];
      }
      return defaultValue;
    };

    const x = getResponsiveValue('x', element.x);
    const y = getResponsiveValue('y', element.y);
    const width = getResponsiveValue('width', element.width);
    const height = getResponsiveValue('height', element.height);
    const backgroundColor = getResponsiveValue('backgroundColor', element.backgroundColor);
    const opacity = getResponsiveValue('opacity', element.opacity);

    const baseStyles = {
      position: 'absolute' as const,
      left: `${x}px`,
      top: `${y}px`,
      width: `${width}px`,
      height: `${height}px`,
      backgroundColor: backgroundColor || (element.type === 'frame' ? 'transparent' : '#e5e5e5'),
      opacity: opacity,
      borderRadius: element.type === 'circle' ? '50%' : undefined,
      display: 'flex',
      alignItems: element.type === 'text' ? 'center' : 'flex-start',
      justifyContent: element.type === 'text' ? 'center' : 'flex-start',
      overflow: 'hidden',
    };

    return (
      <div 
        key={element.id} 
        style={baseStyles}
        className="hover:shadow-md transition-shadow duration-200"
        title={`${element.type}: ${element.name}`}
      >
        {element.type === 'text' && (
          <p
            style={{
              fontSize: element.fontSize || 14,
              fontFamily: element.fontFamily || 'system-ui, -apple-system, sans-serif',
              fontWeight: element.fontWeight || 400,
              lineHeight: element.lineHeight ? `${element.lineHeight}` : 1.5,
              letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : 0,
              color: element.textColor || '#000',
              width: '100%',
              textAlign: 'center',
              margin: 0,
              padding: '8px',
              wordWrap: 'break-word',
              userSelect: 'text',
            }}
          >
            {element.textContent || ''}
          </p>
        )}

        {element.type === 'image' && element.textContent && (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundImage: `url('${element.textContent}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        )}
        
        {/* Render children recursively */}
        {element.children && element.children.length > 0 && (
          <>
            {element.children.map((child) => renderPreviewElement(child))}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0f0f0f] overflow-hidden">
      {/* Preview Controls Bar */}
      <div className="h-16 border-b border-[#2a2a2a] bg-[#1e1e1e] flex items-center justify-between px-6">
        {/* Left: Device Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#999] uppercase mr-3">Vista previa:</span>
          <button
            onClick={() => setPreviewBreakpoint('mobile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              previewBreakpoint === 'mobile'
                ? 'bg-[#0D99FF] text-white'
                : 'bg-[#0f0f0f] text-[#999] hover:text-white hover:bg-[#2a2a2a]'
            }`}
          >
            <Smartphone size={16} />
            Móvil
          </button>
          <button
            onClick={() => setPreviewBreakpoint('tablet')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              previewBreakpoint === 'tablet'
                ? 'bg-[#0D99FF] text-white'
                : 'bg-[#0f0f0f] text-[#999] hover:text-white hover:bg-[#2a2a2a]'
            }`}
          >
            <Tablet size={16} />
            Tablet
          </button>
          <button
            onClick={() => setPreviewBreakpoint('desktop')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              previewBreakpoint === 'desktop'
                ? 'bg-[#0D99FF] text-white'
                : 'bg-[#0f0f0f] text-[#999] hover:text-white hover:bg-[#2a2a2a]'
            }`}
          >
            <Monitor size={16} />
            Desktop
          </button>
        </div>

        {/* Center: Zoom Control */}
        <div className="flex items-center gap-3 bg-[#0f0f0f] rounded-lg p-2">
          <button
            onClick={() => setPreviewZoom(Math.max(50, previewZoom - 10))}
            className="p-1.5 text-[#999] hover:text-white hover:bg-[#2a2a2a] rounded transition-colors"
            title="Zoom out"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-xs font-medium text-[#999] w-12 text-center">
            {previewZoom}%
          </span>
          <button
            onClick={() => setPreviewZoom(Math.min(200, previewZoom + 10))}
            className="p-1.5 text-[#999] hover:text-white hover:bg-[#2a2a2a] rounded transition-colors"
            title="Zoom in"
          >
            <ZoomIn size={16} />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowInfoPanel(!showInfoPanel)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
              showInfoPanel
                ? 'bg-[#0D99FF] text-white'
                : 'bg-[#2a2a2a] text-[#999] hover:text-white'
            }`}
            title="Información"
          >
            <Info size={16} />
            Info
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] text-[#999] hover:text-white hover:bg-[#333] rounded-lg transition-colors text-sm font-medium">
            <Download size={16} />
            Descargar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0D99FF] hover:bg-[#0a7acc] text-white rounded-lg transition-colors text-sm font-medium">
            <Share2 size={16} />
            Compartir
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex">
        {/* Preview Container */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-8" style={{ backgroundColor: '#0a0a0a' }}>
          {/* Device Frame */}
          <div
            className={`bg-white shadow-2xl relative transition-all duration-300 ${
              previewBreakpoint === 'mobile' ? 'rounded-3xl border-[12px] border-black' : 'border border-gray-300'
            }`}
            style={{
              width: `${currentDimensions.width * (previewZoom / 100)}px`,
              height: `${currentDimensions.height * (previewZoom / 100)}px`,
              transform: `scale(${previewZoom / 100})`,
              transformOrigin: 'top center',
              boxShadow: previewBreakpoint === 'mobile' 
                ? '0 20px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.6)' 
                : '0 10px 40px rgba(0, 0, 0, 0.2)',
            }}
          >
            {/* Phone Notch (mobile only) */}
            {previewBreakpoint === 'mobile' && currentDimensions.showNotch && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-black rounded-b-2xl z-10" />
            )}

            {/* Status Bar for Mobile */}
            {previewBreakpoint === 'mobile' && (
              <div className="absolute top-7 left-0 right-0 h-5 bg-white border-b border-gray-100 flex items-center justify-between px-4 text-[10px] text-gray-700 z-5">
                <span>9:41</span>
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-gray-700 rounded-full"></div>
                </div>
              </div>
            )}

            {/* Content Area */}
            <div
              className="relative w-full overflow-hidden"
              style={{
                height: previewBreakpoint === 'mobile' ? 'calc(100% - 28px)' : '100%',
                marginTop: previewBreakpoint === 'mobile' ? '28px' : '0',
                backgroundColor: '#ffffff',
              }}
            >
              {/* Render all elements */}
              {currentPage.elements.map((element) => renderPreviewElement(element))}
            </div>
          </div>
        </div>

        {/* Info Panel */}
        {showInfoPanel && (
          <div className="w-80 bg-[#1e1e1e] border-l border-[#2a2a2a] flex flex-col overflow-hidden">
            {/* Panel Header */}
            <div className="p-4 border-b border-[#2a2a2a]">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-2">
                <Eye size={16} />
                Información de Vista Previa
              </h3>
              <p className="text-xs text-[#666]">Detalles del dispositivo y responsividad</p>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Device Info */}
              <div className="bg-[#0f0f0f] rounded-lg p-3 border border-[#2a2a2a]">
                <h4 className="text-xs font-semibold text-[#999] uppercase mb-3">Dispositivo Actual</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#999]">Tipo:</span>
                    <span className="text-white font-medium capitalize">{previewBreakpoint}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#999]">Ancho:</span>
                    <span className="text-white font-medium">{currentDimensions.width}px</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#999]">Alto:</span>
                    <span className="text-white font-medium">{currentDimensions.height}px</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#999]">Escala:</span>
                    <span className="text-white font-medium">{previewZoom}%</span>
                  </div>
                </div>
              </div>

              {/* Breakpoints */}
              <div className="bg-[#0f0f0f] rounded-lg p-3 border border-[#2a2a2a]">
                <h4 className="text-xs font-semibold text-[#999] uppercase mb-3">Puntos de Corte</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#999]">📱 Móvil</span>
                    <span className="text-[#666]">≤ 375px</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#999]">📱 Tablet</span>
                    <span className="text-[#666]">≤ 768px</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#999]">🖥️ Desktop</span>
                    <span className="text-[#666]">≥ 1440px</span>
                  </div>
                </div>
              </div>

              {/* Elements Info */}
              <div className="bg-[#0f0f0f] rounded-lg p-3 border border-[#2a2a2a]">
                <h4 className="text-xs font-semibold text-[#999] uppercase mb-3">Elementos</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#999]">Total:</span>
                    <span className="text-white font-medium">{currentPage?.elements.length || 0}</span>
                  </div>
                  <div className="text-xs text-[#666] mt-3">
                    <p className="mb-2">Tipos:</p>
                    <div className="space-y-1">
                      {['rectangle', 'text', 'circle', 'image', 'frame'].map((type) => {
                        const count = currentPage?.elements.filter(el => el.type === type).length || 0;
                        return count > 0 ? (
                          <div key={type} className="flex justify-between px-2 py-1 bg-[#1e1e1e] rounded text-[#999]">
                            <span className="capitalize">{type}:</span>
                            <span className="text-white">{count}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Responsive Info */}
              <div className="bg-[#0f0f0f] rounded-lg p-3 border border-[#2a2a2a]">
                <h4 className="text-xs font-semibold text-[#999] uppercase mb-3">Estado Responsivo</h4>
                <div className="space-y-2 text-xs">
                  <p className="text-[#999]">
                    ✓ Elementos con estilos responsivos: {
                      currentPage?.elements.filter(el => Object.keys(el.responsive || {}).length > 0).length || 0
                    }
                  </p>
                  <p className="text-[#666] text-[10px] mt-2">
                    Los elementos con colores responsivos se ajustan automáticamente según el dispositivo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="h-12 border-t border-[#2a2a2a] bg-[#1e1e1e] flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <p className="text-xs text-[#666]">
            Vista previa en tiempo real • {currentDimensions.width} × {currentDimensions.height}px
          </p>
          <div className="h-4 w-px bg-[#2a2a2a]"></div>
          <p className="text-xs text-[#999]">
            {previewBreakpoint === 'mobile' && '📱 iPhone 12 (375×812)'}
            {previewBreakpoint === 'tablet' && '📱 iPad Pro (768×1024)'}
            {previewBreakpoint === 'desktop' && '🖥️ Pantalla de escritorio (1440×900)'}
          </p>
        </div>
        <p className="text-xs text-[#666]">Zoom: {previewZoom}%</p>
      </div>
    </div>
  );
}
