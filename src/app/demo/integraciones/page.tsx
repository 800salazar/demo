import { redirect } from "next/navigation";
import { demoRoutes } from "@/config/routes";
export default function LegacyIntegrationsPage() { redirect(demoRoutes.workspace); }
