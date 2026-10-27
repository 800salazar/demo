type SocialNetwork = "facebook" | "instagram" | "linkedin";

export function SocialIcon({ network, size = 20 }: { network: SocialNetwork; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {network === "facebook" && <path d="M14 21v-8h3l.5-4H14V7c0-.6.4-1 1-1h2V2h-3a5 5 0 0 0-5 5v2H6v4h3v8" />}
      {network === "instagram" && <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" />
      </>}
      {network === "linkedin" && <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M7 10v7m4 0v-7m0 3a3 3 0 0 1 6 0v4" />
        <circle cx="7" cy="7" r=".8" fill="currentColor" stroke="none" />
      </>}
    </svg>
  );
}
