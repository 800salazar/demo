import React, { useEffect, useRef } from "react";


// TypeScript type for a particle
interface Particle {
    x: number;
    y: number;
    diameter: number;
    duration: number;
    amplitude: number;
    offsetY: number;
    arc: number;
    startTime: number;
    colour: string;
}

const NUM_PARTICLES = 600;
const PARTICLE_SIZE = 0.5; // in view heights
const SPEED = 20000; // milliseconds

const BgAnimation: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particles = useRef<Particle[]>([]);


    // Random helper
    const rand = (low: number, high: number) => Math.random() * (high - low) + low;

    // Normal distribution generator
    const randomNormal = (o: { mean?: number; dev?: number } = {}) => {
        const mean = o.mean ?? 0;
        const dev = o.dev ?? 1;
        let r: number, a: number, n: number, e: number, l = mean, t = dev;
        do {
            a = 2 * Math.random() - 1;
            n = 2 * Math.random() - 1;
            r = a * a + n * n;
        } while (r >= 1);
        e = a * Math.sqrt((-2 * Math.log(r)) / r);
        return t * e + l;
    };

    const createParticle = (_canvas: HTMLCanvasElement): Particle => {
        const colour = {
            r: 255,
            g: randomNormal({ mean: 125, dev: 20 }),
            b: 50,
            a: rand(0, 1),
        };
        return {
            x: -2,
            y: -2,
            diameter: Math.max(0, randomNormal({ mean: PARTICLE_SIZE, dev: PARTICLE_SIZE / 2 })),
            duration: randomNormal({ mean: SPEED, dev: SPEED * 0.1 }),
            amplitude: randomNormal({ mean: 16, dev: 2 }),
            offsetY: randomNormal({ mean: 0, dev: 10 }),
            arc: Math.PI * 2,
            startTime: performance.now() - rand(0, SPEED),
            colour: `rgba(${colour.r}, ${colour.g}, ${colour.b}, ${colour.a})`,
        };
    };

    const moveParticle = (particle: Particle, time: number, _canvas: HTMLCanvasElement) => {
        const progress = ((time - particle.startTime) % particle.duration) / particle.duration;
        return {
            ...particle,
            x: progress,
            y: Math.sin(progress * particle.arc) * particle.amplitude + particle.offsetY,
        };
    };

    const drawParticle = (_particle: Particle, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
        const vh = canvas.height / 100;
        ctx.fillStyle = _particle.colour;
        ctx.beginPath();
        ctx.ellipse(
            _particle.x * canvas.width,
            _particle.y * vh + canvas.height / 2,
            _particle.diameter * vh,
            _particle.diameter * vh,
            0,
            0,
            2 * Math.PI
        );
        ctx.fill();
    };

    const draw = (time: number, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
        particles.current = particles.current.map((p) => moveParticle(p, time, canvas));
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.current.forEach((p) => drawParticle(p, canvas, ctx));
        requestAnimationFrame((t) => draw(t, canvas, ctx));
    };

    const initializeCanvas = (canvas: HTMLCanvasElement): CanvasRenderingContext2D | null => {
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;
        const resize = () => {
            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;
        };
        resize();
        window.addEventListener("resize", resize);
        return ctx;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = initializeCanvas(canvas);
        if (!ctx) return;

        // Initialize particles
        for (let i = 0; i < NUM_PARTICLES; i++) {
            particles.current.push(createParticle(canvas));
        }

        // Start animation
        requestAnimationFrame((time) => draw(time, canvas, ctx));

        return () => {
            // Clean up
            window.removeEventListener("resize", () => { });
        };
    }, []);

    return (
        <canvas ref={canvasRef} id="particle-canvas" />
    );
};

export default BgAnimation;