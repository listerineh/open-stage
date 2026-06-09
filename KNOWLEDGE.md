# 📚 OpenStage - Base de Conocimiento

Este archivo documenta decisiones técnicas, aprendizajes y soluciones encontradas durante el desarrollo.

---

## Sistema de Diseño

### Principios

- **Minimalista y elegante** - Sin emojis, espaciado generoso
- **Iconos consistentes** - Lucide React para todos los iconos
- **Animaciones sutiles** - Transiciones de 200ms, ease-out
- **Jerarquía visual clara** - Colores y tipografía bien definidos

### Componentes Base

| Componente      | Uso                               |
| --------------- | --------------------------------- |
| `PageContainer` | Wrapper de página con max-width   |
| `PageHeader`    | Título + descripción + acción     |
| `BackLink`      | Link de navegación hacia atrás    |
| `Card`          | Contenedor con borde y fondo      |
| `IconBadge`     | Icono con fondo circular/cuadrado |

### Colores

- **Fondo:** zinc-950 (primario), zinc-900 (secundario)
- **Bordes:** zinc-800 (default), zinc-700 (hover)
- **Texto:** white (primario), zinc-400 (secundario), zinc-500 (muted)
- **Acento:** violet-500/600 (acciones), violet-400 (texto)

### Tipografía

- **h1:** text-2xl font-semibold tracking-tight
- **h2:** text-lg font-medium
- **body:** text-sm
- **caption:** text-xs text-zinc-500

---

## Decisiones de Arquitectura

### Stack Tecnológico (Junio 2026)

| Componente    | Tecnología                    | Razón                                  |
| ------------- | ----------------------------- | -------------------------------------- |
| Frontend      | Next.js 16 + React 19         | SSR, App Router, ecosistema maduro     |
| UI            | Tailwind CSS 4 + shadcn/ui    | Componentes accesibles, diseño moderno |
| Backend       | Next.js API Routes + Supabase | Serverless, escala automáticamente     |
| Base de datos | Supabase (PostgreSQL)         | Tier gratis generoso, auth incluido    |
| Auth          | Supabase Auth                 | OAuth providers, gratis                |

### Procesamiento de Video

**Decisión:** Enfoque híbrido - browser-first con API fallback

- **Transcripción:** Whisper.cpp (WASM) en browser, Groq API como fallback
- **Corte de video:** FFmpeg.wasm en browser
- **Detección de momentos:** Análisis de audio local (peaks, silencios)

**Razón:** Minimizar costos operativos, mantener el proyecto open source viable.

### Límites Definidos

| Parámetro           | Valor       | Notas                                  |
| ------------------- | ----------- | -------------------------------------- |
| Tamaño máx. video   | 500MB - 1GB | Ajustable según storage                |
| Duración máx. video | 30min - 1hr | Balance entre utilidad y procesamiento |

---

## Convenciones de Código

### Estructura de Carpetas

```
src/
├── app/           # Rutas (Next.js App Router)
├── components/
│   ├── ui/        # shadcn/ui (no modificar directamente)
│   └── features/  # Componentes específicos por feature
├── lib/           # Utilidades y clientes
├── hooks/         # Custom hooks
├── stores/        # Estado global (Zustand)
└── types/         # TypeScript types/interfaces
```

### Convención de Commits

Formato: `tipo(alcance): descripción`

- `feat` - Nueva funcionalidad
- `fix` - Corrección de bug
- `docs` - Documentación
- `style` - Formato (sin cambios de código)
- `refactor` - Refactorización
- `test` - Tests
- `chore` - Mantenimiento

### Versionado

Seguimos SemVer: `vMAJOR.MINOR.PATCH`

---

## Problemas Resueltos

### [2026-06-09] Configuración inicial

**Problema:** Configurar proyecto con todas las herramientas de desarrollo.

**Solución:**

- Next.js 16 con App Router y TypeScript
- Tailwind CSS 4 + shadcn/ui para UI
- ESLint + Prettier + Husky para calidad de código
- lint-staged para pre-commit hooks

### [2026-06-09] Supabase SSR y Build en CI

**Problema:** El build fallaba en CI porque las variables de entorno de Supabase no estaban disponibles durante el pre-render de páginas estáticas.

**Solución:**

- Lazy initialization del cliente Supabase (crear dentro de `useEffect`, no en el render)
- Usar `useRef` para mantener una única instancia del cliente
- Middleware defensivo que hace skip si no hay env vars
- Función `validateEnv()` separada para validación explícita en runtime

**Archivos clave:**

- `src/contexts/auth-context.tsx` - AuthProvider con lazy init
- `src/hooks/use-auth.ts` - Hook con lazy init
- `src/lib/supabase/middleware.ts` - Skip si no hay config
- `src/lib/env.ts` - Validación separada

### [2026-06-09] Vercel + GitHub Actions

**Problema:** Workflows de deploy duplicaban el trabajo de Vercel.

**Solución:** Eliminar workflows de deploy, dejar solo CI (lint + build). Vercel maneja deploys automáticamente al estar conectado a GitHub.

### [2026-06-09] Storage de Videos - Google Drive

**Problema:** Supabase Storage en plan gratuito tiene límite de 50MB por archivo, insuficiente para videos largos.

**Solución:** Usar Google Drive como storage externo:

- Usuario sube video a su Google Drive
- Comparte con "Cualquier persona con el enlace"
- Pega la URL en la app
- Convertimos la URL a formato de descarga directa

**Ventajas:**

- Sin límite de tamaño (depende del Drive del usuario)
- Gratis para el proyecto
- Usuario mantiene control de sus archivos
- Escala infinitamente

**Archivos clave:**

- `src/components/features/video-upload/video-url-input.tsx` - Input + tutorial

---

## Limitaciones Conocidas

### APIs de Redes Sociales

| Plataforma | Limitación                                | Workaround                         |
| ---------- | ----------------------------------------- | ---------------------------------- |
| TikTok     | Requiere app review para producción       | Usar modo desarrollo inicialmente  |
| Instagram  | Requiere Business account                 | Documentar requisito para usuarios |
| Twitter/X  | Tier gratis muy limitado (1500 reads/mes) | Evaluar si vale la pena integrar   |

### Procesamiento en Browser

- Videos muy largos (>30min) pueden ser lentos
- Dispositivos con poca RAM pueden tener problemas
- Solución futura: Ofrecer procesamiento en servidor como opción

---

## TODOs Técnicos

- [ ] Investigar WebCodecs API para mejor rendimiento de video
- [ ] Evaluar Cloudflare Workers AI para procesamiento serverless barato
- [ ] Implementar sistema de caché para transcripciones

---

_Última actualización: 9 de Junio 2026_
