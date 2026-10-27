import React from "react";

const BgAnimation: React.FC = () => {
    const bubbleCount = 20;
    return (
        <>
            <div className="bubbles">
                {Array.from({ length: bubbleCount }).map((_, i) => (
                    <div key={i} className="bubble"></div>
                ))}
            </div>
        </>
    );
};

export default BgAnimation;