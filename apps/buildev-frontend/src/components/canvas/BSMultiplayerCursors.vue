<template>
  <div v-if="Object.keys(multiplayer.remoteCursors).length > 0" class="multiplayer-cursors">
    <div 
       v-for="(cursor, id) in multiplayer.remoteCursors" 
       :key="id" 
       class="cursor" 
       :style="{ left: cursor.x + 'px', top: cursor.y + 'px', '--cursor-color': cursor.color }"
    >

       <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--cursor-color)" xmlns="http://www.w3.org/2000/svg">
         <path d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z" stroke="white"/>
       </svg>
       <div class="cursor-label">{{ cursor.userName }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMultiplayerStore } from '../../store/multiplayer';

const multiplayer = useMultiplayerStore();
</script>

<style scoped>
.multiplayer-cursors { position: absolute; inset: 0; pointer-events: none; z-index: 1000; }
.cursor { position: absolute; transition: all 0.1s linear; display: flex; flex-direction: column; align-items: flex-start; }
.cursor-label {
  margin-top: 4px; padding: 2px 6px; border-radius: 4px; background: var(--cursor-color);
  color: #fff; font-size: 10px; font-weight: 700; white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>
