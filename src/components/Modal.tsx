"use client";

import { useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";

// Basic modal: click the backdrop or press Escape to close.
export default function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    // Stop the page behind the modal from scrolling.
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-0 sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="max-h-[92vh] w-full max-w-lg animate-fade-up overflow-y-auto rounded-t-2xl bg-surface shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-semibold text-fg">{title}</h2>
          <button
            onClick={onClose}
            className="text-fg/40 hover:text-fg"
            aria-label="Close"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
