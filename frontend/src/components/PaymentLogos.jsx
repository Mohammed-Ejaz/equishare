import React from 'react';

// Official & crisp Vector Logos for Indian Payment Apps

export function GPayLogo({ className = "w-6 h-6", size }) {
  const style = size ? { width: size, height: size } : undefined;
  return (
    <svg style={style} className={size ? '' : className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="12" fill="#FFFFFF" />
      <path d="M24 14C18.48 14 14 18.48 14 24C14 29.52 18.48 34 24 34C29.52 34 34 29.52 34 24C34 18.48 29.52 14 24 14Z" fill="#F8F9FA" />
      <path d="M33.6 24.2C33.6 23.5 33.54 22.82 33.42 22.18H24V26.02H29.38C29.15 27.27 28.44 28.32 27.38 29.04V31.54H30.62C32.52 29.79 33.6 27.24 33.6 24.2Z" fill="#4285F4" />
      <path d="M24 34C26.7 34 28.96 33.1 30.62 31.54L27.38 29.04C26.48 29.64 25.34 30 24 30C21.39 30 19.18 28.24 18.39 25.88H15.04V28.48C16.74 31.86 20.24 34 24 34Z" fill="#34A853" />
      <path d="M18.39 25.88C18.19 25.28 18.08 24.65 18.08 24C18.08 23.35 18.19 22.72 18.39 22.12V19.52H15.04C14.36 20.88 13.97 22.4 13.97 24C13.97 25.6 14.36 27.12 15.04 28.48L18.39 25.88Z" fill="#FBBC05" />
      <path d="M24 18C25.47 18 26.79 18.51 27.83 19.5L30.69 16.64C28.95 15.02 26.69 14 24 14C20.24 14 16.74 16.14 15.04 19.52L18.39 22.12C19.18 19.76 21.39 18 24 18Z" fill="#EA4335" />
    </svg>
  );
}

export function PhonePeLogo({ className = "w-6 h-6", size }) {
  const style = size ? { width: size, height: size } : undefined;
  return (
    <svg style={style} className={size ? '' : className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="12" fill="#5F259F" />
      <path d="M27.2 13H21.4C19.5 13 18 14.5 18 16.4V31.6C18 33.5 19.5 35 21.4 35H27.2C31.5 35 35 31.5 35 27.2V20.8C35 16.5 31.5 13 27.2 13ZM24.5 28.5H21.5V17.5H24.5C26.7 17.5 28.5 19.3 28.5 21.5C28.5 23.7 26.7 25.5 24.5 25.5V28.5Z" fill="#FFFFFF" />
      <path d="M21 21H31" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M26 17L18 35" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function PaytmLogo({ className = "w-6 h-6", size }) {
  const style = size ? { width: size, height: size } : undefined;
  return (
    <svg style={style} className={size ? '' : className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="12" fill="#002E6E" />
      <path d="M12 20C12 17.8 13.8 16 16 16H22V24H16C13.8 24 12 22.2 12 20Z" fill="#00BAF2" />
      <path d="M22 16H28C30.2 16 32 17.8 32 20C32 22.2 30.2 24 28 24H22V16Z" fill="#FFFFFF" />
      <path d="M12 28C12 25.8 13.8 24 16 24H22V32H16C13.8 32 12 30.2 12 28Z" fill="#00BAF2" />
      <path d="M22 24H28C30.2 24 32 25.8 32 28C32 30.2 30.2 32 28 32H22V24Z" fill="#FFFFFF" />
      <text x="34" y="27" fill="#00BAF2" fontSize="9" fontWeight="900" fontFamily="sans-serif">tm</text>
    </svg>
  );
}

export function SuperMoneyLogo({ className = "w-6 h-6", size }) {
  const style = size ? { width: size, height: size } : undefined;
  return (
    <svg style={style} className={size ? '' : className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="12" fill="#111827" stroke="#FBBF24" strokeWidth="1.5" />
      <path d="M26 11L14 26H23L21 37L34 22H25L26 11Z" fill="#F59E0B" stroke="#FDE047" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
}

export function BhimUpiLogo({ className = "w-6 h-6", size }) {
  const style = size ? { width: size, height: size } : undefined;
  return (
    <svg style={style} className={size ? '' : className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="12" fill="#FFFFFF" />
      <path d="M14 27L24 13L34 27H27V35H21V27H14Z" fill="#097939" />
      <path d="M27 13L34 23L27 33V13Z" fill="#ED752E" />
      <path d="M14 27L21 17L21 37L14 27Z" fill="#097939" />
    </svg>
  );
}

export function CashLogo({ className = "w-6 h-6", size }) {
  const style = size ? { width: size, height: size } : undefined;
  return (
    <svg style={style} className={size ? '' : className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="12" fill="#064E3B" />
      <rect x="10" y="16" width="28" height="16" rx="4" fill="#10B981" />
      <circle cx="24" cy="24" r="5" fill="#064E3B" />
      <text x="24" y="27" fill="#10B981" fontSize="10" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">₹</text>
    </svg>
  );
}

// Apple iOS Native App Icon Style Logo
export function AppLogo({ className = "w-9 h-9", size }) {
  const style = size ? { width: size, height: size } : undefined;
  return (
    <div style={style} className={`relative flex items-center justify-center shrink-0 ${size ? '' : className}`}>
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-full h-full drop-shadow-[0_8px_20px_rgba(16,185,129,0.42)] transition-transform hover:scale-105 duration-200"
      >
        <defs>
          <linearGradient id="iosBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="35%" stopColor="#10B981" />
            <stop offset="85%" stopColor="#059669" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          <linearGradient id="iosTopLight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
          </linearGradient>

          <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#044E38" floodOpacity="0.5" />
          </filter>

          <linearGradient id="cardGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#D1FAE5" />
          </linearGradient>

          <linearGradient id="cardGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ECFDF5" />
            <stop offset="100%" stopColor="#A7F3D0" />
          </linearGradient>
        </defs>

        {/* 1. iOS Standard Superellipse Squircle Body */}
        <rect 
          x="3" 
          y="3" 
          width="94" 
          height="94" 
          rx="22" 
          fill="url(#iosBg)" 
        />

        {/* 2. iOS Top Specular Light Highlight Rim */}
        <rect 
          x="4" 
          y="4" 
          width="92" 
          height="92" 
          rx="21" 
          stroke="url(#iosTopLight)" 
          strokeWidth="2" 
          fill="none" 
        />

        {/* 3. Layered Cards Geometry */}
        <rect 
          x="32" 
          y="24" 
          width="44" 
          height="30" 
          rx="8" 
          transform="rotate(8 32 24)" 
          fill="url(#cardGrad2)" 
          fillOpacity="0.8" 
          stroke="#FFFFFF" 
          strokeWidth="1.5" 
          strokeOpacity="0.7" 
        />

        <g filter="url(#cardShadow)">
          <rect 
            x="24" 
            y="42" 
            width="52" 
            height="34" 
            rx="9" 
            fill="url(#cardGrad1)" 
            stroke="#FFFFFF" 
            strokeWidth="1.5" 
          />
          <rect x="33" y="52" width="22" height="4" rx="2" fill="#059669" />
          <rect x="33" y="60" width="34" height="4" rx="2" fill="#10B981" />
          <circle cx="63" cy="54" r="3.5" fill="#10B981" />
        </g>
      </svg>
    </div>
  );
}
