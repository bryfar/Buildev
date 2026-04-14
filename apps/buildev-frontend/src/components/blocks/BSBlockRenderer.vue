<template>
  <div 
    class="canvas-block"
    :class="{ 
      'canvas-block--selected': !previewMode && block.id === store.selectedBlockId,
      'canvas-block--preview': previewMode,
      'drag-over': !previewMode && isDragOver && isContainer 
    }"
    :style="wrapperStyle"
    @click.stop="onBlockClick"
    @dragover.prevent.stop="onDragOverSafe"
    @dragleave="onDragLeaveSafe"
    @drop.prevent.stop="onDropSafe"
  >
    <component :is="resolveBlock(block.type)" :block="{ ...block, props: resolvedProps }">
      <template #default="slotProps">
        <ChildrenRenderer :block="block" :slot-props="slotProps" />
      </template>
    </component>
    <template v-if="!previewMode">
      <BSBoxResizer :blockId="block.id" />
      <BSPaddingHandler :blockId="block.id" />
      <BSMarginHandler :blockId="block.id" />
      <BSBorderRadiusHandler :blockId="block.id" />
      <BSBlockFlexLayoutHandler :blockId="block.id" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent, h, onMounted, provide } from "vue";
import { usePagesStore } from "../../store/pages";
import type { BSBlock } from "@buildersite/sdk";
import { BLOCK_PREVIEW_KEY } from "../../constants/injectionKeys";
import BSBoxResizer from "../canvas/BSBoxResizer.vue";
import BSMarginHandler from "../canvas/BSMarginHandler.vue";
import BSPaddingHandler from "../canvas/BSPaddingHandler.vue";
import BSBorderRadiusHandler from "../canvas/BSBorderRadiusHandler.vue";
import BSBlockFlexLayoutHandler from "../canvas/BSBlockFlexLayoutHandler.vue";
import { setFont } from "../../utils/fontManager";

// Recursive reference
import BSBlockRenderer from "./BSBlockRenderer.vue";

type BreakpointKey = "desktop" | "tablet" | "mobile";

const props = withDefaults(
  defineProps<{
    block: BSBlock;
    parentBlock?: BSBlock;
    /** Solo lectura: sin handlers ni selección (p. ej. miniatura de librería). */
    preview?: boolean;
    /** Breakpoint usado al resolver props en modo preview (por defecto desktop). */
    previewBreakpoint?: BreakpointKey;
  }>(),
  { preview: false, previewBreakpoint: undefined },
);

const previewMode = computed(() => props.preview === true);
provide(BLOCK_PREVIEW_KEY, previewMode);

const store = usePagesStore();

onMounted(() => {
  const fontFamily = props.block.props.fontFamily;
  if (fontFamily && typeof fontFamily === "string") {
    setFont(fontFamily);
  }
});

const isDragOver = ref(false);
const isContainer = computed(() => ['section', 'container', 'columns', 'form'].includes(props.block.type));

const resolvedProps = computed(() => {
  const breakpoint: BreakpointKey = props.preview
    ? props.previewBreakpoint ?? "desktop"
    : store.currentBreakpoint;
  const base = { ...props.block.props };
  const responsive = (base.responsive as Record<string, Record<string, unknown>> | undefined)?.[breakpoint];
  if (responsive) {
    return { ...base, ...responsive };
  }
  return base;
});

