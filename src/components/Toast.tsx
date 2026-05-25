'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export type ToastState = { type: 'success' | 'error'; message: string } | null;

export function Toast({
  toast,
  onClear,
}: {
  toast: ToastState;
  onClear: () => void;
}) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClear, 3200);
    return () => clearTimeout(t);
  }, [toast, onClear]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          style={{
            position: 'fixed',
            left: '16px',
            right: '16px',
            bottom: '92px',
            zIndex: 4000,
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            className="glass-panel"
            style={{
              pointerEvents: 'auto',
              maxWidth: '520px',
              width: '100%',
              padding: '14px 14px',
              borderRadius: '18px',
              borderColor: toast.type === 'success' ? 'rgba(0,230,118,0.22)' : 'rgba(232,0,29,0.25)',
              background: toast.type === 'success' ? 'rgba(0,230,118,0.06)' : 'rgba(232,0,29,0.06)',
              boxShadow: toast.type === 'success'
                ? '0 18px 44px rgba(0,0,0,0.75), 0 0 28px rgba(0,230,118,0.08)'
                : '0 18px 44px rgba(0,0,0,0.75), 0 0 28px rgba(232,0,29,0.10)',
            }}
          >
            <p style={{ fontWeight: 800, color: '#fff', fontSize: '0.92rem' }}>{toast.message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

