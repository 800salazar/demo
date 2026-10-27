import React, { useEffect, useRef } from "react";

const BgAnimation: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext("2d");
        if (!context) return;

        // Set canvas size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const W = canvas.width;
        const H = canvas.height;

        // Mouse store
        let mouse = { x: 0, y: 0 };

        canvas.addEventListener("mousemove", (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        // Vector object (same as your original)
        const vector = {
            create(x: number, y: number) {
                return {
                    x,
                    y,
                    getX() {
                        return this.x;
                    },
                    getY() {
                        return this.y;
                    }
                };
            },
        };

        // Generate vector grid
        const number = 80;
        const vectorStock: any[] = [];

        for (let i = 0; i < W / number + 1; i++) {
            for (let j = 0; j < H / number + 1; j++) {
                vectorStock.push(vector.create(i * number, j * number));
            }
        }

        // Animation update
        const update = () => {
            context.clearRect(0, 0, W, H);

            vectorStock.forEach((v) => {
                const dx = v.getX() - mouse.x;
                const dy = v.getY() - mouse.y;

                let dist = 10 + Math.sqrt(dx * dx + dy * dy);
                dist = Math.min(dist, dist / 4);

                context.save();
                context.translate(v.getX(), v.getY());
                context.rotate(Math.atan2(dy, dx));

                context.fillStyle = "#484848";
                context.fillRect(0, 0, -dist / 4, 1);

                context.restore();
            });

            requestAnimationFrame(update);
        };

        update();

        return () => {
            // Clean up
            canvas.removeEventListener("mousemove", () => { });
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                width: "100vw",
                height: "100vh",
                display: "block",
                position: "fixed",
                top: 0,
                left: 0,
            }}
        />
    );
};

export default BgAnimation;