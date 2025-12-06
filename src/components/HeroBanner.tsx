import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const banners = [
  {
    id: 1,
    title: "ВСЁ ДЛЯ ПРАЗДНИЧНОГО СТОЛА!",
    subtitle: "Подготовьтесь к Новому году вместе с нами!",
    buttonText: "Подробнее",
    bgColor: "bg-gradient-to-r from-red-700 to-red-600",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=400&fit=crop",
  },
  {
    id: 2,
    title: "6-ой КОФЕ В ПОДАРОК!",
    subtitle: "при покупке с картой лояльности",
    buttonText: "Подробнее",
    bgColor: "bg-gradient-to-r from-amber-500 to-orange-500",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=400&fit=crop",
  },
  {
    id: 3,
    title: "НОВОГОДНИЕ ТОРТЫ",
    subtitle: "Закажите праздничный торт уже сегодня!",
    buttonText: "Заказать",
    bgColor: "bg-gradient-to-r from-emerald-700 to-emerald-600",
    image: "https://images.unsplash.com/photo-1562440499-64c9a111f713?w=600&h=400&fit=crop",
  },
];

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  return (
    <section className="container py-6">
      <div className="relative overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {banners.map((banner) => (
            <div
              key={banner.id}
              className={`min-w-full h-[300px] md:h-[400px] ${banner.bgColor} relative flex items-center`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent z-10" />
              
              <div className="container relative z-20 flex items-center justify-between px-8 md:px-16">
                <div className="max-w-md">
                  <h2 className="text-2xl md:text-4xl font-bold text-primary-foreground mb-2 leading-tight">
                    {banner.title}
                  </h2>
                  <p className="text-primary-foreground/90 text-sm md:text-lg mb-6">
                    {banner.subtitle}
                  </p>
                  <button className="btn-primary">
                    {banner.buttonText}
                  </button>
                </div>
                
                <div className="hidden md:block">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-72 h-48 object-cover rounded-xl shadow-2xl"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        <button
          onClick={goToPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 btn-carousel z-30"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 btn-carousel z-30"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`carousel-dot ${index === currentSlide ? 'carousel-dot-active' : ''}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroBanner;
