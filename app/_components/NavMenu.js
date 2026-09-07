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
        <div className={`absolute top-full left-0 ${isSidebar ? "backdrop-blur-xs h-screen" : "bg-white p-6"} w-full z-40 flex flex-col gap-4 text-center ${isOpen ? "translate-x-0" : "-translate-x-[150%]"} transition-transform duration-300 ease-in-out`}>
            {!isSidebar && <h2 className='text-md'>Menu</h2>}
            {cloneElement(children, {open})}
        </div>
    )
}

NavMenu.Open = Open;
NavMenu.Window = Window;

export default NavMenu;