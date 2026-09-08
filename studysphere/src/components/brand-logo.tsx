import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const sizeMap = {
  sm: { box: "h-9 w-9", px: 36 },
  md: { box: "h-11 w-11 sm:h-12 sm:w-12", px: 48 },
  lg: { box: "h-16 w-16 sm:h-20 sm:w-20", px: 80 },
} as const;

type BrandLogoProps = {
  size?: keyof typeof sizeMap;
  showWordmark?: boolean;
  showTagline?: boolean;
  href?: string | null;
  className?: string;
  priority?: boolean;
  align?: "left" | "center";
};

export function BrandLogo({
  size = "md",
  showWordmark = true,
  showTagline = false,
  href = "/",
  className,
  priority = false,
  align = "left",
}: BrandLogoProps) {
  const dims = sizeMap[size];
  const content = (
    <>
      <Image
        src="/studysphere-mark.png"
        alt={showWordmark ? "StudySphere" : "StudySphere logo"}
        width={dims.px}
        height={dims.px}
        priority={priority}
        unoptimized
        className={cn(dims.box, "shrink-0 rounded-[22%] object-cover")}
      />
      {showWordmark && (
        <span
          className={cn(
            "flex min-w-0 flex-col leading-tight",
            align === "center" && "items-center text-center",
          )}
        >
          <span
            className={cn(
              "font-serif tracking-tight text-ink",
              size === "lg" ? "text-3xl sm:text-4xl" : size === "sm" ? "text-base" : "text-lg sm:text-xl",
            )}
          >
            StudySphere
          </span>
          {showTagline && (
            <span className="mt-0.5 hidden text-[0.65rem] uppercase tracking-[0.18em] text-muted sm:inline">
              Search. Share. Study.
            </span>
          )}
        </span>
      )}
    </>
  );

  const classes = cn(
    "inline-flex items-center gap-3 min-w-0",
    align === "center" && "flex-col gap-3",
    className,
  );

  if (href === null) {
    return <div className={classes}>{content}</div>;
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}
