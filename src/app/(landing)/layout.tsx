import type { ReactNode } from "react";

/** Independent content and layout; demo navigation and data providers belong in /demo only. */
export default function LandingLayout({ children }: { children: ReactNode }) {
  return <main className="min-h-dvh bg-white text-slate-950">{children}</main>;
}
