<template>
  <a
    :href="hrefAttr"
    class="bs-btn"
    :class="[`bs-btn--${block.props.variant}`]"
    :style="btnStyle"
    @click="onAnchorClick"
  >
    {{ block.props.label }}
  </a>
</template>
<script setup lang="ts">
import { computed } from "vue";
import type { BSBlock } from "@buildersite/sdk";
import { usePagesStore } from "../../store/pages";

const props = defineProps<{ block: BSBlock }>();
const store = usePagesStore();

const hrefAttr = computed(() => {
  const h = props.block.props.href;
  return typeof h === "string" && h.length > 0 ? h : "#";
});

const btnStyle = computed(() => {
  const breakpoint = store.currentBreakpoint;
  const base = props.block.props as Record<string, unknown>;
  const responsive = (base.responsive as Record<string, Record<string, unknown>> | undefined)?.[breakpoint] ?? {};
  const m = { ...base, ...responsive };
  const s: Record<string, string> = {};
  const set = (k: string) => {
    const v = m[k];
    if (v === undefined || v === null || v === "") return;
    if (k === "fontSize" && typeof v === "number") s.fontSize = `${v}px`;
    else if (k === "fontSize") s.fontSize = String(v).match(/px|rem|em|%$/) ? String(v) : `${v}px`;
    else s[k] = String(v);
  };
  set("fontSize");
  set("fontWeight");
  set("fontFamily");
  set("color");
  set("textAlign");
  set("lineHeight");
  set("letterSpacing");
  set("textDecoration");
  set("textTransform");
  set("padding");
  set("backgroundColor");
  set("borderRadius");
  set("border");
  set("boxShadow");
  return s;
});

function onAnchorClick(e: MouseEvent) {
  const h = props.block.props.href;
  if (typeof h !== "string" || h.length === 0 || h === "#") {
    e.preventDefault();
  }
}
</script>
<style scoped>
.bs-btn {
  display: inline-block;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  font-size: 14px;
}
.bs-btn--primary {
  background: #6366f1;
  color: #fff;
}
.bs-btn--secondary {
  background: transparent;
  border: 2px solid #6366f1;
  color: #6366f1;
}
</style>
