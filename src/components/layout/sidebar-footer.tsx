import { ResetDemoButton } from "@/components/showroom/reset-demo-button";
import { cn } from "@/lib/utils";

export function SidebarFooter({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <ResetDemoButton size="sm" className="h-auto w-full justify-start py-1.5 text-left whitespace-normal" />
      <p className="text-xs leading-relaxed text-muted-foreground">
        Demostración con datos simulados. Los cambios se guardan solo en tu navegador.
      </p>
    </div>
  );
}
