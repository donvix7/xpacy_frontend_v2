"use client"
import { cloneElement, createContext, useContext, useState } from 'react';


const NavMenuContext = createContext();


const NavMenu = ({children}) => {
    const [isOpen, setIsOpen] = useState(false);
    const open = () => setIsOpen(prev => !prev);
    const value = {isOpen, open}
    return (
        <NavMenuContext.Provider value={value}>{children}</NavMenuContext.Provider>
    )
}


const Open = ({children}) => {
    const {open, isOpen} = useContext(NavMenuContext)
    return cloneElement(children, {open, isOpen})
}


const Window = ({children, isSidebar}) => {
    const {isOpen, open} = useContext(NavMenuContext);
    
    return (
        <div className={`absolute top-full left-0 ${isSidebar ? "backdrop-blur-xs h-screen" : "bg-card border-b border-line shadow-2xl p-5 text-ink"} w-full z-40 flex flex-col gap-3 text-center ${isOpen ? "translate-x-0" : "-translate-x-[150%]"} transition-transform duration-300 ease-in-out`}>
            {!isSidebar && <p className='text-xs font-semibold text-mute uppercase tracking-widest'>Menu</p>}
            {cloneElement(children, {open})}
        </div>
    )
}

NavMenu.Open = Open;
NavMenu.Window = Window;

export default NavMenu;