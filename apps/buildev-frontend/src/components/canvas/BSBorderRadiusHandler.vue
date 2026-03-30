<template>
  <div class="bs-radius-handler" v-if="isActive">
    <div class="radius-handle top-left" @mousedown.stop.prevent="startDrag($event, 'tl')"></div>
    <div class="radius-handle top-right" @mousedown.stop.prevent="startDrag($event, 'tr')"></div>
    <div class="radius-handle bottom-left" @mousedown.stop.prevent="startDrag($event, 'bl')"></div>
    <div class="radius-handle bottom-right" @mousedown.stop.prevent="startDrag($event, 'br')"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { usePagesStore } from "../../store/pages";

const props = defineProps<{ blockId: string }>();
const store = usePagesStore();

const isActive = computed(() => store.selectedBlockId === props.blockId);

let initialMouseX = 0;
let initialMouseY = 0;
let initialRadius = 0;
let currentCorner = "";

function startDrag(e: MouseEvent, corner: string) {
  currentCorner = corner;
  initialMouseX = e.clientX;
  initialMouseY = e.clientY;
  
  const block = store.getSelectedBlock();
  if (block) {
    initialRadius = parseInt(block.props.borderRadius as string) || 0;
  }

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", stopDrag);
}

function onMouseMove(e: MouseEvent) {
  const deltaX = e.clientX - initialMouseX;
  const deltaY = e.clientY - initialMouseY;
  
  // Depending on corner, moving inward increases radius
  let diff = 0;
  if (currentCorner === 'tl') diff = (deltaX + deltaY) / 2;
  if (currentCorner === 'tr') diff = (-deltaX + deltaY) / 2;
  if (currentCorner === 'bl') diff = (deltaX - deltaY) / 2;
  if (currentCorner === 'br') diff = (-deltaX - deltaY) / 2;

  const newRadius = Math.max(0, initialRadius + diff);
  store.updateBlock(props.blockId, { borderRadius: `${Math.round(newRadius)}px` });
}

function stopDrag() {
  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", stopDrag);
}
</script>

<style scoped>
.bs-radius-handler {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 60;
}

.radius-handle {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #fff;
  border: 1.5px solid #10b981;
  border-radius: 50%;
  pointer-events: auto;
  cursor: crosshair;
  transition: transform 0.2s;
}

.radius-handle:hover {
  transform: scale(1.2);
  background: #10b981;
}

.top-left { top: 10px; left: 10px; }
.top-right { top: 10px; right: 10px; }
.bottom-left { bottom: 10px; left: 10px; }
.bottom-right { bottom: 10px; right: 10px; }
</style>
