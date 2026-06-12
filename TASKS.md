# OpenStage - Lista de Tareas

> Este archivo es LOCAL y no se sube a GitHub. Contiene el checklist completo del proyecto.

---

## FASE 0: Fundación ✅ COMPLETADA

- [x] Inicializar proyecto Next.js con TypeScript
- [x] Configurar Tailwind CSS + shadcn/ui
- [x] Configurar ESLint, Prettier, Husky
- [x] Crear estructura de carpetas (feature-based)
- [x] Crear TASKS.md local y actualizar .gitignore
- [x] Crear README.md y KNOWLEDGE.md
- [x] Configurar Supabase (proyecto, tablas base)
- [x] Sistema de autenticación básico (email + Google OAuth)
- [x] CI/CD con GitHub Actions
- [x] Configurar git flow (main, develop, feature branches)
- [x] Deploy en Vercel

---

## FASE 1: MVP - Generación de Clips ✅ COMPLETADA

- [x] UI de video (input de URL de Google Drive + tutorial)
- [x] Selector de formatos de salida (TikTok, Reels, YouTube Shorts, Instagram, YouTube)
- [x] Selector de intención del video:
  - [x] Clips virales (momentos de alta energía)
  - [x] Canciones completas (separadas)
  - [x] Mejores momentos (highlights)
  - [x] Momentos divertidos (detección de risas/reacciones)
- [x] Configuración de subtítulos (estilo, posición, idioma)
- [x] Procesamiento con FFmpeg WASM (cliente-side)
- [x] Proxy API para descarga de Google Drive (bypass CORS)
- [x] Generación de clips en formatos correctos (720x1280, 1080x1080, etc.)
- [x] Vista previa de clips generados (video player nativo)
- [x] Descarga individual de clips
- [x] Página de procesamiento con progreso real
- [x] Página de resultados con preview y descarga
- [x] Descarga masiva (ZIP con JSZip)
- [x] Tag: v0.1.0 ✅

---

## FASE 2: Arquitectura Modular y Rebranding ✅ COMPLETADA

> Objetivo: Transformar OpenStage en una plataforma modular de herramientas para bandas

### 2.1 Nueva Arquitectura de Módulos/Tools ✅

- [x] Definir estructura de módulos (`/tools/[tool-id]`)
- [x] Crear sistema de registro de herramientas (tool registry)
- [x] Cada herramienta como módulo independiente con:
  - [x] Icono, nombre, descripción
  - [x] Ruta dedicada
  - [x] Estado (disponible, próximamente, beta)
  - [x] Categoría (contenido, analytics, social, etc.)

### 2.2 Nuevo Homepage ✅

- [x] Hero section: "La plataforma open source para bandas"
- [x] Badge "🇪🇨 Plataforma ecuatoriana Open Source"
- [x] Grid de herramientas disponibles con cards
- [x] Sección de "Próximamente" para herramientas futuras
- [x] Sección de beneficios con stats
- [x] CTA claro hacia registro/login
- [x] Footer con créditos a listerineh.dev

### 2.3 Nuevo Dashboard ✅

- [x] Vista de herramientas como grid de cards
- [x] Herramientas disponibles y próximamente
- [x] Resumen con stats (herramientas activas, en desarrollo, categorías)
- [x] Eliminar botón +Crear del topnav
- [x] Footer actualizado con créditos

### 2.4 Migrar Generador de Clips como Tool ✅

- [x] Mover a `/tools/clip-generator`
- [x] Subrutas: `/tools/clip-generator/processing` y `/tools/clip-generator/results`
- [x] Registrar en tool registry
- [x] Adaptar UI al nuevo sistema (header con icono y breadcrumb)
- [x] Mantener funcionalidad actual
- [x] Redirects de compatibilidad (`/create`, `/processing`, `/results`)

### 2.5 Preparar estructura para futuros Tools ✅

- [x] Tool: Analytics Dashboard (placeholder - coming soon)
- [x] Tool: Social Publisher (placeholder - coming soon)
- [x] Tool: Clip Editor (placeholder - coming soon)
- [x] Tool: Content Calendar (placeholder - coming soon)
- [x] Tool: Content Library (placeholder - coming soon)
- [x] Configurar dominio openstage.online
- [x] Tag: v0.2.0 ✅

