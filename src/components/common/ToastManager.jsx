import React from 'react';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';

const ToastManager = () => {
  const toast = useRef(null);

  // You can export the show method to use it globally
  const show = (severity, summary, detail) => {
    toast.current.show({ severity, summary, detail });
  };

  // Add to window for global access (optional)
  window.showToast = show;

  return <Toast ref={toast} />;
};

export default ToastManager; 