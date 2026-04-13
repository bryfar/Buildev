import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useUIStore = defineStore('ui', () => {
  const theme = ref<'light' | 'dark'>(
    (localStorage.getItem('bs_theme') as 'light' | 'dark') || 'dark'
  );

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
    localStorage.setItem('bs_theme', theme.value);
    applyTheme();
  }

  /** Fija tema explícito (p. ej. desde ajustes de cuenta). */
  function setTheme(next: 'light' | 'dark') {
    if (theme.value === next) return;
    theme.value = next;
    localStorage.setItem('bs_theme', theme.value);
    applyTheme();
  }

  function applyTheme() {
    if (theme.value === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  // Initial apply
  applyTheme();

  return {
    theme,
    toggleTheme,
    setTheme,
    applyTheme
  };
});