---

## FASE 3: SEO y Metadatos ✅

> Configurar SEO correctamente desde el principio

- [x] Metadata base en layout.tsx (title, description, keywords)
- [x] Open Graph tags para redes sociales
- [x] Twitter Card tags
- [x] Favicon y apple-touch-icon
- [x] robots.txt y sitemap.xml
- [x] Structured data (JSON-LD) para la organización
- [x] Meta tags dinámicos por página
- [x] Canonical URLs
- [x] Logo SVG y componente Logo reutilizable
- [x] OG images específicas por herramienta (clip-generator)
- [x] Login/Signup con logo oficial y animaciones
- [x] Tag: v0.3.0

---

## FASE 4: Gestión de Bandas

> Un usuario DEBE pertenecer a una banda para usar la plataforma.
> Flujo: Registro → Crear/Unirse a banda → Dashboard

### 4.1 Base de Datos (Supabase)

- [x] Tabla `bands` (id, name, slug, logo_url, description, genre, created_at)
- [x] Tabla `band_members` (band_id, user_id, role, joined_at)
- [x] Actualizar tabla `profiles` con `current_band_id`, `onboarding_completed`
- [x] Tabla `band_invitations` para códigos de invitación
- [x] RLS policies para bandas, miembros e invitaciones
- [x] Funciones: create_band_with_admin, join_band_with_code, switch_current_band
- [x] Tipos TypeScript (database.ts)
- [x] Hook useBand() y BandProvider context

### 4.2 Onboarding Post-Registro

- [x] Página `/onboarding` después del primer login
- [x] Opción: Crear nueva banda o Unirse con código
- [x] Formulario crear banda (nombre, género, descripción)
- [x] Input código de invitación para unirse
- [x] Redirect a dashboard después de completar
- [x] Middleware para forzar onboarding antes de usar la app

### 4.3 CRUD de Bandas

- [x] Página `/bands` - Lista de bandas del usuario
- [x] Página `/bands/[slug]` - Detalle de banda con miembros
- [x] Página `/bands/[slug]/settings` - Configuración (solo admin)
- [x] Editar nombre, descripción, género
- [x] Eliminar banda (solo admin, con confirmación)
- [x] Gestión de códigos de invitación

### 4.4 Gestión de Miembros

- [x] Lista de miembros en página de banda
- [x] Roles: admin, editor, viewer (con iconos)
- [x] Generar código de invitación (en settings)
- [x] Cambiar rol de miembros (admin) - menú dropdown
- [x] Expulsar miembros (admin)
- [x] Salir de banda (miembro, con validación de único admin)

### 4.5 Selector de Banda Activa

- [x] Dropdown en header para cambiar banda activa
- [x] Guardar `current_band_id` en perfil
- [x] Context provider para banda activa (BandProvider)
- [x] Hook `useBand()` para acceder a banda actual
- [x] Componente BandSelector con switch rápido
- [x] Tag: v0.4.0

### 4.6 Integración con Herramientas

- [x] Mostrar banda activa en header del clip-generator
- [x] Mostrar banda activa en página de resultados
- [x] Tag: v0.4.1

### 4.7 Integración con Google Drive (Storage de Clips)

- [x] OAuth con Google Drive API
- [x] UI en settings de banda para conectar carpeta de Drive
- [x] Guardar `drive_folder_id` en tabla `bands`
- [x] Subir clips generados a carpeta de Drive de la banda
- [x] Auto-guardado en Drive al generar clips
- [x] Subcarpetas por formato (TikTok, Reels, YouTube Shorts, etc.)
- [x] Tabla `clips` para metadata (drive_file_id, url, duración, formato)
- [x] Previsualización de clips con iframe de Drive
- [x] Listado de clips por banda en dashboard (/bands/[slug]/clips)
- [x] Mostrar errores de guardado al usuario

- [x] Tag: v0.4.2

