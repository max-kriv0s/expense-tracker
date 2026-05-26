'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/shared/lib/utils';

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
};

export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCloseRef.current(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" aria-hidden />
      <div
        className={cn(
          'relative z-10 w-full max-w-md bg-card rounded-xl shadow-lg p-6',
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-5">{title}</h2>
        {children}
      </div>
    </div>
  );
}
