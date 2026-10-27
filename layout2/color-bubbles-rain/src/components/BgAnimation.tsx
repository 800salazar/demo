import React, { useEffect, useRef } from "react";


interface ConfettiParticle {
    x: number;
    y: number;
    r: number;
    r2: number;
    vx: number;
    vy: number;
    opacity: number;
    dop: number;
    xmax: number;
    ymax: number;
    rgb: string;
    style: number[];
    draw: () => void;
}


const BgAnimation: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const xpos = useRef(0.5);   // wind direction based on mouse
    const confettiRef = useRef<ConfettiParticle[]>([]);
    const frameRef = useRef<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const COLORS = [
            [85, 71, 106],
            [174, 61, 99],
            [219, 56, 83],
            [244, 92, 68],
            [248, 182, 70],
        ];

        let w = window.innerWidth;
        let h = window.innerHeight;

        const resize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        };

        window.addEventListener("resize", resize);
        resize();

        const range = (a: number, b: number) => Math.random() * (b - a) + a;

        const drawCircle = (x: number, y: number, r: number, style: string) => {
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2, false);
            ctx.fillStyle = style;
            ctx.fill();
        };

        class Confetti {
            style: number[];
            rgb: string;
            r: number;
            r2: number;
            x!: number;
            y!: number;
            vx!: number;
            vy!: number;
            opacity!: number;
            dop!: number;
            xmax!: number;
            ymax!: number;

            constructor() {
                this.style = COLORS[Math.floor(range(0, 5))];
                this.rgb = `rgba(${this.style[0]},${this.style[1]},${this.style[2]}`;
                this.r = Math.floor(range(2, 6));
                this.r2 = 2 * this.r;
                this.replace();
            }

            replace() {
                this.opacity = 0;
                this.dop = 0.03 * range(1, 4);
                this.x = range(-this.r2, w - this.r2);
                this.y = range(-20, h - this.r2);
                this.xmax = w - this.r;
                this.ymax = h - this.r;
                this.vx = range(0, 2) + 8 * xpos.current - 5;
                this.vy = 0.7 * this.r + range(-1, 1);
            }

            draw() {
                this.x += this.vx;
                this.y += this.vy;
                this.opacity += this.dop;

                if (this.opacity > 1) {
                    this.opacity = 1;
                    this.dop *= -1;
                } else if (this.opacity < 0 || this.y > this.ymax) {
                    this.replace();
                }

                // Wrap horizontally
                if (this.x > this.xmax || this.x < 0) {
                    this.x = (this.x + this.xmax) % this.xmax;
                }

                drawCircle(
                    Math.floor(this.x),
                    Math.floor(this.y),
                    this.r,
                    `${this.rgb},${this.opacity})`
                );
            }
        }

        // Create particles
        const NUM = 350;
        confettiRef.current = Array.from({ length: NUM }).map(
            () => new Confetti()
        );

        // Mouse wind
        document.onmousemove = (e) => {
            xpos.current = e.pageX / w;
        };

        // Animation loop
        const step = () => {
            ctx.clearRect(0, 0, w, h);

            confettiRef.current.forEach((c) => c.draw());

            frameRef.current = requestAnimationFrame(step);
        };

        step();

        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <canvas
            id="world"
            ref={canvasRef}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                pointerEvents: "none",
            }}
        />
    );
};

export default BgAnimation;
