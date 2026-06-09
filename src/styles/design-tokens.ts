/**
 * OpenStage Design System
 *
 * Principios:
 * - Minimalista y elegante
 * - Espaciado generoso
 * - Animaciones sutiles
 * - Sin emojis, iconos consistentes (Lucide)
 * - Jerarquía visual clara
 */

export const colors = {
  // Backgrounds
  bg: {
    primary: 'bg-zinc-950',
    secondary: 'bg-zinc-900',
    tertiary: 'bg-zinc-800',
    elevated: 'bg-zinc-900/80',
  },

  // Borders
  border: {
    default: 'border-zinc-800',
    subtle: 'border-zinc-800/50',
    hover: 'border-zinc-700',
    active: 'border-violet-500',
  },

  // Text
  text: {
    primary: 'text-white',
    secondary: 'text-zinc-400',
    muted: 'text-zinc-500',
    accent: 'text-violet-400',
  },

  // Accent
  accent: {
    primary: 'bg-violet-600',
    hover: 'hover:bg-violet-500',
    subtle: 'bg-violet-500/10',
    text: 'text-violet-400',
    border: 'border-violet-500',
  },

  // Status
  status: {
    success: 'text-emerald-400',
    successBg: 'bg-emerald-500/10',
    error: 'text-red-400',
    errorBg: 'bg-red-500/10',
    warning: 'text-amber-400',
    warningBg: 'bg-amber-500/10',
  },
} as const;

export const spacing = {
  page: 'px-6 py-8 md:px-8 lg:px-12',
  section: 'space-y-8',
  card: 'p-6',
  cardCompact: 'p-4',
  stack: 'space-y-4',
  inline: 'space-x-3',
} as const;

export const typography = {
  // Headings
  h1: 'text-2xl font-semibold tracking-tight',
  h2: 'text-lg font-medium',
  h3: 'text-base font-medium',

  // Body
  body: 'text-sm',
  bodySmall: 'text-xs',

  // Labels
  label: 'text-sm font-medium',
  caption: 'text-xs text-zinc-500',
} as const;

export const animation = {
  // Transitions
  fast: 'transition-all duration-150 ease-out',
  default: 'transition-all duration-200 ease-out',
  slow: 'transition-all duration-300 ease-out',

  // Hover states
  hover: 'hover:scale-[1.02]',
  press: 'active:scale-[0.98]',
} as const;

export const layout = {
  maxWidth: 'max-w-5xl',
  container: 'mx-auto w-full',
  grid: {
    cols2: 'grid grid-cols-1 gap-4 sm:grid-cols-2',
    cols3: 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3',
  },
} as const;

export const radius = {
  sm: 'rounded-md',
  default: 'rounded-lg',
  lg: 'rounded-xl',
} as const;
