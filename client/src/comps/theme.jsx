import { create } from "zustand";

// Retrieve theme from localStorage or use 'dark' as default
const getInitialTheme = () => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme || "dark"; // Default to 'dark'
};

// Apply theme to `document.documentElement` on first load
document.documentElement.setAttribute("data-theme", getInitialTheme());

const useTheme = create(set => ({
    theme: getInitialTheme(),
    toggleTheme: () =>
        set(state => {
            const newTheme = state.theme === "light" ? "dark" : "light";
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
            return { theme: newTheme };
        })
}));

export default useTheme;
