import type { TourStep } from './use-tour';

export const CLIP_GENERATOR_TOUR: TourStep[] = [
  {
    id: 'welcome',
    title: '¡Bienvenido al Generador de Clips! 🎬',
    text: 'Te guiaremos paso a paso para crear clips increíbles de tus videos. Este proceso es muy sencillo.',
  },
  {
    id: 'video-url',
    title: 'Paso 1: Pega tu video',
    text: 'Primero, pega el enlace de Google Drive de tu video. Asegúrate de que el video tenga permisos de acceso.',
    attachTo: {
      element: '[data-tour="video-input"]',
      on: 'bottom',
    },
  },
  {
    id: 'workflow',
    title: 'Flujo de trabajo',
    text: 'Después de verificar el video, seguirás estos pasos: elegir formatos (TikTok, Reels, etc.), seleccionar tipo de contenido, revisar momentos detectados y configurar subtítulos.',
  },
  {
    id: 'generate',
    title: '¡Y listo!',
    text: 'Al final, generaremos tus clips automáticamente. Podrás descargarlos o subirlos directamente a Google Drive. ¡Así de fácil!',
  },
];

export const DASHBOARD_TOUR: TourStep[] = [
  {
    id: 'welcome',
    title: '¡Bienvenido a OpenStage! 🎸',
    text: 'Este es tu centro de control. Desde aquí puedes acceder a todas las herramientas para crear contenido increíble para tu banda.',
  },
  {
    id: 'stats',
    title: 'Tu resumen',
    text: 'Aquí verás las estadísticas de tu banda: clips generados, alcance y seguidores. Por ahora están vacías, ¡pero pronto las llenarás!',
    attachTo: {
      element: '[data-tour="stats-section"]',
      on: 'bottom',
    },
  },
  {
    id: 'getting-started',
    title: 'Comienza aquí',
    text: 'Esta sección te guía para crear tu primer clip viral. Haz clic en "Generar clips" para empezar.',
    attachTo: {
      element: '[data-tour="getting-started"]',
      on: 'bottom',
    },
  },
  {
    id: 'sidebar',
    title: 'Navegación',
    text: 'Usa el menú lateral para acceder a todas las herramientas, gestionar tus bandas y configurar tu cuenta.',
    attachTo: {
      element: '[data-tour="sidebar-toggle"]',
      on: 'left',
    },
  },
];

export const BANDS_TOUR: TourStep[] = [
  {
    id: 'welcome',
    title: 'Gestión de Bandas 🎵',
    text: 'Aquí puedes ver todas las bandas a las que perteneces y gestionar sus configuraciones.',
  },
  {
    id: 'create-band',
    title: 'Crear nueva banda',
    text: 'Haz clic aquí para crear una nueva banda. Podrás invitar a otros miembros después.',
    attachTo: {
      element: '[data-tour="create-band-button"]',
      on: 'bottom',
    },
  },
  {
    id: 'switch-band',
    title: 'Cambiar banda activa',
    text: 'Haz clic en "Activar" para cambiar a otra banda. La banda activa se muestra con un borde violeta.',
    attachTo: {
      element: '[data-tour="band-card"]',
      on: 'bottom',
    },
  },
];
