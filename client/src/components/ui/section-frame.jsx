import { PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionFrame({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "relative border border-gold-400/20 bg-night-900/80 p-5 text-cream shadow-gold-glow sm:p-6 lg:p-8",
        className,
      )}
      {...props}
    >
      <PlusIcon className="pointer-events-none absolute -top-3 -left-3 h-6 w-6 text-gold-400/70" />
      <PlusIcon className="pointer-events-none absolute -top-3 -right-3 h-6 w-6 text-gold-400/70" />
      <PlusIcon className="pointer-events-none absolute -bottom-3 -left-3 h-6 w-6 text-gold-400/70" />
      <PlusIcon className="pointer-events-none absolute -right-3 -bottom-3 h-6 w-6 text-gold-400/70" />
      <div className="relative">{children}</div>
    </div>
  );
}
