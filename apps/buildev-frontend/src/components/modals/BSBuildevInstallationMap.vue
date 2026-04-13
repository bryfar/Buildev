<template>
  <section class="installation-map">
    <header class="map-header">
      <h3>Buildev Installation</h3>
      <p>Mapa de proceso y flujo para crear Landing page, Multisitio o CMS.</p>
    </header>

    <div class="flow-grid">
      <div class="flow-card start">
        <strong>1. Inicio</strong>
        <span>Usuario abre "New Project"</span>
      </div>

      <div class="flow-arrow">↓</div>

      <div class="flow-card">
        <strong>2. Tipo de proyecto</strong>
        <span>Landing page | Multisitio | CMS</span>
      </div>

      <div class="flow-arrow">↓</div>

      <div class="flow-card">
        <strong>3. Stack y servicios</strong>
        <span>Frontend, Backend, CMS provider</span>
      </div>

      <div class="flow-arrow">↓</div>

      <div class="flow-card policy">
        <strong>4. Policy Engine</strong>
        <span>Si tipo = CMS, frontend se fija en Astro</span>
      </div>

      <div class="flow-arrow">↓</div>

      <div class="flow-split">
        <div class="flow-card result">
          <strong>5A. Provisioning</strong>
          <span>Store crea site con metadata del flujo</span>
        </div>
        <div class="flow-card result">
          <strong>5B. AI Wizard</strong>
          <span>Prompt y arquitectura incluyen projectType y stack final</span>
        </div>
      </div>

      <div class="flow-arrow">↓</div>

      <div class="flow-card success">
        <strong>6. Resultado</strong>
        <span>Proyecto listo en editor con configuración consistente y segura</span>
      </div>
    </div>

    <footer class="map-footer">
      <span>Regla CMS activa: Astro para contenido, inspirado en EmDash.</span>
    </footer>
  </section>
</template>

<script setup lang="ts">
</script>

<style scoped>
.installation-map {
  border: 1px solid var(--border-main);
  border-radius: 16px;
  padding: 16px;
  background: var(--bg-main);
}

.map-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: var(--text-main);
}

.map-header p {
  margin: 6px 0 14px;
  font-size: 12px;
  color: var(--text-muted);
}

.flow-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.flow-card {
  border: 1px solid var(--border-main);
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: var(--bg-surface);
}

.flow-card strong {
  font-size: 12px;
  color: var(--text-main);
}

.flow-card span {
  font-size: 12px;
  color: var(--text-muted);
}

.flow-card.start {
  border-color: #60a5fa;
}

.flow-card.policy {
  border-color: #f59e0b;
}

.flow-card.result {
  border-color: #a78bfa;
}

.flow-card.success {
  border-color: #10b981;
}

.flow-arrow {
  text-align: center;
  font-weight: 800;
  color: var(--text-dim);
}

.flow-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.map-footer {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--border-subtle);
  font-size: 11px;
  color: var(--text-dim);
}
</style>
