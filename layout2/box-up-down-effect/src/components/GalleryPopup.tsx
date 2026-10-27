import React from "react";
import type { ProjectItem } from "../types.ts";

type Props = {
    project: ProjectItem;
    onClose: () => void;
    galleryImages: string[];
};

const GalleryPopup: React.FC<Props> = ({ project, onClose, galleryImages }) => {
    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-box" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>
                    X
                </button>
                <div className="popup-gallery">
                    <h2 className="spce-in-text text-gallery">{project.title}</h2>
                    <div className="gallery-main-card">
                        {galleryImages.map((img, i) => (
                            <img key={i} src={img} alt={`gallery-${i}`} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GalleryPopup;
