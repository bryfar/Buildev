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
  readOnly?: boolean;
  minimap?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [string];
  cursorChange: [{ line: number; column: number }];
}>();

const editorContainer = ref<HTMLElement | null>(null);
let editor: monaco.editor.IStandaloneCodeEditor | null = null;

onMounted(async () => {
  const monacoInstance = await loader.init();
  
  if (editorContainer.value) {
    const ed = monacoInstance.editor.create(editorContainer.value, {
      value: props.modelValue,
      language: props.language || 'json',
      theme: props.theme === 'vs-dark' ? 'vs-dark' : 'vs',
      automaticLayout: true,
      minimap: { enabled: props.minimap !== false },
      fontSize: 13,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'IBM Plex Mono', Consolas, monospace",
      lineNumbers: 'on',
      roundedSelection: true,
      scrollBeyondLastLine: false,
      readOnly: !!props.readOnly,
      wordWrap: 'on',
      cursorBlinking: 'smooth',
      smoothScrolling: true,
      padding: { top: 12, bottom: 12 },
      scrollbar: {
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10
      }
    });
    editor = ed;

    ed.onDidChangeCursorPosition((e: monaco.editor.ICursorPositionChangedEvent) => {
      emit('cursorChange', { line: e.position.lineNumber, column: e.position.column });
    });

    ed.onDidChangeModelContent(() => {
      const value = ed.getValue();
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

watch(() => props.readOnly, (ro) => {
  editor?.updateOptions({ readOnly: !!ro });
});

watch(() => props.language, (lang) => {
  if (!editor) return;
  const model = editor.getModel();
  if (model) monaco.editor.setModelLanguage(model, lang || 'json');
});

watch(() => props.minimap, (m) => {
  editor?.updateOptions({ minimap: { enabled: m !== false } });
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
  border-radius: 0;
  overflow: hidden;
}
</style>
