
import React from 'react';

interface KalviLogoProps {
  className?: string;
  showText?: boolean;
  color?: string;
  tagline?: boolean; // Option to show/hide tagline for small spaces
}

export const KalviLogo: React.FC<KalviLogoProps> = ({ 
  className = "h-16", 
  showText = true, 
  color,
  tagline = false
}) => {
  // Brand Colors
  const GOLD = "#D9A74A"; // Rich muted gold from the logo image
  
  return (
    <div 
      className={`flex flex-col items-center justify-center select-none ${className} leading-none transition-all duration-300`}
      style={{ color: color }}
    >
      
      {/* GRAPHICAL ICON */}
      <div className={`${showText ? 'h-[70%]' : 'h-full'} w-auto aspect-[1.2/1] flex items-center justify-center relative`}>
        <svg 
          viewBox="0 0 110 100" 
          className="h-full w-full overflow-visible" 
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
        >
           {/* 1. SUN RAYS (Gold) */}
           <g stroke={GOLD} strokeWidth="1.2" strokeLinecap="round">
              {[...Array(9)].map((_, i) => {
                 // Fan out from -70 to 70 degrees
                 const angle = -70 + (i * 17.5); 
                 const rad = (angle - 90) * (Math.PI / 180);
                 const rStart = 40;
                 const rEnd = 55;
                 const cx = 55;
                 const cy = 65;
                 
                 const x1 = cx + Math.cos(rad) * rStart;
                 const y1 = cy + Math.sin(rad) * rStart;
                 const x2 = cx + Math.cos(rad) * rEnd;
                 const y2 = cy + Math.sin(rad) * rEnd;
                 return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
              })}
           </g>

           {/* 2. OPEN BOOK (Gold & Black) */}
           <g transform="translate(55, 82)">
              {/* Pages Body - Gold Gradient Simulation via Fill */}
              <defs>
                <linearGradient id="bookGold" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#C59D5F" />
                    <stop offset="50%" stopColor="#EBCB8B" />
                    <stop offset="100%" stopColor="#C59D5F" />
                </linearGradient>
              </defs>
              
              <path d="M0 0 C -15 -6, -40 6, -48 0 V 10 C -40 16, -15 6, 0 14 Z" fill="url(#bookGold)" />
              <path d="M0 0 C 15 -6, 40 6, 48 0 V 10 C 40 16, 15 6, 0 14 Z" fill="url(#bookGold)" />
              
              {/* Book Base/Cover (Black/CurrentColor) */}
              <path d="M-48 10 C -40 16, -15 6, 0 14 C 15 6, 40 16, 48 10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              
              {/* Spine */}
              <path d="M0 0 V 14" stroke="currentColor" strokeWidth="1" />
           </g>

           {/* 3. CENTRAL SPLIT ICON (Brain + Tamil Ki) */}
           <g transform="translate(55, 55)">
              {/* Vertical Divider (Gold Staff) */}
              <path d="M0 -20 V 35" stroke={GOLD} strokeWidth="3" strokeLinecap="round" />

              {/* LEFT: Tamil 'Ki' (கி) */}
              <g transform="translate(-20, -10)">
                 <text 
                    x="0" 
                    y="0" 
                    fill="currentColor" 
                    fontSize="32" 
                    fontWeight="bold" 
                    fontFamily="'Noto Sans Tamil', sans-serif"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                 >
                    கி
                 </text>
              </g>

              {/* RIGHT: Brain Circuitry */}
              <g transform="translate(18, -12) scale(0.9)">
                 <path d="M-10 0 C -10 -12 2 -20 12 -16 C 20 -14 24 -4 20 6 C 18 14 10 18 0 18 C -8 18 -16 10 -10 0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                 {/* Internal convolutions */}
                 <path d="M0 0 Q 5 -5 10 0 T 15 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                 <path d="M-2 8 Q 4 12 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                 <path d="M5 -10 Q 10 -8 12 -2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </g>
           </g>
        </svg>
      </div>
      
      {/* TEXT LOCKUP */}
      {showText && (
        <div className="flex flex-col items-center justify-start h-[30%] w-full mt-1">
            <h1 
              className="font-serif font-bold tracking-tight leading-none whitespace-nowrap"
              style={{ fontSize: '1.4em' }}
            >
            Kalvi.AI
            </h1>
            {tagline && (
                <div className="flex items-center gap-1 w-full justify-center mt-[2px] opacity-80 scale-90 origin-top">
                    <div className="h-[0.5px] bg-current opacity-30 w-4"></div>
                    <p className="text-[0.25em] font-sans font-bold tracking-[0.2em] uppercase whitespace-nowrap">
                        Powered by AI. Designed for All.
                    </p>
                    <div className="h-[0.5px] bg-current opacity-30 w-4"></div>
                </div>
            )}
        </div>
      )}
    </div>
  );
};
