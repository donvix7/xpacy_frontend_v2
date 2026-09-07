"use client"
import { createContext, useContext } from "react";
import { HiMiniXMark } from "react-icons/hi2";
import { useCloseModal } from "../_hooks/useCloseModal";
const ModalContext = createContext();


const Modal = ({ open, onOpen, children }) => {
    return <ModalContext.Provider value={{ open, onOpen }}>{children}</ModalContext.Provider>
}


const Window = ({ children }) => {
    const { open, onOpen } = useContext(ModalContext);
    const ref = useCloseModal(() => onOpen(false));
    if (!open) return null;
    return (
        <div className="fixed top-0 w-full left-0 bottom-0 h-screen bg-gray-0 backdrop-blur-xs z-40 transition-all duration-300 ease-in overflow-hidden">
            <div ref={ref} className="fixed top-1/2 left-1/2 -translate-x-[50%] -translate-y-[50%] mt-10 bg-gray-50 rounded-lg px-3 py-2.5 shadow-lg transition-all duration-300">
                <button onClick={() => onOpen(false)} className="bg-none p-1 text-2xl cursor-pointer text-gray-900 rounded-full absolute top-2 right-2.5 transition-all duration-300 ease-in hover:bg-gray-100">
                    <HiMiniXMark />
                </button>
                {children}
            </div>
        </div>
    )
}

Modal.Window = Window;

export default Modal