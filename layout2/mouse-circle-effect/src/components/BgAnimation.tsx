import React, { useEffect, useRef } from "react";

const BgAnimation: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const _canvas = canvas;
        const _ctx = ctx;

        _canvas.width = window.innerWidth;
        _canvas.height = window.innerHeight;

        const config = {
            particleNumber: 800,
            maxParticleSize: 10,
            maxSpeed: 40,
            colorVariation: 50,
        };

        const colorPalette = {
            matter: [
                { r: 36, g: 18, b: 42 },
                { r: 78, g: 36, b: 42 },
                { r: 252, g: 178, b: 96 },
                { r: 253, g: 238, b: 152 },
            ],
        };

        let particles: Particle[] = [];

        class Particle {
            x: number;
            y: number;
            r: number;
            c: string;
            s: number;
            d: number;

            constructor(x?: number, y?: number) {
                this.x = x ?? Math.random() * _canvas.width;
                this.y = y ?? Math.random() * _canvas.height;
                this.r = Math.ceil(Math.random() * config.maxParticleSize);

                this.c = colorVariation(
                    colorPalette.matter[
                    Math.floor(Math.random() * colorPalette.matter.length)
                    ]
                );

                this.s = Math.pow(Math.ceil(Math.random() * config.maxSpeed), 0.7);
                this.d = Math.round(Math.random() * 360);
            }
        }

        function colorVariation(color: any): string {
            const r =
                Math.random() * config.colorVariation -
                config.colorVariation / 2 +
                color.r;
            const g =
                Math.random() * config.colorVariation -
                config.colorVariation / 2 +
                color.g;
            const b =
                Math.random() * config.colorVariation -
                config.colorVariation / 2 +
                color.b;
            const a = Math.random() + 0.5;
            return `rgba(${r},${g},${b},${a})`;
        }

        function updateParticleModel(p: Particle) {
            const a = 180 - (p.d + 90);

            if (p.d > 0 && p.d < 180)
                p.x += (p.s * Math.sin(p.d)) / Math.sin(p.s);
            else p.x -= (p.s * Math.sin(p.d)) / Math.sin(p.s);

            if (p.d > 90 && p.d < 270)
                p.y += (p.s * Math.sin(a)) / Math.sin(p.s);
            else p.y -= (p.s * Math.sin(a)) / Math.sin(p.s);

            return p;
        }

        function drawParticle(x: number, y: number, r: number, c: string) {
            _ctx.beginPath();
            _ctx.fillStyle = c;
            _ctx.arc(x, y, r, 0, Math.PI * 2);
            _ctx.fill();
        }

        function cleanUpArray() {
            particles = particles.filter((p) => p.x > -100 && p.y > -100);
        }

        function initParticles(num: number, x?: number, y?: number) {
            for (let i = 0; i < num; i++) {
                particles.push(new Particle(x, y));
            }
            particles.forEach((p) => drawParticle(p.x, p.y, p.r, p.c));
        }

        let frameId: number;

        function frame() {
            // ✅ Removed drawBg()
            _ctx.clearRect(0, 0, _canvas.width, _canvas.height); // optional: clear canvas before drawing
            particles = particles.map(updateParticleModel);
            particles.forEach((p) => drawParticle(p.x, p.y, p.r, p.c));
            frameId = requestAnimationFrame(frame);
        }

        const handleClick = (event: MouseEvent) => {
            cleanUpArray();
            initParticles(config.particleNumber, event.clientX, event.clientY);
        };

        document.body.addEventListener("click", handleClick);

        initParticles(config.particleNumber);
        frame();

        return () => {
            cancelAnimationFrame(frameId);
            document.body.removeEventListener("click", handleClick);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            id="canvas"
            style={{
                
            }}
        />
    );
};

export default BgAnimation;