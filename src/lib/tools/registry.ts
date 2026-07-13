export type ToolStatus = 'available' | 'beta' | 'coming-soon';
export type ToolCategory = 'content' | 'analytics' | 'social' | 'organization';

export type ToolIconName = 'video' | 'scissors' | 'bar-chart' | 'share' | 'calendar' | 'folder';

export interface Tool {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  iconName: ToolIconName;
  href: string;
  status: ToolStatus;
  category: ToolCategory;
  color: string;
  bgColor: string;
}

export const TOOL_CATEGORIES: Record<ToolCategory, { name: string; description: string }> = {
  content: {
    name: 'Creación de Contenido',
    description: 'Herramientas para crear y editar contenido',
  },
  analytics: {
    name: 'Analytics',
    description: 'Métricas y análisis de rendimiento',
  },
  social: {
    name: 'Redes Sociales',
    description: 'Publicación y gestión de redes',
  },
  organization: {
    name: 'Organización',
    description: 'Gestión y almacenamiento de contenido',
  },
};

export const TOOLS: Tool[] = [
  {
    id: 'clip-generator',
    name: 'Generador de Clips',
    description:
      'Genera clips virales automáticamente desde tus videos de conciertos, ensayos o sesiones. Soporta múltiples formatos para TikTok, Reels, Shorts y más.',
    shortDescription: 'Genera clips virales desde tus videos',
    iconName: 'video',
    href: '/tools/clip-generator',
    status: 'available',
    category: 'content',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
  },
  {
    id: 'clip-editor',
    name: 'Editor de Clips',
    description:
      'Edita tus clips con un timeline intuitivo. Recorta, ajusta volumen, agrega subtítulos y cambia thumbnails.',
    shortDescription: 'Edita y perfecciona tus clips',
    iconName: 'scissors',
    href: '/tools/clip-editor',
    status: 'coming-soon',
    category: 'content',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
  },
  {
    id: 'analytics',
    name: 'Analytics Dashboard',
    description:
      'Visualiza métricas de Spotify, YouTube, TikTok e Instagram en un solo lugar. Gráficos de crecimiento y comparativas.',
    shortDescription: 'Métricas de todas tus redes',
    iconName: 'bar-chart',
    href: '/tools/analytics',
    status: 'beta',
    category: 'analytics',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
  },
  {
    id: 'social-publisher',
    name: 'Social Publisher',
    description:
      'Publica directamente a TikTok, Instagram, YouTube y más. Programa publicaciones y gestiona tu calendario de contenido.',
    shortDescription: 'Publica en todas tus redes',
    iconName: 'share',
    href: '/tools/social-publisher',
    status: 'coming-soon',
    category: 'social',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  {
    id: 'content-calendar',
    name: 'Calendario de Contenido',
    description:
      'Planifica tu contenido con un calendario visual. Ve qué publicar y cuándo para maximizar tu alcance.',
    shortDescription: 'Planifica tu contenido',
    iconName: 'calendar',
    href: '/tools/content-calendar',
    status: 'coming-soon',
    category: 'social',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
  },
  {
    id: 'content-library',
    name: 'Biblioteca de Contenido',
    description:
      'Organiza todos tus clips, videos y assets en un solo lugar. Búsqueda, filtros y carpetas.',
    shortDescription: 'Organiza tu contenido',
    iconName: 'folder',
    href: '/tools/content-library',
    status: 'coming-soon',
    category: 'organization',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
  },
];

export function getToolById(id: string): Tool | undefined {
  return TOOLS.find(tool => tool.id === id);
}

export function getToolsByCategory(category: ToolCategory): Tool[] {
  return TOOLS.filter(tool => tool.category === category);
}

export function getAvailableTools(): Tool[] {
  return TOOLS.filter(tool => tool.status === 'available');
}

export function getComingSoonTools(): Tool[] {
  return TOOLS.filter(tool => tool.status === 'coming-soon');
}
