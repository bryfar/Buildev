<template>
  <div class="monaco-container" ref="editorContainer"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import loader from '@monaco-editor/loader';
import * as monaco from 'monaco-editor';

const props = defineProps<{
  modelValue: string;
  language?: string;
  theme?: 'vs-dark' | 'light';
}>();

const emit = defineEmits(['update:modelValue']);

const editorContainer = ref<HTMLElement | null>(null);
let editor: monaco.editor.IStandaloneCodeEditor | null = null;

onMounted(async () => {
  const monacoInstance = await loader.init();
  
  if (editorContainer.value) {
    editor = monacoInstance.editor.create(editorContainer.value, {
      value: props.modelValue,
      language: props.language || 'json',
      theme: props.theme === 'vs-dark' ? 'vs-dark' : 'vs',
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 13,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      lineNumbers: 'on',
      roundedSelection: true,
      scrollBeyondLastLine: false,
      readOnly: false,
      cursorBlinking: 'smooth',
      smoothScrolling: true,
      padding: { top: 16 }
    });

    editor.onDidChangeModelContent(() => {
      const value = editor?.getValue();
      if (value !== props.modelValue) {
        emit('update:modelValue', value);
      }
    });
  }
});

watch(() => props.modelValue, (newVal) => {
  if (editor && newVal !== editor.getValue()) {
    editor.setValue(newVal);
  }
});

watch(() => props.theme, (newTheme) => {
  if (editor) {
    monaco.editor.setTheme(newTheme === 'vs-dark' ? 'vs-dark' : 'vs');
  }
});

onUnmounted(() => {
  if (editor) {
    editor.dispose();
  }
});
</script>

<style scoped>
.monaco-container {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}
</style>
