# 🎸 OpenStage

**Plataforma open source para que músicos generen y gestionen contenido para redes sociales.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

🌐 **Producción:** [openstage.online](https://openstage.online) | **Staging:** [open-stage-dev.vercel.app](https://open-stage-dev.vercel.app)

---

## 🎯 ¿Qué es OpenStage?

OpenStage es una plataforma all-in-one diseñada para bandas y músicos que quieren:

- **Generar clips** optimizados automáticamente desde videos largos (shows, ensayos, sesiones)
- **Añadir subtítulos** y formatear para cada red social (TikTok, Instagram, YouTube)
- **Centralizar métricas** de todas las plataformas (Spotify prioritario)
- **Gestionar equipos** (bandas) con roles y permisos
- **Programar publicaciones** en múltiples redes sociales

## ✨ Características Principales

- 🎬 **Generación de clips en el navegador** - Procesamiento con FFmpeg WASM, sin servidores externos
- � **Soporte Google Drive** - Descarga videos directamente desde enlaces públicos de Drive
- 🎯 **Múltiples formatos** - TikTok (9:16), Instagram Reels, YouTube Shorts, Posts (1:1), YouTube (16:9)
- ⚡ **Procesamiento rápido** - Clips de 30 segundos generados en minutos
- � **Descarga directa** - Clips listos para publicar, descarga individual o masiva
- 🎨 **Wizard intuitivo** - Flujo paso a paso para configurar formato, intención y subtítulos

## 🚀 Inicio Rápido

### Requisitos

- Node.js 18+
- pnpm 10+

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/listerineh/ia-content-creator.git
cd ia-content-creator

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
│   ├── (auth)/            # Rutas de autenticación
│   ├── (dashboard)/       # Rutas protegidas (create, processing, results)
│   └── api/               # API Routes (download-video, verify-video)
├── components/
│   ├── ui/                # Componentes shadcn/ui
│   └── features/          # Componentes por feature
├── lib/
│   ├── supabase/          # Cliente y tipos de Supabase
│   ├── video/             # Procesamiento FFmpeg WASM
│   └── constants/         # Formatos, intents, estilos
├── stores/                # Zustand stores
└── types/                 # TypeScript types
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

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/) - Framework React
- [Supabase](https://supabase.com/) - Backend as a Service
- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- [FFmpeg WASM](https://ffmpegwasm.netlify.app/) - Procesamiento de video en el navegador

---

**Hecho con ❤️ para músicos por [listerineh](https://listerineh.dev)** 🇪🇨
