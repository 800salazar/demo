import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { menuItems } from "../hooks/menuItems.ts";

interface HeaderProps {
    toggleMenu: () => void;
    isOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleMenu, isOpen }) => {
    const [active, setActive] = useState("home");
    const [manualScroll, setManualScroll] = useState(false);

    const headerRef = useRef<HTMLDivElement>(null);

    // Handle clicking menu items
    const handleClick = (id: string) => {
        setManualScroll(true);
        setActive(id);

        const section = document.getElementById(id);
        section?.scrollIntoView({ behavior: "smooth" });

        setTimeout(() => setManualScroll(false), 900);
    };

    // Highlight menu on scroll (desktop + mobile)
    useEffect(() => {
        const sections = document.querySelectorAll("section");

        const observer = new IntersectionObserver(
            (entries) => {
                if (manualScroll) return;

                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActive(entry.target.id);
                    }
                });
            },
            { threshold: 0.40 }
        );

        sections.forEach((sec) => observer.observe(sec));

        return () => observer.disconnect();
    }, [manualScroll]);

    // Sticky header effect
    useEffect(() => {
        const handleScroll = () => {
            if (!headerRef.current) return;

            if (window.scrollY > 50) {
                headerRef.current.classList.add("scrolled");
            } else {
                headerRef.current.classList.remove("scrolled");
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="container" id="mainHeader" >
            <header ref={headerRef}>
                <Link to="/" className="main-header-logo">
                    <img className="logo" src="./images/svg/logo.svg" alt="logo" />
                </Link>

                <div className="aryaBtn-toggle-main mt-0">

                    {/* DESKTOP MENU */}
                    <ul className="side-menu-ul" id="menu-list-header">
                        {menuItems.map(item => (
                            <li key={item.id} className="menu-btn">
                                <button
                                    className={active === item.id ? "active" : ""}
                                    onClick={() => handleClick(item.id)}
                                >
                                    {item.label}
                                </button>
                            </li>
                        ))}
                    </ul>

                    {/* MOBILE HAMBURGER */}
                    <button
                        id="menu-toggle"
                        className="menu-toggle-button"
                        onClick={toggleMenu}
                    >
                        <span className={`hamburger ${isOpen ? "is-active" : ""}`} id="hamburger-1">
                            <span className="line"></span>
                            <span className="line"></span>
                            <span className="line"></span>
                        </span>
                    </button>
                </div>
            </header>
        </div>
    );
};

export default Header;