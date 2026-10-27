import React, { useEffect } from "react";
import { gsap } from "gsap";

const Preloader: React.FC = () => {
    useEffect(() => {
        const handleLoad = () => {
            const svg = document.getElementById("loade-svg");

            if (!(svg instanceof SVGPathElement)) {
                console.error("SVG path element not found");
                return;
            }

            const tl = gsap.timeline();

            const shapes = {
                start: "M0 502S175 272 500 272s500 230 500 230V0H0Z",
                end: "M0 2S175 1 500 1s500 1 500 1V0H0Z"
            };

            tl.to(".loading", {
                delay: 1.2,
                y: -50,
                opacity: 0,
                duration: 0.6
            })
                .to(svg, {
                    duration: 0.6,
                    attr: { d: shapes.start },
                    ease: "power1.easeIn"
                })
                .to(svg, {
                    duration: 0.6,
                    attr: { d: shapes.end },
                    ease: "power1.easeOut"
                })
                .to(".preloader", {
                    y: -1000,
                    duration: 0.8,
                    ease: "power2.inOut"
                })
                .set(".preloader", {
                    zIndex: -1,
                    display: "none"
                });
        };

        window.addEventListener("load", handleLoad);
        return () => window.removeEventListener("load", handleLoad);
    }, []);

    return (
        <div className="preloader">
            <svg viewBox="0 0 1000 1000" preserveAspectRatio="none">
                <path
                    id="loade-svg"
                    d="M0,1005S175,995,500,995s500,5,500,5V0H0Z"
                ></path>
            </svg>

            <div className="loader-main">
                <div className="loading">
                    <span data-text="L">L</span>
                    <span data-text="O">O</span>
                    <span data-text="A">A</span>
                    <span data-text="D">D</span>
                    <span data-text="I">I</span>
                    <span data-text="N">N</span>
                    <span data-text="G">G</span>
                </div>
            </div>
        </div>
    );
};

export default Preloader;
