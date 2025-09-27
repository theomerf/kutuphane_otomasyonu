import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs, Autoplay } from 'swiper/modules';
import "swiper/swiper.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import PopularBooks from "../components/home/PopularBooks";


export default function Home() {
    const images = [
        { id: 1, imageUrl: 'https://localhost:7214/images/announcements/1.svg', targetUrl: '/reservation' },
        { id: 2, imageUrl: 'https://localhost:7214/images/announcements/2.svg', targetUrl: '/books' },
    ]
    return (
        <div className="flex flex-col gap-y-5 lg:gap-y-20 h-full mx-8 lg:mx-20">

            <div className="relative">
                <div className="mb-8 lg:mt-[-40px] rounded-lg px-6 py-3 border-violet-200 border justify-center w-fit ml-auto mr-auto shadow-lg">
                    <p className="lg:text-4xl font-bold text-violet-400 text-center">
                        Kütüphanemize Hoşgeldiniz!
                    </p>
                </div>
                <Swiper
                    style={{
                        "--swiper-navigation-color": "#8B5CF6",
                        "--swiper-pagination-color": "#8B5CF6",
                    } as React.CSSProperties}
                    spaceBetween={0}
                    slidesPerView={1}
                    loop={images.length > 1}
                    navigation={{
                        nextEl: '.swiper-button-next-custom',
                        prevEl: '.swiper-button-prev-custom',
                    }}
                    modules={[FreeMode, Navigation, Thumbs, Autoplay]}
                    autoplay={images.length > 1 ? {
                        delay: 5000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                    } : false}
                    className="main-swiper rounded-2xl shadow-xl "
                >
                    {images.map((img, index) => (
                        <SwiperSlide key={`${img.id}-${index}`} className="relative group">
                            <div className="relative h-full w-full bg-transparent rounded-2xl overflow-hidden shadow-lg">
                                <Link to={img.targetUrl}>
                                    <img
                                        src={img.imageUrl}
                                        alt={`Duyuru resmi ${index + 1}`}
                                        className="w-full h-full object-cover hover:scale-[101%] duration-300"
                                        loading={index === 0 ? "eager" : "lazy"}
                                    />

                                    {images.length > 1 && (
                                        <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                                            {index + 1} / {images.length}
                                        </div>
                                    )}
                                </Link>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
                {images.length > 1 && (
                    <>
                        <button
                            className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 hover:bg-white text-violet-600 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Önceki resim"
                        >
                            <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        </button>
                        <button
                            className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 hover:bg-white text-violet-600 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Sonraki resim"
                        >
                            <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        </button>
                    </>
                )}
            </div>

            <div>
                <PopularBooks />
            </div>
        </div>
    )
}