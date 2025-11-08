import React from 'react';
import { useApp } from '../../context/AppContext';

export const Modal = () => {
  const { modal, closeModal } = useApp();

  if (!modal.isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{modal.title}</h3>
          <button onClick={closeModal} className="modal-close">&times;</button>
        </div>
        <div className="modal-body">
          {modal.content}
        </div>
      </div>
    </div>
  );
};