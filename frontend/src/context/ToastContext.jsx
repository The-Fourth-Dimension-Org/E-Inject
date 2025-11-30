// src/context/ToastContext.jsx
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const ToastContext = createContext({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

let idCounter = 1;

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]); // {id, message, action}
  const timersRef = useRef({}); // id -> timeout

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
  }, []);

  const showToast = useCallback((message, opts = {}) => {
    const id = idCounter++;
    const toast = { id, message, action: opts.action }; // action?: {label, onClick}
    setToasts((prev) => [...prev, toast]);
    timersRef.current[id] = setTimeout(() => remove(id), opts.duration ?? 1800);
  }, [remove]);

  useEffect(() => {
    return () => Object.values(timersRef.current).forEach(clearTimeout);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {createPortal(
        <div className="fixed inset-x-0 bottom-4 z-[10000] flex justify-center pointer-events-none">
          <div className="flex flex-col gap-2 w-full max-w-sm px-4">
            {toasts.map((t) => (
              <div
                key={t.id}
                className="pointer-events-auto rounded-lg bg-gray-900 text-white shadow-lg border border-gray-800 px-4 py-3 flex items-center justify-between gap-3"
              >
                <span className="text-sm">{t.message}</span>
                <div className="flex items-center gap-2">
                  {t.action && (
                    <button
                      onClick={() => { t.action?.onClick?.(); remove(t.id); }}
                      className="text-emerald-400 hover:text-emerald-300 text-sm font-medium"
                    >
                      {t.action.label}
                    </button>
                  )}
                  <button
                    onClick={() => remove(t.id)}
                    className="w-6 h-6 grid place-items-center rounded hover:bg-white/10"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}
