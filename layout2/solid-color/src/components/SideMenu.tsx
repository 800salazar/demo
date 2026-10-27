import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { menuItems } from "../hooks/menuItems.ts";

interface SideMenuProps {
    isOpen: boolean;
    closeMenu: () => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, closeMenu }) => {
    const [active, setActive] = useState("home");
    const [manualScroll, setManualScroll] = useState(false);

    const handleClick = (id: string) => {
        setManualScroll(true);
        setActive(id);
        closeMenu();

        const section = document.getElementById(id);
        section?.scrollIntoView({ behavior: "smooth" });

        setTimeout(() => setManualScroll(false), 900);
    };

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

    return (
        <div className="col-xxl-3 col-xl-3 col-lg-4">
            <div className={`side-menu-main ${isOpen ? "show" : ""}`}>
                <Link to="/" className="side-menu-two-logo">
                    <img className="logo" src="./images/svg/logo.svg" alt="logo" />
                </Link>
                <div className="portfolio-girl-menu-main">
                    <img src="./images/home-images/portfolio-girl-menu.jpg" alt="portfolio-girl-menu" />
                </div>
                <div className="list-menu">
                    <p className="side-menu-arya">Arya stone</p>
                    <p className="web-arya">WEB & UI DESIGNER</p>
                    <div className="media-main">
                        <a href="https://www.facebook.com" className="media-icons">
                            <img src="./images/svg/facebook.svg" alt="facebook" />
                        </a>
                        <a href="https://www.instagram.com" className="media-icons">
                            <img src="./images/svg/insta.svg" alt="insta" />
                        </a>
                        <a href="https://x.com" className="media-icons">
                            <img src="./images/svg/twitter.svg" alt="twitter" />
                        </a>
                        <a href="https://www.behance.net" className="media-icons">
                            <img src="./images/svg/behance.svg" alt="behance" />
                        </a>
                        <a href="https://dribbble.com" className="media-icons">
                            <img src="./images/svg/dribbale.svg" alt="dribbale" />
                        </a>
                        <a href="https://www.linkedin.com" className="media-icons">
                            <img src="./images/svg/linkdin.svg" alt="linkdin" />
                        </a>
                    </div>
                </div>
                <div className="list-menu menu-list-main">
                    <ul className="side-menu-ul">
                        {menuItems.map(item => (
                            <li key={item.id} className={active === item.id ? "active" : ""}>
                                <button
                                    className="menu-btn"
                                    onClick={() => handleClick(item.id)}
                                >
                                    {item.label}
                                    <img src={item.icon} alt={item.label} />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="list-menu">
                    <p className="phone-text">PHONE:</p>
                    <a href="tel:+(01)5623894336" className="phone-num">
                        <p>+(01) 5623 894 336</p>
                    </a>
                    <p className="phone-text">EMAIL:</p>
                    <a href="mailto:hello@aryastone.com" className="phone-num">
                        <p>hello@aryastone.com</p>
                    </a>
                    <p className="phone-text">LOCATION:</p>
                    <p className="phone-num">New York, USA</p>
                    <div className="Hire-Me-side-menu">
                        <button className="aryaBtn">
                            Hire Me! <img className="hireMe-svg-side hireMe-hert" src="./images/svg/hireMe-svg.svg" alt="download-svg" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SideMenu;