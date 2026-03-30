<template>
  <div class="bs-flex-handler" v-if="isActive && isFlex">
    <!-- Gap Handles -->
    <div 
      v-for="(pos, i) in gapHandles" 
      :key="i"
      class="gap-handle"
      :style="pos.style"
      @mousedown.stop.prevent="startDrag($event)"
    >
      <div class="gap-tooltip">{{ currentGap }}px</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { usePagesStore } from "../../store/pages";

const props = defineProps<{ blockId: string }>();
const store = usePagesStore();

const isActive = computed(() => store.selectedBlockId === props.blockId);
const block = computed(() => store.getSelectedBlock());
const isFlex = computed(() => block.value?.props.display === 'flex' || block.value?.props.display === 'grid');
const currentGap = computed(() => parseInt(block.value?.props.gap as string) || 0);

const gapHandles = ref<any[]>([]);

function updateHandles() {
  if (!isActive.value || !isFlex.value) return;
  // We need to find the gaps between children
  // For simplicity, we'll just show one handle for the entire container's gap
  gapHandles.value = [
    { style: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' } }
  ];
}

let initialMouseX = 0;
let initialGap = 0;

function startDrag(e: MouseEvent) {
  initialMouseX = e.clientX;
  initialGap = currentGap.value;
  
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", stopDrag);
}

function onMouseMove(e: MouseEvent) {
  const deltaX = e.clientX - initialMouseX;
  const newGap = Math.max(0, initialGap + deltaX);
  store.updateBlock(props.blockId, { gap: `${Math.round(newGap)}px` });
}

function stopDrag() {
  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", stopDrag);
}

onMounted(updateHandles);
</script>

<style scoped>
.bs-flex-handler {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 55;
}

.gap-handle {
  position: absolute;
  width: 20px;
  height: 20px;
  background: rgba(99, 102, 241, 0.2);
  border: 1px dashed #6366f1;
  border-radius: 4px;
  pointer-events: auto;
  cursor: ew-resize;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gap-handle:hover {
  background: rgba(99, 102, 241, 0.4);
}

.gap-tooltip {
  position: absolute;
  top: -25px;
  background: #6366f1;
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
}

.gap-handle:hover .gap-tooltip {
  opacity: 1;
}
</style>
