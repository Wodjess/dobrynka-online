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
      className={`fixed inset-0 z-[100] flex items-center justify-start transition-opacity duration-500 ${
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
      <div className="flex flex-col items-start gap-4 pl-8 md:pl-16 lg:pl-24 max-w-xl">
        {/* Logo and "Встречайте!" row */}
        <div className="flex items-center gap-4 animate-slide-in-left">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shadow-2xl border-4 border-orange">
            <img
              src={botLogo}
              alt="Assistant"
              className="w-full h-full object-cover"
            />
          </div>
          <h1
            className={`text-3xl md:text-4xl lg:text-5xl font-bold text-orange transition-all duration-500 ${
              showMainText ? "-translate-y-8 opacity-0" : "translate-y-0 opacity-100"
            }`}
          >
            Встречайте!
          </h1>
        </div>

        {/* Main text and button - appears after "Встречайте!" moves up */}
        <div
          className={`transition-all duration-500 delay-100 ${
            showMainText
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          <p className="text-xl md:text-2xl lg:text-3xl text-white font-medium leading-relaxed mb-6">
            Первый в мире ассистент, который экономит вам деньги при заказе 😱😱😱
          </p>
          <Button
            onClick={handleClose}
            className="bg-orange hover:bg-orange-hover text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg transition-transform hover:scale-105"
          >
            Интересно
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeOverlay;
