import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';

export const Message = () => {
  const { message, hideMessage } = useApp();

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => hideMessage(), 3000);
      return () => clearTimeout(timer);
    }
  }, [message, hideMessage]);

  if (!message) return null;

  return (
    <div className={`message message-${message.type}`}>
      <span>{message.text}</span>
      <button onClick={hideMessage}>&times;</button>
    </div>
  );
};