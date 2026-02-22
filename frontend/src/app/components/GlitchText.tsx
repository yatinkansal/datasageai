import { useEffect, useState } from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
}

export default function GlitchText({ text, className = '' }: GlitchTextProps) {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 200);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative inline-block ${className}`}>
      <span className={`relative z-10 ${isGlitching ? 'animate-glitch' : ''}`}>
        {text}
      </span>
      {isGlitching && (
        <>
          <span 
            className="absolute top-0 left-0 z-0 text-cyan-500 opacity-70"
            style={{ 
              clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)',
              transform: 'translate(-2px, -2px)'
            }}
          >
            {text}
          </span>
          <span 
            className="absolute top-0 left-0 z-0 text-pink-500 opacity-70"
            style={{ 
              clipPath: 'polygon(0 55%, 100% 55%, 100% 100%, 0 100%)',
              transform: 'translate(2px, 2px)'
            }}
          >
            {text}
          </span>
        </>
      )}
    </div>
  );
}
