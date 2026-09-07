"use client"
import { cloneElement, createContext, useContext, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useCloseModal } from '../_hooks/useCloseModal';

const FilterMenuContext = createContext();

const FilterMenu = ({children}) => {
    const [filterByName, setFilterByName] = useState("");
    const triggerRef = useRef(null);

    const close = () => {
        setFilterByName("");
        triggerRef.current = null;
    }
    const onOpen = (name, node) => {
        triggerRef.current = node;
        setFilterByName(name);
    }
    return (
        <FilterMenuContext.Provider value={{filterByName, close, onOpen, triggerRef}}>{children}</FilterMenuContext.Provider>
    )
}

const Open = ({name, children}) => {
    const {onOpen} = useContext(FilterMenuContext)
    const handleClick = (e) => {
        e.stopPropagation();
        onOpen(name, e.currentTarget);
    }
    return cloneElement(children, {onClick: handleClick})
}

const Window = ({name, children}) => {
    const {close, filterByName, triggerRef} = useContext(FilterMenuContext);
    const ref = useCloseModal(close);
    const [style, setStyle] = useState({});
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        let animationFrameId;

        const updatePosition = () => {
             if (name === filterByName && triggerRef.current && ref.current) {
                const triggerRect = triggerRef.current.getBoundingClientRect();
                const windowRect = ref.current.getBoundingClientRect();
                const PADDING = 20;
                
                // Using fixed positioning relative to viewport
                let top = triggerRect.bottom;
                let left = triggerRect.left;
                let right = 'auto';

                // If it goes beyond the bottom of viewport
                if (triggerRect.bottom + windowRect.height > window.innerHeight - PADDING) {
                    top = triggerRect.top - windowRect.height;
                }
                
                // If it goes beyond the right of viewport
                if (triggerRect.left + windowRect.width > window.innerWidth - PADDING) {
                    left = 'auto';
                    right = window.innerWidth - triggerRect.right; 
                }
                
                setStyle({
                    top: `${top}px`,
                    ...(left !== 'auto' ? { left: `${left}px` } : { right: `${right}px` })
                });
             }
        };

        if (name === filterByName) {
            updatePosition(); // initial positioning
            
            // Auto-update position on any scroll or resize
            const handleScrollOrResize = () => {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = requestAnimationFrame(updatePosition);
            };

            document.addEventListener('scroll', handleScrollOrResize, true);
            window.addEventListener('resize', handleScrollOrResize, true);

            return () => {
                document.removeEventListener('scroll', handleScrollOrResize, true);
                window.removeEventListener('resize', handleScrollOrResize, true);
                cancelAnimationFrame(animationFrameId);
            };
        }
    }, [name, filterByName, triggerRef, ref]);

    if(name !== filterByName || !mounted) return null;

    return createPortal(
        <div ref={ref} className="fixed z-[9999] bg-white w-max" style={style}>
            {cloneElement(children, {onClose: close})}
        </div>,
        document.body
    );
}

FilterMenu.Open = Open;
FilterMenu.Window = Window;

export default FilterMenu;