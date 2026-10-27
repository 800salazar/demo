import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Salazar.red",
  description: "Próximamente.",
  alternates: { canonical: "/" },
};

/** Neutral placeholder until the independent landing's content is defined. */
export default function LandingPage() {
  return (
    <section className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center px-6 py-24">
      <p className="text-sm font-medium tracking-widest text-slate-500 uppercase">salazar.red</p>
      <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-6xl">Próximamente.</h1>
    </section>
  );
}
