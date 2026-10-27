import type { ReactNode } from "react";
import "@/components/motion/skeleton-reveal.css";

/** Independent content and layout; demo navigation and data providers belong in /demo only. */
export default function LandingLayout({ children }: { children: ReactNode }) {
  return <>
    <noscript><style>{`.t-skeleton-content{opacity:1!important;visibility:visible!important;transform:none!important;filter:none!important}.t-skeleton-placeholder{display:none!important}`}</style></noscript>
    {children}
  </>;
}
