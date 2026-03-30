<template>
  <div class="bs-resizer" v-if="isActive">
    <div class="handle n" @mousedown.stop.prevent="startResize($event, 'n')"></div>
    <div class="handle s" @mousedown.stop.prevent="startResize($event, 's')"></div>
    <div class="handle e" @mousedown.stop.prevent="startResize($event, 'e')"></div>
    <div class="handle w" @mousedown.stop.prevent="startResize($event, 'w')"></div>
    <div class="handle nw" @mousedown.stop.prevent="startResize($event, 'nw')"></div>
    <div class="handle ne" @mousedown.stop.prevent="startResize($event, 'ne')"></div>
    <div class="handle sw" @mousedown.stop.prevent="startResize($event, 'sw')"></div>
    <div class="handle se" @mousedown.stop.prevent="startResize($event, 'se')"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { usePagesStore } from "../../store/pages";

const props = defineProps<{ blockId: string }>();
const store = usePagesStore();

const isActive = computed(() => store.selectedBlockId === props.blockId);

let initialMouseX = 0;
let initialMouseY = 0;
let initialWidth = 0;
let initialHeight = 0;
let currentHandle = "";
let resizeTarget: HTMLElement | null = null;

function pxToNum(val: string) {
  return parseInt(val) || 0;
}

function startResize(e: MouseEvent, handle: string) {
  currentHandle = handle;
  initialMouseX = e.clientX;
  initialMouseY = e.clientY;
  
  // Find the actual rendered block element
  const resizerEl = (e.target as HTMLElement).closest('.bs-resizer');
  if (!resizerEl) return;
  // The actual block content is a sibling of the .bs-resizer in .canvas-block
  resizeTarget = resizerEl.parentElement;
  
  if (resizeTarget) {
    const rect = resizeTarget.getBoundingClientRect();
    initialWidth = rect.width;
    initialHeight = rect.height;
  }

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", stopResize);
}

function onMouseMove(e: MouseEvent) {
  if (!resizeTarget) return;

  const deltaX = e.clientX - initialMouseX;
  const deltaY = e.clientY - initialMouseY;

  let newWidth = initialWidth;
  let newHeight = initialHeight;

  // Horizontal resizing
  if (currentHandle.includes("e")) newWidth = initialWidth + deltaX;
  if (currentHandle.includes("w")) newWidth = initialWidth - deltaX;

  // Vertical resizing
  if (currentHandle.includes("s")) newHeight = initialHeight + deltaY;
  if (currentHandle.includes("n")) newHeight = initialHeight - deltaY;

  // Enforce mins
  if (newWidth < 20) newWidth = 20;
  if (newHeight < 20) newHeight = 20;

  // Apply temporarily to DOM for fast feedback (optional)
  if (currentHandle.includes("e") || currentHandle.includes("w")) {
    resizeTarget.style.width = `${newWidth}px`;
  }
  if (currentHandle.includes("s") || currentHandle.includes("n")) {
    resizeTarget.style.height = `${newHeight}px`;
  }
}

function stopResize(e: MouseEvent) {
  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", stopResize);

  if (!resizeTarget) return;

  // Finalize width/height to store
  const bp = store.currentBreakpoint;
  const block = store.getSelectedBlock();
  if (!block || block.id !== props.blockId) return;

  const updates: any = {};
  
  // Only update what was actually moved based on the handle
  const deltaX = e.clientX - initialMouseX;
  const deltaY = e.clientY - initialMouseY;

  let newWidth = initialWidth;
  let newHeight = initialHeight;
  
  if (currentHandle.includes("e")) newWidth = initialWidth + deltaX;
  if (currentHandle.includes("w")) newWidth = initialWidth - deltaX;
  if (currentHandle.includes("s")) newHeight = initialHeight + deltaY;
  if (currentHandle.includes("n")) newHeight = initialHeight - deltaY;

  if (currentHandle.includes("e") || currentHandle.includes("w")) updates.width = `${Math.max(20, newWidth)}px`;
  if (currentHandle.includes("n") || currentHandle.includes("s")) updates.height = `${Math.max(20, newHeight)}px`;

  // We should ideally save to responsive if bp !== 'desktop', but for simplicity let's save to base or handle it manually:
  if (bp === 'desktop') {
    store.updateBlock(props.blockId, updates);
  } else {
    const responsive = (block.props.responsive as any) || {};
    if (!responsive[bp]) responsive[bp] = {};
    Object.assign(responsive[bp], updates);
    store.updateBlock(props.blockId, { responsive });
  }
  
  // Clean up inline styles so Vue takes over
  resizeTarget.style.width = '';
  resizeTarget.style.height = '';
  resizeTarget = null;
}
</script>

<style scoped>
.bs-resizer {
  position: absolute;
  inset: 0;
  pointer-events: none; /* Let clicks pass through to the block */
  z-index: 50;
  border: 1.5px solid #3b82f6; /* Highlight border */
}

.handle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: white;
  border: 1.5px solid #3b82f6;
  border-radius: 50%;
  pointer-events: auto; /* Handles catch mouse events */
}

/* Corners */
.nw { top: -5px; left: -5px; cursor: nwse-resize; }
.ne { top: -5px; right: -5px; cursor: nesw-resize; }
.sw { bottom: -5px; left: -5px; cursor: nesw-resize; }
.se { bottom: -5px; right: -5px; cursor: nwse-resize; }

/* Edges */
.n { top: -5px; left: 50%; transform: translateX(-50%); cursor: ns-resize; width: 12px; border-radius: 4px; }
.s { bottom: -5px; left: 50%; transform: translateX(-50%); cursor: ns-resize; width: 12px; border-radius: 4px; }
.e { top: 50%; right: -5px; transform: translateY(-50%); cursor: ew-resize; height: 12px; border-radius: 4px; }
.w { top: 50%; left: -5px; transform: translateY(-50%); cursor: ew-resize; height: 12px; border-radius: 4px; }
</style>
