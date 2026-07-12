'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

// Lightweight accessible modal used for create/edit forms.
export function Modal({ open, onClose, title, description, children, className }: ModalProps) {
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'relative z-10 w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto',
          className
        )}
        style={{
          background: 'rgba(14,14,14,0.92)',
          border: '1px solid rgba(255,255,255,0.10)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-lg text-white/30 hover:text-white/80 hover:bg-white/8 transition-all duration-200"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Title */}
        {title && (
          <div className="mb-1">
            <h2 className="text-base font-semibold text-white/90">{title}</h2>
            {description && <p className="mt-1 text-sm text-white/40">{description}</p>}
          </div>
        )}

        {/* Divider */}
        <div className="my-4 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />

        <div>{children}</div>
      </div>
    </div>
  );
}
