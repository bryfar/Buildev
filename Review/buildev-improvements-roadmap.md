# Buildev: Roadmap de Mejoras Arquitectónicas
## Competir con Webflow, Framer y similares YC

---

## 1. REORGANIZACIÓN DE ESTRUCTURA DE CARPETAS

### Estructura Actual
```
buildev/
├── apps/
│   ├── buildev-backend/
│   └── buildev-frontend/
├── packages/
│   ├── buildersite-domain/
│   └── buildersite-sdk/
└── package.json
```

### Estructura Propuesta
```
buildev/
├── apps/
│   ├── editor/                    # Nueva: Frontend principal (Vue 3)
│   │   ├── src/
│   │   │   ├── views/
│   │   │   │   ├── Onboarding.vue          # Flujo: IA/Figma/Imagen/Cero
│   │   │   │   ├── Editor.vue              # Canvas + Layers + Inspector
│   │   │   │   ├── CodeEditor.vue          # Monaco editor integrado
│   │   │   │   └── Export.vue              # ZIP + GitHub push
│   │   │   ├── components/
│   │   │   │   ├── DesignCanvas.vue        # Drag & drop canvas
│   │   │   │   ├── ComponentLibrary.vue    # Bloques preconstruidos
│   │   │   │   ├── AnimationPanel.vue      # Framer Motion, GSAP
│   │   │   │   └── ResponsivePreview.vue   # Desktop/Tablet/Mobile
│   │   │   └── store/
│   │   │       └── editor.ts               # Pinia store (state del proyecto)
│   │
│   ├── api/                       # Nueva: Backend (Express + Fastify)
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── projects.ts             # CRUD proyectos
│   │   │   │   ├── pages.ts                # CRUD páginas
│   │   │   │   ├── components.ts           # CRUD componentes
│   │   │   │   ├── export.ts               # ZIP + GitHub export
│   │   │   │   └── ai.ts                   # Rutas de IA
│   │   │   ├── services/
│   │   │   │   ├── figma.service.ts        # Integración Figma API
│   │   │   │   ├── image-parser.service.ts # Visión: Imagen → JSON
│   │   │   │   ├── code-generator.service.ts # Código con IA
│   │   │   │   ├── animation.service.ts    # Generador animaciones
│   │   │   │   ├── responsive.service.ts   # Auto-responsive
│   │   │   │   ├── export.service.ts       # ZIP + GitHub
│   │   │   │   └── github.service.ts       # GitHub API (crear repo)
│   │   │   ├── models/
│   │   │   │   ├── Project.ts
│   │   │   │   ├── Page.ts
│   │   │   │   ├── Component.ts
│   │   │   │   └── Style.ts
│   │   │   ├── queue/
│   │   │   │   └── jobs.ts                 # Bull/Bullmq para trabajos async
│   │   │   ├── ai/
│   │   │   │   ├── prompts.ts              # System prompts optimizados
│   │   │   │   └── client.ts               # Cliente Anthropic/OpenAI
│   │   │   └── utils/
│   │   │       └── code-formatter.ts       # Prettier + ESLint integration
│   │
│   └── dashboard/                 # Nueva: Admin (Next.js)
│       └── src/
│           ├── pages/
│           │   ├── projects.tsx            # Listado de proyectos
│           │   ├── [projectId]/editor.tsx  # Editor visual
│           │   └── analytics.tsx           # Métricas de usuario
│
├── packages/
│   ├── domain/                    # Renamed: tipos compartidos
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   ├── page.ts
│   │   │   │   ├── component.ts
│   │   │   │   ├── style.ts
│   │   │   │   └── animation.ts
│   │   │   ├── constants/
│   │   │   │   ├── frameworks.ts           # Front: React, Vue, Svelte...
│   │   │   │   ├── backends.ts             # Back: Node, Python, Go...
│   │   │   │   ├── animations.ts           # Framer Motion, GSAP, etc
│   │   │   │   └── ui-components.ts        # Button, Card, Form...
│   │   │   └── validators/
│   │   │       └── project.schema.ts       # Zod schemas
│   │
│   ├── sdk/                       # Renamed: SDK para consumir proyectos
│   │   ├── src/
│   │   │   ├── core/
│   │   │   │   ├── client.ts
│   │   │   │   └── types.ts
│   │   │   ├── renderers/
│   │   │   │   ├── react.tsx               # React renderer
│   │   │   │   ├── vue.ts                  # Vue renderer
│   │   │   │   └── static.ts               # HTML estático
│   │   │   ├── generators/
│   │   │   │   └── code.ts                 # Genera código a partir JSON
│   │   │   └── cli/
│   │   │       ├── index.ts                # CLI entry point
│   │   │       ├── create.ts               # create-buildev-app
│   │   │       ├── export.ts               # buildev export
│   │   │       └── deploy.ts               # buildev deploy
│   │
│   ├── ui-library/                # Nueva: Componentes pre-construidos
│   │   └── src/
│   │       ├── components/
│   │       │   ├── Button.tsx
│   │       │   ├── Card.tsx
│   │       │   ├── Form.tsx
│   │       │   ├── Hero.tsx
│   │       │   ├── Navbar.tsx
│   │       │   └── Footer.tsx
│   │       └── variants.ts                 # Sistema de variantes
│   │
│   └── ai-prompts/                # Nueva: System prompts optimizados
│       └── src/
│           ├── page-generation.ts
│           ├── code-refactoring.ts
│           ├── image-to-component.ts
│           ├── animation-generation.ts
│           └── style-generation.ts
│
├── docs/                          # Nueva: Documentación
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── SDK.md
│   └── CONTRIBUTING.md
│
├── examples/                      # Nueva: Ejemplos de integración
│   ├── nextjs-app/
│   ├── nuxt-app/
│   ├── astro-site/
│   └── vanilla-js/
│
├── docker/                        # Nueva: Despliegue
│   ├── Dockerfile.api
│   ├── Dockerfile.editor
│   └── docker-compose.yml
│
└── .github/
    ├── workflows/
    │   ├── test.yml
    │   ├── deploy.yml
    │   └── publish-sdk.yml
    └── ISSUE_TEMPLATE/
```

