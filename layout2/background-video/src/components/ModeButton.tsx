import React, { useEffect, useState } from "react";

const ModeButton: React.FC = () => {
    const [theme, setTheme] = useState<"light" | "dark">("light");

    useEffect(() => {
        const savedTheme = localStorage.getItem("mode") as "light" | "dark" | null;
        if (savedTheme) {
            setTheme(savedTheme);
            document.body.classList.toggle("dark-mode", savedTheme === "dark");
        }
    }, []);


    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);

        document.body.classList.toggle("dark-mode", newTheme === "dark");
        localStorage.setItem("mode", newTheme);
    };

    return (
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            <img
                src="./images/svg/sun.svg"
                alt="sun"
                className={`icon ${theme === "dark" ? "hidden" : ""}`}
            />
            <img
                src="./images/svg/moon.svg"
                alt="moon"
                className={`icon ${theme === "light" ? "hidden" : ""}`}
            />
        </button>
    );
};

export default ModeButton;
