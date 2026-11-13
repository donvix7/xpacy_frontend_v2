"use client"
import { createContext, useCallback, useContext, useEffect } from "react";
import { HiMiniXMark } from "react-icons/hi2";
import { useCloseModal } from "../_hooks/useCloseModal";
const ModalContext = createContext();


const Modal = ({ open, onOpen, children }) => {
    return <ModalContext.Provider value={{ open, onOpen }}>{children}</ModalContext.Provider>
}


const Window = ({ children }) => {
    const { open, onOpen } = useContext(ModalContext);
    const close = useCallback(() => onOpen(false), [onOpen]);
    const ref = useCloseModal(close);

    useEffect(() => {
        if (!open) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (event) => {
            if (event.key === "Escape") close();
        };
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, close]);

    if (!open) return null;

    return (
        <div className="xp-surface fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-side/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div ref={ref} className="relative w-full max-w-md overflow-hidden rounded-2xl border border-line bg-card shadow-2xl animate-in zoom-in-95 duration-200">
                <button
                    onClick={close}
                    aria-label="Close dialog"
                    className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-lg border border-line bg-card text-lg text-mute transition-colors hover:bg-soft hover:text-ink"
                >
                    <HiMiniXMark />
                </button>
                {children}
            </div>
        </div>
    )
}

Modal.Window = Window;

export default Modal;
