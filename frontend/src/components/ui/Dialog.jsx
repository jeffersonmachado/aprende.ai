import React from 'react';
import Modal from './Modal';

const Dialog = React.forwardRef(
  ({ open = false, onOpenChange, onClose, ...props }, ref) => {
    const handleClose = onClose || (() => onOpenChange?.(false));

    return (
      <Modal
        ref={ref}
        isOpen={open}
        onClose={handleClose}
        {...props}
      />
    );
  }
);

Dialog.displayName = 'Dialog';

export default Dialog;
