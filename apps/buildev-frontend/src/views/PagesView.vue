<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { usePagesStore } from "../store/pages";

const pagesStore = usePagesStore();
const router = useRouter();

onMounted(() => {
  void pagesStore.fetchPages();
});

function openPage(id: string) {
  router.push({ name: "page-editor", params: { id } });
}
</script>

<template>
  <section>
    <h2>Pages</h2>
    <p class="hint">Listado de páginas gestionadas por Buildev.</p>

    <div v-if="pagesStore.loading">Cargando páginas...</div>
    <div v-else-if="pagesStore.error" class="error">
      Error: {{ pagesStore.error }}
    </div>
    <ul v-else class="page-list">
      <li
        v-for="page in pagesStore.pages"
        :key="page.id"
        class="page-item"
        @click="openPage(page.id)"
      >
        <div>
          <strong>{{ page.name }}</strong>
          <span class="url">{{ page.urlPath }}</span>
        </div>
        <span class="status">{{ page.status }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
h2 {
  margin: 0 0 0.5rem;
}

.hint {
  margin: 0 0 1rem;
  font-size: 0.85rem;
  color: #9ca3af;
}

.error {
  color: #fecaca;
}

.page-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.page-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  background: #0f172a;
  border: 1px solid #1f2937;
  cursor: pointer;
}

.page-item:hover {
  border-color: #3b82f6;
}

.url {
  margin-left: 0.5rem;
  font-size: 0.8rem;
  color: #9ca3af;
}

.status {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #a5b4fc;
}
</style>

