<template>
  <div class="dashboard-root" :class="{ 'theme-dark': ui.theme === 'dark' }">
    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo-group">
          <div class="logo-box">
             <img src="../assets/isotype.svg" alt="Buildev" class="sidebar-isotype" />
          </div>
          <span class="brand-name">Buildev</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section">
          <p class="section-title">Main</p>
          <a class="nav-item" :class="{ active: view === 'projects' }" @click="view = 'projects'">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Projects
          </a>
          <a v-if="store.currentSiteId" class="nav-item" :class="{ active: view === 'pages' }" @click="view = 'pages'">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Pages
          </a>
        </div>

        <div v-if="currentSite?.projectType === 'cms'" class="nav-section">
          <p class="section-title">CMS</p>

          <p class="cms-group-label">Contenido</p>
          <a class="nav-item cms-item" :class="{ active: view === 'cms' && cmsSection === 'content-pages' }" @click="openCmsSection('content-pages')">Pages</a>
          <a class="nav-item cms-item" :class="{ active: view === 'cms' && cmsSection === 'content-posts' }" @click="openCmsSection('content-posts')">Posts</a>
          <a class="nav-item cms-item" :class="{ active: view === 'cms' && cmsSection === 'content-media' }" @click="openCmsSection('content-media')">Media</a>

          <p class="cms-group-label">Manage</p>
          <a class="nav-item cms-item" :class="{ active: view === 'cms' && cmsSection === 'manage-menu' }" @click="openCmsSection('manage-menu')">Menu</a>
          <a class="nav-item cms-item" :class="{ active: view === 'cms' && cmsSection === 'manage-redirects' }" @click="openCmsSection('manage-redirects')">Redirects</a>
          <a class="nav-item cms-item" :class="{ active: view === 'cms' && cmsSection === 'manage-widgets' }" @click="openCmsSection('manage-widgets')">Widgets</a>
          <a class="nav-item cms-item" :class="{ active: view === 'cms' && cmsSection === 'manage-sections' }" @click="openCmsSection('manage-sections')">Sections</a>
          <a class="nav-item cms-item" :class="{ active: view === 'cms' && cmsSection === 'manage-categories' }" @click="openCmsSection('manage-categories')">Categories</a>
          <a class="nav-item cms-item" :class="{ active: view === 'cms' && cmsSection === 'manage-tags' }" @click="openCmsSection('manage-tags')">Tags</a>
          <a class="nav-item cms-item" :class="{ active: view === 'cms' && cmsSection === 'manage-bylines' }" @click="openCmsSection('manage-bylines')">Bylines</a>
          <a class="nav-item cms-item" :class="{ active: view === 'cms' && cmsSection === 'manage-design-system' }" @click="openCmsSection('manage-design-system')">Design System</a>

          <p class="cms-group-label">Admin</p>
          <a class="nav-item cms-item" :class="{ active: view === 'cms' && cmsSection === 'admin-content-types' }" @click="openCmsSection('admin-content-types')">Content Types</a>
          <a class="nav-item cms-item" :class="{ active: view === 'cms' && cmsSection === 'admin-users' }" @click="openCmsSection('admin-users')">Users</a>
          <a class="nav-item cms-item" :class="{ active: view === 'cms' && cmsSection === 'admin-plugins' }" @click="openCmsSection('admin-plugins')">Plugins</a>
          <a class="nav-item cms-item" :class="{ active: view === 'cms' && cmsSection === 'admin-import' }" @click="openCmsSection('admin-import')">Import</a>
          <a class="nav-item cms-item" :class="{ active: view === 'cms' && cmsSection === 'admin-settings' }" @click="openCmsSection('admin-settings')">Settings</a>
        </div>
        
        <div class="nav-section">
          <p class="section-title">Library</p>
          <a class="nav-item" :class="{ active: view === 'symbols' }" @click="view = 'symbols'">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
            Symbols
          </a>
          <a class="nav-item" :class="{ active: view === 'assets' }" @click="view = 'assets'">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            Assets
          </a>
          <a class="nav-item" :class="{ active: view === 'design-system' }" @click="view = 'design-system'">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z"/><path d="M4 10h16"/><path d="M10 4v16"/></svg>
            Design System
          </a>
        </div>

        <div class="nav-section">
          <p class="section-title">Cuenta</p>
          <a class="nav-item" :class="{ active: showAccountSettings }" @click="openAccountSettings">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Perfil y ajustes
          </a>
        </div>
      </nav>

      <div class="sidebar-footer">
        <button class="theme-toggle-v12" @click="ui.toggleTheme()">
           <span v-if="ui.theme === 'light'">🌙 Dark</span>
           <span v-else>☀️ Light</span>
        </button>

        <div v-if="currentSite" class="active-workspace-card">
          <div class="workspace-header">
             <span class="pulse-dot"></span>
             <span class="label">CURRENT WORKSPACE</span>
          </div>
          <p class="workspace-name">{{ currentSite.name }}</p>
        </div>

        <button class="logout-btn-v12" @click="handleLogout">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sign out
        </button>
      </div>
    </aside>

    <!-- CONTENT -->
    <main class="main-content">
      <header class="content-header">
        <div v-if="view === 'projects'" class="header-left">
          <h1>Projects</h1>
          <p class="subtitle">Manage and build your high-converting websites</p>
        </div>
        <div v-else class="header-left">
          <div class="breadcrumb-nav-v12">
             <span class="crumb-link" @click="view = 'projects'">Projects</span>
             <svg class="chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="9 18 15 12 9 6"/></svg>
             <span class="crumb-current">{{ currentSite?.name }}</span>
          </div>
          <h1 class="view-title">{{ currentViewTitle }}</h1>
        </div>

        <div class="header-actions">
          <div class="search-box">
             <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
             <input type="text" placeholder="Search projects..." />
          </div>
          <button v-if="view === 'projects'" class="btn-create shadow-glow" @click="openProjectModal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Project
          </button>
          <button v-else-if="view === 'pages'" class="btn-create shadow-glow" @click="openPageModal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Page
          </button>
          <button v-else-if="view === 'cms'" class="btn-create shadow-glow" @click="openPageModal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Content
          </button>
        </div>
      </header>

      <section class="scroll-area">
        <!-- PROJECTS GRID -->
        <div v-if="view === 'projects'" class="grid-container">
          <div v-if="store.isLoading" class="skeleton-grid">
             <div v-for="i in 4" :key="i" class="skeleton-card"></div>
          </div>
          <div v-else class="projects-grid">
            <div 
              v-for="site in store.sites" 
              :key="site.id" 
              class="project-card" 
              :class="{ active: store.currentSiteId === site.id }"
              @click="handleSelectSite(site.id)"
            >
              <div class="card-preview">
                <div class="preview-overlay">
                   <button class="btn-open">Open Editor</button>
                </div>
                <div class="pattern-bg"></div>
                <div class="card-initial">{{ site.name[0] }}</div>
              </div>
              <div class="card-body">
                <div class="card-main-info">
                   <h3 class="card-title">{{ site.name }}</h3>
                   <p class="card-url">{{ site.subdomain || 'site-' + site.id.slice(0,4) }}.buildev.live</p>
                </div>
                <div class="card-footer">
                   <span class="tag">Production</span>
                   <span class="timestamp">Last updated 2 days ago</span>
                   <button
                     type="button"
                     class="btn-delete-project"
                     title="Eliminar proyecto"
                     aria-label="Eliminar proyecto"
                     @click.stop="confirmDeleteProject(site)"
                   >
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                   </button>
                </div>
              </div>
            </div>
            
            <div v-if="store.sites.length === 0 && !store.isLoading" class="empty-state">
               <div class="empty-icon-v12">
                 <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="opacity: 0.2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
               </div>
               <h3>No projects yet</h3>
               <p>Start your journey by creating your first awesome website.</p>
               <button class="btn-create" @click="openProjectModal">Create my first project</button>
            </div>
          </div>
        </div>

        <!-- PAGES GRID -->
        <div v-if="view === 'pages'" class="grid-container">
           <div v-if="store.isLoading" class="skeleton-grid">
             <div v-for="i in 6" :key="i" class="skeleton-card mini"></div>
          </div>
          <div v-else class="pages-grid">
            <div v-for="page in store.pages" :key="page.id" class="page-row" @click="router.push(`/editor/${page.id}`)">
              <div class="page-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div class="page-details">
                <span class="page-name">{{ page.name }}</span>
                <span class="page-path">{{ page.urlPath }}</span>
              </div>
              <div class="page-status">
                <span class="dot-badge" :class="page.status"></span>
                {{ page.status }}
              </div>
              <div class="page-actions">
                <button
                  type="button"
                  class="btn-icon btn-delete-page"
                  title="Eliminar página"
                  aria-label="Eliminar página"
                  @click.stop="confirmDeletePage(page)"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </div>

            <div v-if="store.pages.length === 0 && !store.isLoading" class="empty-state">
               <h3>This project is empty</h3>
               <p>Create a page to start building your design.</p>
            </div>
          </div>
        </div>

        <div v-if="view === 'symbols'" class="grid-container">
          <div class="cms-section-panel">
            <h3>Symbols</h3>
            <p>Componentes reutilizables del proyecto actual.</p>
            <div class="cms-list">
              <div v-for="symbol in symbolCards" :key="symbol.id" class="cms-list-item plugin-item">
                <div class="plugin-meta">
                  <strong>{{ symbol.name }}</strong>
                  <span>{{ symbol.rootType }} · {{ symbol.description }} · {{ symbol.designLabel }}</span>
                </div>
                <button type="button" class="btn-plugin" @click="deleteSymbol(symbol.id)">Delete</button>
              </div>
            </div>
            <div class="cms-section-actions">
              <button class="btn-create" @click="openSymbolEditor">Use in current project</button>
            </div>
          </div>
        </div>

        <div v-if="view === 'cms'" class="grid-container">
          <div class="cms-section-panel">
            <h3>{{ cmsSectionConfig.title }}</h3>
            <p>{{ cmsSectionConfig.description }}</p>
            <div v-if="cmsSection === 'admin-plugins'" class="cms-list">
              <div v-for="plugin in pluginCatalog" :key="plugin.id" class="cms-list-item plugin-item">
                <div class="plugin-meta">
                  <strong>{{ plugin.name }}</strong>
                  <span>{{ plugin.category }} · {{ plugin.provider }}</span>
                </div>
                <button
                  type="button"
                  class="btn-plugin"
                  :class="{ installed: isPluginInstalled(plugin.id) }"
                  @click="togglePlugin(plugin.id)"
                >
                  {{ isPluginInstalled(plugin.id) ? 'Installed' : 'Install' }}
                </button>
              </div>
            </div>
            <div v-else-if="cmsSection === 'manage-design-system'" class="cms-list">
              <div v-for="system in availableDesignSystems" :key="system.id" class="cms-list-item plugin-item">
                <div class="plugin-meta">
                  <strong>{{ system.name }}</strong>
                  <span>{{ system.scope === 'global' ? 'Shared library' : 'Project library' }} · {{ system.colorPrimary }}</span>
                </div>
                <button
                  type="button"
                  class="btn-plugin"
                  :class="{ installed: activeDesignSystemId === system.id }"
                  @click="applyDesignSystem(system.id)"
                >
                  {{ activeDesignSystemId === system.id ? 'Active' : 'Use' }}
                </button>
              </div>
            </div>
            <div v-else class="cms-list">
              <div v-for="item in cmsSectionConfig.items" :key="item" class="cms-list-item">
                {{ item }}
              </div>
            </div>
            <div class="cms-section-actions">
              <button class="btn-create" @click="openPageModal">{{ cmsSectionConfig.actionLabel }}</button>
            </div>
          </div>
        </div>

        <div v-if="view === 'design-system'" class="grid-container">
          <div class="cms-section-panel">
            <h3>Design System</h3>
            <p>Crea librerias, reutilizalas entre proyectos y previsualiza componentes antes de publicarlos.</p>

            <div class="design-system-create">
              <input v-model="newDesignSystemName" type="text" placeholder="New design system name" />
              <label>
                <input v-model="newDesignSystemShared" type="checkbox" />
                Shared library
              </label>
              <button class="btn-create" @click="createDesignSystem">Create</button>
            </div>

            <div class="cms-list">
              <div v-for="system in availableDesignSystems" :key="system.id" class="cms-list-item plugin-item">
                <div class="plugin-meta">
                  <strong>{{ system.name }}</strong>
                  <span>{{ system.scope === 'global' ? 'Shared' : 'Project' }} · {{ system.typography }}</span>
                </div>
                <button
                  type="button"
                  class="btn-plugin"
                  :class="{ installed: activeDesignSystemId === system.id }"
                  @click="applyDesignSystem(system.id)"
                >
                  {{ activeDesignSystemId === system.id ? 'Active' : 'Use in project' }}
                </button>
              </div>
            </div>

            <h4 class="component-preview-title">Component preview</h4>
            <div class="component-preview-grid">
              <div v-for="component in designSystemComponents" :key="component.id" class="component-card">
                <div class="component-name">{{ component.name }}</div>
                <div class="component-sample" :style="component.style">{{ component.sampleText }}</div>
              </div>
            </div>

            <div class="cms-section-actions">
              <button class="btn-create" @click="view = 'symbols'">Open symbols library</button>
            </div>
          </div>
        </div>

      </section>
    </main>

    <!-- MODALS -->
    <Transition name="fade">
      <div v-if="showCreateProject || showCreatePage" class="modal-backdrop" @click.self="closeModals">
        <div
          class="modal-box premium-card bounce-in"
          :class="{
            'modal-wide': showCreateProject,
            'modal-step-pick-mode': showCreateProject && creationStep === 1,
            'modal-ai-architect': showCreateProject && selectedMode === 'ai' && creationStep === 2,
          }"
        >
          <div class="modal-header">
            <div class="header-with-steps" v-if="showCreateProject">
              <h2>{{ selectedMode === 'ai' ? 'AI Project Architect' : 'Create Project' }}</h2>
              <div class="step-indicator" v-if="selectedMode !== 'ai'">Step {{ creationStep }} of 3</div>
            </div>
            <h2 v-else>New Page</h2>
            <button class="btn-close" @click="closeModals">×</button>
          </div>
          
          <div class="modal-body">
            <!-- CREATE PROJECT WIZARD -->
            <template v-if="showCreateProject">
              <!-- Mode Selection -->
              <div v-if="creationStep === 1" class="mode-selection mode-selection-row">
                <p class="step-desc">Choose your starting point</p>
                <div class="mode-grid-horizontal mode-grid-single-row">
                  <div class="mode-card-v2 ai" :class="{ active: selectedMode === 'ai' }" @click="selectedMode = 'ai'">
                    <div class="mode-badge">✨ Recommended</div>
                    <div class="mode-viz">
                       <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                    </div>
                    <h3>AI Assistant</h3>
                    <p>Conversational building with real-time architecting.</p>
                  </div>
                  <div class="mode-card-v2 figma" :class="{ active: selectedMode === 'figma' }" @click="selectedMode = 'figma'">
                    <div class="mode-viz">
                       <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5zM12 2h3.5A3.5 3.5 0 1 1 12 5.5V2zM5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5zM12 9h3.5A3.5 3.5 0 1 1 12 12.5V9zM5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"/></svg>
                    </div>
                    <h3>Figma Import</h3>
                    <p>Convert your designs into pixel-perfect code instantly.</p>
                  </div>
                  <div class="mode-card-v2 reverse" :class="{ active: selectedMode === 'reverse' }" @click="selectedMode = 'reverse'">
                     <div class="mode-viz">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                     </div>
                     <h3>Reverse UI</h3>
                     <p>Upload a screenshot and AI will detect its structure.</p>
                  </div>
                  <div class="mode-card-v2 github" :class="{ active: selectedMode === 'github' }" @click="selectedMode = 'github'">
                    <div class="mode-viz">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                    </div>
                    <h3>Importar desde GitHub</h3>
                    <p>Trae el JSON exportado del repo y enlaza el proyecto para commit, ramas y PR.</p>
                  </div>
                  <div class="mode-card-v2 normal" :class="{ active: selectedMode === 'normal' }" @click="selectedMode = 'normal'">
                    <div class="mode-viz">
                       <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/></svg>
                    </div>
                    <h3>Start in blank</h3>
                    <p>Traditional setup with your choice of frontend stack.</p>
                  </div>
                </div>
              </div>

              <!-- AI Flow -->
              <div v-else-if="selectedMode === 'ai' && creationStep === 2" class="ai-step-shell">
                <div class="ai-step-toolbar">
                  <button type="button" class="btn-cancel ai-back-btn" @click="returnToModeSelection">
                    ← Cambiar modo
                  </button>
                </div>
                <BSAIChatWizard
                  :key="aiWizardKey"
                  @complete="handleAIComplete"
                  @cancel="returnToModeSelection"
                />
              </div>

              <!-- Figma/Normal/Reverse Details -->
              <div v-else-if="creationStep === 2" class="details-entry">
                <template v-if="selectedMode === 'github'">
                  <p class="step-desc">Repositorio de GitHub</p>
                  <div v-if="auth.githubLinked" class="github-linked-banner">
                    Conectado como <strong>@{{ auth.githubUsername || "github" }}</strong>
                  </div>
                  <div v-else class="input-group">
                    <p class="hint-text">Vincula tu cuenta de GitHub con Buildev para importar sin pegar tokens.</p>
                    <button type="button" class="btn-submit" @click="connectGithubForImport">
                      Conectar con GitHub
                    </button>
                  </div>
                  <div class="input-group">
                    <label>URL del repositorio</label>
                    <input
                      v-model="newProject.githubRepoUrl"
                      type="url"
                      placeholder="https://github.com/acme/mi-sitio"
                    />
                    <p v-if="newProject.githubRepoUrl.trim() && !githubRepoParsed" class="stack-hint err">
                      No se reconoce la URL. Usa https://github.com/owner/repo o owner/repo
                    </p>
                  </div>
                  <div class="input-group row-inline">
                    <div>
                      <label>Rama</label>
                      <input v-model="newProject.githubBranch" type="text" placeholder="main" />
                    </div>
                    <div>
                      <label>Ruta del JSON en el repo</label>
                      <input v-model="newProject.githubExportPath" type="text" placeholder=".buildev/buildev-site.json" />
                    </div>
                  </div>
                </template>
                <!-- Reverse Mode Upload -->
                <div v-if="selectedMode === 'reverse'" class="reverse-upload-zone">
                   <div class="upload-box" @click="fileInput?.click()" :class="{ loading: isReverseAnalyzing }">
                      <input type="file" ref="fileInput" hidden accept="image/*" @change="handleReverseUpload" />
                      <template v-if="!isReverseAnalyzing">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                        <p>Click to upload screenshot</p>
                      </template>
                      <template v-else>
                        <div class="pulse-ring"></div>
                        <p>AI analyzing structure...</p>
                      </template>
                   </div>
                </div>

                <div class="input-group">
                  <label>Project Name</label>
                  <input v-model="newProject.name" type="text" placeholder="e.g. My SaaS Product" autofocus />
                </div>

                <template v-if="selectedMode !== 'reverse' && selectedMode !== 'github'">
                  <div v-if="selectedMode === 'figma'" class="input-group">
                    <label>Figma File URL</label>
                    <input v-model="newProject.figmaUrl" type="text" placeholder="https://www.figma.com/file/..." />
                  </div>
                </template>

                <div class="input-group">
                  <label>Tipo de proyecto</label>
                  <select v-model="newProject.projectType" class="config-select">
                    <option
                      v-for="projectType in projectTypeOptions"
                      :key="projectType.id"
                      :value="projectType.id"
                    >
                      {{ projectType.name }}
                    </option>
                  </select>
                </div>

                <div class="input-group">
                  <label>Frontend Stack</label>
                  <select
                    v-model="newProject.stack"
                    class="config-select"
                    :disabled="newProject.projectType === 'cms'"
                  >
                    <option
                      v-for="framework in frontendStackOptions"
                      :key="framework.id"
                      :value="framework.id"
                    >
                      {{ framework.name }}
                    </option>
                  </select>
                  <p v-if="newProject.projectType === 'cms'" class="stack-hint">
                    Para CMS se usa Astro como stack de contenido.
                  </p>
                </div>

                <div class="input-group">
                  <label>Backend Stack</label>
                  <select v-model="newProject.backend" class="config-select">
                    <option
                      v-for="framework in backendStackOptions"
                      :key="framework.id"
                      :value="framework.id"
                    >
                      {{ framework.name }}
                    </option>
                  </select>
                </div>

                <div class="input-group">
                  <label>CMS</label>
                  <select v-model="newProject.cms" class="config-select">
                    <option
                      v-for="framework in cmsOptions"
                      :key="framework.id"
                      :value="framework.id"
                    >
                      {{ framework.name }}
                    </option>
                  </select>
                </div>

              </div>
            </template>

            <!-- NEW PAGE (KEEPING IT SIMPLE) -->
            <template v-else>
              <div class="input-group">
                <label>Page Title</label>
                <input v-model="newPage.name" type="text" placeholder="e.g. Landing Page" />
              </div>
              <div class="input-group">
                <label>URL Path</label>
                <div class="path-input">
                   <span>/</span>
                   <input v-model="newPage.urlPath" type="text" placeholder="home" />
                </div>
              </div>
            </template>
          </div>

          <div class="modal-footer" v-if="showCreateProject || showCreatePage">
            <template v-if="showCreateProject">
              <template v-if="selectedMode === 'ai' && creationStep === 2">
                <button type="button" class="btn-cancel" @click="creationStep = 1">
                  Back to modes
                </button>
              </template>
              <template v-else>
                <button type="button" class="btn-cancel" @click="creationStep > 1 ? creationStep-- : closeModals()">
                  {{ creationStep === 1 ? 'Cancel' : 'Back' }}
                </button>
                <button
                  type="button"
                  class="btn-submit"
                  v-if="creationStep < 2"
                  @click="creationStep++"
                >
                  Continue
                </button>
                <button
                  type="button"
                  class="btn-submit"
                  v-else-if="selectedMode !== 'ai'"
                  :disabled="
                    !newProject.name ||
                    (selectedMode === 'figma' && !newProject.figmaUrl) ||
                    (selectedMode === 'github' &&
                      (!githubRepoParsed || !auth.githubLinked))
                  "
                  @click="handleCreateProject"
                >
                  {{ isSaving ? 'Launching...' : 'Create Project' }}
                </button>
              </template>
            </template>
            <template v-else>
              <button type="button" class="btn-cancel" @click="closeModals">Cancel</button>
              <button type="button" class="btn-submit" :disabled="isSaving" @click="handleCreatePage()">
                <span v-if="isSaving" class="spinner-sm"></span>
                {{ isSaving ? 'Processing...' : 'Create Page' }}
              </button>
            </template>
          </div>
        </div>
      </div>
    </Transition>

    <BSAccountSettingsPanel v-if="showAccountSettings" @close="showAccountSettings = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../store/auth";
