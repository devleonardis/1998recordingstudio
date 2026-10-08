"use client";

import { useId } from "react";

/**
 * The dented cube from the 19.98 logo (public/brand/logo-mark.svg), inlined so
 * it stays crisp at any size and costs no request. Clip ids are per instance.
 */
export function CubeMark({ className = "", title }: { className?: string; title?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      viewBox="238 39 204 244"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <clipPath id={`${id}-top`}><polygon points="340,45 436,97 340,149 244,97" /></clipPath>
        <clipPath id={`${id}-left`}><polygon points="244,97 340,149 340,277 244,225" /></clipPath>
        <clipPath id={`${id}-right`}><polygon points="340,149 436,97 436,225 340,277" /></clipPath>
      </defs>
      <polygon points="340,45 436,97 340,149 244,97" fill="#D4853A"/>
      <g clipPath={`url(#${id}-top)`}>
      <polygon points="340,45 380,75 355,88" fill="#b06820" opacity="0.55"/>
      <polygon points="380,75 436,97 390,97 355,88" fill="#c07428" opacity="0.4"/>
      <polygon points="355,88 390,97 370,120 340,110" fill="#a05e18" opacity="0.5"/>
      <polygon points="340,45 300,72 320,88 355,88" fill="#f0b060" opacity="0.45"/>
      <polygon points="244,97 300,72 320,88 290,110" fill="#e8a850" opacity="0.3"/>
      <polygon points="320,88 290,110 310,130 340,110 355,88" fill="#f8c070" opacity="0.2"/>
      <polygon points="290,110 310,130 340,149 244,125" fill="#c07428" opacity="0.15"/>
      <polygon points="370,120 400,130 436,97 410,130" fill="#a05e18" opacity="0.12"/>
      <line x1="355" y1="88" x2="340" y2="45" stroke="#ffffff" strokeWidth="0.5" opacity="0.5"/>
      <line x1="355" y1="88" x2="436" y2="97" stroke="#ffffff" strokeWidth="0.4" opacity="0.35"/>
      <line x1="355" y1="88" x2="380" y2="75" stroke="#ffffff" strokeWidth="0.5" opacity="0.55"/>
      <line x1="355" y1="88" x2="390" y2="97" stroke="#ffffff" strokeWidth="0.4" opacity="0.3"/>
      <line x1="355" y1="88" x2="370" y2="120" stroke="#ffffff" strokeWidth="0.4" opacity="0.3"/>
      <line x1="355" y1="88" x2="340" y2="110" stroke="#ffffff" strokeWidth="0.4" opacity="0.35"/>
      <line x1="355" y1="88" x2="320" y2="88" stroke="#ffffff" strokeWidth="0.5" opacity="0.45"/>
      <line x1="355" y1="88" x2="300" y2="72" stroke="#ffffff" strokeWidth="0.4" opacity="0.3"/>
      <line x1="355" y1="88" x2="310" y2="130" stroke="#ffffff" strokeWidth="0.3" opacity="0.2"/>
      <line x1="320" y1="88" x2="355" y2="88" stroke="#ffe0a0" strokeWidth="0.8" opacity="0.6"/>
      </g>
      <polygon points="340,45 436,97 340,149 244,97" fill="none" stroke="#090d18" strokeWidth="3"/>
      <polygon points="244,97 340,149 340,277 244,225" fill="#1a1e42"/>
      <g clipPath={`url(#${id}-left)`}>
      <polygon points="340,149 305,165 320,195" fill="#0d1030" opacity="0.7"/>
      <polygon points="305,165 290,190 310,220 320,195" fill="#0a0c28" opacity="0.6"/>
      <polygon points="244,97 275,140 305,165 280,130" fill="#3a4488" opacity="0.4"/>
      <polygon points="275,140 305,165 290,190 260,175" fill="#2e3870" opacity="0.35"/>
      <polygon points="290,190 310,220 290,250 260,230" fill="#1e2458" opacity="0.3"/>
      <polygon points="310,220 320,195 340,230 320,255" fill="#141840" opacity="0.4"/>
      <polygon points="290,250 320,255 310,277 280,265" fill="#1a2050" opacity="0.25"/>
      <polygon points="244,200 260,230 244,225" fill="#2a3068" opacity="0.2"/>
      <line x1="305" y1="165" x2="340" y2="149" stroke="#6672cc" strokeWidth="0.5" opacity="0.6"/>
      <line x1="305" y1="165" x2="280" y2="130" stroke="#6672cc" strokeWidth="0.5" opacity="0.5"/>
      <line x1="305" y1="165" x2="275" y2="140" stroke="#6672cc" strokeWidth="0.4" opacity="0.45"/>
      <line x1="305" y1="165" x2="320" y2="195" stroke="#6672cc" strokeWidth="0.5" opacity="0.55"/>
      <line x1="305" y1="165" x2="290" y2="190" stroke="#6672cc" strokeWidth="0.4" opacity="0.4"/>
      <line x1="290" y1="190" x2="310" y2="220" stroke="#4a55aa" strokeWidth="0.4" opacity="0.35"/>
      <line x1="310" y1="220" x2="290" y2="250" stroke="#4a55aa" strokeWidth="0.4" opacity="0.3"/>
      <line x1="310" y1="220" x2="340" y2="230" stroke="#4a55aa" strokeWidth="0.4" opacity="0.3"/>
      <line x1="280" y1="130" x2="305" y2="165" stroke="#8890dd" strokeWidth="0.8" opacity="0.5"/>
      </g>
      <polygon points="244,97 340,149 340,277 244,225" fill="none" stroke="#090d18" strokeWidth="3"/>
      <polygon points="340,149 436,97 436,225 340,277" fill="#C8C6C3"/>
      <g clipPath={`url(#${id}-right)`}>
      <polygon points="375,200 360,230 380,255" fill="#8a8890" opacity="0.35"/>
      <polygon points="360,230 340,255 365,270 380,255" fill="#909098" opacity="0.3"/>
      <polygon points="436,97 400,140 375,200 410,165" fill="#e8e6e3" opacity="0.5"/>
      <polygon points="400,140 375,200 395,175" fill="#f0eee8" opacity="0.4"/>
      <polygon points="410,165 395,175 375,200 405,195" fill="#d8d6d0" opacity="0.2"/>
      <polygon points="340,149 370,170 375,200 355,185" fill="#b0aeb8" opacity="0.25"/>
      <polygon points="355,185 375,200 360,230 340,220" fill="#a8a6b0" opacity="0.3"/>
      <polygon points="340,220 360,230 340,277" fill="#b8b6be" opacity="0.2"/>
      <polygon points="380,255 400,260 436,225 415,240" fill="#989698" opacity="0.25"/>
      <line x1="375" y1="200" x2="410" y2="165" stroke="#555360" strokeWidth="0.5" opacity="0.55"/>
      <line x1="375" y1="200" x2="400" y2="140" stroke="#555360" strokeWidth="0.5" opacity="0.45"/>
      <line x1="375" y1="200" x2="395" y2="175" stroke="#555360" strokeWidth="0.4" opacity="0.4"/>
      <line x1="375" y1="200" x2="355" y2="185" stroke="#555360" strokeWidth="0.5" opacity="0.5"/>
      <line x1="375" y1="200" x2="360" y2="230" stroke="#555360" strokeWidth="0.5" opacity="0.45"/>
      <line x1="375" y1="200" x2="380" y2="255" stroke="#555360" strokeWidth="0.4" opacity="0.35"/>
      <line x1="360" y1="230" x2="340" y2="255" stroke="#777580" strokeWidth="0.4" opacity="0.3"/>
      <line x1="360" y1="230" x2="380" y2="255" stroke="#777580" strokeWidth="0.4" opacity="0.3"/>
      <line x1="380" y1="255" x2="400" y2="260" stroke="#777580" strokeWidth="0.3" opacity="0.25"/>
      <line x1="395" y1="175" x2="375" y2="200" stroke="#ffffff" strokeWidth="0.8" opacity="0.55"/>
      </g>
      <polygon points="340,149 436,97 436,225 340,277" fill="none" stroke="#090d18" strokeWidth="3"/>
    </svg>
  );
}

/** Full lockup: cube, "19.98", rule and "RECORDING STUDIO", as in the logo. */
export function BrandLockup({ className = "", cubeClassName = "h-20 w-auto" }: { className?: string; cubeClassName?: string }) {
  return (
    <div className={`flex flex-col items-center text-[#C8923C] ${className}`}>
      <CubeMark className={`${cubeClassName} drop-shadow-[0_0_18px_rgba(233,153,96,0.22)]`} />
      <span className="brand-numerals mt-3 pl-[0.24em] text-4xl leading-none tracking-[0.24em]">19.98</span>
      <span className="mt-3 h-px w-full max-w-[12rem] bg-white/80" />
      <span className="brand-caption mt-2.5 pl-[0.6em] text-[10px] uppercase tracking-[0.6em]">Recording Studio</span>
    </div>
  );
}
