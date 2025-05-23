
import { useEffect, useState } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export function TypewriterText({ 
  text, 
  speed = 20, 
  className,
  onComplete
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    // Reset when text changes
    if (text !== displayedText && completed) {
      setDisplayedText("");
      setIndex(0);
      setCompleted(false);
    }
  }, [text, completed, displayedText]);

  useEffect(() => {
    if (!text || index >= text.length) return;

    const timer = setTimeout(() => {
      setDisplayedText((prev) => prev + text[index]);
      setIndex((prev) => prev + 1);
      
      if (index === text.length - 1) {
        setCompleted(true);
        onComplete?.();
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [text, index, speed, onComplete]);

  return <span className={className}>{displayedText}</span>;
}