---

## 2. FUNCIONALIDADES CRÍTICAS POR MÓDULO

### A. ONBOARDING (Flujo Inicial)

**Endpoint: POST /api/projects/create**

```typescript
// Request
{
  "name": "My Landing Page",
  "type": "ai" | "figma" | "image" | "blank",
  "frontendFramework": "react" | "vue" | "svelte" | "next" | "nuxt",
  "backendFramework": "node" | "python" | "go",
  
  // Si type === "ai"
  "aiPrompt": "Build a modern SaaS landing page...",
  
  // Si type === "figma"
  "figmaUrl": "https://figma.com/file/...",
  "figmaToken": "figi_...",
  
  // Si type === "image"
  "imageUrl": "https://...", // O file upload
}

// Response
{
  "projectId": "uuid",
  "editorUrl": "https://editor.buildev.app/projects/{projectId}",
  "defaultBranch": "main",
  "structure": {
    "frontend": "react",
    "backend": "node",
    "components": [],
    "pages": []
  }
}
```

### B. CONVERSIÓN FIGMA → CÓDIGO

**Service: apps/api/src/services/figma.service.ts**

```typescript
import axios from 'axios';
import { parseFigmaDesign } from '@buildev/figma-parser';

export class FigmaService {
  async convertFigmaToProject(figmaUrl: string, token: string) {
    // 1. Fetch Figma file via API
    const figmaFile = await this.getFigmaFile(figmaUrl, token);
    
    // 2. Parse componentes, estilos, colores
    const designSystem = this.extractDesignSystem(figmaFile);
    
    // 3. Generar JSON structure
    const projectStructure = await this.generateProjectStructure(figmaFile);
    
    // 4. Generar código React/Vue con IA
    const generatedCode = await this.generateCodeFromStructure(projectStructure);
    
    return {
      pages: generatedCode.pages,
      components: generatedCode.components,
      styles: designSystem.colors,
      animations: []
    };
  }

  private extractDesignSystem(figmaFile: any) {
    // Extraer colores, tipografías, espaciado
    return {
      colors: figmaFile.styles.fills,
      typography: figmaFile.styles.text,
      spacing: this.inferSpacing(figmaFile.document)
    };
  }
}
```

