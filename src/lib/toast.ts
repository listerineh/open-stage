export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration: number;
}

type ToastListener = (toast: Toast) => void;
type DismissListener = (id: string) => void;

const toastListeners: ToastListener[] = [];
const dismissListeners: DismissListener[] = [];

function emit(
  type: ToastType,
  message: string,
  options?: { title?: string; duration?: number }
): string {
  const t: Toast = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type,
    message,
    title: options?.title,
    duration: options?.duration ?? 4000,
  };
  toastListeners.forEach(l => l(t));
  return t.id;
}

export const toast = {
  success: (message: string, options?: { title?: string; duration?: number }) =>
    emit('success', message, options),
  error: (message: string, options?: { title?: string; duration?: number }) =>
    emit('error', message, options),
  warning: (message: string, options?: { title?: string; duration?: number }) =>
    emit('warning', message, options),
  info: (message: string, options?: { title?: string; duration?: number }) =>
    emit('info', message, options),
  dismiss: (id: string) => dismissListeners.forEach(l => l(id)),
};

export function subscribeToToasts(listener: ToastListener): () => void {
  toastListeners.push(listener);
  return () => {
    const idx = toastListeners.indexOf(listener);
    if (idx > -1) toastListeners.splice(idx, 1);
  };
}

export function subscribeToDismiss(listener: DismissListener): () => void {
  dismissListeners.push(listener);
  return () => {
    const idx = dismissListeners.indexOf(listener);
    if (idx > -1) dismissListeners.splice(idx, 1);
  };
}
