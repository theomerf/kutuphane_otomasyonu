import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation, Thumbs, Autoplay } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faExpand } from '@fortawesome/free-solid-svg-icons';
import type BookImage from '../../types/bookImage';

import "swiper/swiper.css";

type ImageSwiperProps = {
    images: BookImage[];
};

export default function ImageSwiper({ images }: ImageSwiperProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = (index: number) => {
    setActiveSlide(index);
    setIsFullscreen(true);
  };

  return (
    <>
      <div className="relative group">
        <div className="relative bg-gradient-to-br from-violet-50 to-indigo-100 rounded-3xl p-6 shadow-2xl border border-violet-200/30 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-400 via-purple-500 to-indigo-500"></div>
          <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-violet-200/30 to-purple-200/30 rounded-full blur-xl"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-indigo-200/30 to-blue-200/30 rounded-full blur-lg"></div>

          <div className="relative mb-6">
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
              thumbs={{ 
                swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null 
              }}
              modules={[FreeMode, Navigation, Thumbs, Autoplay]}
              autoplay={images.length > 1 ? {
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              } : false}
              onSlideChange={(swiper) => setActiveSlide(swiper.realIndex)}
              onSwiper={(swiper) => {
                setActiveSlide(swiper.realIndex);
              }}
              className="main-swiper rounded-2xl shadow-xl h-96 lg:h-[500px]"
            >
              {images.map((img, index) => (
                <SwiperSlide key={`${img.id}-${index}`} className="relative group">
                  <div className="relative h-full w-full bg-transparent rounded-2xl overflow-hidden shadow-lg">
                    <img 
                      src={img.imageUrl?.includes("books") 
                        ? `https://localhost:7214/images/${img.imageUrl}` 
                        : img.imageUrl!
                      } 
                      alt={img.caption || `Kitap resmi ${index + 1}`} 
                      className="w-full h-full object- transition-transform duration-700 group-hover:scale-105"
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                    
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                      <button
                        onClick={() => handleFullscreen(index)}
                        className="opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 bg-white/90 hover:bg-white text-violet-600 rounded-full p-3 shadow-lg backdrop-blur-sm"
                        aria-label="Tam ekran görüntüle"
                      >
                        <FontAwesomeIcon icon={faExpand} className="w-4 h-4" />
                      </button>
                    </div>

                    {images.length > 1 && (
                      <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                        {index + 1} / {images.length}
                      </div>
                    )}
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

          {images.length > 1 && (
            <div className="relative px-2">
              <Swiper
                onSwiper={setThumbsSwiper}
                spaceBetween={12}
                slidesPerView="auto"
                freeMode={true}
                watchSlidesProgress={true}
                modules={[FreeMode, Navigation, Thumbs]}
                className="thumbnails-swiper"
                breakpoints={{
                  320: {
                    spaceBetween: 8,
                  },
                  640: {
                    spaceBetween: 12,
                  },
                  768: {
                    spaceBetween: 16,
                  },
                }}
              >
                {images.map((img, index) => (
                  <SwiperSlide key={`thumb-${img.id}-${index}`} className="!w-auto cursor-pointer">
                    <div 
                      className={`
                        relative overflow-hidden rounded-xl transition-all duration-300 
                        w-16 h-16 lg:w-20 lg:h-20 flex-shrink-0
                        ${activeSlide === index 
                          ? 'ring-3 ring-violet-500 ring-offset-2 ring-offset-violet-50 scale-105 shadow-lg' 
                          : 'hover:ring-2 hover:ring-violet-300 hover:ring-offset-1 hover:ring-offset-violet-50 hover:scale-102 shadow-md opacity-70 hover:opacity-100'
                        }
                      `}
                      onClick={() => {
                        setActiveSlide(index);
                        if (thumbsSwiper) {
                          thumbsSwiper.slideToLoop?.(index) || thumbsSwiper.slideTo(index);
                        }
                      }}
                    >
                      <img
                        src={img.imageUrl?.includes("books") 
                          ? `https://localhost:7214/images/${img.imageUrl}` 
                          : img.imageUrl!
                        } 
                        alt={img.caption || `Küçük resim ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      
                      {activeSlide === index && (
                        <div className="absolute inset-0 bg-violet-500/20 border-2 border-violet-500 rounded-xl"></div>
                      )}
                      
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all duration-200 rounded-xl"></div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}

          {images.length > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSlide(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    index === activeSlide 
                      ? 'w-8 bg-violet-500' 
                      : 'w-2 bg-violet-200 hover:bg-violet-300 hover:w-4'
                  }`}
                  aria-label={`${index + 1}. resme git`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {isFullscreen && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4" 
          onClick={() => setIsFullscreen(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={images[activeSlide]?.imageUrl?.includes("books") 
                ? `https://localhost:7214/images/${images[activeSlide]?.imageUrl}` 
                : images[activeSlide]?.imageUrl!
              }
              alt={images[activeSlide]?.caption || 'Tam ekran görünüm'}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition-all duration-300 text-xl font-bold"
              aria-label="Tam ekranı kapat"
            >
              ×
            </button>
            
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const prevIndex = activeSlide === 0 ? images.length - 1 : activeSlide - 1;
                    setActiveSlide(prevIndex);
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition-all duration-300"
                  aria-label="Önceki resim"
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const nextIndex = activeSlide === images.length - 1 ? 0 : activeSlide + 1;
                    setActiveSlide(nextIndex);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition-all duration-300"
                  aria-label="Sonraki resim"
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}