import { usePagesStore } from "../store/pages";
import { useUIStore } from "../store/ui";
import BSAIChatWizard from "../components/modals/BSAIChatWizard.vue";
import BSAccountSettingsPanel from "../components/account/BSAccountSettingsPanel.vue";
import { aiService } from "../services/aiService";
import { gitService } from "../services/gitService";
import { parseGithubRepoUrl } from "../utils/parseGithubRepoUrl";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const store = usePagesStore();
const ui = useUIStore();
const API = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

const view = ref<'projects' | 'pages' | 'symbols' | 'assets' | 'cms' | 'design-system'>('projects');
const showAccountSettings = ref(false);
const cmsSection = ref<'content-pages' | 'content-posts' | 'content-media' | 'manage-menu' | 'manage-redirects' | 'manage-widgets' | 'manage-sections' | 'manage-categories' | 'manage-tags' | 'manage-bylines' | 'manage-design-system' | 'admin-content-types' | 'admin-users' | 'admin-plugins' | 'admin-import' | 'admin-settings'>('content-pages');
const showCreateProject = ref(false);
const showCreatePage = ref(false);
const isSaving = ref(false);
const isReverseAnalyzing = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

// Wizard State
const creationStep = ref(1);
const selectedMode = ref<'ai' | 'normal' | 'figma' | 'reverse' | 'github'>('ai');
const newProject = reactive({ 
  name: "", 
  projectType: "landing",
  prompt: "", 
  figmaUrl: "", 
  stack: "vite-vue", 
  backend: "node-express",
  cms: "none",
  githubRepoUrl: "",
  githubBranch: "main",
  githubExportPath: ".buildev/buildev-site.json",
});

