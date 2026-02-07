# Mobile-First Responsive Design System

## Overview
La aplicación ahora implementa un enfoque **Mobile-First** donde el breakpoint principal es **mobile** (375px). Los otros breakpoints se generan automáticamente usando **Gemini API**.

## Arquitectura

### Breakpoints Definidos (en orden de prioridad)
1. **Mobile** (375px) - Breakpoint principal/base
2. **Tablet** (768px) - Generado automáticamente
3. **Desktop** (1024px+) - Generado automáticamente

### Flujo de Trabajo

#### 1. Generación de Componentes
Cuando creas un componente:
- **Paso 1**: Se genera el diseño MOBILE primero (usando Claude)
- **Paso 2**: Se envía a Gemini API para generar automáticamente las variantes tablet y desktop

```typescript
// Uso básico
const component = await generateComponentWithAI("beautiful hero section");

// Con generación automática de responsive variants
const componentWithResponsive = await generateComponentWithResponsiveVariants(
  "beautiful hero section"
);
// Retorna:
// {
//   mobile: { ... },           // Diseño móvil principal
//   responsive: {
//     tablet: { width, height, changes },
//     desktop: { width, height, changes }
//   }
// }
```

#### 2. Inicialización de Breakpoints
En cada página, los breakpoints se inicializan con:
```typescript
store.initializeMobileFirstBreakpoints();
// Configura automáticamente: mobile → tablet → desktop
```

### API Endpoints

#### `/api/generate-component` (POST)
Genera un componente con diseño mobile-first.

**Request:**
```json
{
  "prompt": "descripción del componente",
  "generateResponsive": true  // Opcional: generar también tablet y desktop
}
```

**Response:**
```json
{
  "name": "Component Name",
  "type": "rectangle",
  "x": 20,
  "y": 20,
  "width": 375,
  "height": 500,
  "backgroundColor": "#0D99FF",
  "isMobileFirst": true,
  "responsive": {
    "tablet": {
      "width": 620,
      "height": 600,
      "changes": { ... }
    },
    "desktop": {
      "width": 1024,
      "height": 700,
      "changes": { ... }
    }
  }
}
```

#### `/api/generate-responsive` (POST)
Genera variantes responsive (tablet + desktop) para un componente móvil.

**Request:**
```json
{
  "mobileDesign": { ... },
  "componentName": "Hero Section",
  "description": "descripción opcional"
}
```

**Response:**
```json
{
  "success": true,
  "responsive": {
    "tablet": { "width": 620, "height": 600, "changes": { ... } },
    "desktop": { "width": 1024, "height": 700, "changes": { ... } }
  }
}
```

### Utilidades Disponibles

#### `responsiveUtils.ts`

**convertResponsiveDesignToDeltas()**
- Convierte output de Gemini en deltas responsive para SiteElement

**createSiteElementFromComponent()**
- Crea un SiteElement a partir de GeneratedComponent con variantes responsive

**getResponsiveElementProperties()**
- Obtiene propiedades computadas para un elemento según el breakpoint activo

**isValidResponsiveDesign()**
- Valida la estructura del output de Gemini

**MOBILE_FIRST_BREAKPOINTS**
- Constante con configuración de breakpoints predeterminada

**scaleElementForBreakpoint()**
- Escala elementos proporcionalmente para diferentes breakpoints (fallback sin API)

### Configuración de Ambiente

Asegúrate de tener en `.env`:
```
GEMINI_API=tu_api_key_aqui
```

### Flujo Completo de Ejemplo

```typescript
// 1. Generar componente con responsive automático
const result = await generateComponentWithResponsiveVariants(
  "Un hero section con botón y descripción"
);

// 2. Convertir a SiteElement
const element = createSiteElementFromComponent(
  result.mobile,
  result.responsive
);

// 3. Agregar a la página
store.addElement(element);

// 4. Ver en diferentes breakpoints
store.setActiveBreakpoint('tablet');  // Ver variante tablet
store.setActiveBreakpoint('desktop'); // Ver variante desktop
```

### Características Principales

✅ **Mobile-First Design**: Mobile es el punto de partida  
✅ **Generación Automática**: Gemini crea tablet/desktop automáticamente  
✅ **Propiedades Adaptables**: Width, height, typography se ajustan por breakpoint  
✅ **Fallback Escalado**: Si Gemini no está disponible, escala proporcionalmente  
✅ **Validación Robusta**: Valida estructura de designs responsive  

### Notas Importantes

- Mobile (375px) es SIEMPRE el breakpoint base/principal
- Las propiedades base se definen en mobile
- Los overrides responsive se aplican solo cuando está activo ese breakpoint
- Gemini adapta automáticamente no solo dimensiones, sino también tipografía y layout
