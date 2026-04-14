<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <header class="modal-header">
        <h3>Asset Gallery</h3>
        <button class="btn-close" @click="close">×</button>
      </header>
      
      <div class="gallery-toolbar">
        <input type="text" placeholder="Search assets..." class="search-input" />
        <button class="btn-upload" @click="triggerUpload">Upload New</button>
        <input type="file" ref="fileInput" style="display: none" @change="handleFileUpload" />
      </div>

      <div class="gallery-grid">
        <div 
          v-for="asset in store.assets" 
          :key="asset.id" 
          class="asset-card" 
          @click="selectAsset(asset)"
        >
          <div class="asset-preview">
            <img v-if="isImage(asset)" :src="asset.url" :alt="asset.name" />
            <div v-else class="file-icon">📄</div>
          </div>
          <div class="asset-info">
            <span class="asset-name">{{ asset.name }}</span>
          </div>
        </div>
        <div v-if="!store.assets.length" class="empty-gallery">
          No assets found. Upload some!
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { usePagesStore } from "../store/pages";
import { useAuthStore } from "../store/auth";
import { apiBase } from "../utils/apiBase";

interface GalleryAsset {
  id: string;
  name: string;
  url: string;
  mimeType: string;
}

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(["close", "select"]);
const store = usePagesStore();
const auth = useAuthStore();
const fileInput = ref<HTMLInputElement | null>(null);

onMounted(() => {
  store.loadAssets();
});

function close() {
  emit("close");
}

function selectAsset(asset: GalleryAsset) {
  emit("select", asset);
  close();
}

function isImage(asset: GalleryAsset) {
  return asset.mimeType.startsWith("image/");
}

function triggerUpload() {
  fileInput.value?.click();
}

async function handleFileUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  // Simulate upload for now by creating a local object URL
  // In a real app, you'd upload to the server
  const url = URL.createObjectURL(file);
  
  // Save record to backend
  const headers: Record<string, string> = { ...auth.authHeaders() };
  if (store.currentSiteId) {
    headers["x-site-id"] = store.currentSiteId;
  }
  const res = await fetch(`${apiBase}/api/assets`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: file.name,
      url: url,
      mimeType: file.type,
      sizeBytes: file.size,
    }),
  });
  
  const json = await res.json();
  if (json.ok) {
    store.assets.unshift(json.data);
  }
}
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 40px; }
.modal-content { background: #1a1d27; border-radius: 12px; border: 1px solid #2a2d3a; width: 100%; max-width: 900px; max-height: 80vh; display: flex; flex-direction: column; overflow: hidden; }
.modal-header { padding: 20px; border-bottom: 1px solid #2a2d3a; display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { margin: 0; font-size: 18px; color: #e2e8f0; }

.gallery-toolbar { padding: 16px 20px; display: flex; gap: 12px; border-bottom: 1px solid #2a2d3a; }
.search-input { flex: 1; background: #0f1117; border: 1px solid #2a2d3a; border-radius: 6px; padding: 8px 12px; color: #e2e8f0; }
.btn-upload { background: #6366f1; border: none; color: white; padding: 8px 20px; border-radius: 6px; cursor: pointer; font-weight: 500; }

.gallery-grid { flex: 1; overflow-y: auto; padding: 20px; display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 16px; }
.asset-card { background: #0f1117; border: 1px solid #2a2d3a; border-radius: 8px; overflow: hidden; cursor: pointer; transition: all 0.2s; }
.asset-card:hover { border-color: #6366f1; transform: translateY(-2px); }

.asset-preview { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; background: #05060a; position: relative; }
.asset-preview img { width: 100%; height: 100%; object-fit: cover; }
.file-icon { font-size: 40px; opacity: 0.5; }

.asset-info { padding: 10px; border-top: 1px solid #2a2d3a; }
.asset-name { font-size: 12px; color: #94a3b8; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.btn-close { background: none; border: none; color: #64748b; font-size: 24px; cursor: pointer; }
.btn-close:hover { color: #e2e8f0; }

.empty-gallery { grid-column: 1 / -1; padding: 60px; text-align: center; color: #64748b; }
</style>
