import React from 'react'
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";


const BgAnimation: React.FC = () => {
    const images = [
        "./images/slider-img/silder-img1.jpg",
        "./images/slider-img/silder-img2.jpg",
        "./images/slider-img/silder-img3.jpg",
        "./images/slider-img/silder-img4.jpg"
    ];
    return (
        <>
            {/* <!-- ====================================== Background Animation ===================================== --> */}
            <div className="background-img-slider-SecOne">
                <Swiper
                    modules={[Autoplay, EffectFade]}
                    effect="fade"
                    fadeEffect={{ crossFade: true }}
                    autoplay={{ delay: 2500, disableOnInteraction: false }}
                    loop={true}
                    speed={700}
                    className="slider-section"
                >
                    {images.map((img, idx) => (
                        <SwiperSlide key={idx}>
                            <img className="service-main-bg" src={img} alt={`slider-${idx}`} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </>
    )
}

export default BgAnimation