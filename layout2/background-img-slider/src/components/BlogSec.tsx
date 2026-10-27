import React, { useState } from "react";
import blogData from "../data/blogData.json";
import BlogPopUp from "../components/BlogPopUp.tsx";

const BlogList: React.FC = () => {
    const [visibleCount, setVisibleCount] = useState(2);
    const [selectedBlog, setSelectedBlog] = useState<any | null>(null);

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + 2);
    };

    return (
        <div>
            <div className="row blog-row">
                {blogData.slice(0, visibleCount).map((blog) => (
                    <div
                        key={blog.id}
                        className="col-xxl-6 col-xl-6 col-lg-6 col-md-6"
                    >
                        <div
                            className="blog-box"
                            onClick={() => setSelectedBlog(blog)}
                        >
                            <p className="date-blog">{blog.date}</p>
                            <h3 className="blog-title">{blog.title}</h3>
                            <p className="Integer-blog">{blog.content1}</p>
                            <img className="blog-img" src={blog.thumbnail} alt={blog.title} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Load more button */}
            {visibleCount < blogData.length && (
                <div className="load-more-btn">
                    <button className="aryaBtn" onClick={handleLoadMore}>
                        Load More
                        <img src="/images/svg/load-more.svg" alt="load-more" />
                    </button>
                </div>
            )}

            {/* Popup */}
            {selectedBlog && (
                <BlogPopUp
                    blog={selectedBlog}
                    onClose={() => setSelectedBlog(null)}
                />
            )}
        </div>
    );
};

export default BlogList;
