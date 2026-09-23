import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  esbTextClassName?: string;
  hubTextClassName?: string;
  href?: string;
}

export function Logo({
  className,
  iconClassName,
  textClassName,
  esbTextClassName,
  hubTextClassName,
  href = "/"
}: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 group transition-transform duration-200 hover:scale-[1.02]",
        className
      )}
    >
      <GraduationCap
        className={cn(
          "w-6 h-6 text-amber-500 shrink-0 transition-transform group-hover:-rotate-6",
          iconClassName
        )}
      />
      <div className={cn("flex items-center", textClassName)}>
        <span
          className={cn(
            "font-black text-xl tracking-tight transition-colors text-slate-900 dark:text-white",
            esbTextClassName
          )}
        >
          ESB
        </span>
        <span
          className={cn(
            "font-bold text-xl text-sky-400 ml-1",
            hubTextClassName
          )}
        >
          Hub
        </span>
      </div>
    </Link>
  );
}