### C. CONVERSIÓN IMAGEN → CÓDIGO (Pixel Perfect)

**Service: apps/api/src/services/image-parser.service.ts**

```typescript
import Anthropic from "@anthropic-ai/sdk";

export class ImageParserService {
  private client = new Anthropic();

  async parseImageToComponent(imageUrl: string) {
    // 1. Enviar imagen a Claude Vision
    const response = await this.client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "url",
                url: imageUrl,
              },
            },
            {
              type: "text",
              text: `Analiza esta imagen de un diseño web y devuelve:
1. Estructura HTML/JSX exacta (pixel perfect)
2. Tailwind CSS classes para replicas exacta de estilos
3. Tipo de componentes (Hero, Card, Form, etc)
4. Responsive breakpoints identificados

Formato JSON:
{
  "structure": "<jsx>",
  "styles": "tailwind-classes",
  "componentType": "Hero | Card | Form | etc",
  "responsive": { "mobile": "...", "tablet": "...", "desktop": "..." }
}`,
            },
          ],
        },
      ],
    });

    return JSON.parse(response.content[0].type === "text" ? response.content[0].text : "{}");
  }
}
```

### D. GENERADOR DE CÓDIGO CON IA

**Service: apps/api/src/services/code-generator.service.ts**

```typescript
import Anthropic from "@anthropic-ai/sdk";

export class CodeGeneratorService {
  private client = new Anthropic();
  private prompts = require("@buildev/ai-prompts");

  async generateComponent(designData: any, framework: "react" | "vue" | "svelte") {
    const systemPrompt = this.prompts.componentGeneration({
      framework,
      componentType: designData.type,
      hasAnimation: !!designData.animations,
    });

    const response = await this.client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 8000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Genera componente ${framework} pixel-perfect para:
${JSON.stringify(designData, null, 2)}

Requisitos:
- Responsive (mobile-first)
- TypeScript strict mode
- Accesible (ARIA labels)
- Animaciones si aplica`,
        },
      ],
    });

    // Parsear y formatear código
    const code = this.extractCodeBlock(response.content[0].type === "text" ? response.content[0].text : "");
    return this.formatWithPrettier(code, framework);
  }

  private extractCodeBlock(text: string): string {
    const match = text.match(/```(?:jsx?|tsx?|vue)?\n([\s\S]*?)```/);
    return match ? match[1] : text;
  }
}
```

### E. AUTO-RESPONSIVE GENERATOR

**Service: apps/api/src/services/responsive.service.ts**

```typescript
export class ResponsiveService {
  async generateResponsiveStyles(baseStyles: CSSObj) {
    // 1. Analizar breakpoints actuales
    // 2. Generar variantes para mobile/tablet/desktop
    // 3. Aplicar mobile-first methodology
    
    return {
      mobile: this.generateMobileStyles(baseStyles),
      tablet: this.generateTabletStyles(baseStyles),
      desktop: baseStyles, // Base es desktop
      fluid: this.generateFluidScaling(baseStyles) // Escalado fluido
    };
  }

  private generateFluidScaling(styles: CSSObj) {
    // Usar clamp() para scaling automático
    return {
      fontSize: `clamp(1rem, 2.5vw, 2rem)`,
      padding: `clamp(1rem, 5vw, 3rem)`,
      // etc...
    };
  }
}
```

### F. EXPORT COMO ZIP + GITHUB

**Service: apps/api/src/services/export.service.ts**

```typescript
import { Octokit } from "@octokit/rest";
import archiver from "archiver";

