import React from 'react';

interface CloudinaryLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textClassName?: string;
}

/**
 * Official Cloudinary Logo & Cloud Icon SVG Component
 */
export const CloudinaryLogo: React.FC<CloudinaryLogoProps> = ({
  className = 'w-5 h-5',
  size = 20,
  showText = false,
  textClassName = 'font-bold text-sm text-white',
}) => {
  return (
    <div className="inline-flex items-center gap-1.5 select-none">
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <linearGradient id="cld-grad-1" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3448C5" />
            <stop offset="50%" stopColor="#4353FF" />
            <stop offset="100%" stopColor="#48C2FF" />
          </linearGradient>
        </defs>
        {/* Cloud Base */}
        <path
          d="M25.3 14.2C24.8 9.7 21 6.2 16.3 6.2C12.6 6.2 9.3 8.4 7.9 11.8C4.5 12.3 2 15.3 2 18.8C2 22.8 5.2 26 9.2 26H24.8C28.2 26 31 23.2 31 19.8C31 16.8 28.5 14.4 25.3 14.2Z"
          fill="url(#cld-grad-1)"
        />
        {/* Cloud Inner Bubbles for distinctive Cloudinary identity */}
        <circle cx="16.5" cy="14" r="4.2" fill="white" fillOpacity="0.35" />
        <circle cx="22" cy="18" r="3.2" fill="white" fillOpacity="0.4" />
        <circle cx="11.5" cy="18.5" r="3.5" fill="white" fillOpacity="0.4" />
      </svg>
      {showText && (
        <span className={`tracking-tight flex items-center gap-1 ${textClassName}`}>
          <span className="font-extrabold text-[#48C2FF]">Cloudinary</span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-blue-600/30 text-blue-300 font-mono font-bold border border-blue-500/40">
            AI
          </span>
        </span>
      )}
    </div>
  );
};