const projectTypeOptions = [
  { id: 'landing', name: 'Landing page' },
  { id: 'multisite', name: 'Multisitio' },
  { id: 'cms', name: 'CMS' }
];

const frontendStackOptions = [
  { id: 'vite-vue', name: 'Vite + Vue' },
  { id: 'vite-react', name: 'Vite + React' },
  { id: 'next-react', name: 'Next.js' },
  { id: 'nuxt', name: 'Nuxt' },
  { id: 'sveltekit', name: 'SvelteKit' },
  { id: 'astro', name: 'Astro' },
  { id: 'remix', name: 'Remix' },
  { id: 'solidstart', name: 'SolidStart' },
  { id: 'qwik', name: 'Qwik' }
];

const backendStackOptions = [
  { id: 'node-express', name: 'Node + Express' },
  { id: 'node-fastify', name: 'Node + Fastify' },
  { id: 'nestjs', name: 'NestJS' },
  { id: 'hono', name: 'Hono' },
  { id: 'adonis', name: 'AdonisJS' },
  { id: 'django', name: 'Django' },
  { id: 'laravel', name: 'Laravel' },
  { id: 'rails', name: 'Ruby on Rails' },
  { id: 'spring', name: 'Spring Boot' },
  { id: 'none', name: 'No backend' }
];

