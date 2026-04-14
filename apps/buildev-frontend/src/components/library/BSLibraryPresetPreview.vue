<template>
  <div ref="hostRef" class="lib-preview-host" aria-hidden="true">
    <div v-if="shouldRender && previewBlock" class="lib-preview-frame">
      <div class="lib-preview-scale">
        <BSBlockRenderer :block="previewBlock" preview preview-breakpoint="desktop" />
      </div>
    </div>
    <div v-else class="lib-preview-placeholder" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, shallowRef, watch } from "vue";
import type { BSBlock } from "@buildersite/sdk";
import BSBlockRenderer from "../blocks/BSBlockRenderer.vue";
import { cloneBlockWithNewIds } from "../../utils/blockClone";

const props = defineProps<{ rootBlock: BSBlock }>();

const hostRef = ref<HTMLElement | null>(null);
const shouldRender = ref(false);
const previewBlock = shallowRef<BSBlock | null>(null);

function rebuild() {
    previewBlock.value = cloneBlockWithNewIds(JSON.parse(JSON.stringify(props.rootBlock)) as BSBlock);
}

watch(
    () => props.rootBlock,
    () => {
        rebuild();
    },
    { deep: true, immediate: true },
);

let io: IntersectionObserver | null = null;

onMounted(() => {
    io = new IntersectionObserver(
        (entries) => {
            const hit = entries.some((e) => e.isIntersecting);
            if (hit) shouldRender.value = true;
        },
        { root: null, rootMargin: "120px", threshold: 0 },
    );
    if (hostRef.value) io.observe(hostRef.value);
});

onUnmounted(() => {
    io?.disconnect();
    io = null;
});
</script>

<style scoped>
.lib-preview-host {
  flex-shrink: 0;
  width: 108px;
  height: 72px;
  border-radius: 6px;
  border: 1px solid var(--border-main, #e2e8f0);
  background: var(--bg-surface-alt, #f8fafc);
  overflow: hidden;
}
.lib-preview-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--border-subtle, #f1f5f9) 0%, transparent 60%);
}
.lib-preview-frame {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}
.lib-preview-scale {
  position: absolute;
  left: 0;
  top: 0;
  width: 900px;
  transform: scale(0.12);
  transform-origin: top left;
  pointer-events: none;
}
</style>
