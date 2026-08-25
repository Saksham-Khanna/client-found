import React, { useEffect, useState } from 'react';
import { clearToast, getToast, subscribeToast, ToastData } from '../../store/toast';

export interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'warning';
  onClose: () => void;
}

export const ToastNotification: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-[300] animate-modal-in flex items-center gap-3 surface-strong rounded-xl px-4 py-3 shadow-2xl shadow-black/80 max-w-[calc(100vw-2rem)]">
      <div className="w-8 h-8 rounded-full bg-[#c9a86c]/20 border border-[#c9a86c]/40 flex items-center justify-center text-[#e3c893] flex-shrink-0">
        {type === 'success' ? '✓' : type === 'warning' ? '!' : 'i'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-white">System Notification</div>
        <div className="text-[12px] text-stone-300 truncate">{message}</div>
      </div>
      <button
        onClick={onClose}
        className="text-stone-400 hover:text-white p-1 rounded-md transition-colors"
      >
        ✕
      </button>
    </div>
  );
};

export const ToastHost: React.FC = () => {
  const [toast, setToast] = useState<ToastData | null>(getToast());

  useEffect(() => subscribeToast(setToast), []);

  if (!toast) return null;
  return (
    <ToastNotification
      key={toast.id}
      message={toast.message}
      type={toast.type}
      onClose={clearToast}
    />
  );
};
