"use client"
import { createContext, useContext, useState } from "react"

const UserContext = createContext();


const UserProvider = ({children}) => {
    const [userData, setUserData] = useState(null)
    const value = {userData, setUserData}
    return (
        <UserContext.Provider value={value}>{children}</UserContext.Provider>
    )
}

const useUser = () => {
    const context = useContext(UserContext);
    return context;
};

export {UserProvider, useUser}