export class ExportService {
  private octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  async exportAsZip(projectId: string): Promise<Buffer> {
    const project = await this.getProject(projectId);
    
    // 1. Generar estructura completa
    const files = await this.generateProjectFiles(project);
    
    // 2. Crear ZIP
    const zip = archiver("zip");
    for (const [path, content] of Object.entries(files)) {
      zip.append(content, { name: path });
    }
    
    return zip.finalize();
  }

  async pushToGithub(projectId: string, githubToken: string) {
    const project = await this.getProject(projectId);
    const userOctokit = new Octokit({ auth: githubToken });
    
    // 1. Crear repositorio
    const repo = await userOctokit.repos.createForAuthenticatedUser({
      name: project.name,
      description: `Created with Buildev`,
      private: false,
    });
    
    // 2. Generar archivos
    const files = await this.generateProjectFiles(project);
    
    // 3. Push a GitHub (commit todo)
    for (const [path, content] of Object.entries(files)) {
      await userOctokit.repos.createOrUpdateFileContents({
        owner: repo.data.owner.login,
        repo: repo.data.name,
        path,
        message: `Initial commit from Buildev`,
        content: Buffer.from(content as string).toString("base64"),
      });
    }
    
    return repo.data.html_url;
  }

  private async generateProjectFiles(project: Project) {
    return {
      "package.json": await this.generatePackageJson(project),
      "tsconfig.json": await this.generateTsConfig(project),
      ".env.example": await this.generateEnvExample(project),
      "src/index.tsx": await this.generateEntry(project),
      "README.md": await this.generateReadme(project),
      // ... más archivos
    };
  }

  private async generatePackageJson(project: Project) {
    return JSON.stringify({
      name: project.name,
      version: "0.1.0",
      scripts: {
        dev: project.frontend === "next" ? "next dev" : "vite",
        build: project.frontend === "next" ? "next build" : "vite build",
      },
      dependencies: this.getDependencies(project.frontend),
      devDependencies: this.getDevDependencies(project.frontend),
    }, null, 2);
  }
}
```

### G. ANIMACIONES AUTOMÁTICAS

**Service: apps/api/src/services/animation.service.ts**

```typescript
export class AnimationService {
  async generateAnimations(component: Component, animationType: string) {
    // Soportar: Framer Motion, GSAP, CSS Animations, Tailwind Motion
    
    const animations = {
      "fade-in": this.generateFadeIn(component),
      "slide-up": this.generateSlideUp(component),
      "bounce": this.generateBounce(component),
      "fade-up": this.generateFadeUp(component),
      // etc...
    };
    
    return animations[animationType];
  }

  private generateFadeIn(component: Component) {
    // Framer Motion
    return {
      framework: "framer-motion",
      code: `
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      `
    };
  }
}
```

---

## 3. BASE DE DATOS MEJORADA (Prisma Schema)

```prisma
// prisma/schema.prisma

model User {
  id          String    @id @default(cuid())
  email       String    @unique
  githubId    String?   @unique
  figmaToken  String?   @encrypted
  projects    Project[]
  createdAt   DateTime  @default(now())
}

