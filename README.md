<p align="center">
  <img src="public/logo.svg" alt="OpenStage Logo" width="120" height="120" />
</p>

<h1 align="center">🎸 OpenStage</h1>

<p align="center">
  <strong>Plataforma open source para que músicos y bandas generen contenido viral y gestionen su presencia en redes sociales.</strong>
</p>

<p align="center">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css" alt="Tailwind CSS" /></a>
  <a href="https://supabase.com/"><img src="https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase" alt="Supabase" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License" /></a>
</p>

<p align="center">
  🌐 <a href="https://openstage.online"><strong>Producción</strong></a> | <a href="https://open-stage-dev.vercel.app"><strong>Staging</strong></a>
</p>

---

## 🎯 ¿Qué es OpenStage?

OpenStage es una plataforma all-in-one diseñada para bandas y músicos que quieren:

- **Generar clips virales** optimizados automáticamente desde videos largos (shows, ensayos, sesiones)
- **Gestionar bandas** con roles (admin, editor, viewer) e invitaciones por código
- **Añadir subtítulos** y formatear para cada red social (TikTok, Instagram, YouTube)
- **Centralizar métricas** de todas las plataformas (próximamente)
- **Programar publicaciones** en múltiples redes sociales (próximamente)

## ✨ Características Principales

### 🎬 Generador de Clips

- **Procesamiento en el navegador** - FFmpeg WASM, sin servidores externos
- **Soporte Google Drive** - Descarga videos directamente desde enlaces públicos
- **Múltiples formatos** - TikTok (9:16), Instagram Reels, YouTube Shorts, Posts (1:1), YouTube (16:9)
- **Procesamiento rápido** - Clips de 30 segundos generados en minutos
- **Descarga directa** - Clips listos para publicar, individual o masiva
- **Wizard intuitivo** - Flujo paso a paso para configurar formato, intención y subtítulos

### 👥 Gestión de Bandas

- **Crear o unirse a bandas** - Onboarding post-registro con flujo intuitivo
- **Roles y permisos** - Admin, Editor, Viewer con diferentes capacidades
- **Códigos de invitación** - Invita miembros con códigos únicos
- **Selector de banda activa** - Cambia entre bandas desde el header
- **Logos personalizados** - Upload de logos hasta 50MB

## 🚀 Inicio Rápido

### Requisitos

- Node.js 18+
- pnpm 10+

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/listerineh/open-stage.git
cd open-stage

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env.local

# Iniciar servidor de desarrollo
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```text
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rutas de autenticación (login, signup)
│   ├── (dashboard)/       # Rutas protegidas
│   │   ├── bands/         # Gestión de bandas (/bands, /bands/[slug])
│   │   ├── dashboard/     # Dashboard principal
│   │   ├── onboarding/    # Onboarding post-registro
│   │   └── tools/         # Herramientas (clip-generator)
│   └── api/               # API Routes
├── components/
│   ├── ui/                # Componentes base (shadcn/ui + custom)
│   ├── layout/            # Header, BandSelector, etc.
│   └── features/          # Componentes por feature
├── contexts/              # React Contexts (Auth, Band)
├── hooks/                 # Custom hooks (useAuth, useBand)
├── lib/
│   ├── supabase/          # Cliente, middleware, tipos
│   ├── video/             # Procesamiento FFmpeg WASM
│   └── constants/         # Formatos, rutas, estilos
├── stores/                # Zustand stores
└── types/                 # TypeScript types
supabase/
└── migrations/            # Migraciones SQL
public/
└── ffmpeg/                # FFmpeg WASM core files
```

## 🛠️ Scripts Disponibles

| Comando             | Descripción                      |
| ------------------- | -------------------------------- |
| `pnpm dev`          | Inicia servidor de desarrollo    |
| `pnpm build`        | Construye para producción        |
| `pnpm start`        | Inicia servidor de producción    |
| `pnpm lint`         | Ejecuta ESLint                   |
| `pnpm lint:fix`     | Corrige errores de ESLint        |
| `pnpm format`       | Formatea código con Prettier     |
| `pnpm format:check` | Verifica formato                 |
| `pnpm db:migrate`   | Aplica migraciones a Supabase    |
| `pnpm db:reset`     | Resetea la base de datos         |
| `pnpm db:types`     | Genera tipos TypeScript de la DB |

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor lee [CONTRIBUTING.md](docs/CONTRIBUTING.md) para detalles sobre el proceso.

### Flujo de Git

- `main` - Producción estable
- `develop` - Integración y staging
- `feature/*` - Nuevas funcionalidades
- `fix/*` - Corrección de bugs

### Convención de Commits

```text
tipo(alcance): descripción breve

Ejemplos:
feat(auth): agregar login con Google
fix(video): corregir error en upload
docs(readme): actualizar instrucciones
```

## �️ Roadmap

- [x] **v0.1.0** - Landing page y estructura base
- [x] **v0.2.0** - Autenticación con Supabase (email + Google)
- [x] **v0.3.0** - Generador de clips con FFmpeg WASM
- [x] **v0.4.0** - Gestión de bandas y onboarding
- [ ] **v0.5.0** - Integración de herramientas con bandas
- [ ] **v0.6.0** - Dashboard de métricas (Spotify, YouTube)
- [ ] **v0.7.0** - Programación de publicaciones

## 🔧 Stack Tecnológico

| Categoría | Tecnología                         |
| --------- | ---------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack) |
| Lenguaje  | TypeScript 5                       |
| Estilos   | Tailwind CSS 4                     |
| UI        | shadcn/ui + Lucide Icons           |
| Backend   | Supabase (Auth, Database, Storage) |
| Video     | FFmpeg WASM                        |
| Deploy    | Vercel                             |

## � Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## �� Agradecimientos

- [Next.js](https://nextjs.org/) - Framework React
- [Supabase](https://supabase.com/) - Backend as a Service
- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- [FFmpeg WASM](https://ffmpegwasm.netlify.app/) - Procesamiento de video en el navegador
- [Vercel](https://vercel.com/) - Hosting y deploy

---

**Hecho con ❤️ para músicos por [listerineh](https://listerineh.dev)** 🇪🇨
