---
name: creador-de-habilidades
description: Esta habilidad permite al agente crear nuevas habilidades (skills) en español dentro del workspace, siguiendo las convenciones de Antigravity.
---

# Creador de Habilidades en Español

Esta habilidad te faculta para extender tus propias capacidades mediante la creación de nuevas habilidades estructuradas.

## Cuándo usar esta habilidad
- Cuando el usuario te pida crear una nueva "habilidad", "skill" o "capacidad" persistente.
- Cuando identifiques una tarea repetitiva compleja que se beneficiaría de tener instrucciones estructuradas en un archivo dedicado.

## Instrucciones y Directrices

### 1. Estructura de Archivos
Todas las habilidades deben seguir este esquema exacto:
`.agent/skills/`
└── `Nombre de la Habilidad/`
    └── `Skill.md`

### 2. Formato del archivo Skill.md
Cada archivo `Skill.md` DEBE comenzar con un bloque de frontmatter YAML:

```yaml
---
name: nombre-unico-de-la-habilidad
description: Descripción concisa de qué hace la habilidad y cuándo debe activarse.
---
```

### 3. Pasos para crear una nueva habilidad
1. **Identificar la necesidad**: Entender qué nueva capacidad requiere el usuario.
2. **Definir el nombre**: Usar un nombre descriptivo (puedes usar espacios y mayúsculas si el usuario lo prefiere, o kebab-case por defecto).
3. **Crear el directorio**: `.agent/skills/[Nombre de la Habilidad]/`
4. **Escribir el Skill.md**: Crear el archivo dentro del directorio anterior con el frontmatter y las instrucciones en español.


## Ejemplo de creación
Si el usuario pide una habilidad para "Revisar Documentación", deberías crear:
`.agent/skills/Revisor de Documentación/Skill.md` con:
```yaml
---
name: revisor-documentacion
description: Revisa archivos markdown buscando errores gramaticales y consistencia de estilo.
---
# Revisor de Documentación
... instrucciones aquí ...
```
