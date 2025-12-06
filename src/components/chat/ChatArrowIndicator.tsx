import { useState, useEffect } from "react";
import arrowImage from "@/assets/arrow-indicator.png";

interface ChatArrowIndicatorProps {
  delay?: number; // Delay before starting (ms)
  blinkCount?: number; // Number of blink cycles
}

const ChatArrowIndicator = ({ delay = 4000, blinkCount = 5 }: ChatArrowIndicatorProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [opacity, setOpacity] = useState(0);
  const [currentBlink, setCurrentBlink] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Start showing after delay with smooth fade-in
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      // Small delay to allow browser to render with opacity 0 first
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setOpacity(1);
        });
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  // Handle blinking animation
  useEffect(() => {
    if (!isVisible || isComplete) return;

    // Wait for initial fade-in (500ms), then start blink cycle
    const startBlinkTimer = setTimeout(() => {
      // Start the blink cycles
      const blinkInterval = setInterval(() => {
        setCurrentBlink((prev) => {
          const next = prev + 1;
          if (next >= blinkCount) {
            clearInterval(blinkInterval);
            // Final fade out after last blink
            setTimeout(() => {
              setOpacity(0);
              setTimeout(() => setIsComplete(true), 500);
            }, 500);
            return prev;
          }
          return next;
        });

        // Fade out
        setOpacity(0);
        
        // Fade in after 500ms
        setTimeout(() => {
          setOpacity(1);
        }, 500);
      }, 1000); // 500ms fade out + 500ms fade in

      return () => clearInterval(blinkInterval);
    }, 500); // Wait for initial appearance

    return () => clearTimeout(startBlinkTimer);
  }, [isVisible, blinkCount, isComplete]);

  if (isComplete) return null;

  return (
    <div
      className="fixed z-40 pointer-events-none"
      style={{
        bottom: "4rem",
        right: "-7rem",
        opacity: isVisible ? opacity : 0,
        transition: "opacity 500ms ease-in-out",
      }}
    >
      <img 
        src={arrowImage}
        alt=""
        style={{
          width: "25rem",
          height: "auto",
          transform: "rotate(90deg)",
          transformOrigin: "center center",
        }}
      />
    </div>
  );
};

export default ChatArrowIndicator;
