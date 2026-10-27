import React, { useEffect, useRef } from "react";

const BgAnimation: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const canvasBgRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const canvasbg = canvasBgRef.current;

        if (!canvas || !canvasbg) return;

        const ctx = canvas.getContext("2d")!;
        const ctxbg = canvasbg.getContext("2d")!;

        const W = canvas.width;
        const H = canvas.height;

        // =============== CONFIGURATION ===============
        const radMin = 10,
            radMax = 10,
            filledCircle = 60,
            concentricCircle = 30,
            radThreshold = 25;

        const speedMin = 0.3,
            speedMax = 2.5;

        const maxOpacity = 0.6;

        const colors = [
            "52,168,83",
            "117,95,147",
            "199,108,23",
            "194,62,55",
            "0,172,212",
            "120,120,120",
        ];

        const bgColors = [...colors];

        const circleBorder = 10;
        const backgroundMlt = 0.85;

        const linkDist = Math.min(W, H) / 2.4;
        const lineBorder = 2.5;

        const maxCircles = 20;

        // =============== UTIL FUNCTIONS ===============
        const randint = (a: number, b: number) =>
            Math.floor(Math.random() * (b - a + 1) + a);

        const randRange = (a: number, b: number) =>
            Math.random() * (b - a) + a;

        const hyperRange = (a: number, b: number) =>
            Math.random() * Math.random() * Math.random() * (b - a) + a;

        // =============== CIRCLE CLASS ===============
        class Circle {
            x: number;
            y: number;
            radius: number;
            filled: false | "full" | "concentric";
            color: string;
            borderColor: string;
            opacity: number;
            speed: number;
            speedAngle: number;
            speedx: number;
            speedy: number;
            ttl: number;
            background: boolean;

            constructor(background = false) {
                this.background = background;

                this.x = randRange(-W / 2, W / 2);
                this.y = randRange(-H / 2, H / 2);

                this.radius = background
                    ? hyperRange(radMin, radMax) * backgroundMlt
                    : hyperRange(radMin, radMax);

                // Decide fill type
                this.filled =
                    this.radius < radThreshold
                        ? randint(0, 100) > filledCircle
                            ? false
                            : "full"
                        : randint(0, 100) > concentricCircle
                            ? false
                            : "concentric";

                this.color = background
                    ? bgColors[randint(0, bgColors.length - 1)]
                    : colors[randint(0, colors.length - 1)];

                this.borderColor = background
                    ? bgColors[randint(0, bgColors.length - 1)]
                    : colors[randint(0, colors.length - 1)];

                this.opacity = 0.05;

                this.speed = background
                    ? randRange(speedMin, speedMax) / backgroundMlt
                    : randRange(speedMin, speedMax);

                this.speedAngle = Math.random() * 2 * Math.PI;
                this.speedx = Math.cos(this.speedAngle) * this.speed;
                this.speedy = Math.sin(this.speedAngle) * this.speed;

                const spacex = Math.abs(
                    (this.x -
                        (this.speedx < 0 ? -1 : 1) * (W / 2 + this.radius)) / this.speedx
                );
                const spacey = Math.abs(
                    (this.y -
                        (this.speedy < 0 ? -1 : 1) * (H / 2 + this.radius)) /
                    this.speedy
                );

                this.ttl = Math.min(spacex, spacey);
            }

            init() {
                Object.assign(this, new Circle(this.background));
            }
        }

        // =============== CREATE CIRCLES ===============
        const points: Circle[] = [];
        const pointsBack: Circle[] = [];

        for (let i = 0; i < maxCircles * 2; i++) points.push(new Circle());
        for (let i = 0; i < maxCircles; i++) pointsBack.push(new Circle(true));

        // =============== DRAW SINGLE CIRCLE ===============
        const drawCircle = (ctx: CanvasRenderingContext2D, circle: Circle) => {
            ctx.beginPath();
            ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
            ctx.lineWidth = Math.max(
                1,
                (circleBorder * (radMin - circle.radius)) / (radMin - radMax)
            );

            ctx.strokeStyle = `rgba(${circle.borderColor}, ${circle.opacity})`;

            if (circle.filled === "full") {
                ctx.fillStyle = `rgba(${circle.borderColor}, ${circle.background ? circle.opacity * 0.8 : circle.opacity
                    })`;
                ctx.fill();
                ctx.lineWidth = 0;
            }

            ctx.stroke();

            if (circle.filled === "concentric") {
                ctx.beginPath();
                ctx.arc(circle.x, circle.y, circle.radius / 2, 0, Math.PI * 2);
                ctx.lineWidth = Math.max(
                    1,
                    (circleBorder * (radMin - circle.radius)) / (radMin - radMax)
                );
                ctx.strokeStyle = `rgba(${circle.color}, ${circle.opacity})`;
                ctx.stroke();
            }

            circle.x += circle.speedx;
            circle.y += circle.speedy;

            if (circle.opacity < (circle.background ? maxOpacity : 1))
                circle.opacity += 0.01;

            circle.ttl--;
        };

        // =============== RENDER PARTICLES ===============
        const renderPoints = (ctx: CanvasRenderingContext2D, arr: Circle[]) => {
            for (let i = 0; i < arr.length; i++) {
                const c = arr[i];

                if (c.ttl < -20) c.init();
                drawCircle(ctx, c);
            }

            // connections
            for (let i = 0; i < arr.length - 1; i++) {
                for (let j = i + 1; j < arr.length; j++) {
                    const dx = arr[i].x - arr[j].x;
                    const dy = arr[i].y - arr[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist <= arr[i].radius + arr[j].radius) continue;
                    if (dist > linkDist) continue;

                    const opacity = Math.min(arr[i].opacity, arr[j].opacity) * ((linkDist - dist) / linkDist);

                    ctx.beginPath();
                    ctx.moveTo(arr[i].x, arr[i].y);
                    ctx.lineTo(arr[j].x, arr[j].y);
                    ctx.strokeStyle = `rgba(${arr[i].borderColor}, ${opacity})`;
                    ctx.lineWidth =
                        (arr[i].background ? lineBorder * backgroundMlt : lineBorder) *
                        ((linkDist - dist) / linkDist);
                    ctx.stroke();
                }
            }
        };

        // =============== ANIMATION LOOP ===============
        let frameId: number;

        const draw = () => {
            ctx.globalCompositeOperation = "destination-over";
            ctx.clearRect(0, 0, W, H);

            ctxbg.globalCompositeOperation = "destination-over";
            ctxbg.clearRect(0, 0, W, H);

            ctx.save();
            ctx.translate(W / 2, H / 2);
            ctxbg.save();
            ctxbg.translate(W / 2, H / 2);

            renderPoints(ctx, points);
            renderPoints(ctxbg, pointsBack);

            ctx.restore();
            ctxbg.restore();

            frameId = requestAnimationFrame(draw);
        };

        draw();

        // Cleanup on unmount
        return () => {
            cancelAnimationFrame(frameId);
        };
    }, []);
    return (
        <>
            <canvas
                ref={canvasRef}
                id="canvas"
                width={1950}
                height={1080}
            />
            <canvas
                ref={canvasBgRef}
                id="canvasbg"
                width={1950}
                height={1080}
            />
        </>
    );
};

export default BgAnimation;