### 4.8 Sidebar y Dashboard Layout ✅ COMPLETADO

> Rediseño de la navegación con sidebar mobile-first

- [x] Crear componente `Sidebar` con navegación principal
- [x] Mobile: hamburger menu que abre sidebar como overlay
- [x] Desktop: sidebar fijo (256px)
- [x] Contenido del sidebar:
  - [x] Logo OpenStage
  - [x] Dashboard
  - [x] Generador de Clips
  - [x] Mis Clips (próximamente - disabled)
  - [x] Selector de Banda con dropdown
  - [x] Configuración
  - [x] User info (avatar, nombre, email)
  - [x] Cerrar sesión
- [x] Modificar `DashboardLayout` para usar sidebar
- [x] Eliminar `DashboardHeader` duplicado
- [x] Responsive: overlay en mobile, fijo en desktop
- [x] Animaciones suaves de apertura/cierre (300ms)
- [x] Cerrar sidebar al hacer click en links
- [x] Cerrar sidebar con tecla Escape
- [x] Prevenir scroll del body cuando sidebar abierto
- [x] Ajustar padding-top en todas las páginas para hamburger
- [x] Tag: v0.4.3

### 4.9 Mejoras UX/UI Mobile-First ✅ COMPLETADO

> Refinamiento del sidebar y dashboard con enfoque mobile-first

**Desktop:**

- [x] Todas las herramientas en sidebar (disponibles y próximas)
- [x] Dashboard rediseñado con stats, getting started y actividad
- [x] Footer minimalista y acoplado
- [x] Logo y nombre más grandes en sidebar
- [x] Reordenar bottom: Configuración → Cerrar sesión → User
- [x] Header de clip generator simplificado (sin banda duplicada)
- [x] Descripción completa del generador

**Mobile:**

- [x] Hamburger a la derecha (UX estándar para diestros)
- [x] Sidebar slide desde derecha
- [x] Topnav minimalista sin logo
- [x] Logo + nombre visible solo en dashboard mobile
- [x] Saludo personalizado con nombre del usuario
- [x] Stats más grandes y espaciosos (iconos h-14, números text-3xl)
- [x] Stepper con scroll horizontal centrado
- [x] Overflow fixes para URLs largas (break-all)
- [x] Input con overflow-hidden y text-ellipsis
- [x] Padding-top aumentado (pt-20 → pt-32)
- [x] Tag: v0.4.4

### 4.10 Editor de Clips (Futuro)

- [ ] Cachear video temporalmente en Supabase Storage para edición
- [ ] Editor con timeline y cortes
- [ ] Guardar clip editado de vuelta a Drive
- [ ] Limpiar cache de Supabase después de edición

---

## FASE 5: Detección Inteligente de Momentos (Clip Generator v2)

> Mejora del generador de clips con IA

### 5.1 Análisis de Audio (Cliente) ✅ COMPLETADO

- [x] Integrar Web Audio API para análisis de energía
- [x] Detectar picos de audio (aplausos, gritos, drops)
- [x] Detectar silencios y transiciones
- [x] Crear utilidad `analyzer.ts` con cálculo de RMS
- [x] Hook `useAudioAnalysis` para React
- [x] Componente `AudioMomentsList` para mostrar momentos
- [x] Componente `AudioTimeline` con visualización temporal
- [x] Integrar en wizard del Clip Generator
- [x] Nuevo step "Momentos" en el flujo
- [x] Análisis automático al entrar al step
- [x] Selección/deselección de momentos
- [x] Guardar momentos en estado del wizard

### 5.2 Transcripción con Whisper

- [ ] Integrar Whisper WASM para transcripción local
- [ ] Extraer audio del video con FFmpeg
- [ ] Generar transcripción con timestamps

### 5.3 Análisis con IA (Gemini/DeepSeek)

- [ ] Integrar Gemini 2.5 Flash-Lite API (free tier)
- [ ] DeepSeek V4 Flash como fallback
- [ ] Prompt engineering para detectar momentos virales
- [ ] Recibir sugerencias con timestamps y razones

### 5.4 UI de Sugerencias ✅ COMPLETADO

