import type { Metadata } from "next";
import { Suspense } from "react";
import { DemoWorkspace } from "@/components/workspace/demo-workspace";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Control de órdenes" };

export default function SistemaPage() {
  return <Suspense fallback={<Skeleton className="h-96 w-full" aria-label="Cargando sistema" />}><DemoWorkspace /></Suspense>;
}
