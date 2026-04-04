"use client";

import Image from "next/image";
import { useState } from "react";

interface LogoProps {
  className?: string;
}

export function StudioLogo({ className = "" }: LogoProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <div className={`h-11 w-11 rounded-full border border-white/20 bg-white/5 ${className}`} />;
  }

  return (
    <div className={`relative h-11 w-11 overflow-hidden rounded-full border border-white/20 shadow-[0_0_0_1px_rgba(205,121,72,0.25)] ${className}`}>
      <Image src="/brand/logo.png" alt="19.98 Recording Studio" fill className="object-cover" onError={() => setFailed(true)} priority />
    </div>
  );
}
