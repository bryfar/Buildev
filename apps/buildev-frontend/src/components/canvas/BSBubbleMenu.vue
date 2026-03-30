<template>
  <Teleport to="body">
    <div 
      v-if="isVisible" 
      class="bs-bubble-menu"
      :style="{ top: position.y + 'px', left: position.x + 'px' }"
      @mousedown.prevent="keepSelection"
    >
      <button class="menu-btn" title="Bold (Cmd+B)" @click.prevent.stop="execCmd('bold')">B</button>
      <button class="menu-btn italic" title="Italic (Cmd+I)" @click.prevent.stop="execCmd('italic')">I</button>
      <button class="menu-btn underline" title="Underline (Cmd+U)" @click.prevent.stop="execCmd('underline')">U</button>
      <div class="divider"></div>
      <button class="menu-btn" title="Clear Formatting" @click.prevent.stop="execCmd('removeFormat')">Tₓ</button>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const isVisible = ref(false);
const position = ref({ x: 0, y: 0 });

let updateTimeout: any = null;

function handleSelectionChange() {
  clearTimeout(updateTimeout);
  
  updateTimeout = setTimeout(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      isVisible.value = false;
      return;
    }

    // Check if the selection is inside an editable text/heading area
    let node = selection.anchorNode;
    let isInsideEditor = false;
    while (node && node !== document.body) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        if (el.hasAttribute('data-text-editor')) {
          isInsideEditor = true;
          break;
        }
      }
      node = node.parentNode;
    }

    if (!isInsideEditor) {
      isVisible.value = false;
      return;
    }

    updatePosition(selection);
  }, 100);
}

function updatePosition(selection: Selection) {
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  if (rect.width === 0 && rect.height === 0) {
    isVisible.value = false;
    return;
  }

  // Position exactly above the selection
  position.value = {
    x: rect.left + (rect.width / 2) - 60, // approximate half width of menu
    y: rect.top - 40 // above the selection
  };
  
  // Keep within screen bounds
  if (position.value.y < 10) position.value.y = rect.bottom + 10;
  if (position.value.x < 10) position.value.x = 10;

  isVisible.value = true;
}

function execCmd(command: string, value: string | undefined = undefined) {
  document.execCommand(command, false, value);
  // Re-focus the editor if needed
  const sel = window.getSelection();
  if (sel && sel.anchorNode) {
    let el = sel.anchorNode.parentElement;
    while(el && !el.classList.contains('editable-text')) {
      el = el.parentElement;
    }
    if (el) {
      el.focus();
      // Dispatch an input event so the component knows HTML changed
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
}

// Ensure the menu doesn't steal focus when clicking buttons
function keepSelection(e: MouseEvent) {
  e.preventDefault();
}

onMounted(() => {
  document.addEventListener("selectionchange", handleSelectionChange);
  // Also hide on blur entirely
  document.addEventListener("mousedown", (e) => {
    if (!(e.target as Element).closest('.bs-bubble-menu')) {
      setTimeout(handleSelectionChange, 10);
    }
  });
});

onUnmounted(() => {
  document.removeEventListener("selectionchange", handleSelectionChange);
});
</script>

<style scoped>
.bs-bubble-menu {
  position: fixed;
  z-index: 99999;
  display: flex;
  align-items: center;
  background: #1e212b;
  border: 1px solid #2a2d3a;
  border-radius: 6px;
  padding: 4px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
  gap: 2px;
  transition: opacity 0.1s ease;
}

/* Caret/Tail pointing downwards */
.bs-bubble-menu::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #1e212b transparent transparent transparent;
}

.menu-btn {
  background: transparent;
  border: none;
  color: #e2e8f0;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.1s;
}

.menu-btn:hover {
  background: #3f445b;
}

.italic {
  font-style: italic;
  font-family: serif;
}

.underline {
  text-decoration: underline;
}

.divider {
  width: 1px;
  height: 20px;
  background: #2a2d3a;
  margin: 0 4px;
}
</style>
