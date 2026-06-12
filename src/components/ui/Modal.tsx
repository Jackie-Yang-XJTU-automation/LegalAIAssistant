"use client";

import { useEffect, useRef } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function Modal({ open, onClose, title, children, actions }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-md"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="bg-white rounded-lg shadow-high w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-lg border-b border-[#E0E0E0]">
          <h2 className="text-heading text-text-primary">{title}</h2>
          <button onClick={onClose} className="text-text-hint hover:text-text-primary text-xl leading-none">
            ✕
          </button>
        </div>
        <div className="p-lg">{children}</div>
        {actions && (
          <div className="flex justify-end gap-sm p-lg border-t border-[#E0E0E0]">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
