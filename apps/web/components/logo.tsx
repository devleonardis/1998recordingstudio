import { CubeMark } from "./brand-logo";

interface LogoProps {
  className?: string;
}

/** Header mark: the dented cube from the 19.98 logo. */
export function StudioLogo({ className = "" }: LogoProps) {
  return (
    <CubeMark
      title="19.98 Recording Studio"
      className={`h-10 w-auto drop-shadow-[0_0_14px_rgba(233,153,96,0.25)] transition-transform duration-500 hover:rotate-[-6deg] hover:scale-105 ${className}`}
    />
  );
}
