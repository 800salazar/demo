import React, { useEffect, useRef } from "react";

interface Skill {
    name: string;
    value: number;
    color: string;
}

const skills: Skill[] = [
    { name: "Design", value: 79, color: "#bce70c" },
    { name: "Development", value: 92, color: "#ff759c" },
    { name: "Testing", value: 85, color: "#00cc97" },
    { name: "Marketing", value: 80, color: "#ffdb59" },
    { name: "Photography", value: 76, color: "#6f39fd" },
];

const SkillProgress: React.FC = () => {
    const progressRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const container = progressRef.current;
        if (!container) return;

        const items = container.querySelectorAll(".progress-item");

        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;

                    items.forEach((item, index) => {
                        const skill = skills[index];
                        const numberEl = item.querySelector(".skill-number") as HTMLElement;
                        let count = 0;

                        const interval = setInterval(() => {
                            if (count >= skill.value) {
                                clearInterval(interval);
                            } else {
                                count++;
                                numberEl.textContent = `${count}%`;
                                (item as HTMLElement).style.background =
                                    `conic-gradient(${skill.color} ${count}%, var(--primary-color) ${count}%)`;
                            }
                        }, 20);
                    });

                    observer.unobserve(container);
                });
            },
            { threshold: 0.3 }
        );

        observer.observe(container);
    }, []);

    return (
        <div id="progress" ref={progressRef}>
            {skills.map((skill, i) => (
                <div key={i} className="progress-item">
                    <div className="skill-label">{skill.name}</div>
                    <div className="skill-number">0%</div>
                </div>
            ))}
        </div>
    );
};

export default SkillProgress;
