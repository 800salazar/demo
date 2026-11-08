import type { Metadata } from "next";
import { PrioritiesOverview } from "@/components/admin/priorities-overview";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "Sistema autoadministrable" };

export default function AdministracionPage() {
  return (
    <>
      <PageHeader
        title="Sistema autoadministrable"
      />
      <div className="space-y-6">
        <PrioritiesOverview />
      </div>
    </>
  );
}
