import React, { useEffect, useRef } from "react";

const BgAnimation: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Non-null assertion for TS
        const rawCtx = canvas.getContext("2d");
        if (!rawCtx) return;
        const ctx: CanvasRenderingContext2D = rawCtx;

        // Canvas size
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const colours = ["#838485", "#838485", "#838485", "#838485"];
        const maxParticles = 800;
        const particles: Particle[] = [];

        // Mouse center
        let cx = width / 2;
        let cy = height / 2;

        const onMouseMove = (e: MouseEvent) => {
            cx = e.clientX;
            cy = e.clientY;
        };

        window.addEventListener("mousemove", onMouseMove);

        // ---- Particle Class ----
        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            radius: number;
            colour: string;

            constructor(
                x: number,
                y: number,
                vx: number,
                vy: number,
                radius: number,
                colour: string
            ) {
                this.x = x;
                this.y = y;
                this.vx = vx;
                this.vy = vy;
                this.radius = radius;
                this.colour = colour;
            }

            move() {
                if (
                    this.y > height ||
                    this.y < 0 ||
                    this.x > width ||
                    this.x < 0
                ) {
                    this.reset();
                }
                this.x += this.vx;
                this.y += this.vy;
            }

            reset() {
                this.x = cx;
                this.y = cy;
                this.vx = 2 + Math.random() * -4;
                this.vy = 2 + Math.random() * -4;
                this.radius = 1 + Math.random();
            }

            draw(ctx: CanvasRenderingContext2D) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.colour;
                ctx.fill();
            }
        }

        // ---- Particle Creation ----
        function createParticle() {
            const p = new Particle(
                Math.random() * width,
                Math.random() * height,
                1.5 + Math.random() * -3,
                1.5 + Math.random() * -3,
                1 + Math.random(),
                colours[Math.floor(Math.random() * colours.length)]
            );
            particles.push(p);
        }

        function initParticles() {
            for (let i = 0; i < maxParticles; i++) {
                setTimeout(createParticle, 10 * i);
            }
        }

        // ---- Animation Loop ----
        function loop() {
            ctx.clearRect(0, 0, width, height);

            particles.forEach((p) => {
                p.move();
                p.draw(ctx);
            });

            requestAnimationFrame(loop);
        }

        initParticles();
        loop();

        // ---- Handle Resize ----
        const onResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener("resize", onResize);

        // Cleanup
        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("resize", onResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full fixed inset-0 pointer-events-none top-0"
        />
    );
};

export default BgAnimation;