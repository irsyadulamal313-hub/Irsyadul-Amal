import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const IrsyadulAmalLogo: React.FC<LogoProps> = ({ className = '', size = 48 }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-label="Logo Yayasan Irsyadul Amal Indonesia"
    >
      <svg
        viewBox="0 0 500 500"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full select-none"
      >
        <defs>
          {/* Circular paths for text */}
          {/* Top arc for IRSYADUL AMAL INDONESIA */}
          <path
            id="top-arc"
            d="M 68,250 A 182,182 0 1,1 432,250"
            fill="none"
          />
          {/* Bottom arc for YAYASAN */}
          <path
            id="bottom-arc"
            d="M 125,295 A 182,182 0 0,0 375,295"
            fill="none"
          />
        </defs>

        {/* Outer thick turquoise ring */}
        <circle cx="250" cy="250" r="235" stroke="#009B9E" strokeWidth="26" fill="#FFFFFF" />

        {/* Inner thin turquoise circular guide */}
        <circle cx="250" cy="250" r="172" stroke="#009B9E" strokeWidth="6" fill="#009B9E" />

        {/* Arched text: IRSYADUL AMAL INDONESIA */}
        <text
          fill="#009B9E"
          fontSize="37"
          fontWeight="800"
          fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
          letterSpacing="0.08em"
        >
          <textPath href="#top-arc" startOffset="50%" textAnchor="middle">
            IRSYADUL AMAL INDONESIA
          </textPath>
        </text>

        {/* Arched text: YAYASAN */}
        <text
          fill="#009B9E"
          fontSize="40"
          fontWeight="800"
          fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
          letterSpacing="0.14em"
        >
          <textPath href="#bottom-arc" startOffset="50%" textAnchor="middle">
            YAYASAN
          </textPath>
        </text>

        {/* Emblem Graphics Inside Center Circle (White on Turquoise) */}
        {/* Open Book (Qur'an) at Bottom */}
        <g fill="#FFFFFF" stroke="#FFFFFF" strokeLinejoin="round" strokeLinecap="round">
          {/* Stylized open book outer chevron pages */}
          <path
            d="M 130,250 L 130,310 L 250,380 L 370,310 L 370,250 L 354,250 L 354,298 L 250,360 L 146,298 L 146,250 Z"
            fill="#FFFFFF"
            stroke="none"
          />
          {/* Middle book layer */}
          <path
            d="M 148,312 L 250,372 L 352,312 L 340,300 L 250,350 L 160,300 Z"
            fill="#FFFFFF"
            stroke="none"
          />

          {/* Central Architecture / Monogram: Arch 'A' and Pillars 'I' */}
          {/* Left vertical pillar */}
          <rect x="160" y="180" width="28" height="120" rx="8" fill="#FFFFFF" />
          <rect x="188" y="226" width="30" height="22" fill="#FFFFFF" />

          {/* Right vertical pillar */}
          <rect x="312" y="180" width="28" height="120" rx="8" fill="#FFFFFF" />
          <rect x="282" y="226" width="30" height="22" fill="#FFFFFF" />

          {/* Center Main Arch (Letter A / Dome) */}
          <path
            d="M 198,160 C 198,132 220,126 250,126 C 280,126 302,132 302,160 L 302,320 L 260,320 L 260,250 L 240,250 L 240,320 L 198,320 Z"
            fill="#FFFFFF"
          />

          {/* Inner arch cutout inside central A */}
          <path
            d="M 226,172 C 226,160 236,152 250,152 C 264,152 274,160 274,172 L 274,226 L 226,226 Z"
            fill="#009B9E"
          />

          {/* Center vertical slit / accent */}
          <rect x="238" y="260" width="24" height="42" rx="4" fill="#009B9E" />
        </g>
      </svg>
    </div>
  );
};
