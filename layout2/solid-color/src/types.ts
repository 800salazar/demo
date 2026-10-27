export type ProjectItem = {
    id: number;
    title: string;
    category: string;
    image: string;
    overlayIcon: string;
    videoUrl?: string;
    galleryImages?: string[];
};

export const menuItems = [
    { label: "HOME", id: "home", icon: "./images/svg/home.svg" },
    { label: "ABOUT ME", id: "about", icon: "./images/svg/about.svg" },
    { label: "SERVICES", id: "services", icon: "./images/svg/services.svg" },
    { label: "PORTFOLIO", id: "portfolio", icon: "./images/svg/portfolio.svg" },
    { label: "TESTIMONIAL", id: "testimonial", icon: "./images/svg/testimonial.svg" },
    { label: "RESUME", id: "resume", icon: "./images/svg/resume.svg" },
    { label: "PRICING PLAN", id: "pricingPlan", icon: "./images/svg/pricingPlan.svg" },
    { label: "BLOG", id: "blog", icon: "./images/svg/blog.svg" },
    { label: "CONTACT", id: "contact", icon: "./images/svg/contact.svg" },
];