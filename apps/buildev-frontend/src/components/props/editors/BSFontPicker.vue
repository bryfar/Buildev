<template>
  <div class="prop-font-picker">
    <div class="picker-header">
      <span class="label">Font Family</span>
    </div>
    <div class="dropdown-container" v-click-outside="closeDropdown">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Search Google Fonts..." 
        @focus="isOpen = true"
        class="search-input"
      />
      <div v-show="isOpen" class="dropdown-list">
        <div 
          class="dropdown-item inherit-font"
          @click="selectFont('')"
        >
          Inherit (Default)
        </div>
        <div 
          v-for="font in filteredFonts" 
          :key="font.family" 
          class="dropdown-item"
          :style="{ fontFamily: font.family }"
          @mouseenter="previewFont(font.family)"
          @click="selectFont(font.family)"
        >
          {{ font.family }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { usePagesStore } from "../../../store/pages";
import { fontList, setFont } from "../../../utils/fontManager";

const props = defineProps<{ blockId: string; propKey: string; modelValue?: string }>();
const store = usePagesStore();

const searchQuery = ref(props.modelValue || "");
const isOpen = ref(false);

const allFonts = (fontList as any).items || [];

const filteredFonts = computed(() => {
  if (!searchQuery.value) return allFonts.slice(0, 100);
  return allFonts
    .filter((f: any) => f.family.toLowerCase().includes(searchQuery.value.toLowerCase()))
    .slice(0, 100);
});

function closeDropdown() {
  isOpen.value = false;
}

function previewFont(fontFamily: string) {
  setFont(fontFamily, "400");
}

function selectFont(fontFamily: string) {
  searchQuery.value = fontFamily;
  isOpen.value = false;
  
  if (!fontFamily) {
    store.updateBlock(props.blockId, { [props.propKey]: "" });
    return;
  }

  setFont(fontFamily, "400").then(() => {
    store.updateBlock(props.blockId, { [props.propKey]: fontFamily });
  });
}

const vClickOutside = {
  mounted(el: any, binding: any) {
    el.clickOutsideEvent = function(event: Event) {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event, el);
      }
    };
    document.body.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el: any) {
    document.body.removeEventListener('click', el.clickOutsideEvent);
  }
};
</script>

<style scoped>
.prop-font-picker { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.label { font-size: 10px; font-weight: 700; color: var(--text-dim); text-transform: uppercase; }
.dropdown-container { position: relative; }
.search-input {
  width: 100%; background: var(--bg-input); border: 1px solid var(--border-main); 
  color: var(--text-main); padding: 8px; border-radius: 6px; font-size: 12px; outline: none; box-sizing: border-box;
}
.search-input:focus { border-color: var(--brand-primary); }
.dropdown-list {
  position: absolute; top: 100%; left: 0; width: 100%; max-height: 250px; overflow-y: auto;
  background: var(--bg-surface); border: 1px solid var(--border-main); border-radius: 6px;
  z-index: 50; margin-top: 4px; box-shadow: var(--shadow-lg);
}
.dropdown-item { padding: 8px 12px; font-size: 13px; color: var(--text-main); cursor: pointer; transition: background 0.1s; }
.dropdown-item:hover { background: var(--bg-surface-alt); color: var(--brand-primary); }
.inherit-font { font-style: italic; color: var(--text-muted); border-bottom: 1px solid var(--border-subtle); }

.dropdown-list::-webkit-scrollbar { width: 6px; }
.dropdown-list::-webkit-scrollbar-track { background: transparent; }
.dropdown-list::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 3px; }
</style>