model Project {
  id                String    @id @default(cuid())
  name              String
  type              String    // "ai" | "figma" | "image" | "blank"
  frontendFramework String    // "react" | "vue" | "svelte"
  backendFramework  String    // "node" | "python"
  
  userId            String
  user              User      @relation(fields: [userId], references: [id])
  
  pages             Page[]
  components        Component[]
  designSystem      DesignSystem?
  
  // Para export
  githubUrl         String?
  githubBranch      String?   @default("main")
  lastExportedAt    DateTime?
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

model Page {
  id          String    @id @default(cuid())
  projectId   String
  project     Project   @relation(fields: [projectId], references: [id])
  
  name        String
  slug        String
  
  jsonData    String    // Serialized design tree
  metadata    Json      // SEO, etc
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Component {
  id          String    @id @default(cuid())
  projectId   String
  project     Project   @relation(fields: [projectId], references: [id])
  
  name        String
  type        String    // "Button", "Card", "Hero", etc
  
  jsonData    String    // Design structure
  code        String    // Generated code
  styles      Json      // CSS/Tailwind
  animations  Json      // Animation config
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model DesignSystem {
  id          String    @id @default(cuid())
  projectId   String    @unique
  project     Project   @relation(fields: [projectId], references: [id])
  
  colors      Json      // Color palette
  typography  Json      // Font families, sizes
  spacing     Json      // Spacing scale
  shadows     Json      // Shadow definitions
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

---

## 4. DEPENDENCIAS CLAVE A AÑADIR

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.20.0",
    "@figma/rest-api-spec": "^1.0.0",
    "@octokit/rest": "^20.0.0",
    "bull": "^4.14.0",
    "prisma": "^5.22.0",
    "claude-vision": "latest",
    "framer-motion": "^10.0.0",
    "gsap": "^3.12.0",
    "tailwindcss": "^3.3.0",
    "prettier": "^3.0.0",
    "zod": "^3.23.0",
    "archiver": "^6.0.0",
    "sharp": "^0.33.0",
    "multer": "^1.4.5"
  }
}
```

---

## 5. DOCUMENTACIÓN CLAVE

Crear estos archivos en `/docs`:

1. **ARCHITECTURE.md** - Diagrama completo del flujo
2. **API.md** - Endpoints y ejemplos
3. **SDK.md** - Cómo usar SDK en proyectos externos
4. **CONTRIBUTING.md** - Guía para contribuidores
5. **DEPLOYMENT.md** - Cómo desplegar en Vercel/Railway

---

## 6. CLI PARA USUARIOS

```bash
# Instalar SDK como herramienta global
npm install -g buildev

# Crear nuevo proyecto desde Buildev
buildev create my-project
# → Pregunta: Descargar del editor web? O desde archivo local?

# Exportar proyecto descargado
cd my-project
buildev export

# Desplegar a Vercel
buildev deploy --platform vercel

# Abrir en editor web
buildev open
```

---

## 7. ROADMAP DE IMPLEMENTACIÓN

### Fase 1 (Semanas 1-4): Core Architecture
- Reorganizar carpetas
- Implementar servicios base (Figma, Image Parser, Code Generator)
- Setup base de datos
- Crear endpoints principales

### Fase 2 (Semanas 5-8): IA Integration
- Integración Claude Vision
- Prompts optimizados
- Code generation pipeline
- Testing exhaustivo

### Fase 3 (Semanas 9-12): Export & GitHub
- Export ZIP
- GitHub push automático
- CLI herramienta
- Documentación completa

### Fase 4 (Semanas 13+): Escala
- Marketplace de componentes
- Plantillas preconstruidas
- Hosting integrado
- Analytics & usage monitoring

---

## 8. COMPARACIÓN: TU POSICIÓN VS COMPETENCIA

| Feature | Webflow | Framer | Buildev (Tu visión) |
|---------|---------|--------|---------------------|
| Drag & Drop | ✅ | ✅ | ✅ |
| IA Asistente | ❌ | ✅ | ✅✅ (Multimodal) |
| Figma Import | ❌ | Parcial | ✅ Full |
| Image to Code | ❌ | ❌ | ✅ |
| Code Export | ✅ | ✅ | ✅ (Git) |
| Developer-Friendly | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| No-Code Path | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |

Tu ventaja: **Dual path (Dev + No-Dev) + IA fuerte + Export limpio**

---

## SIGUIENTES PASOS

1. Crear rama `architecture-refactor` en tu repo
2. Implementar cambios de estructura carpetas
3. Crear tabla de base de datos mejorada
4. Implementar servicios críticos en orden:
   - Figma Parser
   - Image Parser
   - Code Generator
   - Export Service
5. Documentar todo

¿Quieres que empiece a crear archivos específicos para cualquiera de estos módulos?