const cmsOptions = [
  { id: 'none', name: 'No CMS' },
  { id: 'strapi', name: 'Strapi' },
  { id: 'directus', name: 'Directus' },
  { id: 'payload', name: 'Payload CMS' },
  { id: 'sanity', name: 'Sanity' },
  { id: 'contentful', name: 'Contentful' },
  { id: 'wordpress-headless', name: 'WordPress Headless' }
];

const newPage = ref({ name: "", urlPath: "" });
const aiWizardKey = ref(0);

interface DesignSystemLibrary {
  id: string;
  name: string;
  scope: "site" | "global";
  siteId: string;
  colorPrimary: string;
  colorSurface: string;
  typography: string;
}

interface PluginItem {
  id: string;
  name: string;
  category: string;
  provider: string;
}

const cmsSectionLabels: Record<string, string> = {
  'content-pages': 'Contenido · Pages',
  'content-posts': 'Contenido · Posts',
  'content-media': 'Contenido · Media',
  'manage-menu': 'Manage · Menu',
  'manage-redirects': 'Manage · Redirects',
  'manage-widgets': 'Manage · Widgets',
  'manage-sections': 'Manage · Sections',
  'manage-categories': 'Manage · Categories',
  'manage-tags': 'Manage · Tags',
  'manage-bylines': 'Manage · Bylines',
  'manage-design-system': 'Manage · Design System',
  'admin-content-types': 'Admin · Content Types',
  'admin-users': 'Admin · Users',
  'admin-plugins': 'Admin · Plugins',
  'admin-import': 'Admin · Import',
  'admin-settings': 'Admin · Settings'
};

interface CmsSectionConfig {
  title: string;
  description: string;
  actionLabel: string;
  items: string[];
}

const cmsSections: Record<string, CmsSectionConfig> = {
  'content-pages': {
    title: 'Contenido · Pages',
    description: 'Gestiona paginas estaticas y landing pages del sitio.',
    actionLabel: 'Create page',
    items: ['Home', 'About', 'Pricing', 'Contact']
  },
  'content-posts': {
    title: 'Contenido · Posts',
    description: 'Administra articulos, borradores y publicaciones.',
    actionLabel: 'Create post',
    items: ['Draft queue', 'Published posts', 'Scheduled posts', 'Archived posts']
  },
  'content-media': {
    title: 'Contenido · Media',
    description: 'Organiza imagenes, videos y documentos del proyecto.',
    actionLabel: 'Upload media',
    items: ['Image library', 'Video assets', 'Documents', 'Alt text status']
  },
  'manage-menu': {
    title: 'Manage · Menu',
    description: 'Define la estructura de navegacion principal y footer.',
    actionLabel: 'Create menu',
    items: ['Header menu', 'Footer menu', 'Mobile menu']
  },
  'manage-redirects': {
    title: 'Manage · Redirects',
    description: 'Configura redirecciones para SEO y contenido movido.',
    actionLabel: 'Add redirect',
    items: ['301 redirects', '302 redirects', 'Broken URL report']
  },
  'manage-widgets': {
    title: 'Manage · Widgets',
    description: 'Habilita widgets reutilizables para bloques de contenido.',
    actionLabel: 'Create widget',
    items: ['Newsletter', 'Latest posts', 'CTA widgets']
  },
  'manage-sections': {
    title: 'Manage · Sections',
    description: 'Agrupa secciones reutilizables para paginas y posts.',
    actionLabel: 'Create section',
    items: ['Hero sections', 'Feature grids', 'Testimonial blocks']
  },
  'manage-categories': {
    title: 'Manage · Categories',
    description: 'Administra categorias para clasificar contenido.',
    actionLabel: 'Create category',
    items: ['Product', 'News', 'Docs', 'Tutorials']
  },
  'manage-tags': {
    title: 'Manage · Tags',
    description: 'Controla etiquetas para filtrado y descubrimiento.',
    actionLabel: 'Create tag',
    items: ['Release', 'How-to', 'Guide', 'Opinion']
  },
  'manage-bylines': {
    title: 'Manage · Bylines',
    description: 'Gestiona autores y firmas editoriales.',
    actionLabel: 'Create byline',
    items: ['Staff writers', 'Guest authors', 'Reviewers']
  },
  'manage-design-system': {
    title: 'Manage · Design System',
    description: 'Mantiene tokens y componentes para consistencia visual.',
    actionLabel: 'Open design system',
    items: ['Color tokens', 'Typography', 'Spacing rules', 'UI components']
  },
  'admin-content-types': {
    title: 'Admin · Content Types',
    description: 'Define esquemas de contenido y campos personalizados.',
    actionLabel: 'Create content type',
    items: ['Pages schema', 'Posts schema', 'Custom collections']
  },
  'admin-users': {
    title: 'Admin · Users',
    description: 'Administra usuarios, roles y permisos del CMS.',
    actionLabel: 'Invite user',
    items: ['Admins', 'Editors', 'Authors', 'Contributors']
  },
  'admin-plugins': {
    title: 'Admin · Plugins',
    description: 'Instala y configura plugins para ampliar capacidades.',
    actionLabel: 'Install plugin',
    items: ['Installed plugins', 'Available updates', 'Capability scopes']
  },
  'admin-import': {
    title: 'Admin · Import',
    description: 'Importa contenido externo y migra estructuras.',
    actionLabel: 'Start import',
    items: ['WordPress import', 'CSV import', 'JSON import']
  },
  'admin-settings': {
    title: 'Admin · Settings',
    description: 'Configura opciones generales del CMS y del sitio.',
    actionLabel: 'Open settings',
    items: ['General', 'SEO', 'Integrations', 'Backups']
  }
};

const githubRepoParsed = computed(() => parseGithubRepoUrl(newProject.githubRepoUrl));

const cmsSectionTitle = computed(() => cmsSectionLabels[cmsSection.value] || 'CMS');
const cmsSectionDescription = computed(() => `Gestiona ${cmsSectionTitle.value.toLowerCase()} desde el dashboard CMS.`);
const cmsSectionConfig = computed(() => cmsSections[cmsSection.value] ?? {
  title: cmsSectionTitle.value,
  description: cmsSectionDescription.value,
  actionLabel: 'Create item',
  items: []
});

const currentViewTitle = computed(() => {
  if (view.value === 'pages') return 'Site Pages';
  if (view.value === 'cms') return cmsSectionConfig.value.title;
  if (view.value === 'design-system') return 'Design System';
  return view.value;
});

function openCmsSection(section: typeof cmsSection.value) {
  view.value = 'cms';
  cmsSection.value = section;
}