- [x] Timeline visual con momentos detectados
- [x] Selección/deselección de momentos
- [x] Preview rápido de cada momento
- [x] Categorización de momentos (Picos, Silencios, Transiciones)
- [x] Filtrado por categoría con tabs
- [x] Timeline dinámico que se actualiza según categoría
- [x] Audio preview con loader y estados (loading/playing/stopped)
- [x] Selección automática de top 3 momentos por confianza
- [x] Badge visual para identificar top momentos
- [x] Barra de energía con label y porcentaje
- [x] Banner informativo explicando indicadores
- [x] Diseño responsive mobile-first
- [x] Componente AudioMomentsMobile optimizado
- [x] Timeline más alto y visible (h-16 móvil, h-20 desktop)

### 5.5 Generación Multi-Formato ✅ COMPLETADO

- [x] Generar clips para cada formato seleccionado (TikTok, YouTube, etc.)
- [x] Nomenclatura descriptiva: `{video}_clip{n}_{timestamp}_{formato}.mp4`
- [x] Duración ideal por formato (TikTok 30s, YouTube 2min, Story 15s)
- [x] Aspect ratio correcto con crop al centro (sin franjas negras)
- [x] Progress tracking por clip y formato
- [x] Preview con aspect ratio dinámico según formato
- [x] Contador de clips: momentos × formatos = total

### 5.6 Mejoras UX Clip Generator ✅ COMPLETADO

- [x] Wizard stepper responsive (dots en mobile, full en desktop)
- [x] Layout consistente de previews (altura fija, botones debajo)
- [x] Banner de Google Drive al inicio de las cards
- [x] Mostrar tiempo de inicio real del clip (no el momento detectado)
- [x] Duración mínima garantizada (80% del ideal del formato)

### 5.7 Tipos de Contenido Especializados

- [x] "Canciones completas" marcado como "Próximamente"
- [ ] Implementar detección de momentos divertidos (risas, fails, reacciones)
- [ ] Implementar detección de canciones completas (silencios largos entre canciones)
- [ ] UI para marcar inicio/fin de canciones manualmente

### 5.8 Bugfixes y Mejoras UX ✅ COMPLETADO

- [x] Fix: Preview de audio reproducía siempre el primer momento
- [x] Remover límite artificial de 20 momentos en analyzer
- [x] Remover preselección automática de top 3 momentos
- [x] Remover estrellas de "top 10" en UI de momentos
- [x] Top 5 sugerencias con estrella y color amber en timeline
- [x] Categorización de momentos por intención seleccionada
- [x] Preview de audio restaurado usando Blob URL
- [x] Retry con delay para rate limits de Google Drive
- [x] UI de error amigable para rate limits (429)
- [ ] Tag: v0.5.0

### 5.9 Mejoras UI Bandas ✅ COMPLETADO

- [x] Modal de crear banda (sin redirigir a /onboarding)
- [x] Responsive mejorado en /bands (flex-col mobile, flex-row desktop)
- [x] Selector de géneros con chips clickeables (multi-selección)
- [x] Retrocompatibilidad con bandas de un solo género
- [x] Card expandible con "Ver más géneros"
- [x] Hasta 5 géneros por banda

### 5.10 Sistema de Tours Guiados ✅ COMPLETADO

- [x] Integrar Shepherd.js para tutoriales
- [x] Tema personalizado CSS para OpenStage
- [x] Hook useTour con persistencia en Supabase
- [x] Auto-start en primera visita
- [x] Botón de ayuda (?) para reiniciar tour
- [x] Indicador de progreso con dots
- [x] Tours predefinidos: bands, dashboard, clip-generator
- [x] Botón "Reiniciar tutoriales" en settings
- [x] Fix: marcar tour como completado al saltar o cerrar
- [x] Fix: overlay blur optimizado (2px, 0.3 opacity)

### 5.11 Páginas Legales y Cookies ✅ COMPLETADO

