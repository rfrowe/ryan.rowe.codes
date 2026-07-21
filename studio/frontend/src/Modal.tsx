import type { ReactNode } from "react";

interface ModalProps {
  onClose: () => void;
  /** Width modifier on `.modal__body` (`--wide`/`--narrow`); omit for the base width. */
  size?: "wide" | "narrow";
  children: ReactNode;
}

/** Dialog over a backdrop: clicking the backdrop closes, clicks inside the body don't propagate. */
export function Modal({ onClose, size, children }: ModalProps) {
  const bodyClass = size ? `modal__body modal__body--${size}` : "modal__body";
  return (
    <div className="modal" onClick={onClose}>
      <div className={bodyClass} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
