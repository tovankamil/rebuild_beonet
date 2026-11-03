import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ModalPortal from '../common/ModalPortal';
import VirtualOffice3DView from './VirtualOffice3DView';

/**
 * Fullscreen / Immersive Modal Wrapper for Bionet Executive 3D Virtual Office
 * Mounts directly to document.body via ModalPortal to ensure 100% viewport coverage.
 */
export default function VirtualOffice3DModal({
  isOpen,
  onClose,
  currentUser,
  onNavigate,
  onOpenRankRewards,
}) {
  if (!isOpen) return null;

  return (
    <ModalPortal
      isOpen={isOpen}
      onClose={onClose}
      zIndex="z-[140]"
      backdropClassName="bg-slate-950/90 backdrop-blur-xl"
      closeOnBackdropClick={false}
      closeOnEsc={true}
      lockScroll={true}
      ariaLabel="Bionet Executive 3D Virtual Office"
    >
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 w-screen h-screen min-h-dvh flex flex-col bg-slate-950 overflow-hidden"
        >
          <VirtualOffice3DView
            currentUser={currentUser}
            onNavigate={onNavigate}
            onOpenRankRewards={onOpenRankRewards}
            onClose={onClose}
            isModal={true}
          />
        </motion.div>
      </AnimatePresence>
    </ModalPortal>
  );
}
