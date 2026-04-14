<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { usePagesStore } from "../store/pages";

const pagesStore = usePagesStore();
const router = useRouter();

onMounted(() => {
  void pagesStore.loadPages();
});

function openPage(id: string) {
  void router.push(`/editor/${id}`);
}
</script>

<template>
  <section>
    <h2>Pages</h2>
    <p class="hint">Listado de páginas gestionadas por Buildev.</p>

    <div v-if="pagesStore.isLoading">Cargando páginas...</div>
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
  color: #64748b;
  font-size: 0.9rem;
}

.page-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.page-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: background 0.15s ease;
}

.page-item:hover {
  background: #f8fafc;
}

.url {
  display: block;
  font-size: 0.85rem;
  color: #64748b;
}

.status {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #94a3b8;
}

.error {
  color: #b91c1c;
}
</style>