const wrapperStyle = computed(() => {
  const p = resolvedProps.value as any;
  const style: any = {};
  
  if (p.width) style.width = p.width;
  if (p.height) style.height = p.height;
  if (p.marginTop) style.marginTop = p.marginTop;
  if (p.marginBottom) style.marginBottom = p.marginBottom;
  if (p.marginLeft) style.marginLeft = p.marginLeft;
  if (p.marginRight) style.marginRight = p.marginRight;
  if (p.paddingTop) style.paddingTop = p.paddingTop;
  if (p.paddingBottom) style.paddingBottom = p.paddingBottom;
  if (p.paddingLeft) style.paddingLeft = p.paddingLeft;
  if (p.paddingRight) style.paddingRight = p.paddingRight;
  
  if (p.backgroundColor) style.backgroundColor = p.backgroundColor;
  if (p.borderRadius) style.borderRadius = p.borderRadius;
  if (p.borderWidth) style.borderWidth = p.borderWidth;
  if (p.borderColor) style.borderColor = p.borderColor;
  if (p.borderStyle) style.borderStyle = p.borderStyle;
  
  if (p.display) style.display = p.display;
  if (p.flexDirection) style.flexDirection = p.flexDirection;
  if (p.alignItems) style.alignItems = p.alignItems;
  if (p.justifyContent) style.justifyContent = p.justifyContent;
  if (p.gap) style.gap = p.gap;
  
  return style;
});

// Functional component to safely handle recursion without compiler crashes
const ChildrenRenderer = (renderProps: { block: BSBlock, slotProps: any }) => {
  const { block, slotProps } = renderProps;
  
  let children: BSBlock[] = [];
  if (block.type === 'columns' && slotProps?.column !== undefined) {
    children = block.children?.filter(c => (c.props as any).column === slotProps.column) || [];
  } else if (['section', 'container', 'form'].includes(block.type)) {
    children = block.children || [];
  }

  return children.map((child) =>
    h(BSBlockRenderer, {
      block: child,
      key: child.id,
      preview: props.preview,
      previewBreakpoint: props.previewBreakpoint,
    }),
  );
};

function onBlockClick() {
  if (props.preview) return;
  store.selectBlock(props.block.id);
}

function onDragOverSafe() {
  if (props.preview) return;
  if (isContainer.value) isDragOver.value = true;
}

function onDragLeaveSafe() {
  if (props.preview) return;
  isDragOver.value = false;
}

function onDropSafe() {
  if (props.preview) return;
  isDragOver.value = false;
  if (isContainer.value) {
    store.handleDrop(props.block.id);
  }
}

function resolveBlock(type: string): any {
  const map: Record<string, any> = {
    text: defineAsyncComponent(() => import("./BSTextBlock.vue")),
    image: defineAsyncComponent(() => import("./BSImageBlock.vue")),
    button: defineAsyncComponent(() => import("./BSButtonBlock.vue")),
    section: defineAsyncComponent(() => import("./BSSectionBlock.vue")),
    heading: defineAsyncComponent(() => import("./BSHeadingBlock.vue")),
    container: defineAsyncComponent(() => import("./BSContainerBlock.vue")),
    columns: defineAsyncComponent(() => import("./BSColumnsBlock.vue")),
    video: defineAsyncComponent(() => import("./BSVideoBlock.vue")),
    divider: defineAsyncComponent(() => import("./BSDividerBlock.vue")),
    spacer: defineAsyncComponent(() => import("./BSSpacerBlock.vue")),
    form: defineAsyncComponent(() => import("./BSFormBlock.vue")),
    input: defineAsyncComponent(() => import("./BSInputBlock.vue")),
  };
  return map[type] ?? "div";
}
</script>

<style scoped>
.canvas-block {
  position: relative;
  cursor: pointer;
  border: 1px solid transparent;
  transition: border-color 0.2s;
  /* Ensure it has a layout context */
  box-sizing: border-box;
}
.canvas-block:hover {
  outline: 1px solid rgba(99, 102, 241, 0.4);
}
.canvas-block--selected {
  outline: 2px solid #6366f1 !important;
  z-index: 10;
}
.drag-over {
  background: rgba(99, 102, 241, 0.05);
  outline: 2px dashed #6366f1 !important;
}
.canvas-block--preview {
  cursor: default;
  border-color: transparent !important;
  pointer-events: none;
}
.canvas-block--preview:hover {
  outline: none !important;
}
</style>
