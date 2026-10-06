import { ReactNode } from "react";
import { ScrollCard } from "./reveal";
import { TiltCard } from "./interactive";

/** Scroll-dealt + pointer-tilted card, usable from server components. */
export function FxCard({
  children,
  className = "",
  wrapperClassName = "",
}: {
  children: ReactNode;
  className?: string;
  wrapperClassName?: string;
}) {
  return (
    <ScrollCard className={wrapperClassName}>
      <TiltCard className="h-full rounded-2xl" max={7}>
        <div className={`h-full ${className}`}>{children}</div>
      </TiltCard>
    </ScrollCard>
  );
}
