import { useState, useEffect } from "react";
import botLogo from "@/assets/bot-logo.png";
import { Button } from "@/components/ui/button";

const WelcomeOverlay = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [phase, setPhase] = useState<"loading" | "shrinking" | "content">("loading");
  const [isLogoLoaded, setIsLogoLoaded] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  // Preload logo and set minimum display time for phase 1
  useEffect(() => {
    const img = new Image();
    img.src = botLogo;
    img.onload = () => setIsLogoLoaded(true);

    // Minimum 0.5s display time for "Встречайте!" even if logo is cached
    const minTimer = setTimeout(() => setMinTimeElapsed(true), 500);

    return () => clearTimeout(minTimer);
  }, []);

  // Transition to phase 2 after logo loaded AND minimum time elapsed
  useEffect(() => {
    if (isLogoLoaded && minTimeElapsed && phase === "loading") {
      setPhase("shrinking");
    }
  }, [isLogoLoaded, minTimeElapsed, phase]);

  // Transition to phase 3 after 1s in shrinking phase (longer for bounce to complete)
  useEffect(() => {
    if (phase === "shrinking") {
      const timer = setTimeout(() => setPhase("content"), 1000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // 5 second auto-close timer starts ONLY after content phase
  useEffect(() => {
    if (phase === "content") {
      const timer = setTimeout(() => handleClose(), 5000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 500);
  };

  if (!isVisible) return null;

  const isLoadingPhase = phase === "loading";

  // Logo dimensions - 2x scale
  const logoSize = 384; // 24rem = 384px
  const logoMargin = 64; // 4rem = 64px

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
      {/* Fixed-width container that doesn't change size */}
      <div 
        className="flex items-center px-4"
        style={{ width: 'max-content' }}
      >
        {/* Logo container - ALWAYS reserves space, uses transform for animation */}
        <div 
          className="rounded-full overflow-hidden shadow-2xl flex-shrink-0 border-8 border-orange"
          style={{
            width: `${logoSize}px`,
            height: `${logoSize}px`,
            marginRight: `${logoMargin}px`,
            transform: isLoadingPhase ? 'scale(0)' : 'scale(1)',
            opacity: isLoadingPhase ? 0 : 1,
            transition: 'transform 800ms cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 500ms ease-out',
            willChange: 'transform, opacity',
          }}
        >
          <img
            src={botLogo}
            alt="Assistant"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Text container - uses transform for position animation */}
        <div 
          className="flex flex-col items-start justify-start gap-4 py-2"
          style={{
            height: `${logoSize}px`,
            transform: isLoadingPhase ? `translateX(-${(logoSize + logoMargin) / 2}px)` : 'translateX(0)',
            transition: 'transform 700ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            willChange: 'transform',
          }}
        >
          {/* "Встречайте!" - uses transform: scale() for smooth GPU-accelerated animation */}
          <h1
            className="font-bold text-orange"
            style={{
              fontSize: 'clamp(3.5rem, 6vw, 5rem)',
              transform: phase === "loading" 
                ? 'scale(2.4)' 
                : phase === "shrinking" 
                  ? 'scale(1.6)' 
                  : 'scale(1)',
              transformOrigin: 'left top',
              transition: 'transform 800ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              willChange: 'transform',
            }}
          >
            Встречайте!
          </h1>

          {/* Main text and button - appear in phase 3 */}
          <div
            className="flex flex-col gap-4"
            style={{
              opacity: phase === "content" ? 1 : 0,
              transform: phase === "content" ? 'translateY(0)' : 'translateY(1rem)',
              transition: 'opacity 500ms ease-out, transform 500ms ease-out',
              pointerEvents: phase === "content" ? 'auto' : 'none',
            }}
          >
            <p className="text-2xl md:text-3xl lg:text-4xl text-white font-medium leading-relaxed max-w-2xl">
              Первый в мире ассистент, который экономит вам деньги при заказе 😱😱😱
            </p>
            
            <Button
              onClick={handleClose}
              className="bg-orange hover:bg-orange-hover text-white px-16 py-6 text-2xl font-semibold rounded-full shadow-lg transition-transform hover:scale-105 w-fit"
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
