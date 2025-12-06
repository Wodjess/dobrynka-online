import { useState, useEffect } from "react";
import botLogo from "@/assets/bot-logo.png";
import { Button } from "@/components/ui/button";

const WelcomeOverlay = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [phase, setPhase] = useState<"intro" | "shrinking" | "content">("intro");

  useEffect(() => {
    // Phase 1: Show big "Встречайте!" for 1 second
    const shrinkTimer = setTimeout(() => {
      setPhase("shrinking");
    }, 1000);

    // Phase 2: After shrink animation, show content
    const contentTimer = setTimeout(() => {
      setPhase("content");
    }, 1800);

    // Auto close after 15 seconds
    const closeTimer = setTimeout(() => {
      handleClose();
    }, 15000);

    return () => {
      clearTimeout(shrinkTimer);
      clearTimeout(contentTimer);
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
      {/* Phase 1: Giant "Встречайте!" in center */}
      {phase === "intro" && (
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-orange animate-scale-in">
          Встречайте!
        </h1>
      )}

      {/* Phase 2 & 3: Logo + shrinking text + content */}
      {(phase === "shrinking" || phase === "content") && (
        <div className="flex items-center gap-8 md:gap-12 lg:gap-16 px-4">
          {/* Large Logo */}
          <div className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 rounded-full overflow-hidden shadow-2xl border-8 border-orange flex-shrink-0 animate-scale-in">
            <img
              src={botLogo}
              alt="Assistant"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Text content - aligned with logo height */}
          <div className="flex flex-col justify-start gap-6 h-48 md:h-64 lg:h-80 py-2">
            {/* "Встречайте!" - shrinks and stays at top */}
            <h1
              className={`font-bold text-orange transition-all duration-700 ease-out ${
                phase === "shrinking" 
                  ? "text-6xl md:text-8xl lg:text-9xl animate-fade-in" 
                  : "text-3xl md:text-4xl lg:text-5xl"
              }`}
            >
              Встречайте!
            </h1>

            {/* Main text and button - appear after shrinking */}
            <div
              className={`flex flex-col gap-4 transition-all duration-500 ${
                phase === "content"
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8 pointer-events-none"
              }`}
            >
              <p className="text-lg md:text-xl lg:text-2xl text-white font-medium leading-relaxed max-w-md">
                Первый в мире ассистент, который экономит вам деньги при заказе 😱😱😱
              </p>
              
              <Button
                onClick={handleClose}
                className="bg-orange hover:bg-orange-hover text-white px-10 py-4 text-lg font-semibold rounded-full shadow-lg transition-transform hover:scale-105 w-fit"
              >
                Интересно
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomeOverlay;
