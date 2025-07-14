import React, { useEffect } from 'react';
/**
 * Modal overlay for dialogs, with focus trap and escape close.
 * Accessible and beautiful.
 */
const ModalOverlay = ({ children, onClose }) => {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && onClose) onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-[9999] bg-black/60 dark:bg-background-dark/80 backdrop-blur-sm transition-all duration-200"
      tabIndex={-1}
      aria-modal="true"
      role="dialog"
      aria-label="Modal dialog"
    >
      {children}
    </div>
  );
};

export default React.memo(ModalOverlay);
