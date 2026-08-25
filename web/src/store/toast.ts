export type ToastType = 'success' | 'info' | 'warning';

export interface ToastData {
  id: number;
  message: string;
  type: ToastType;
}

type Listener = (toast: ToastData | null) => void;

let currentToast: ToastData | null = null;
const listeners = new Set<Listener>();

export function showToast(message: string, type: ToastType = 'success') {
  currentToast = { id: Date.now(), message, type };
  listeners.forEach((l) => l(currentToast));
}

export function clearToast() {
  currentToast = null;
  listeners.forEach((l) => l(null));
}

export function getToast(): ToastData | null {
  return currentToast;
}

export function subscribeToast(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
