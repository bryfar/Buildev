# Quick Start Guide - Mobile-First Responsive Design

## Setup Rápido

### 1. Verificar Gemini API en `.env`
```env
GEMINI_API=tu_clave_api_aqui
```

### 2. Archivos Principales Creados/Modificados

| Archivo | Cambio | Propósito |
|---------|--------|----------|
| `app/api/generate-responsive/route.ts` | ✨ Nuevo | Genera tablet/desktop automáticamente |
| `app/api/generate-component/route.ts` | 📝 Modificado | Mobile-first, con opción responsive |
| `lib/aiService.ts` | 📝 Modificado | Nuevas funciones de responsive |
| `lib/responsiveUtils.ts` | ✨ Nuevo | Utilidades para responsive design |
| `lib/store.ts` | 📝 Modificado | Breakpoints mobile-first |
| `app/components/ResponsiveComponentGenerator.tsx` | ✨ Nuevo | UI para generar componentes |

### 3. Breakpoints (Mobile-First)

```
Mobile   → 375px  (BASE/PRIMARY)
Tablet   → 768px  (Auto-generado)
Desktop  → 1024px (Auto-generado)
```

## Uso

### Opción 1: Generar con Responsive Automático (Recomendado)

```typescript
import { generateComponentWithResponsiveVariants } from '@/lib/aiService';
import { createSiteElementFromComponent } from '@/lib/responsiveUtils';
import { useAppStore } from '@/lib/store';

const store = useAppStore();

// Paso 1: Generar con variantes automáticas
const result = await generateComponentWithResponsiveVariants(
  "Un hero section con título y botón"
);

// Paso 2: Crear elemento
const element = createSiteElementFromComponent(
  result.mobile,
  result.responsive
);

// Paso 3: Agregar a canvas
store.addElement(element);

// Paso 4: Ver diferentes breakpoints
store.setActiveBreakpoint('mobile');   // 375px
store.setActiveBreakpoint('tablet');   // 768px (generado)
store.setActiveBreakpoint('desktop');  // 1024px (generado)
```

### Opción 2: Solo Mobile

```typescript
const component = await generateComponentWithAI("descripción");
const element = createSiteElementFromComponent(component);
store.addElement(element);
```

### Opción 3: Agregar Responsive a Elemento Existente

```typescript
const responsiveDesign = await generateResponsiveDesigns(
  mobileComponent,
  "descripción"
);

// Ahora el elemento tiene tablet y desktop variants
```

## APIs Disponibles

### Cliente

```typescript
// lib/aiService.ts
generateComponentWithAI(prompt)              // Mobile solo
generateResponsiveDesigns(component, desc)   // Tablet + Desktop
generateComponentWithResponsiveVariants(p)   // Todo en uno

// lib/responsiveUtils.ts
createSiteElementFromComponent(comp, resp)   // Convierte a SiteElement
getResponsiveElementProperties(elem, bp)     // Propiedades por breakpoint
isValidResponsiveDesign(design)              // Valida output Gemini
```

### Servidor

```
POST /api/generate-component
  Request: { prompt, generateResponsive? }
  Response: { name, type, x, y, width, height, ... responsive? }

POST /api/generate-responsive
  Request: { mobileDesign, componentName, description? }
  Response: { responsive: { tablet: {...}, desktop: {...} } }
```

## Estructura de Datos

### GeneratedComponent (Mobile)
```typescript
{
  name: "Hero Section",
  type: "rectangle",
  x: 20,
  y: 20,
  width: 375,          // Ancho móvil
  height: 500,
  backgroundColor: "#0D99FF",
  fontSize: 32,
  // ... más propiedades
}
```

### ResponsiveDesignOutput (Gemini)
```typescript
{
  tablet: {
    width: 620,
    height: 600,
    changes: {
      fontSize: 36,
      padding: 32,
      // ... más cambios
    }
  },
  desktop: {
    width: 1024,
    height: 700,
    changes: {
      fontSize: 40,
      padding: 48,
      // ... más cambios
    }
  }
}
```

### SiteElement (Con Responsive)
```typescript
{
  id: "unique-id",
  name: "Hero Section",
  type: "rectangle",
  // Propiedades base (Mobile)
  x: 20,
  y: 20,
  width: 375,
  height: 500,
  // Overrides por breakpoint
  responsive: {
    tablet: { width: 620, height: 600, ... },
    desktop: { width: 1024, height: 700, ... }
  }
}
```

## Ejemplo Completo

```tsx
'use client';

import { ResponsiveComponentGenerator } from '@/app/components/ResponsiveComponentGenerator';

export default function Editor() {
  return (
    <div>
      {/* Tu editor aquí */}
      <ResponsiveComponentGenerator />
    </div>
  );
}
```

## Troubleshooting

### Error: "Gemini API key not configured"
- Verifica que `GEMINI_API` está en `.env`
- Reinicia el servidor de desarrollo

### Responsive Design no generado
- Revisa la consola para errores de Gemini API
- Asegúrate que tu API key es válida
- Intenta con un prompt más descriptivo

### Build error
- Limpia `pnpm install` y reinicia
- Revisa que TypeScript compile: `pnpm tsc --noEmit`

## Performance Tips

1. Genera responsive solo cuando sea necesario (no en cada componente)
2. Cache el output de Gemini para el mismo componente
3. Usa scaleElementForBreakpoint() como fallback rápido
4. Valida estructura con isValidResponsiveDesign()

## Roadmap Futuro

- [ ] Más breakpoints (sm, lg, xl, 2xl)
- [ ] Persistencia de responsive designs
- [ ] Export a código (Tailwind CSS)
- [ ] Preview en tiempo real de breakpoints
- [ ] Batch generation (múltiples componentes)
