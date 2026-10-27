import React from "react";
import type { ProjectItem } from "../types.ts";

type Props = {
    project: ProjectItem;
    onClose: () => void;
};

const VideoPopup: React.FC<Props> = ({ project, onClose }) => {
    if (!project.videoUrl) return null;

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-box h-auto" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>
                    X
                </button>
                <iframe
                    width="100%"
                    height="400"
                    src={project.videoUrl}
                    allow="autoplay; fullscreen; encrypted-media"
                    title={project.title}
                />
            </div>
        </div>
    );
};

export default VideoPopup;
