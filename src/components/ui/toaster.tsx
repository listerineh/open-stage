'use client';

import { useEffect, useRef, useState } from 'react';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { subscribeToToasts, subscribeToDismiss } from '@/lib/toast';
import type { Toast } from '@/lib/toast';

interface ActiveToast extends Toast {
  visible: boolean;
}

const CONFIGS = {
  success: {
    icon: CheckCircle2,
    bar: 'bg-emerald-500',
    icon_color: 'text-emerald-400',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/5',
  },
  error: {
    icon: AlertCircle,
    bar: 'bg-red-500',
    icon_color: 'text-red-400',
    border: 'border-red-500/20',
    bg: 'bg-red-500/5',
  },
  warning: {
    icon: AlertTriangle,
    bar: 'bg-amber-500',
    icon_color: 'text-amber-400',
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/5',
  },
  info: {
    icon: Info,
    bar: 'bg-blue-500',
    icon_color: 'text-blue-400',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/5',
  },
};

function ToastItem({ toast, onDismiss }: { toast: ActiveToast; onDismiss: (id: string) => void }) {
  const config = CONFIGS[toast.type];
  const Icon = config.icon;
  const [progress, setProgress] = useState(100);
  const startRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const remaining = Math.max(0, 100 - (elapsed / toast.duration) * 100);
      setProgress(remaining);
      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [toast.duration]);

  return (
    <div
      className={`
        pointer-events-auto w-full max-w-sm overflow-hidden rounded-xl border shadow-2xl shadow-black/40
        transition-all duration-300 ease-out
        ${toast.visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${config.border} ${config.bg} bg-zinc-900/95 backdrop-blur-sm
      `}
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${config.icon_color}`} />

        <div className="min-w-0 flex-1">
          {toast.title && <p className="text-sm font-semibold text-white">{toast.title}</p>}
          <p className={`text-sm ${toast.title ? 'mt-0.5 text-zinc-400' : 'text-zinc-200'}`}>
            {toast.message}
          </p>
        </div>

        <button
          onClick={() => onDismiss(toast.id)}
          className="shrink-0 rounded p-0.5 text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="h-0.5 w-full bg-zinc-800">
        <div className={`h-full transition-none ${config.bar}`} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

export function Toaster() {
  const [toasts, setToasts] = useState<ActiveToast[]>([]);

  const dismiss = (id: string) => {
    setToasts(prev => prev.map(t => (t.id === id ? { ...t, visible: false } : t)));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
  };

  useEffect(() => {
    const unsubToast = subscribeToToasts(incoming => {
      const active: ActiveToast = { ...incoming, visible: false };
      setToasts(prev => [...prev, active]);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setToasts(prev => prev.map(t => (t.id === active.id ? { ...t, visible: true } : t)));
        });
      });
      setTimeout(() => dismiss(active.id), incoming.duration);
    });

    const unsubDismiss = subscribeToDismiss(id => dismiss(id));

    return () => {
      unsubToast();
      unsubDismiss();
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[9999] flex flex-col-reverse items-end gap-2.5">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>
  );
}
