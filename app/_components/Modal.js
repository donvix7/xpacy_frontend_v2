"use client";

import {
    cloneElement,
    createContext,
    isValidElement,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { createPortal } from "react-dom";
import { HiMiniXMark } from "react-icons/hi2";

const ModalContext = createContext(null);

/**
 * Universal Modal Provider & Wrapper
 *
 * Supports 3 patterns:
 * 1. Compound Uncontrolled:
 *    <Modal>
 *      <Modal.Open name="edit"><button>Edit</button></Modal.Open>
 *      <Modal.Window name="edit"><EditForm /></Modal.Window>
 *    </Modal>
 *
 * 2. Compound Controlled:
 *    <Modal open={isOpen} onOpen={setIsOpen}>
 *      <Modal.Window><Content /></Modal.Window>
 *    </Modal>
 *
 * 3. Direct Standalone Modal Window:
 *    <Modal.Window open={isOpen} onClose={() => setIsOpen(false)} className="max-w-md">
 *      <Content />
 *    </Modal.Window>
 */
const Modal = ({
    children,
    open,
    isOpen,
    onOpen,
    onClose,
    defaultWindowName = "",
}) => {
    const [windowName, setWindowName] = useState(defaultWindowName);

    const controlledOpen =
        open !== undefined ? Boolean(open) : isOpen !== undefined ? Boolean(isOpen) : undefined;
    const isControlled = controlledOpen !== undefined;

    const close = useCallback(() => {
        setWindowName("");
        if (onClose) onClose();
        if (onOpen) onOpen(false);
    }, [onClose, onOpen]);

    const openModal = useCallback(
        (name) => {
            setWindowName(name || "default");
            if (onOpen) onOpen(true);
        },
        [onOpen]
    );

    const contextValue = useMemo(
        () => ({
            windowName,
            close,
            open: openModal,
            isControlled,
            isOpen: controlledOpen,
        }),
        [windowName, close, openModal, isControlled, controlledOpen]
    );

    return (
        <ModalContext.Provider value={contextValue}>
            {children}
        </ModalContext.Provider>
    );
};

const Open = ({ children, name }) => {
    const context = useContext(ModalContext);

    if (!isValidElement(children)) {
        return children;
    }

    return cloneElement(children, {
        onClick: (event) => {
            if (children.props?.onClick) {
                children.props.onClick(event);
            }
            context?.open?.(name);
        },
    });
};

const Window = ({
    children,
    name,
    open,
    isOpen,
    onClose,
    property_id,
    className = "max-w-md",
    hideCloseButton = false,
    closeOnOverlayClick = true,
    closeOnEscape = true,
    role = "dialog",
    ariaLabel,
    ariaLabelledBy,
    zIndex = "z-[11000]",
    ...rest
}) => {
    const context = useContext(ModalContext);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Determine whether this window is currently open
    let isWindowOpen = false;
    if (open !== undefined) {
        isWindowOpen = Boolean(open);
    } else if (isOpen !== undefined) {
        isWindowOpen = Boolean(isOpen);
    } else if (context) {
        if (context.isControlled) {
            isWindowOpen = Boolean(context.isOpen);
        } else if (name) {
            isWindowOpen = name === context.windowName;
        } else {
            isWindowOpen = Boolean(context.windowName);
        }
    }

    const handleClose = useCallback(() => {
        if (onClose) {
            onClose();
        } else if (context?.close) {
            context.close();
        }
    }, [onClose, context]);

    // Lock body scroll and close on Escape while open
    useEffect(() => {
        if (!isWindowOpen) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (event) => {
            if (event.key === "Escape" && closeOnEscape) {
                handleClose();
            }
        };
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isWindowOpen, closeOnEscape, handleClose]);

    if (!isWindowOpen || !mounted) return null;

    return createPortal(
        <div
            className={`xp-surface fixed inset-0 ${zIndex} flex items-center justify-center overflow-y-auto bg-side/60 p-4 backdrop-blur-sm animate-in fade-in duration-200`}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && closeOnOverlayClick) {
                    handleClose();
                }
            }}
        >
            <div
                role={role}
                aria-modal="true"
                aria-label={ariaLabel || rest["aria-label"]}
                aria-labelledby={ariaLabelledBy || rest["aria-labelledby"]}
                className={`relative w-full overflow-hidden rounded-2xl border border-line bg-card text-ink shadow-2xl animate-in zoom-in-95 duration-200 ${className}`}
            >
                {!hideCloseButton && (
                    <button
                        type="button"
                        onClick={handleClose}
                        aria-label="Close dialog"
                        className="absolute right-3.5 top-3.5 z-10 grid h-8 w-8 place-items-center rounded-lg border border-line bg-card text-base text-mute transition-colors hover:bg-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-side-active"
                    >
                        <HiMiniXMark className="h-4 w-4" />
                    </button>
                )}
                {typeof children === "function"
                    ? children({ onClose: handleClose })
                    : isValidElement(children)
                    ? cloneElement(children, {
                          onClose: handleClose,
                          ...(property_id ? { property_id } : {}),
                      })
                    : children}
            </div>
        </div>,
        document.body
    );
};

Modal.Open = Open;
Modal.Window = Window;
Modal.Dialog = Window;

export default Modal;
export { Modal, Window as ModalWindow, Window as ModalDialog };
