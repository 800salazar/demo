import { useState } from "react";
import { Typewriter } from "react-simple-typewriter";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import Header from "../components/Header.tsx";
import SideMenu from "../components/SideMenu.tsx";
import CounterSection from "../components/Counter.tsx";
import Projects from "../components/Project.tsx";
import SkillProgress from "../components/SkillProgress.tsx";
import BlogSec from "../components/BlogSec.tsx";
import Footer from "../components/Footer.tsx";
import aboutDetailData from "../data/aboutDetailData.json";
import testimonialData from '../data/testimonialData.json';
import servicesData from '../data/servicesData.json';
import pricingData from '../data/pricingData.json';
import resumeData from '../data/resumeData.json';
import awardsData from '../data/awardsData.json';

const Home: React.FC = () => {
    // Toggle Menu 
    const [menuOpen, setMenuOpen] = useState(false);
    // Marquee Images
    const logos = [
        "/images/home-images/client-logo1.png",
        "/images/home-images/client-logo2.png",
        "/images/home-images/client-logo3.png",
        "/images/home-images/client-logo4.png",
    ];

    return (
        <>
            <div className="site-containe">
                <Header toggleMenu={() => setMenuOpen(!menuOpen)} isOpen={menuOpen} />
                {/* <!-- ====================================== Side Menu ===================================== --> */}
                <div className="container">
                    <div className="row main-row">
                        <SideMenu isOpen={menuOpen} closeMenu={() => setMenuOpen(false)} />
                        <div className="col-xxl-9 col-xl-9 col-lg-12">
                            {/* <!-- ====================================== Section-One ===================================== --> */}
                            <section className="section-one" id="home">
                                <div className="row section-one-row">
                                    <div className="col-xxl-6 col-xl-6 col-lg-6">
                                        <p className="hi-there">Hi there! <span>👋</span></p>
                                        <h1 className="creative">Creative Web & UI Designer.</h1>
                                        <h2 className="visionary">I am a visionary creative designer, known for my ability
                                            to turn concepts into captivating visual narratives. My deep passion for the world
                                            of design allows me to craft compelling stories through my artistic ingenuity.</h2>
                                        <div className="download-btn">
                                            <button className="aryaBtn">
                                                Download CV <img className="download-svg" src="./images/svg/download-svg.svg" alt="download-svg" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-xxl-6 col-xl-6 col-lg-6 portfolio-girl-img-col">
                                        <div className="position-relative">
                                            <video autoPlay loop muted className="portfolio-girl-img challenge-img">
                                                <source src="./video/video.mp4" type="video/mp4" />
                                            </video>
                                            <div className="girl-name">
                                                <p className="ityped">
                                                    <Typewriter
                                                        words={["HI THERE!", "I'M ARYA Stone", "Web & UI Designer!"]}
                                                        loop={true}
                                                        cursor
                                                        cursorStyle="_"
                                                        typeSpeed={60}
                                                        deleteSpeed={40}
                                                        delaySpeed={1500}
                                                    />
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                            {/* <!-- ====================================== Section-Two ===================================== --> */}
                            <section className="section-two overflow-hidden" id="about">
                                <div className="row">
                                    <div className="col-xxl-5 col-xl-5 col-lg-5 about-col">
                                        <h2 className="arya-stack-about"><span>I’m</span> Arya Stone</h2>
                                        <p className="WebExperts">Your Web Experts</p>
                                        <CounterSection />
                                    </div>
                                    <div className="col-xxl-7 col-xl-7 col-lg-7 self-taught-col">
                                        <h2 className="self-taught">Hello! <span>I’m Arya</span> a self-taught &
                                            award-winning <span>Web Designer & UI Developer</span> with over <span>Seven years
                                                of work experience.</span> started in my children’s room and got pro at renowned
                                            <span> Ren Tech</span> Agencies.
                                        </h2>
                                        <h2 className="visionary">I transform ideas into impactful digital experiences,
                                            delivering innovative solutions that elevate brands and captivate audiences around
                                            the world.
                                        </h2>
                                        <div className="about-deatils-head">
                                            {aboutDetailData.map((item, index) => (
                                                <div className="about-detail-main" key={index}>
                                                    <p className="about-detail">{item.label}</p>
                                                    <p className="about-detail-info">{item.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>
                            {/* <!-- ====================================== Section-Three ===================================== --> */}
                            <section className="section-three" id="services">
                                <h3 className="creative brand">Helping Brands <span>achieve digital mastery of</span> Creative Innovation <span>and</span> Strategic Planning.
                                </h3>
                                <h3 className="visionary mb-5">Transforming ideas into digital realities by blending strategic
                                    insights with innovative design, helping brands thrive in a rapidly evolving digital
                                    landscape.</h3>
                                <div className="services-wrapper">
                                    {servicesData.map((service) => (
                                        <div className="services-box" key={service.id}>
                                            <div>
                                                <img
                                                    className="services-icon"
                                                    src={service.icon}
                                                    alt={service.title}
                                                />
                                                <p className="web-dev-text">{service.title}</p>
                                            </div>
                                            <p className="visionary">{service.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                            {/* <!-- ====================================== Section-Four ===================================== --> */}
                            <section className="section-four" id="portfolio">
                                <h2 className="creative">Featured Projects</h2>
                                <h2 className="visionary">My step-by-step guide ensures a smooth project journey, from the
                                    initial consultation to the final delivery. I take care of every detail, allowing you to
                                    focus on what you do best.</h2>
                                <Projects />
                            </section>
                            {/* <!-- ====================================== Section-Five ===================================== --> */}
                            <section className="section-five" id="testimonial">
                                <h3 className="creative brand">Our Clients <span>love working with us, we are
                                </span>Confident You Will Too!
                                </h3>
                                <h3 className="visionary">Our happy customers give us impactful and positive feedback on
                                    our services customer support & etc.</h3>
                                <div className="testimonial">
                                    <Swiper
                                        modules={[Autoplay, Pagination]}
                                        autoplay={{ delay: 3000 }}
                                        pagination={{
                                            el: ".custom-pagination",
                                            clickable: true
                                        }}
                                        slidesPerView={1}
                                        loop={true}
                                        speed={1000}
                                    >
                                        {testimonialData.map((item) => (
                                            <SwiperSlide key={item.id}>
                                                <div className="testimonial-box">
                                                    <img className="client-img" src={item.image} alt={item.name} />
                                                    <div className="slider-text-group">
                                                        <div className="am-text-main">
                                                            <p>{item.title}</p>
                                                            <img src={item.quoteIcon} alt="quote" />
                                                        </div>
                                                        <p className="Neque">{item.text}</p>
                                                        <p className="client-name">
                                                            {item.name} <span>({item.position})</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                    {/* CUSTOM PAGINATION */}
                                    <div className="custom-pagination"></div>
                                </div>
                                <div className="section-title">
                                    <div className="line"></div>
                                    <div className="title-box">MY AWESOME CLIENTS</div>
                                    <div className="line"></div>
                                </div>
                                {/* <!-- =============== Marquee Track =========== --> */}
                                <div className="logos-marquee">
                                    <div className="marquee-track">
                                        {[...logos, ...logos].map((logo, index) => (
                                            <div className="marquee-item" key={index}>
                                                <img src={logo} alt={`client-logo-${index}`} className="brand-logos" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                            {/* <!-- ====================================== Section-Six ===================================== --> */}
                            <section className="section-six" id="resume">
                                <div className="row resume-sec-row">
                                    {/* Education */}
                                    <div className="col-xxl-6 col-lg-6">
                                        <h2 className="creative brand">Education</h2>
                                        {resumeData.education.map(item => (
                                            <div key={item.id} className="education position-relative">
                                                <div className="side_circle_ring">
                                                    <div className="small_yellow_border">
                                                        <div className="small_yellow_circle"></div>
                                                    </div>
                                                </div>
                                                <div className="small_yellow_border_main">
                                                    <p className="bachelor">{item.title}</p>
                                                    <p className="cursus university">
                                                        {item.institute} / {item.year}
                                                    </p>
                                                    <p className="cursus">{item.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Experience */}
                                    <div className="col-xxl-6 col-lg-6">
                                        <h2 className="creative brand">Experience.</h2>
                                        {resumeData.experience.map(item => (
                                            <div key={item.id} className="education position-relative">
                                                <div className="side_circle_ring">
                                                    <div className="small_yellow_border">
                                                        <div className="small_yellow_circle"></div>
                                                    </div>
                                                </div>
                                                <div className="small_yellow_border_main">
                                                    <p className="bachelor">{item.title}</p>
                                                    <p className="cursus university">
                                                        {item.institute} / {item.year}
                                                    </p>
                                                    <p className="cursus">{item.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="coding-skill-section">
                                    <h2 className="creative brand pb-0">Top <span>Skills</span></h2>
                                    <SkillProgress />
                                </div>
                                <div className="coding-skill-section">
                                    <h2 className="creative brand pb-0">Design <span>Skills</span></h2>
                                    <div className="design-skill-sub-section">
                                        <div className="design-skills-img-main flip_up show">
                                            <img src="./images/home-images/figma-img.png" alt="figma-img" />
                                            <div className="skill-counter-main">
                                                <p>94%</p>
                                                <p>HTML, CSS</p>
                                            </div>
                                        </div>
                                        <div className="design-skills-img-main photoshop flip_up show">
                                            <img src="./images/home-images/photoshop-img.png" alt="photoshop-img" />
                                            <div className="skill-counter-main photoshop-text">
                                                <p>98%</p>
                                                <p>PHOTOSHOP</p>
                                            </div>
                                        </div>
                                        <div className="design-skills-img-main adobe-xd flip_up show">
                                            <img src="./images/home-images/adobe-xd-img.png" alt="adobe-xd-img" />
                                            <div className="skill-counter-main adobe-xd-text">
                                                <p>88%</p>
                                                <p>ADOBE XD</p>
                                            </div>
                                        </div>
                                        <div className="design-skills-img-main sketch flip_up show">
                                            <img src="./images/home-images/sktech-img.png" alt="sktech-img" />
                                            <div className="skill-counter-main sketch-text">
                                                <p>85%</p>
                                                <p>SKETCH</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* ======== Awards Section ======== */}
                                <div className="awards-section overflow-hidden">
                                    <h2 className="creative pb-0">Awards.</h2>
                                    <div className="row awards-row">
                                        {awardsData.map((award) => (
                                            <div className="col-xxl-6 col-xl-6 col-lg-6 col-md-6" key={award.id}>
                                                <div className="box-item flip_up">
                                                    <div className="flip-box">
                                                        <div className="flip-box-front">
                                                            <div className="inner">
                                                                <div className="years-award-img">
                                                                    <img className="winner-award" src={award.image} alt={award.title} />
                                                                    <p className="award-yer">{award.year}</p>
                                                                </div>
                                                                <p className="award-interior">{award.title}</p>
                                                                <p className="award-winner-text">{award.status}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flip-box-back">
                                                            <div className="inner">
                                                                <p className="flip-back-text">{award.description}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                            {/* <!-- ====================================== Section Seven ===================================== --> */}
                            <section className="section-Seven" id="pricingPlan">
                                <h2 className="creative brand pb-0">Pricing <span>Plan</span></h2>
                                {pricingData.map((plan) => (
                                    <div key={plan.id} className="pricing-section-main">
                                        <div className="basic-plain-box-main">
                                            <div className="basic-plain-box">
                                                <img src={plan.icon} alt={plan.name} />
                                                <p className="basic-plain-text">{plan.name}</p>
                                            </div>
                                            <div className="basic-plain-box-sub">
                                                <p className="mon">
                                                    {plan.price}
                                                    <sup>$</sup>
                                                    <span>{plan.priceUnit}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="development-box">
                                            <div>
                                                {plan.features.map((feature, index) => (
                                                    <h3
                                                        key={index}
                                                        className={`pricing-plaines-name ${index === plan.features.length - 1 ? "mb-0" : ""
                                                            }`}
                                                    >
                                                        {feature}
                                                    </h3>
                                                ))}
                                            </div>
                                            <div className="choose-plain-btn-main">
                                                <div className="aryaBtn-toggle-main">
                                                    <button className="aryaBtn choose-plan">
                                                        Choose Plan
                                                        <img
                                                            src="/images/svg/right-arrow.svg"
                                                            alt="right-arrow"
                                                        />
                                                    </button>
                                                </div>
                                                <p className="taxes">{plan.taxesNote}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </section>
                            {/* <!-- ====================================== Section Eight ===================================== --> */}
                            <section className="section-eight" id="blog">
                                <h3 className="creative brand">Latest <span>Blog</span></h3>
                                <h3 className="visionary">Our happy customers give us impactful and positive feedback on
                                    our services customer support & etc.</h3>
                                <BlogSec />
                            </section>
                            {/* <!-- ====================================== Section Nine ===================================== --> */}
                            <section className="section-nine" id="contact">
                                <h3 className="creative brand">Let’s Talk <span> With Us</span></h3>
                                <h3 className="visionary">We are the top creative agency for branding corp. We offer a
                                    full range of services to help clients improve their search engine rankings and drive more
                                    traffic to their websites.</h3>
                                <div className="contact-box-grid">
                                    <div className="contact-sec-box">
                                        <p className="call-us-contact">
                                            <img className="call-us-contact-img" src="./images/svg/call.svg" alt="call" /> Call
                                            Us
                                        </p>
                                        <p className="day-time">Monday to Friday 8:30 - 17:00</p>
                                        <a href="tel:(+1)5623894336" className="call-num">
                                            <p>(+1) 5623 894 336</p>
                                        </a>
                                    </div>
                                    <div className="contact-sec-box">
                                        <p className="call-us-contact">
                                            <img className="call-us-contact-img" src="./images/svg/email.svg" alt="call" /> Chat
                                            to Us
                                        </p>
                                        <p className="day-time">Our friendly team is here to help.</p>
                                        <a href="mailto:hello@aryaStone.com" className="call-num">
                                            <p>hello@aryaStone.com</p>
                                        </a>
                                    </div>
                                    <div className="contact-sec-box">
                                        <p className="call-us-contact">
                                            <img className="call-us-contact-img" src="./images/svg/loaction.svg"
                                                alt="loaction" />Visit Us
                                        </p>
                                        <p className="day-time">Come say hello at our office HQ.</p>
                                        <p className="call-num">180 East 45th Street 17, New York, NY 10065</p>
                                    </div>
                                </div>
                                <iframe className="map-iframe"
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11661.278162829134!2d-76.16113884753138!3d43.0557465765357!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d9f3add89232d3%3A0x516c4febad79a023!2sNear%20Northeast%2C%20Syracuse%2C%20NY%2013203%2C%20USA!5e0!3m2!1sen!2sin!4v1704092010021!5m2!1sen!2sin"
                                    allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="contactMap">
                                </iframe>
                                <h3 className="creative brand got">Got Ideas? <span> We've got the skills</span></h3>
                                <h3 className="visionary">We are the top creative agency for branding corp. We offer a full range of
                                    services to help clients improve their search engine rankings and drive more traffic to
                                    their websites.</h3>
                                <form>
                                    <div className="input-main">
                                        <div className="labal-input">
                                            <p className="labal">NAME*</p>
                                            <input type="text" placeholder="Your Full Name" name="YourName" autoComplete="off" />
                                        </div>
                                        <div className="labal-input">
                                            <p className="labal">EMAIL*</p>
                                            <input type="text" placeholder="Your Email Address" name="EmailID"
                                                autoComplete="off" />
                                        </div>
                                    </div>
                                    <div className="input-main">
                                        <div className="labal-input">
                                            <p className="labal">SUBJECT*</p>
                                            <input type="text" placeholder="Your Subject" name="subject" autoComplete="off" />
                                        </div>
                                    </div>
                                    <div className="input-main">
                                        <div className="labal-input">
                                            <p className="labal">MESSAGE*</p>
                                            <input type="text" placeholder="Write Your Message..." name="message"
                                                autoComplete="off" />
                                        </div>
                                    </div>
                                    <div className="download-btn">
                                        <button className="aryaBtn">
                                            Send Message <img src="./images/svg/right-arrow.svg" alt="right-arrow" />
                                        </button>
                                    </div>
                                </form>
                            </section>
                            {/* <!-- ====================================== Footer ===================================== --> */}
                            <Footer />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Home;