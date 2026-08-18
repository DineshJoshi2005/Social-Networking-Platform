import React from 'react';
import { createContext } from 'react';

export const authDataContext = createContext();

function AuthContext({ children }) {
    const serverUrl = import.meta.env.VITE_SERVER_URL || "https://social-networking-platform-7wnj.onrender.com";
    const value = {
        serverUrl
    };

    return (
        <authDataContext.Provider value={value}>
            {children}
        </authDataContext.Provider>
    );
}

export default AuthContext;
