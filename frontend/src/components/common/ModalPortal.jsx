import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * Universal Modal Portal & Backdrop Component
 * Memastikan semua modal / pop-up di Bionet:
 * 1. Di-mount langsung ke document.body via React Portal (kebal dari transform/clipping container).
 * 2. Menutup 100% viewport layar penuh (w-screen h-screen min-h-dvh) dari ujung paling atas hingga bawah.
 * 3. Memiliki backdrop gelap konsisten (bg-slate-950/65) dengan efek frosted glass blur (backdrop-blur-md).
 * 4. Memiliki body scroll lock (mencegah background ter-scroll saat modal aktif).
 * 5. Mendukung aksesibilitas (ESC key to close, role="dialog", aria-modal="true").
 */
export default function ModalPortal({
  isOpen = true,
  onClose,
  children,
  zIndex = 'z-[120]',
  backdropClassName = 'bg-slate-950/65 backdrop-blur-md',
  className = '',
  closeOnBackdropClick = true,
  closeOnEsc = true,
  lockScroll = true,
  ariaLabel,
}) {
  const backdropRef = useRef(null);

  // 1. Lock Body Scroll saat modal terbuka
  useEffect(() => {
    if (!isOpen || !lockScroll) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    
    // Cegah scroll jump jika ada scrollbar
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen, lockScroll]);

  // 2. Keyboard ESC listener
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEsc, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={backdropRef}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      className={`fixed inset-0 ${zIndex} w-screen h-screen min-h-screen min-h-dvh !m-0 overflow-y-auto flex items-center justify-center p-3 sm:p-5 ${backdropClassName} ${className} transition-all duration-200 animate-in fade-in select-auto`}
      onClick={(e) => {
        if (closeOnBackdropClick && e.target === backdropRef.current && onClose) {
          onClose();
        }
      }}
    >
      {children}
    </div>,
    document.body
  );
}

