import { useState, useEffect } from "react";
import botLogo from "@/assets/bot-logo.png";
import { Button } from "@/components/ui/button";

const WelcomeOverlay = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [showMainText, setShowMainText] = useState(false);

  useEffect(() => {
    // Show main text after 2 seconds
    const mainTextTimer = setTimeout(() => {
      setShowMainText(true);
    }, 2000);

    // Auto close after 15 seconds
    const closeTimer = setTimeout(() => {
      handleClose();
    }, 15000);

    return () => {
      clearTimeout(mainTextTimer);
      clearTimeout(closeTimer);
    };
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 500);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-500 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      style={{
        background: `linear-gradient(
          to top,
          rgba(0, 0, 0, 0.9) 0%,
          rgba(0, 0, 0, 0.8) 50%,
          rgba(0, 0, 0, 0) 100%
        )`,
      }}
    >
      <div className="flex items-center gap-8 md:gap-12 lg:gap-16 px-4">
        {/* Large Logo */}
        <div 
          className={`w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 rounded-full overflow-hidden shadow-2xl border-8 border-orange flex-shrink-0 transition-all duration-700 ${
            isClosing ? "scale-0 opacity-0" : "scale-100 opacity-100"
          }`}
          style={{ animationDelay: "0.2s" }}
        >
          <img
            src={botLogo}
            alt="Assistant"
            className="w-full h-full object-cover animate-scale-in"
          />
        </div>

        {/* Text content - aligned with logo height */}
        <div className="flex flex-col justify-between h-48 md:h-64 lg:h-80 py-4">
          {/* "Встречайте!" - at top */}
          <h1
            className={`text-4xl md:text-5xl lg:text-6xl font-bold text-orange transition-all duration-500 ${
              showMainText ? "-translate-y-4 opacity-0 absolute" : "translate-y-0 opacity-100"
            }`}
            style={{ animationDelay: "0.4s" }}
          >
            Встречайте!
          </h1>

          {/* Main text - replaces "Встречайте!" */}
          <div
            className={`transition-all duration-500 ${
              showMainText
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8 pointer-events-none"
            }`}
          >
            <p className="text-lg md:text-xl lg:text-2xl text-white font-medium leading-relaxed max-w-md">
              Первый в мире ассистент, который экономит вам деньги при заказе 😱😱😱
            </p>
          </div>

          {/* Button - at bottom */}
          <div
            className={`transition-all duration-500 delay-200 ${
              showMainText
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 pointer-events-none"
            }`}
          >
            <Button
              onClick={handleClose}
              className="bg-orange hover:bg-orange-hover text-white px-10 py-4 text-lg font-semibold rounded-full shadow-lg transition-transform hover:scale-105"
            >
              Интересно
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeOverlay;
