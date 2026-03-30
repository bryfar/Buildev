<template>
  <div 
    class="bs-video"
    :style="{ 
      width: block.props.width || '100%',
      aspectRatio: block.props.aspectRatio || '16 / 9'
    }"
  >
    <iframe
      v-if="videoUrl"
      :src="videoUrl"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
    ></iframe>
    <div v-else class="video-placeholder">
      <span>Video Placeholder (Enter YouTube/Vimeo ID or URL)</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { BSBlock } from "@buildersite/sdk";
const props = defineProps<{ block: BSBlock }>();

const videoUrl = computed(() => {
  const url = props.block.props.url as string;
  if (!url) return null;
  
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const id = url.includes("v=") ? url.split("v=")[1].split("&")[0] : url.split("/").pop();
    return `https://www.youtube.com/embed/${id}`;
  }
  if (url.includes("vimeo.com")) {
    const id = url.split("/").pop();
    return `https://player.vimeo.com/video/${id}`;
  }
  return url;
});
</script>

<style scoped>
.bs-video {
  overflow: hidden;
  border-radius: 8px;
  background: #000;
}
iframe {
  width: 100%;
  height: 100%;
}
.video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 13px;
  background: #1e293b;
}
</style>
