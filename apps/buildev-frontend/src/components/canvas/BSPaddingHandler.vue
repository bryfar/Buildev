<template>
  <div class="bs-padding-handler" v-if="isActive">
    <div class="pad-bar top" @mousedown.stop.prevent="startDrag($event, 0)">
      <span class="label" v-if="draggingIndex === 0">{{ currentVal }}px</span>
    </div>
    <div class="pad-bar right" @mousedown.stop.prevent="startDrag($event, 1)">
      <span class="label" v-if="draggingIndex === 1">{{ currentVal }}px</span>
    </div>
    <div class="pad-bar bottom" @mousedown.stop.prevent="startDrag($event, 2)">
      <span class="label" v-if="draggingIndex === 2">{{ currentVal }}px</span>
    </div>
    <div class="pad-bar left" @mousedown.stop.prevent="startDrag($event, 3)">
      <span class="label" v-if="draggingIndex === 3">{{ currentVal }}px</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { usePagesStore } from "../../store/pages";

const props = defineProps<{ blockId: string }>();
const store = usePagesStore();

const isActive = computed(() => store.selectedBlockId === props.blockId);

const draggingIndex = ref<number | null>(null);
const currentVal = ref(0);

let initialMouseX = 0;
let initialMouseY = 0;
let initialParts: [number, number, number, number] = [0, 0, 0, 0];

function val(prop: string) {
  const block = store.getSelectedBlock();
  if (!block) return "";
  const breakpoint = store.currentBreakpoint;
  const base = block.props;
  return (base.responsive as any)?.[breakpoint]?.[prop] ?? base[prop];
}

function parseSpacing(value: string | undefined): [number, number, number, number] {
  if (!value) return [0, 0, 0, 0];
  const parts = value.split(' ').map(p => parseInt(p) || 0);
  if (parts.length === 1) return [parts[0], parts[0], parts[0], parts[0]];
  if (parts.length === 2) return [parts[0], parts[1], parts[0], parts[1]];
  if (parts.length === 3) return [parts[0], parts[1], parts[2], parts[1]];
  if (parts.length >= 4) return [parts[0], parts[1], parts[2], parts[3]];
  return [0, 0, 0, 0];
}

function stringifySpacing(parts: [number, number, number, number]): string {
  if (parts[0] === parts[1] && parts[1] === parts[2] && parts[2] === parts[3]) return `${parts[0]}px`;
  if (parts[0] === parts[2] && parts[1] === parts[3]) return `${parts[0]}px ${parts[1]}px`;
  return `${parts[0]}px ${parts[1]}px ${parts[2]}px ${parts[3]}px`;
}

function startDrag(e: MouseEvent, index: number) {
  draggingIndex.value = index;
  initialMouseX = e.clientX;
  initialMouseY = e.clientY;
  
  const currentPaddingStr = val('padding') as string;
  initialParts = parseSpacing(currentPaddingStr);
  currentVal.value = initialParts[index];

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", stopDrag);
}

function onMouseMove(e: MouseEvent) {
  if (draggingIndex.value === null) return;
  const index = draggingIndex.value;
  
  let delta = 0;
  if (index === 0) delta = e.clientY - initialMouseY; // top (drag down increases)
  if (index === 2) delta = initialMouseY - e.clientY; // bottom (drag up increases)
  if (index === 3) delta = e.clientX - initialMouseX; // left (drag right increases)
  if (index === 1) delta = initialMouseX - e.clientX; // right (drag left increases)

  // Reverse delta because we are inside the box dragging INWARDS to increase padding.
  // Wait, if I grab the top edge and drag DOWN, `e.clientY` increases, so delta is positive. Padding top should INCREASE.
  // If I grab the bottom edge and drag UP, `e.clientY` decreases, so initial - new is positive. Padding bottom should INCREASE.
  // This is correct for Padding!

  let newVal = initialParts[index] + delta;
  if (newVal < 0) newVal = 0;

  currentVal.value = newVal;

  // Apply visual update real-time via store
  updateStorePadding(newVal);
}

function stopDrag() {
  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", stopDrag);
  draggingIndex.value = null;
}

function updateStorePadding(newValue: number) {
  if (draggingIndex.value === null) return;
  const newParts: [number, number, number, number] = [...initialParts] as any;
  newParts[draggingIndex.value] = newValue;
  
  const str = stringifySpacing(newParts);
  
  const bp = store.currentBreakpoint;
  const block = store.getSelectedBlock();
  if (!block || block.id !== props.blockId) return;

  if (bp === 'desktop') {
    store.updateBlock(props.blockId, { padding: str });
  } else {
    const responsive = (block.props.responsive as any) || {};
    if (!responsive[bp]) responsive[bp] = {};
    Object.assign(responsive[bp], { padding: str });
    store.updateBlock(props.blockId, { responsive });
  }
}
</script>

<style scoped>
.bs-padding-handler {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 40;
}

.pad-bar {
  position: absolute;
  background: rgba(16, 185, 129, 0.2); /* Green tint for padding */
  pointer-events: auto;
  opacity: 0;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pad-bar:hover, .pad-bar:active {
  opacity: 1;
}

.pad-bar.top { top: 0; left: 0; right: 0; height: 12px; cursor: ns-resize; }
.pad-bar.bottom { bottom: 0; left: 0; right: 0; height: 12px; cursor: ns-resize; }
.pad-bar.left { top: 0; bottom: 0; left: 0; width: 12px; cursor: ew-resize; }
.pad-bar.right { top: 0; bottom: 0; right: 0; width: 12px; cursor: ew-resize; }

.label {
  background: #10b981;
  color: white;
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: monospace;
  pointer-events: none;
}
</style>
