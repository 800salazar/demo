import React, { useEffect, useRef } from "react";

const BgAnimation: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d")!;
        const colors = ["#484848", "#484848", "#484848"];
        const spacing = 30;
        const tSpeedFactor = [0.2, 0.4, 0.6, 0.8, 1];

        let cubes: any[] = [];
        let n = 0;
        let animationId: number;

        const init = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            cubes = [];
            let xPos = 0;
            n = Math.floor(window.innerWidth / spacing);

            for (let i = 0; i < n; i++) {
                cubes.push({
                    x: xPos,
                    y: Math.round(Math.random() * canvas.height),
                    width: Math.round(Math.random() * 10) * 2,
                    tSpeed: tSpeedFactor[Math.floor(Math.random() * tSpeedFactor.length)],
                    color: colors[Math.floor(Math.random() * colors.length)],
                    angle: 0,
                    upDownFactor: Math.random() >= 0.5 ? 1 : -1,
                });
                xPos += spacing;
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < n; i++) {
                const cube = cubes[i];

                ctx.save();
                ctx.translate(cube.x + cube.width / 2, cube.y + cube.width / 2);
                ctx.rotate(cube.angle);
                ctx.fillStyle = cube.color;
                ctx.globalAlpha = 1;
                ctx.fillRect(-cube.width / 2, -cube.width / 2, cube.width, cube.width);
                ctx.restore();

                cube.y += cube.tSpeed * cube.upDownFactor;
                cube.angle += Math.PI / 360;

                if (cube.upDownFactor === -1) {
                    if (cube.y + cube.width < 0) cube.y = canvas.height;
                } else {
                    if (cube.y >= canvas.height) cube.y = -cube.width;
                }
            }

            animationId = requestAnimationFrame(draw);
        };

        init();
        draw();

        window.addEventListener("resize", () => {
            cancelAnimationFrame(animationId);
            init();
            draw();
        });

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener("resize", init);
        };
    }, []);
    return (
        <>
            <canvas
                ref={canvasRef}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                }}
            />
        </>
    );
};

export default BgAnimation;