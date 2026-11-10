import { redirect } from "next/navigation";
import { demoRoutes } from "@/config/routes";

export default function LegacyPage() {
  redirect(`${demoRoutes.workspace}?vista=operador`);
}
