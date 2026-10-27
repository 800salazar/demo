import React from "react";

type BlogDetailsProps = {
    blog: any;
    onClose: () => void;
};

const BlogPopUp: React.FC<BlogDetailsProps> = ({ blog, onClose }) => {
    if (!blog) return null;

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-box blog-details-box" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>X</button>
                <div className="modal-body">
                    <div className="date-tag-eye-main">
                        <p className="date-blog">
                            <img src="/images/svg/calendar-clock.svg" alt="date" />
                            {blog.date}
                        </p>
                        <p className="date-blog">
                            <img src="/images/svg/tag.svg" alt="tag" />
                            {blog.tag}
                        </p>
                        <p className="date-blog">
                            <img src="/images/svg/eye.svg" alt="views" />
                            {blog.views}
                        </p>
                    </div>
                    <h2 className="simple-steps">{blog.title}</h2>
                    <img src={blog.thumbnail} alt={blog.title} className="single-blog" />
                    <p className="fusc mt-0">{blog.content1}</p>
                    <div className="qoute-box">
                        <h2>{blog.quote}</h2>
                        <p className="Michel">{blog.quoteAuthor}</p>
                    </div>
                    <p className="fusc">{blog.content2}</p>
                    <div className="plan-body">
                        <ul>
                            {blog.list?.map((item: string, i: number) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="media-main single-blog-media">
                        <a href="https://www.facebook.com" className="media-icons">
                            <img src="/images/svg/facebook.svg" alt="fb" />
                        </a>
                        <a href="https://www.instagram.com" className="media-icons">
                            <img src="/images/svg/insta.svg" alt="insta" />
                        </a>
                        <a href="https://x.com" className="media-icons">
                            <img src="/images/svg/twitter.svg" alt="twitter" />
                        </a>
                        <a href="https://www.behance.net" className="media-icons">
                            <img src="/images/svg/behance.svg" alt="behance" />
                        </a>
                        <a href="https://dribbble.com" className="media-icons">
                            <img src="/images/svg/dribbale.svg" alt="dribbble" />
                        </a>
                        <a href="https://www.linkedin.com" className="media-icons">
                            <img src="/images/svg/linkdin.svg" alt="linkedin" />
                        </a>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default BlogPopUp;
