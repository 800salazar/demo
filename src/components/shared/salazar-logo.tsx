"use client";

import Image from "next/image";
import { useState } from "react";
import { brandAssets } from "@/config/brand";
import { cn } from "@/lib/utils";

const logos = { blue: brandAssets.logoBlue, white: brandAssets.logoWhite, black: brandAssets.logoBlack } as const;

export function SalazarLogo({ variant = "blue", className, eager = false }: {
  variant?: keyof typeof logos; className?: string; eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <span className={cn("relative block h-10 w-44 shrink-0", className)}>
      {failed ? (
        <span className={cn("flex h-full items-center text-base font-semibold tracking-tight", variant === "white" ? "text-white" : "text-[#01172f]")}>
          Salazar Consultores
        </span>
      ) : (
        <Image src={logos[variant]} alt="Salazar Consultores" fill sizes="(min-width: 1024px) 208px, 176px"
          unoptimized loading={eager ? "eager" : "lazy"} className="object-contain object-left"
          onError={() => setFailed(true)} />
      )}
    </span>
  );
}