- [x] Página de Política de Privacidad (/privacy)
- [x] Página de Política de Cookies (/cookies)
- [x] Banner de consentimiento de cookies (GDPR compliant)
- [x] Configuración de cookies en /settings
- [x] Persistencia en Supabase (profiles.cookie_preferences)
- [x] Fallback a localStorage para usuarios no logueados
- [x] Helpers: hasConsentFor(), shouldLoadAnalytics()
- [x] BackButton inteligente (redirige a /dashboard si logueado)
- [x] Consentimiento explícito requerido (default NULL)
- [x] Banner full-width con gradiente violeta
- [x] Toggles para cookies funcionales y analytics

---

## FASE 6: Tool - Analytics Dashboard

- [ ] Conexión OAuth con redes sociales
- [ ] Dashboard con métricas de Spotify, YouTube, TikTok, Instagram
- [ ] Gráficos de crecimiento (Recharts)
- [ ] Comparativas entre plataformas
- [ ] Histórico de datos
- [ ] Tag: v0.6.0

---

## FASE 7: Tool - Social Publisher

- [ ] Publicación directa a redes sociales
- [ ] Programación de publicaciones
- [ ] Content Calendar visual
- [ ] Estado de publicaciones
- [ ] Tag: v0.7.0

---

## FASE 8: Tool - Clip Editor

- [ ] Timeline básico de video
- [ ] Recortar inicio/fin
- [ ] Ajustar volumen
- [ ] Agregar/editar subtítulos
- [ ] Cambiar thumbnail
- [ ] Exportar con cambios
- [ ] Tag: v0.8.0

---

## FASE 9: Almacén de Contenido

- [ ] Sistema de carpetas/organización
- [ ] Historial de sesiones de generación
- [ ] Vista de galería de clips
- [ ] Búsqueda y filtros
- [ ] Metadatos de clips
- [ ] Tag: v0.9.0

---

## FASE 10: Notificaciones y Colaboración

- [ ] Sistema de notificaciones in-app
- [ ] Notificaciones por email (Resend)
- [ ] Feed de actividad de la banda
- [ ] Comentarios en clips
- [ ] Tag: v0.10.0

---

## FASE 11: Funcionalidades Avanzadas (Futuro)

- [ ] Más tools: Link in Bio, EPK Generator, Merch Store
- [ ] Publicación automática de posts/stories
- [ ] Sugerencias de mejores horarios para publicar
- [ ] A/B testing de thumbnails
- [ ] Integraciones: Twitch, SoundCloud, Bandcamp
- [ ] Modo offline (PWA)
- [ ] App móvil (React Native)
- [ ] Internacionalización (i18n)
- [ ] Tag: v1.0.0

---

## Notas de Progreso

| Fecha      | Versión | Descripción                                                           |
| ---------- | ------- | --------------------------------------------------------------------- |
| 2026-06-09 | v0.0.0  | Inicio del proyecto, Fase 0 en progreso                               |
| 2026-06-09 | -       | Supabase integrado, auth con email + Google, CI/CD, deploy Vercel     |
| 2026-06-09 | v0.1.0  | FASE 1 completada: generación de clips con FFmpeg WASM, Google Drive  |
| 2026-06-09 | -       | FASE 2: Tool Registry, nuevo homepage, dashboard, migración clip-gen  |
| 2026-06-09 | -       | Dominio openstage.online configurado, docs actualizados               |
| 2026-06-09 | v0.2.0  | FASE 2 completada: arquitectura modular, rebranding, dominio          |
| 2026-06-12 | -       | FASE 5: Generación multi-formato, duración por formato, crop sin franjas |
| 2026-06-12 | -       | UX: Stepper responsive, layout previews, timestamps reales            |
| 2026-06-12 | -       | "Canciones completas" marcado como Próximamente                       |
| 2026-06-12 | -       | Top 5 sugerencias, preview audio con blob, retry rate limits          |
| 2026-06-12 | -       | Modal crear banda, selector géneros multi-select con chips            |
| 2026-06-12 | -       | Sistema de tours guiados con Shepherd.js, persistencia Supabase       |
| 2026-06-12 | -       | Páginas legales (privacy, cookies), banner GDPR, config en settings   |

---

Última actualización: 12 de Junio 2026 (4:26am)
