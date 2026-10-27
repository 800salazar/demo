import React from "react";
import type { ProjectItem } from "../types.ts";

type Props = {
    project: ProjectItem;
    onClose: () => void;
};

const ContentPopup: React.FC<Props> = ({ project, onClose }) => {
    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-box" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>
                    X
                </button>
                <div className="popup-content">
                    <img className="content-img" src={project.image} alt={project.title} />
                    <p className="spce-in-text">{project.title}</p>
                    <p className="spce-in-Content">Content</p>
                    <div className="corporate_main">
                        <div className="cuberto_main">
                            <p className="created_by">Created By :</p>
                            <p className="cuberto">Cuberto</p>
                        </div>
                        <div className="cuberto_main">
                            <p className="created_by">Date :</p>
                            <p className="cuberto">20/12/2024</p>
                        </div>
                        <div className="cuberto_main">
                            <p className="created_by">Client :</p>
                            <p className="cuberto">Rayan Patrick</p>
                        </div>
                        <div className="cuberto_main">
                            <p className="created_by">Categories :</p>
                            <p className="cuberto">Content</p>
                        </div>
                    </div>
                    <p className="ipsum mb-2">Lorem ipsum dolor, sit amet consectetur
                        adipisicing elit. Fuga consequatur delectus porro sapiente
                        molestias, magni quasi sed, enim corporis omnis doloremque
                        soluta inventore dolorum conseqr quo obcaecati rerum sit non.
                        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Fuga
                        consequatur delectus porro sapiente molestias, magni quasi sed,
                        enim corporis omnis doloremque soluta inventore dolorum
                        consequuntur quo obcaecati rerum sit non.
                    </p>
                    <p className="ipsum">Lorem ipsum dolor, sit amet consectetur adipisicing
                        elit. Fuga consequatur delectus porro sapiente molestias, magni
                        quasi sed, enim corporis omnis doloremque soluta inventore
                        dolorum consetur quo obcaecati rerum sit non.
                    </p>
                    <div className="plumbing-grid">
                        <img src="./images/home-images/project-img1.jpg"
                            alt="single-blog-img3" />
                        <img src="./images/home-images/project-img4.jpg"
                            alt="single-blog-img4" />
                    </div>
                    <p className="ipsum">Lorem ipsum dolor, sit amet consectetur adipisicing
                        elit. Fuga consequatur delectus porro sapiente molestias, magni
                        quasi sed, enim corporis omnis doloremque soluta inventore
                        dolorum consetur quo obcaecati rerum sit non.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ContentPopup;
