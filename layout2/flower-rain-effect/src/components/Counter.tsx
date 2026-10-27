import { useEffect, useRef } from "react";

export default function CounterSection() {
    const sectionRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const container = sectionRef.current;
        if (!container) return;

        const counters = container.querySelectorAll<HTMLParagraphElement>(".count");
        
        // Animate counter
        const animateCounter = (el: HTMLParagraphElement) => {
            const finalVal = parseInt(el.textContent || "0");
            let current = 0;

            const duration = 1500;
            const step = Math.max(1, Math.floor(finalVal / (duration / 50)));

            const interval = setInterval(() => {
                current += step;

                if (current >= finalVal) {
                    current = finalVal;
                    clearInterval(interval);
                }

                el.textContent = current < 10 ? `0${current}` : `${current}`;
            }, 50);
        };

        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        counters.forEach(counter => animateCounter(counter));
                        observer.disconnect(); 
                    }
                });
            },
            { threshold: 0.4 }
        );

        observer.observe(container);

        return () => observer.disconnect();
    }, []);

    return (
        <div className="yer-exp-box-main" ref={sectionRef}>
            <div className="yer-exp-box counter">
                <p className="degit count">07</p>
                <div>
                    <p>+</p>
                    <p>Years Of Exp.</p>
                </div>
            </div>
            <div className="yer-exp-box counter">
                <p className="degit count">26</p>
                <div>
                    <p>k+</p>
                    <p>Work Hours</p>
                </div>
            </div>
            <div className="yer-exp-box counter">
                <p className="degit count">99</p>
                <div>
                    <p>+</p>
                    <p>Projects Done</p>
                </div>
            </div>
        </div>
    );
}
