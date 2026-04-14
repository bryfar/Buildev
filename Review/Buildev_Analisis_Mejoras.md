# Buildev — Análisis Completo + Plan de Mejoras
**Basado en:** 4 documentos estratégicos + estado actual del repo + análisis de una referencia de mercado
*Abril 2026*

---

## 1. ESTADO REAL DEL REPO HOY

| Métrica | Buildev | Referencia comparativa |
|---|---|---|
| Stars | 0 | 38 |
| Commits | 1 | 53 |
| Contributors | 1 | 3 |
| Releases | 0 | 34 |
| node_modules en repo | ✅ (crítico) | ✗ |
| .gitignore | ✗ | ✅ |
| LICENSE | ✅ (ya existe) | ✅ MIT |
| CONTRIBUTING.md | ✗ | ✅ |
| AGENTS.md | ✗ | ✅ |
| CI/CD | ✗ | ✅ |
| Naming consistente | ✗ (@buildersite) | ✅ |
| Changesets | ✗ | ✅ |
| Renovate | ✗ | ✅ |
| Templates / demos | ✗ | ✅ |
| `npm create` scaffolding | ✗ | ✅ |
| MCP Server | ✗ | ✅ |

---

## 2. DIFERENCIAS CLAVE: PATRONES QUE BUILDEV DEBE APRENDER

Estudiando un repositorio de referencia comparable, hay **7 patrones concretos** que Buildev debe copiar inmediatamente:

### 2.1 `.claude/` folder (no solo CLAUDE.md)
Ese proyecto no tiene un solo `CLAUDE.md` en la raíz — tiene una **carpeta `.claude/`** con contexto modular. Esto permite progressive disclosure: el agente carga solo el contexto relevante para la tarea actual.

```
.claude/
  commands/          # Comandos custom para Claude Code
  settings.json      # Configuración de la sesión
```

Acción: Crear `.claude/` folder además del `CLAUDE.md` en raíz.

### 2.2 `.opencode/` folder
Ese enfoque incluye compatibilidad explícita con OpenCode (el AI coding agent de OpenAI). Esto amplía la comunidad que puede contribuir usando su tool preferida.

```
.opencode/
  AGENTS.md          # Instrucciones específicas para OpenCode
```

### 2.3 `skills/` folder (agent skills)
Incluye un directorio `skills/` con archivos que enseñan a los agentes AI cómo construir plugins y themes para el proyecto. Esto es un **diferenciador enorme para atraer contribuidores**: el agente puede auto-aprender la arquitectura.

Para Buildev esto sería:
```
skills/
  create-component.md    # Cómo crear un nuevo componente en el canvas
  add-codegen-target.md  # Cómo añadir un nuevo framework de export
  add-ai-provider.md     # Cómo añadir un nuevo proveedor de LLM
  create-plugin.md       # Cómo crear plugins para el block marketplace
```

### 2.4 Changesets para versioning automático
Usa `.changeset/` para gestionar versiones y generar changelogs automáticamente. Cada PR que modifica código incluye un changeset file. En el momento del release, se calculan automáticamente las versiones semánticas y se genera el CHANGELOG.

```bash
pnpm changeset        # El contribuidor describe su cambio
pnpm changeset version # Bump versions + update CHANGELOG
pnpm changeset publish # Publica a npm
```

Para Buildev: `yarn changeset` con el plugin de Yarn 4.

### 2.5 Renovate para dependency updates automáticos
Define `renovate.json` para abrir PRs automáticos cuando hay actualizaciones de dependencias. En un proyecto open source donde no hay un equipo full-time revisando deps, esto es esencial para la seguridad y mantenimiento.

```json
// renovate.json mínimo
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["config:base"],
  "automerge": true,
  "automergeType": "pr",
  "packageRules": [
    {
      "matchUpdateTypes": ["minor", "patch"],
      "automerge": true
    }
  ]
}
```

### 2.6 `knip.json` para detectar código muerto
Usa Knip, una herramienta que detecta exports, archivos y dependencias no usadas en el monorepo. En un proyecto con múltiples packages, esto previene que el repo se llene de código zombie.

