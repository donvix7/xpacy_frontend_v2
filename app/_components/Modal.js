"use client"
import { cloneElement, createContext, useContext, useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { useCloseModal } from "../_hooks/useCloseModal";
import { HiMiniXMark } from "react-icons/hi2";
const ModalContext = createContext();


const Modal = ({ children }) => {
    const [windowName, setWindowName] = useState("");
    const close = () => setWindowName("");
    const open = setWindowName;

    return <ModalContext.Provider value={{ windowName, close, open }}>{children}</ModalContext.Provider>
}

const Open = ({ children, name}) => {
    const { open } = useContext(ModalContext)
    return cloneElement(children, {onClick: () => open(name)})
};

const Window = ({ children, name, property_id, className }) => {
    const { close, windowName } = useContext(ModalContext);
    const ref = useCloseModal(close);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (name !== windowName || !mounted) return null;

    return createPortal(
        <div className="fixed top-0 w-full left-0 bottom-0 h-screen bg-black/40 backdrop-blur-[2px] z-50 transition-all duration-200 ease-in flex items-center justify-center p-4">
            <div ref={ref} className={`relative bg-white rounded-2xl shadow-xl transition-all duration-200 w-full overflow-hidden animate-in fade-in zoom-in-95 ${className || "max-w-md"}`}>
                <button onClick={close} className="p-1.5 text-xl cursor-pointer text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full absolute top-3 right-3 shadow-sm transition-all duration-200 z-10 border border-gray-100">
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