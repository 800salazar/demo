import { useState } from "react";
import type { ProjectItem } from "../types.ts";
import projectData from "../data/projectData.json";
import ContentPopup from "../components/ContentPopup.tsx";
import GalleryPopup from "../components/GalleryPopup.tsx";
import VideoPopup from "../components/VideoPopup.tsx";

export default function Projects() {
    const filters = ["Show All", "Content", "Gallery", "YT Video", "Vimeo Video"] as const;
    const [activeFilter, setActiveFilter] = useState<typeof filters[number]>("Show All");
    const [selectedItem, setSelectedItem] = useState<ProjectItem | null>(null);

    const filteredProjects =
        activeFilter === "Show All"
            ? projectData
            : projectData.filter((item) => item.category === activeFilter);

    // multiple gallery images
    const galleryImages = [
        "./images/gallery/gallery-img1.jpg",
        "./images/gallery/gallery-img2.jpg",
        "./images/gallery/gallery-img3.jpg",
        "./images/gallery/gallery-img4.jpg",
        "./images/gallery/gallery-img5.jpg",
        "./images/gallery/gallery-img6.jpg",
        "./images/gallery/gallery-img7.jpg",
        "./images/gallery/gallery-img8.jpg",
    ];

    return (
        <div>
            {/* Filter Buttons */}
            <div className="tab-btn-main">
                {filters.map((filter, i) => (
                    <button
                        key={i}
                        className={`aryaBtn tab-btn ${activeFilter === filter ? "tab-active" : ""}`}
                        onClick={() => setActiveFilter(filter)}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Gallery */}
            <div className="tabContainer tab-active">
                <div className="gallery">
                    {filteredProjects.map((item: ProjectItem) => (
                        <div className="gallery-item" key={item.id}>
                            <div className="gallery-item-sub" onClick={() => setSelectedItem(item)}>
                                <img src={item.image} alt={item.title} />
                                <div className="overlay">
                                    <img src={item.overlayIcon} alt={item.category} className="vimeo-icon" />
                                    <p className="overlay-text">{item.title}</p>
                                </div>
                            </div>

                            <div className="gallery-info">
                                <h3>{item.title}</h3>
                                <p>{item.category}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Popups */}
            {selectedItem && selectedItem.category === "Content" && (
                <ContentPopup project={selectedItem} onClose={() => setSelectedItem(null)} />
            )}
            {selectedItem && selectedItem.category === "Gallery" && (
                <GalleryPopup
                    project={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    galleryImages={galleryImages}
                />
            )}
            {selectedItem &&
                (selectedItem.category === "YT Video" || selectedItem.category === "Vimeo Video") && (
                    <VideoPopup project={selectedItem} onClose={() => setSelectedItem(null)} />
                )}
        </div>
    );
}
