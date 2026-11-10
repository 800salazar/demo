import type { Metadata } from "next";
import { GuideStartButton } from "@/components/guide/demo-guide";
export const metadata: Metadata = { title: "Guía de uso" };
export default function RecorridoPage() {
  return <div className="space-y-5"><h1 className="text-2xl font-semibold">Guía de uso</h1><GuideStartButton guide="full" attention /></div>;
}
