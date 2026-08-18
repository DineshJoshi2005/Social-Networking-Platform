import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem("conexis_theme");
        return saved ? saved === "dark" : true;
    });

    useEffect(() => {
        const root = document.documentElement;
        const body = document.body;
        if (darkMode) {
            root.classList.add("dark");
            body?.classList.add("dark");
            localStorage.setItem("conexis_theme", "dark");
        } else {
            root.classList.remove("dark");
            body?.classList.remove("dark");
            localStorage.setItem("conexis_theme", "light");
        }
    }, [darkMode]);

    const toggleTheme = () => {
        setDarkMode(prev => !prev);
    };

    return (
        <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export default ThemeProvider;
