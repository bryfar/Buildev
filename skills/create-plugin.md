# Skill: Create a Visual Block Plugin

Este documento enseña a un agente (humano o AI) a crear un nuevo bloque para el marketplace de Buildev.

## Paso 1: Definir el Esquema
Asegúrate de que el bloque tenga un nombre único y propiedades configurables en `packages/core/src/data/blocks.ts`.

## Paso 2: Crear el Componente Vue
Crea un archivo `<script setup>` en `apps/buildev-frontend/src/components/blocks/`.

Ejemplo básico:
```vue
<script setup lang="ts">
import type { ElementNode } from "@buildev/core";
defineProps<{ block: ElementNode }>();
</script>

<template>
  <div :style="block.styles?.base">
    <slot />
  </div>
</template>
```

## Paso 3: Registrar en el Renderer
Añade el nuevo tag al `BSBlockRenderer.vue` para que el canvas sepa cómo renderizarlo.

## Paso 4: Definir el Inspector
Añade los controles necesarios en `BSPropertyPanel.vue` para que el usuario pueda editar las propiedades únicas de este bloque.
