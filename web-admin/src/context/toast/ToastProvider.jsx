// src/components/ui/ToastProvider.jsx
import { Toast } from "primereact/toast";
import { useCallback, useMemo, useRef } from "react";
import { ToastContext } from "./ToastContext"

export const ToastProvider = ({ children }) => {
  const toastRef = useRef(null);

  const showToast = useCallback((severity = "info", summary = "", detail = "", life = 3000) => {
    toastRef.current?.show({ severity, summary, detail, life });
  }, []);
  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      <Toast ref={toastRef} />
      {children}
    </ToastContext.Provider>
  );
};
