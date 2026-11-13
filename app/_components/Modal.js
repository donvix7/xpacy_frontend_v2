"use client"
import { cloneElement, createContext, useCallback, useContext, useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { useCloseModal } from "../_hooks/useCloseModal";
import { HiMiniXMark } from "react-icons/hi2";
const ModalContext = createContext();


const Modal = ({ children }) => {
    const [windowName, setWindowName] = useState("");
    const close = useCallback(() => setWindowName(""), []);
    const open = setWindowName;

    return <ModalContext.Provider value={{ windowName, close, open }}>{children}</ModalContext.Provider>
}

const Open = ({ children, name}) => {
    const { open } = useContext(ModalContext)
    return cloneElement(children, {onClick: () => open(name)})
};

const Window = ({ children, name, property_id, className }) => {
    const { close, windowName } = useContext(ModalContext);
    const isOpen = name === windowName;
    const ref = useCloseModal(close);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Lock body scroll and close on Escape while the window is open.
    useEffect(() => {
        if (!isOpen) return;

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
    }, [isOpen, close]);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="xp-surface fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-side/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div ref={ref} role="dialog" aria-modal="true" className={`relative w-full overflow-hidden rounded-2xl border border-line bg-card shadow-2xl animate-in zoom-in-95 duration-200 ${className || "max-w-md"}`}>
                <button
                    onClick={close}
                    aria-label="Close dialog"
                    className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-lg border border-line bg-card text-lg text-mute transition-colors hover:bg-soft hover:text-ink"
                >
                    <HiMiniXMark />
                </button>
                {cloneElement(children, { onClose: close, property_id })}
            </div>
        </div>,
        document.body
    )
}

Modal.Open = Open;
Modal.Window = Window;

export default Modal