function resolveProjectView(projectType?: string): 'pages' | 'cms' {
  if (projectType === 'cms') {
    return 'cms';
  }
  return 'pages';
}

function ensureDefaultDesignSystem() {
  if (designSystems.value.length === 0) {
    designSystems.value = [
      {
        id: "ds-default",
        name: "Buildev Default",
        scope: "global",
        siteId: "global",
        colorPrimary: "#4f46e5",
        colorSurface: "#f8fafc",
        typography: "Inter"
      }
    ];
  }
}

async function loadCmsWorkspaceData() {
  try {
    const res = await fetch(`${API}/api/sites/workspace`, { headers: auth.authHeaders() });
    const json = await res.json();
    if (json.ok) {
      const bySite = (json.data?.bySite ?? {}) as Record<string, { designSystems: DesignSystemLibrary[]; activeDesignSystemId: string; installedPlugins: string[] }>;
      const mergedSystems: DesignSystemLibrary[] = [];
      const activeBySite: Record<string, string> = {};
      const pluginsBySite: Record<string, string[]> = {};

      for (const [siteId, workspace] of Object.entries(bySite)) {
        if (Array.isArray(workspace.designSystems)) {
          mergedSystems.push(...workspace.designSystems);
        }
        if (workspace.activeDesignSystemId) {
          activeBySite[siteId] = workspace.activeDesignSystemId;
        }
        pluginsBySite[siteId] = Array.isArray(workspace.installedPlugins) ? workspace.installedPlugins : [];
      }

      designSystems.value = mergedSystems;
      activeDesignSystemsBySite.value = activeBySite;
      installedPluginsBySite.value = pluginsBySite;
      ensureDefaultDesignSystem();
      return;
    }
  } catch {
    // Fallback to local state below.
  }

  const rawSystems = localStorage.getItem("buildev_design_systems");
  const rawActive = localStorage.getItem("buildev_active_design_systems");
  const rawPlugins = localStorage.getItem("buildev_installed_plugins");
  if (rawSystems) designSystems.value = JSON.parse(rawSystems) as DesignSystemLibrary[];
  if (rawActive) activeDesignSystemsBySite.value = JSON.parse(rawActive) as Record<string, string>;
  if (rawPlugins) installedPluginsBySite.value = JSON.parse(rawPlugins) as Record<string, string[]>;
  ensureDefaultDesignSystem();
}

