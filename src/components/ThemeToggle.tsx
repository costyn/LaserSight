import { useState, useEffect } from 'react';

export function ThemeToggle() {
    const [darkMode, setDarkMode] = useState(true); // Default to dark mode

    // Check for user's preferred color scheme or previously saved preference
    useEffect(() => {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        
        // Use saved preference if available, otherwise default to dark mode
        if (savedTheme === 'light') {
            setDarkMode(false);
        }
    }, []);

    // Apply theme changes when darkMode state changes
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    return (
        <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
            {darkMode ? (
                <span className="text-yellow-500 text-lg">☀️</span>
            ) : (
                <span className="text-gray-700 text-lg">🌙</span>
            )}
        </button>
    );
}