### 2.7 `tsconfig.base.json` + herencia por package
Expone un `tsconfig.base.json` en la raíz que todos los packages extienden. Esto garantiza configuración consistente de TypeScript sin duplicación.

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "moduleResolution": "bundler"
  }
}
```

---

## 3. CORRECCIONES CRÍTICAS (SEMANA 1) — ORDEN DE EJECUCIÓN

Tomando los documentos + el análisis de referencia, este es el orden exacto:

### Paso 1: Eliminar node_modules (15 min)
```bash
git rm -r --cached node_modules
echo "node_modules/" >> .gitignore
git add .gitignore
git commit -m "chore: remove node_modules and add .gitignore"
git push origin main
```

### Paso 2: .gitignore completo
```
# Dependencies
node_modules/
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/sdks
!.yarn/versions

# Build
dist/
build/
.output/
.nuxt/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Database
*.db
*.sqlite
prisma/*.db

# Testing
coverage/
```

### Paso 3: Renaming de packages
```bash
# En cada package.json reemplazar @buildersite/* → @buildev/*
# @buildersite/frontend → @buildev/editor
# @buildersite/backend  → @buildev/api
# @buildersite/domain   → @buildev/core
# @buildersite/sdk      → @buildev/sdk
```

### Paso 4: Crear archivos de comunidad
- `CONTRIBUTING.md` — guía de contribución con setup en <2 min
- `CODE_OF_CONDUCT.md` — Contributor Covenant
- `CLAUDE.md` — contexto para Claude Code (ver Vibe Coding Plan)
- `AGENTS.md` — contexto cross-tool (ver Vibe Coding Plan)

### Paso 5: GitHub Actions CI
```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: yarn
      - run: yarn install --immutable
      - run: yarn lint
      - run: yarn typecheck
      - run: yarn test --if-present
      - run: yarn build
```

### Paso 6: Configuración adicional (patrones del referente)
```bash
# Changesets
yarn add -D @changesets/cli
yarn changeset init

# Knip
yarn add -D knip
# Crear knip.json

# Renovate
# Instalar la GitHub App de Renovate en el repo

# tsconfig.base.json en raíz

# .claude/ folder
mkdir .claude

# skills/ folder
mkdir skills
```

---

## 4. README MEJORADO — ESTRUCTURA EXACTA

El README actual de Buildev es funcional pero le falta el **elemento más importante**: un GIF animado del producto en acción. Comparando con el referente:

| Elemento | Buildev actual | Referente | Recomendado |
|---|---|---|---|
| Hero GIF/video | ✗ (solo imagen estática) | ✗ | ✅ CRÍTICO |
| Deploy button | ✗ | ✅ (Deploy to Cloudflare) | ✅ "Deploy to Vercel" |
| Badges CI/npm | ✗ | ✗ | ✅ |
| Tabla comparativa | ✗ | ✗ | ✅ |
| Quick Start en <3 comandos | ✅ (parcial) | ✅ (1 comando) | ✅ |
| Roadmap visible | ✅ | ✗ | ✅ |
| `npm create` / scaffolding | ✗ | ✅ | ✅ Fase 3 |

### Estructura del README perfecto para Buildev:

```markdown
# Buildev — Open Source AI Web Builder

[GIF animado: drag&drop → código TypeScript generado en tiempo real]

[Badges: CI | License | npm | Discord | Stars]

> The VS Code of web builders. Design visually. Export clean code.
> Open source, AI-native, multi-framework, zero vendor lock-in.

## Why Buildev?

| | Webflow | Framer | V0 | Lovable | **Buildev** |
|---|---|---|---|---|---|
| Open Source | ✗ | ✗ | ✗ | ✗ | **✅ MIT** |
| Visual Editor | ✅ | ✅ | ✗ | ✗ | **✅** |
| AI Chat | ✗ | ✗ | ✅ | ✅ | **✅ BYOK** |
| Export Clean Code | ✗ | ✗ | ✅ React | ✅ React | **✅ React/Vue/Svelte** |
| Figma Import | ✗ | partial | ✅ | ✅ | **✅ Pixel-perfect** |
| Self-hostable | ✗ | ✗ | ✗ | ✗ | **✅** |
| Price | $29+/mo | $15+/mo | $20+/mo | $25+/mo | **$0 forever** |

## Quick Start

\`\`\`bash
git clone https://github.com/bryfar/Buildev.git
cd Buildev && yarn install
yarn dev
\`\`\`

[Deploy to Vercel button]  [Deploy to Railway button]

## 4 Ways to Build

[Screenshot: AI Mode] [Screenshot: Figma Import] [Screenshot: Image→Code] [Screenshot: Drag&Drop]

## Roadmap

- [x] Visual drag & drop editor (Monaco Code Mode)
- [x] Design tokens system
- [ ] AI Mode (BYOK: Claude, GPT, Ollama)
- [ ] Figma Import (pixel-perfect)
- [ ] Image → Code
- [ ] Real-time collaboration (Y.js)
- [ ] Block marketplace

## Contributing

See CONTRIBUTING.md. Good first issues labeled 👇
[Good first issues badge]
```

---

## 5. ARQUITECTURA TÉCNICA — BRECHAS IDENTIFICADAS

Comparando los documentos con la realidad del repo, hay 3 brechas críticas de arquitectura que no están en los documentos actuales:

### Brecha 1: No hay `create-buildev` scaffolding
Ofrece un flujo tipo `npm create <paquete>@latest`. Esto es **enorme** para adopción: un dev puede probar el builder sin clonar el repo completo. Para Buildev:

```bash
npm create buildev@latest
# → Pregunta: Framework? (React/Vue/Svelte/HTML)
# → Genera proyecto listo para abrir en el builder
```

Esto debería ser el **packages/create-buildev** en el monorepo. Prioridad: Fase 3 del roadmap.

### Brecha 2: No hay MCP Server
Incluye un MCP server que permite a Claude y otros AI tools interactuar directamente con el CMS. Para Buildev, un MCP server permitiría:

- Que Claude pueda crear páginas en el builder via chat
- Que el usuario describa un sitio y Claude lo construya sin abrir el browser
- Integración con Claude Code para agents que construyen sitios programáticamente

```typescript
// packages/mcp-server/src/index.ts
// Herramientas MCP que exponer:
// - create_page(name, framework)
// - add_component(pageId, componentType, props)
// - export_project(projectId, format)
// - apply_design_token(tokenName, value)
```

Esto sería un **diferenciador enorme** para posicionamiento AI-native. Agregar en Fase 4.

### Brecha 3: El AST no está documentado para agentes
Apalanca `skills/` para enseñar a los agentes. Buildev tiene `docs/agent/` planeado pero no ejecutado. Sin esta documentación, los contribuidores no pueden usar Claude Code efectivamente.

Archivos mínimos para crear HOY:
```
docs/agent/ast-schema.md     → Qué es BuildevNode, sus tipos, reglas
docs/agent/codegen.md        → Cómo AST → código por framework  
docs/agent/canvas.md         → Cómo el canvas renderiza el árbol
docs/agent/ai-engine.md      → Cómo funciona BYOK multi-LLM
docs/agent/testing.md        → Cómo testear cada parte
```

---

## 6. STACK ACTUALIZADO — RECOMENDACIONES

Comparando el stack actual de Buildev con el referente y el estado del arte:

| Área | Buildev actual | Referente | Recomendación |
|---|---|---|---|
| Package manager | Yarn 4 | pnpm | Mantener Yarn 4 (funciona bien) |
| Linter | No configurado | oxlint | Oxlint (10-100x más rápido que ESLint) |
| Formatter | No configurado | oxfmt + prettier | Prettier (más compatible con Vue) |
| Dead code | No | knip | Knip |
| Dep updates | No | renovate | Renovate GitHub App |
| Versioning | No | changesets | Changesets |
| Testing e2e | No | playwright | Playwright (ya en el plan) |
| Deploy CI | No | GitHub Actions | GitHub Actions |

### Oxlint para Buildev (en lugar de ESLint)
```bash
yarn add -D @oxlint/oxlint
# oxlint es 50-100x más rápido que ESLint
# Compatible con la mayoría de reglas de ESLint
# Configurar en .oxlintrc.json
```

---

## 7. COMPARATIVA BUILDEV VS REFERENTE — APRENDIZAJES CLAVE

Esa línea de producto y Buildev no compiten en el mismo nicho (uno apuesta por CMS con Astro/Cloudflare; Buildev es un visual builder con export de código). Aun así, sirve como ejemplo de cómo ejecutar un proyecto open source TypeScript en 2026.

**Lo que el referente hace mejor:**

1. **Velocidad de releases** — 34 releases en ~2 meses = una release cada 2 días. Cada release es contenido para postear, razón para que la gente vuelva al repo, y señal de que el proyecto está vivo.

2. **`npm create` como primer punto de entrada** — El dev no necesita clonar el repo para probar el producto. Reduce la fricción al mínimo absoluto.

3. **Integración con Cloudflare Workers** — Buildev debería tener un equivalente: "Deploy to Vercel" / "Deploy to Cloudflare" button en el README que lanza la instancia del builder en un click.

4. **Templates listos para usar** — Incluye blog, marketing, portfolio. Para Buildev: tener 3-5 proyectos demo pre-cargados en el builder (landing page SaaS, portfolio, e-commerce básico) que el usuario puede clonar y editar.

5. **Sandboxed plugins** — Un sistema de plugins con capabilities declaradas es brillante para seguridad. Para Buildev: el block marketplace debería tener un modelo de seguridad similar donde cada plugin declara qué permisos necesita.

**Lo que Buildev hace mejor (ventaja frente al referente):**

1. El posicionamiento como "AI-native visual builder" tiene mucho mayor potencial viral que un CMS. Los GIFs de "prompt → website" generan más engagement que cualquier feature de CMS.

2. La propuesta de multi-framework (React/Vue/Svelte) es más amplia que una apuesta solo Astro.

3. BYOK es un diferenciador enorme que el referente no cubre con el mismo énfasis.

---

## 8. CHECKLIST MAESTRO ACTUALIZADO (incorporando el análisis de referencia)

### Semana 1: Fundación (crítico antes de cualquier promo)

**Repo hygiene:**
- [ ] Eliminar node_modules + crear .gitignore
- [ ] Renombrar @buildersite/* → @buildev/*
- [ ] Verificar que LICENSE existe (ya está ✅)
- [ ] Crear CONTRIBUTING.md
- [ ] Crear CODE_OF_CONDUCT.md

**Archivos de agentes AI:**
- [ ] Crear CLAUDE.md (ver Vibe Coding Plan sección 1)
- [ ] Crear AGENTS.md (ver Vibe Coding Plan sección 2)
- [ ] Crear .claude/ folder con commands/
- [ ] Crear .opencode/ folder
- [ ] Crear docs/agent/ con 5 archivos de contexto

**Configuración de calidad:**
- [ ] GitHub Actions CI (lint + typecheck + build)
- [ ] Crear tsconfig.base.json en raíz
- [ ] Instalar oxlint + prettier
- [ ] Instalar knip
- [ ] Instalar changesets
- [ ] Configurar Renovate GitHub App

**GitHub repo settings:**
- [ ] Habilitar Discussions
- [ ] Agregar topics: web-builder, ai, typescript, vue, visual-editor, open-source
- [ ] Crear issue templates (bug + feature request)
- [ ] Crear PR template
- [ ] Agregar description al repo

### Pre-launch (semana 6):
- [ ] GIF del builder en acción (el más importante de todos)
- [ ] README rediseñado con GIF hero + tabla comparativa
- [ ] "Deploy to Vercel" button en README
- [ ] Demo deployada en Vercel (URL para mostrar)
- [ ] 3+ releases publicadas (v0.1.0, v0.2.0, v0.3.0)
- [ ] 5+ good first issues abiertos

### Extras del referente a implementar (Fase 3-4):
- [ ] `packages/create-buildev` — scaffolding npm create
- [ ] `packages/mcp-server` — MCP server para integración con Claude
- [ ] `templates/` folder — 3 proyectos demo pre-cargados
- [ ] `skills/` folder — agent skills para contribuidores
- [ ] Deploy to Cloudflare Workers option

---

## 9. PITCH FINAL MEJORADO (incorporando todo)

El pitch original del Plan de Acción es sólido. Con los aprendizajes del análisis de referencia, se puede fortalecer así:

**Versión corta (Show HN title):**
> "Show HN: Buildev — Open Source AI Web Builder. Design visually, export clean React/Vue/Svelte. BYOK AI, zero vendor lock-in."

**Versión para inversores (60 segundos):**
> Webflow hace $100M+/año vendiendo lock-in. Framer vale $4B haciendo lo mismo. Lovable llegó a $200M ARR atando devs a React + Supabase. El mercado de website builders vale $10B+. Buildev es la primera herramienta que combina visual drag & drop + AI (BYOK) + Figma import + Image-to-code, en un solo producto open source que exporta código limpio en el framework que el dev elija. MIT license, self-hosteable, zero lock-in. Monetizamos con cloud hosting, colaboración enterprise, y deploy one-click — el modelo que hizo exitosos a Supabase, GitLab, y PostHog en YC.

---

*Buildev — Bridge the gap between Visual Design and Production Code*
*github.com/bryfar/Buildev*