async function saveCmsWorkspaceData() {
  localStorage.setItem("buildev_design_systems", JSON.stringify(designSystems.value));
  localStorage.setItem("buildev_active_design_systems", JSON.stringify(activeDesignSystemsBySite.value));
  localStorage.setItem("buildev_installed_plugins", JSON.stringify(installedPluginsBySite.value));

  const siteId = currentSiteId.value;
  if (!siteId || siteId === "global") return;
  const payload = {
    designSystems: designSystems.value.filter((system) => system.scope === "global" || system.siteId === siteId),
    activeDesignSystemId: activeDesignSystemsBySite.value[siteId] || "",
    installedPlugins: installedPluginsBySite.value[siteId] || [],
  };
  try {
    await fetch(`${API}/api/sites/${siteId}/workspace`, {
      method: "PUT",
      headers: { ...auth.authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Keep local fallback if backend unavailable.
  }
}

function createDesignSystem() {
  const name = newDesignSystemName.value.trim();
  if (!name) return;
  const system: DesignSystemLibrary = {
    id: `ds-${Date.now()}`,
    name,
    scope: newDesignSystemShared.value ? "global" : "site",
    siteId: newDesignSystemShared.value ? "global" : currentSiteId.value,
    colorPrimary: "#4f46e5",
    colorSurface: "#f8fafc",
    typography: "Inter"
  };
  designSystems.value.unshift(system);
  applyDesignSystem(system.id);
  newDesignSystemName.value = "";
  newDesignSystemShared.value = false;
  void saveCmsWorkspaceData();
}

function applyDesignSystem(systemId: string) {
  activeDesignSystemsBySite.value[currentSiteId.value] = systemId;
  void saveCmsWorkspaceData();
}

function isPluginInstalled(pluginId: string): boolean {
  const installed = installedPluginsBySite.value[currentSiteId.value] || [];
  return installed.includes(pluginId);
}

function togglePlugin(pluginId: string) {
  const installed = installedPluginsBySite.value[currentSiteId.value] || [];
  if (installed.includes(pluginId)) {
    installedPluginsBySite.value[currentSiteId.value] = installed.filter((item) => item !== pluginId);
  } else {
    installedPluginsBySite.value[currentSiteId.value] = [...installed, pluginId];
  }
  void saveCmsWorkspaceData();
}

async function deleteSymbol(componentId: string) {
  await store.deleteComponent(componentId);
}

function confirmDeletePage(page: { id: string; name: string }) {
  if (!confirm(`¿Eliminar la página «${page.name}»?`)) return;
  void store.deletePage(page.id);
}

function confirmDeleteProject(site: { id: string; name: string }) {
  if (!confirm(`¿Eliminar el proyecto «${site.name}» y todos sus datos? Esta acción no se puede deshacer.`)) return;
  void store.deleteSite(site.id);
}

async function openSymbolEditor() {
  if (!store.currentSiteId) return;
  if (!store.pages.length) {
    const created = await store.createPage("Components", "/components");
    if (created) {
      router.push(`/editor/${created.id}`);
      return;
    }
  }
  const firstPage = store.pages[0];
  if (firstPage) {
    router.push(`/editor/${firstPage.id}`);
  }
}

function navToAIStudio() {
  closeModals();
  router.push('/ai-studio');
}

const currentSite = computed(() => store.sites.find((s: any) => s.id === store.currentSiteId));
const currentSiteId = computed(() => store.currentSiteId || "global");

const designSystems = ref<DesignSystemLibrary[]>([]);
const activeDesignSystemsBySite = ref<Record<string, string>>({});
const installedPluginsBySite = ref<Record<string, string[]>>({});
const newDesignSystemName = ref("");
const newDesignSystemShared = ref(false);

const pluginCatalog: PluginItem[] = [
  { id: "google-analytics", name: "Google Analytics", category: "Marketing", provider: "Google" },
  { id: "google-tag-manager", name: "Google Tag Manager", category: "Marketing", provider: "Google" },
  { id: "google-ads", name: "Google Ads Conversion", category: "Marketing", provider: "Google" },
  { id: "hubspot", name: "HubSpot CRM", category: "CRM", provider: "HubSpot" },
  { id: "salesforce", name: "Salesforce CRM", category: "CRM", provider: "Salesforce" },
  { id: "pipedrive", name: "Pipedrive CRM", category: "CRM", provider: "Pipedrive" },
  { id: "mailchimp", name: "Mailchimp", category: "Email Marketing", provider: "Intuit" }
];

const availableDesignSystems = computed(() =>
  designSystems.value.filter(
    (system) => system.scope === "global" || system.siteId === currentSiteId.value
  )
);

const activeDesignSystemId = computed(
  () => activeDesignSystemsBySite.value[currentSiteId.value] || availableDesignSystems.value[0]?.id || ""
);

const activeDesignSystem = computed(() =>
  availableDesignSystems.value.find((system) => system.id === activeDesignSystemId.value)
);

const designSystemComponents = computed(() => {
  const system = activeDesignSystem.value;
  const primary = system?.colorPrimary || "#4f46e5";
  const surface = system?.colorSurface || "#f8fafc";
  const font = system?.typography || "Inter";
  return [
    {
      id: "button-primary",
      name: "Primary Button",
      sampleText: "Get started",
      style: `background:${primary};color:#fff;padding:8px 14px;border-radius:8px;display:inline-block;font-family:${font};font-size:13px;`
    },
    {
      id: "card",
      name: "Card",
      sampleText: "Feature card preview",
      style: `background:${surface};color:#111;padding:10px;border-radius:10px;border:1px solid rgba(0,0,0,0.08);font-family:${font};font-size:12px;`
    },
    {
      id: "badge",
      name: "Badge",
      sampleText: "New",
      style: `background:rgba(79,70,229,0.1);color:${primary};padding:4px 8px;border-radius:999px;display:inline-block;font-family:${font};font-size:11px;font-weight:700;`
    }
  ];
});

const symbolCards = computed(() =>
  (
    store.components as Array<{
      id: string;
      name: string;
      description?: string;
      rootBlockJson: string;
      updatedAt?: string;
      designSystemId?: string | null;
    }>
  ).map((component) => {
    let rootType = "component";
    try {
      const parsed = JSON.parse(component.rootBlockJson) as { type?: string };
      rootType = parsed.type || rootType;
    } catch {
      rootType = "component";
    }
    const designLabel =
      typeof component.designSystemId === "string" && component.designSystemId.length > 0
        ? `DS ${component.designSystemId.slice(0, 8)}…`
        : "sin design system";
    return {
      id: component.id,
      name: component.name,
      description: component.description || "Reusable block component",
      rootType,
      updatedAt: component.updatedAt || "",
      designLabel,
    };
  })
);

async function refreshDashboard() {
  try {
    await auth.fetchGitHubStatus();
    await store.loadSites();
    if (store.currentSiteId && store.sites.length > 0) {
      const activeSite = store.sites.find((site: { id: string; projectType?: string }) => site.id === store.currentSiteId);
      view.value = resolveProjectView(activeSite?.projectType);
      await Promise.all([store.loadPages(), store.loadComponents()]);
    }
  } catch (err) {
    console.error("Dashboard Load Error:", err);
  }
}

watch(
  () => route.path,
  (path) => {
    if (path !== "/" && path !== "/dashboard") return;
    refreshDashboard();
  },
  { immediate: true }
);

onMounted(async () => {
  await loadCmsWorkspaceData();
});

function openProjectModal() {
  creationStep.value = 1;
  selectedMode.value = 'ai';
  newProject.name = "";
  newProject.projectType = "landing";
  newProject.prompt = "";
  newProject.figmaUrl = "";
  newProject.stack = "vite-vue";
  newProject.backend = "node-express";
  newProject.cms = "none";
  newProject.githubRepoUrl = "";
  newProject.githubBranch = "main";
  newProject.githubExportPath = ".buildev/buildev-site.json";
  aiWizardKey.value += 1;
  showCreateProject.value = true;
}

function openPageModal() {
  newPage.value = { name: "", urlPath: "" };
  showCreatePage.value = true;
}

function closeModals() {
  showCreateProject.value = false;
  showCreatePage.value = false;
  isSaving.value = false;
}

function returnToModeSelection() {
  creationStep.value = 1;
  aiWizardKey.value += 1;
}

async function handleSelectSite(id: string) {
  await store.selectSite(id);
  const selectedSite = store.sites.find((site: { id: string; projectType?: string }) => site.id === id);
  view.value = resolveProjectView(selectedSite?.projectType);
  if (view.value === 'cms') {
    cmsSection.value = 'content-pages';
  }
  store.loadComponents();
}

async function handleAIComplete(data: { name: string; prompt: string; architecture?: unknown; projectType?: string; stack?: string; backend?: string; cms?: string }) {
  newProject.name = data.name;
  newProject.prompt = data.prompt;
  if (data.projectType) {
    const normalizedType = data.projectType.toLowerCase();
    if (normalizedType.includes('cms')) {
      newProject.projectType = 'cms';
    } else if (normalizedType.includes('multi')) {
      newProject.projectType = 'multisite';
    } else {
      newProject.projectType = 'landing';
    }
  }
  if (data.stack) newProject.stack = data.stack;
  if (data.backend) newProject.backend = data.backend;
  if (data.cms) newProject.cms = data.cms;
  if (newProject.projectType === 'cms') {
    newProject.stack = 'astro';
  }
  await handleCreateProject();
}

async function connectGithubForImport() {
  try {
    await auth.startGitHubOAuth();
  } catch (e: unknown) {
    alert(e instanceof Error ? e.message : "No se pudo iniciar la conexión con GitHub");
  }
}

function openAccountSettings() {
  showAccountSettings.value = true;
  void auth.fetchGitHubStatus();
}

async function handleCreateProject() {
  if (!newProject.name || isSaving.value) return;
  if (selectedMode.value === "github") {
    const repoFull = parseGithubRepoUrl(newProject.githubRepoUrl.trim());
    if (!repoFull || !auth.githubLinked) return;
  }
  isSaving.value = true;
  try {
    const site = await store.createSite(newProject.name, {
      mode: selectedMode.value,
      projectType: newProject.projectType,
      prompt: newProject.prompt,
      figmaUrl: newProject.figmaUrl,
      stack: newProject.stack,
      backend: newProject.backend,
      cms: newProject.cms
    });

    if (!site) return;

    await store.selectSite(site.id);

    if (selectedMode.value === "github") {
      const repoFull = parseGithubRepoUrl(newProject.githubRepoUrl.trim());
      if (!repoFull) {
        throw new Error("URL de repositorio no válida");
      }
      localStorage.setItem(`bs_git_poll_${site.id}`, "1");
      await gitService.importRepository(auth.authHeaders(), site.id, undefined, {
        repoFullName: repoFull,
        branch: newProject.githubBranch.trim() || "main",
        exportPath: newProject.githubExportPath.trim() || ".buildev/buildev-site.json",
        linkAfterImport: true,
      });
      await store.loadPages();
      await store.loadComponents();
      await store.loadSites();
    }

    showCreateProject.value = false;
    const latest = store.sites.find((s: { id: string }) => s.id === site.id);
    view.value = resolveProjectView(
      selectedMode.value === "github" ? latest?.projectType : newProject.projectType,
    );
    if (view.value === 'cms') {
      cmsSection.value = 'content-pages';
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al crear o importar el proyecto";
    alert(message);
  } finally {
    isSaving.value = false;
  }
}

async function handleCreatePage() {
  if (!newPage.value.name || isSaving.value) return;
  isSaving.value = true;
  try {
    const path = newPage.value.urlPath.startsWith('/') ? newPage.value.urlPath : '/' + (newPage.value.urlPath || '');
    const page = await store.createPage(newPage.value.name, path);
    if (page) {
       showCreatePage.value = false;
       router.push(`/editor/${page.id}`);
    }
  } catch (err) {
    console.error("Page Creation Error:", err);
  } finally {
    isSaving.value = false;
  }
}

async function handleReverseUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  isReverseAnalyzing.value = true;
  try {
    const blocks = await aiService.reverseUI(file);
    const siteName = newProject.name.trim() || `Reverse UI - ${file.name.split('.')[0]}`;
    const site = await store.createSite(siteName, {
      mode: 'reverse',
      projectType: newProject.projectType,
      prompt: `Generated from screenshot: ${file.name}`,
      blocks,
      stack: newProject.stack,
      backend: newProject.backend,
      cms: newProject.cms
    });
    if (site) {
      showCreateProject.value = false;
      await store.selectSite(site.id);
      view.value = resolveProjectView(site.projectType);
      if (view.value === 'cms') {
        cmsSection.value = 'content-pages';
      }
    }
  } catch (err) {
    alert("AI Analysis failed: " + err);
  } finally {
    isReverseAnalyzing.value = false;
  }
}

function handleLogout() {
  auth.logout();
  router.push('/login');
}

watch(
  () => newProject.projectType,
  (projectType) => {
    if (projectType === 'cms') {
      newProject.stack = 'astro';
      if (newProject.cms === 'none') {
        newProject.cms = 'strapi';
      }
    }
  }
);

watch(
  () => view.value,
  async (nextView) => {
    if (nextView === "symbols" && store.currentSiteId) {
      await store.loadComponents();
    }
  }
);

watch(
  () => currentSiteId.value,
  (siteId) => {
    if (!siteId) return;
    if (!activeDesignSystemsBySite.value[siteId] && availableDesignSystems.value.length > 0) {
      activeDesignSystemsBySite.value[siteId] = availableDesignSystems.value[0].id;
      void saveCmsWorkspaceData();
    }
  },
  { immediate: true }
);

</script>

<style scoped>
.dashboard-root { display: flex; height: 100vh; background: var(--bg-main); color: var(--text-main); font-family: 'Inter', system-ui, sans-serif; overflow: hidden; }

/* SIDEBAR */
.sidebar { width: 260px; background: var(--bg-sidebar); border-right: 1px solid var(--border-main); display: flex; flex-direction: column; padding: 32px 16px; flex-shrink: 0; box-shadow: 4px 0 24px rgba(0,0,0,0.02); z-index: 10; }
.sidebar-header { margin-bottom: 40px; padding: 0 12px; }
.logo-group { display: flex; align-items: center; gap: 12px; }
.logo-box { width: 32px; height: 32px; background: var(--brand-primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
.sidebar-isotype { width: 20px; height: 20px; filter: brightness(0) invert(1); }
.brand-name { font-weight: 800; font-size: 20px; letter-spacing: -0.02em; }

.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 28px; }
.section-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--text-dim); letter-spacing: 0.12em; margin-bottom: 12px; padding-left: 12px; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 12px; color: var(--text-muted); font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
.nav-icon { width: 18px; height: 18px; opacity: 0.7; }
.nav-item:hover { background: var(--bg-surface-alt); color: var(--text-main); }
.nav-item.active { background: var(--brand-primary); color: #fff; box-shadow: 0 8px 16px rgba(79, 70, 229, 0.25); }
.nav-item.active .nav-icon { opacity: 1; }

.sidebar-footer { padding-top: 24px; border-top: 1px solid var(--border-subtle); display: flex; flex-direction: column; gap: 16px; }

.theme-toggle-v12 {
  width: 100%; padding: 12px; background: var(--bg-surface-alt); border: 1px solid var(--border-main); border-radius: 12px;
  color: var(--text-main); font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: all 0.2s;
}
.theme-toggle-v12:hover { border-color: var(--brand-primary); transform: translateY(-1px); background: var(--bg-surface); }

.active-workspace-card { 
  background: var(--bg-surface-alt); border: 1px solid var(--border-main); border-radius: 14px; padding: 14px; 
  display: flex; flex-direction: column; gap: 6px; 
}
.workspace-header { display: flex; align-items: center; gap: 8px; }
.pulse-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 0 rgba(16, 185, 129, 0.4); animation: pulse 2s infinite; }
@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
.workspace-header .label { font-size: 9px; font-weight: 800; color: var(--text-dim); letter-spacing: 0.05em; }
.workspace-name { font-size: 13px; font-weight: 700; color: var(--text-main); }

.logout-btn-v12 { 
  display: flex; align-items: center; justify-content: center; gap: 10px; background: transparent; 
  border: 1px solid transparent; color: var(--text-dim); padding: 10px; border-radius: 10px; cursor: pointer; font-size: 13px; font-weight: 600; 
}
.logout-btn-v12:hover { color: #ef4444; background: #fef2f2; }

/* MAIN CONTENT */
.main-content { flex: 1; display: flex; flex-direction: column; background: var(--bg-main); overflow: hidden; }
.content-header { padding: 40px 48px; display: flex; justify-content: space-between; align-items: flex-end; }
.breadcrumb-nav-v12 { display: flex; align-items: center; gap: 8px; color: var(--text-muted); font-size: 13px; font-weight: 500; margin-bottom: 8px; }
.crumb-link { cursor: pointer; transition: color 0.2s; }
.crumb-link:hover { color: var(--brand-primary); }
.crumb-current { color: var(--text-dim); }
.view-title { font-size: 32px; font-weight: 800; letter-spacing: -0.02em; margin: 0; }
.subtitle { color: var(--text-muted); font-size: 14px; margin-top: 4px; }

.header-actions { display: flex; align-items: center; gap: 16px; }
.search-box { background: var(--bg-surface-alt); border: none; border-radius: 12px; padding: 0 14px; display: flex; align-items: center; gap: 10px; height: 40px; width: 280px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); }
.search-icon { color: var(--text-dim); }
.search-box input { background: transparent; border: none; color: var(--text-main); font-size: 14px; outline: none; flex: 1; }

.btn-create { background: var(--brand-primary); color: #fff; border: none; border-radius: 10px; height: 40px; padding: 0 20px; display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s ease; }
.btn-create:hover { background: var(--brand-primary-hover); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }

.scroll-area { flex: 1; padding: 0 48px 48px; overflow-y: auto; }

/* GRIDS */
.projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 32px; }
.project-card { background: var(--bg-surface); border: 1px solid var(--border-main); border-radius: 16px; overflow: hidden; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.project-card:hover { border-color: var(--brand-primary); transform: translateY(-6px); box-shadow: var(--shadow-lg); }
.project-card.active { border-color: var(--brand-primary); background: var(--bg-surface-alt); }

.card-preview { height: 160px; background: var(--bg-surface-alt); position: relative; display: flex; align-items: center; justify-content: center; font-size: 40px; font-weight: 800; color: var(--text-dim); overflow: hidden; }
.pattern-bg { position: absolute; inset: 0; opacity: 0.05; background-image: radial-gradient(var(--text-main) 1px, transparent 1px); background-size: 20px 20px; }
.preview-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); opacity: 0; display: flex; align-items: center; justify-content: center; transition: opacity 0.2s; backdrop-filter: blur(2px); }
.project-card:hover .preview-overlay { opacity: 1; }
.btn-open { background: #fff; color: #000; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 700; font-size: 13px; transform: translateY(10px); transition: all 0.3s; }
.project-card:hover .btn-open { transform: translateY(0); }

.card-body { padding: 20px; }
.card-title { font-size: 16px; font-weight: 700; color: var(--text-main); margin-bottom: 4px; }
.card-url { font-size: 12px; color: var(--text-muted); }
.card-footer { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-subtle); }
.tag { font-size: 10px; font-weight: 800; background: var(--bg-main); color: var(--text-muted); padding: 4px 10px; border-radius: 6px; border: 1px solid var(--border-main); }
.timestamp { font-size: 11px; color: var(--text-dim); flex: 1; min-width: 0; }
.btn-delete-project {
  margin-left: auto;
  flex-shrink: 0;
  background: transparent;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
}
.btn-delete-project:hover { color: #ef4444; background: rgba(239, 68, 68, 0.08); }

/* PAGES LIST */
.pages-grid { display: flex; flex-direction: column; gap: 12px; }
.page-row { background: var(--bg-surface); border: 1px solid var(--border-main); border-radius: 14px; padding: 16px 24px; display: flex; align-items: center; gap: 20px; cursor: pointer; transition: all 0.2s; }
.page-row:hover { border-color: var(--brand-primary); transform: translateX(4px); box-shadow: var(--shadow-sm); }
.page-icon-box { width: 40px; height: 40px; background: var(--bg-surface-alt); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--brand-primary); }
.page-details { flex: 1; display: flex; flex-direction: column; }
.page-name { font-weight: 700; font-size: 15px; color: var(--text-main); }
.page-path { font-size: 13px; color: var(--text-muted); }
.page-status { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 700; color: var(--text-dim); text-transform: uppercase; }
.dot-badge { width: 8px; height: 8px; border-radius: 50%; }
.dot-badge.published { background: #10b981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.4); }
.dot-badge.draft { background: #6b7280; }
.page-actions { display: flex; align-items: center; gap: 8px; }
.btn-delete-page { background: transparent; border: none; cursor: pointer; color: var(--text-dim); padding: 6px; border-radius: 8px; display: flex; }
.btn-delete-page:hover { color: #ef4444; background: rgba(239, 68, 68, 0.08); }

/* MODALS */
.premium-card { background: var(--bg-surface); border: 1px solid var(--border-main); box-shadow: 0 20px 50px rgba(0,0,0,0.2); border-radius: 24px; }
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal-box { width: 100%; max-width: 460px; overflow: hidden; }
.modal-wide {
  width: fit-content;
  max-width: min(95vw, 1100px);
  min-width: min(900px, 95vw);
  box-sizing: border-box;
}
.modal-wide.modal-step-pick-mode {
  min-width: min(1040px, 96vw);
  max-width: min(98vw, 1180px);
}
.modal-step-pick-mode .modal-header {
  padding-bottom: 8px;
}
.modal-step-pick-mode .modal-body {
  padding-top: 4px;
  padding-bottom: 28px;
}
.modal-header { padding: 32px 32px 16px; display: flex; justify-content: space-between; align-items: flex-start; }
.modal-header h2 { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; margin: 0; }
.btn-close { background: var(--bg-surface-alt); border: none; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; color: var(--text-dim); cursor: pointer; transition: all 0.2s; }
.btn-close:hover { background: #ef4444; color: #fff; }

.modal-body { padding: 0 32px 24px; display: flex; flex-direction: column; gap: 16px; max-height: 70vh; overflow-y: auto; }
.input-group label { display: block; font-size: 12px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; }
.input-group input { width: 100%; height: 48px; background: var(--bg-main); border: 1px solid var(--border-main); border-radius: 12px; padding: 0 16px; color: var(--text-main); font-size: 15px; outline: none; transition: all 0.2s; }
.input-group input:focus { border-color: var(--brand-primary); box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }
.config-select {
  width: 100%;
  height: 44px;
  border: 1px solid var(--border-main);
  border-radius: 10px;
  background: var(--bg-main);
  color: var(--text-main);
  font-size: 14px;
  padding: 0 12px;
  outline: none;
}
.config-select:focus {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
}
.details-entry {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.modal-footer { padding: 24px 32px; background: var(--bg-surface-alt); border-top: 1px solid var(--border-main); display: flex; justify-content: flex-end; gap: 12px; }
.btn-cancel { background: var(--bg-surface-alt); border: none; color: var(--text-muted); padding: 10px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-cancel:hover { background: var(--bg-main); color: var(--text-main); }
.btn-submit { background: var(--brand-primary); color: #fff; border: none; padding: 10px 24px; border-radius: 10px; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2); }
.btn-submit:hover { background: var(--brand-primary-hover); transform: translateY(-1px); box-shadow: 0 6px 16px rgba(79, 70, 229, 0.3); }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

/* STACK SELECTION */
.stack-grid { display: flex; flex-direction: column; gap: 10px; margin-top: 8px; }
.stack-item { 
  padding: 14px 16px; background: var(--bg-main); border: 2px solid transparent; border-radius: 14px; 
  cursor: pointer; transition: all 0.2s; font-size: 14px; font-weight: 600; color: var(--text-muted);
  display: flex; align-items: center; justify-content: space-between;
}
.stack-item::after { content: ''; width: 18px; height: 18px; border: 2px solid var(--border-main); border-radius: 50%; transition: all 0.2s; }
.stack-item:hover { background: var(--bg-surface-alt); color: var(--text-main); }
.stack-item.selected { border-color: var(--brand-primary); background: var(--bg-surface-alt); color: var(--text-main); }
.stack-item.selected::after { background: var(--brand-primary); border-color: var(--brand-primary); box-shadow: inset 0 0 0 3px var(--bg-surface-alt); }
.stack-item.disabled { opacity: 0.45; cursor: not-allowed; }
.stack-item.disabled:hover { background: var(--bg-main); color: var(--text-muted); }
.stack-hint { margin-top: 8px; font-size: 12px; color: var(--text-dim); }

.cms-group-label {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--text-dim);
  padding: 8px 12px 4px;
  margin: 0;
}

.cms-item {
  font-size: 13px;
  padding: 8px 14px;
}

.cms-section-panel {
  border: 1px solid var(--border-main);
  border-radius: 14px;
  padding: 20px;
  background: var(--bg-surface);
}

.cms-section-panel h3 {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 800;
}

.cms-section-panel p {
  margin: 0;
  color: var(--text-muted);
}

.cms-section-actions {
  margin-top: 16px;
}

.cms-list {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.cms-list-item {
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  padding: 10px 12px;
  background: var(--bg-main);
  font-size: 13px;
  color: var(--text-main);
}

.plugin-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.plugin-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.plugin-meta strong {
  font-size: 13px;
}

.plugin-meta span {
  font-size: 11px;
  color: var(--text-muted);
}

.btn-plugin {
  border: 1px solid var(--border-main);
  background: var(--bg-surface-alt);
  color: var(--text-main);
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 10px;
  cursor: pointer;
}

.btn-plugin.installed {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.4);
  color: #047857;
}

.design-system-create {
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.design-system-create input[type="text"] {
  flex: 1;
  height: 38px;
  border-radius: 10px;
  border: 1px solid var(--border-main);
  background: var(--bg-main);
  padding: 0 12px;
  font-size: 13px;
}

.design-system-create label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
}

.component-preview-title {
  margin: 18px 0 10px;
  font-size: 14px;
  font-weight: 800;
}

.component-preview-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.component-card {
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  background: var(--bg-main);
  padding: 10px;
}

.component-name {
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 8px;
}

/* AI MODES — una sola fila horizontal */
.mode-selection-row .step-desc {
  margin-bottom: 16px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-muted);
}
.mode-grid-horizontal.mode-grid-single-row {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 14px;
  justify-content: center;
  align-items: stretch;
  overflow-x: auto;
  padding: 4px 8px 8px;
  width: max-content;
  max-width: 100%;
  margin: 0 auto;
  min-height: 0;
  -webkit-overflow-scrolling: touch;
}
.mode-grid-single-row .mode-card-v2 {
  flex: 0 0 auto;
  width: 196px;
  min-width: 196px;
  max-width: 196px;
  min-height: 268px;
  padding: 22px 14px 18px;
  gap: 12px;
  justify-content: flex-start;
}
.mode-grid-single-row .mode-viz {
  width: 58px;
  height: 58px;
  border-radius: 16px;
}
.mode-grid-single-row .mode-viz svg {
  width: 34px;
  height: 34px;
}
.mode-grid-single-row .mode-card-v2 h3 {
  font-size: 14px;
  line-height: 1.25;
  font-weight: 800;
}
.mode-grid-single-row .mode-card-v2 p {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 12px;
  line-height: 1.45;
  text-align: center;
  color: var(--text-muted);
  margin: 0;
  flex: 1;
}
.mode-grid-single-row .mode-badge {
  font-size: 10px;
  padding: 3px 8px;
  top: 10px;
  right: 10px;
}
.mode-card-v2.github.active { border-color: #238636; box-shadow: 0 10px 30px rgba(35, 134, 54, 0.12); }
.github-linked-banner {
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(35, 134, 54, 0.12);
  border: 1px solid rgba(35, 134, 54, 0.35);
  font-size: 13px;
  margin-bottom: 12px;
}
.hint-text { font-size: 13px; color: var(--text-muted); margin: 0 0 10px; }
.stack-hint.err { color: #b91c1c; }
.row-inline { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 520px) {
  .row-inline { grid-template-columns: 1fr; }
}
.mode-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(79, 70, 229, 0.14);
  color: var(--brand-primary);
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 800;
  z-index: 1;
}
.mode-card-v2 { border: 1px solid var(--border-main); border-radius: 20px; padding: 20px 12px; text-align: center; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; align-items: center; gap: 12px; position: relative; }
.mode-card-v2.active { border-color: var(--brand-primary); background: var(--bg-surface-alt); transform: scale(1.02); box-shadow: 0 10px 30px rgba(79, 70, 229, 0.15); }
.mode-viz { width: 64px; height: 64px; border-radius: 16px; background: var(--bg-main); display: flex; align-items: center; justify-content: center; color: var(--brand-primary); }
.mode-card-v2.active .mode-viz { background: var(--brand-primary); color: #fff; }
.mode-card-v2 h3 { font-size: 14px; font-weight: 700; margin: 0; }
.mode-card-v2 p { font-size: 11px; color: var(--text-muted); line-height: 1.4; margin: 0; }

/* ANIMATIONS */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.bounce-in { animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
@keyframes bounceIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
/* AI ARCHITECT MODAL ADJUSTMENT */
.modal-ai-architect {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  max-width: 640px !important;
}
/* Mantiene limpio el look del wizard, pero deja visible el footer para "Back to modes". */
.modal-ai-architect .modal-header {
  display: none;
}
.modal-ai-architect .modal-footer {
  display: flex;
  padding: 14px 0 0;
  background: transparent;
  border-top: none;
}
.modal-ai-architect .modal-body {
  padding: 0;
}
.ai-step-shell {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.ai-step-toolbar {
  display: flex;
  justify-content: flex-end;
}
.ai-back-btn {
  border: 1px solid var(--border-main);
  background: var(--bg-surface-alt);
  color: var(--text-main);
}
.ai-back-btn:hover {
  background: var(--bg-main);
}

</style>
