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
    text: 'Este es tu centro de control. Desde aquí puedes acceder a todas las herramientas y ver el estado de tu banda de un vistazo.',
  },
  {
    id: 'stats',
    title: 'Resumen rápido',
    text: 'Aquí ves tus clips generados, cuántas plataformas sociales tienes conectadas y la banda activa. Se actualiza en tiempo real.',
    attachTo: {
      element: '[data-tour="stats-section"]',
      on: 'bottom',
    },
  },
  {
    id: 'analytics',
    title: 'Analytics de plataformas',
    text: 'Conecta tus cuentas de Spotify, YouTube, Instagram y TikTok para ver métricas unificadas. Si ya están conectadas, verás su estado aquí directamente.',
    attachTo: {
      element: '[data-tour="analytics-section"]',
      on: 'bottom',
    },
  },
  {
    id: 'tools',
    title: 'Tus herramientas',
    text: 'Accede rápidamente a todas las herramientas de OpenStage: el Generador de Clips ya está disponible, Analytics está en Beta, y más herramientas están llegando pronto.',
    attachTo: {
      element: '[data-tour="tools-section"]',
      on: 'top',
    },
  },
  {
    id: 'getting-started',
    title: '¡Empieza ya!',
    text: 'Genera tu primer clip viral desde aquí. Sube un video de concierto y lo convertiremos en contenido optimizado para TikTok, Reels y Shorts.',
    attachTo: {
      element: '[data-tour="getting-started"]',
      on: 'top',
    },
  },
  {
    id: 'sidebar',
    title: 'Navegación',
    text: 'Usa el menú lateral para acceder a todas las secciones: herramientas, bandas, configuración y más.',
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
