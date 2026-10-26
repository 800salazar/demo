import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DemoModule } from "@/config/site";
import { cn } from "@/lib/utils";

export function DemoCard({ module, className }: { module: DemoModule; className?: string }) {
  const Icon = module.icon;

  return (
    <Card
      className={cn(
        "transition duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        className,
      )}
    >
      <CardHeader>
        <div className="mb-3 grid size-11 place-items-center rounded-xl bg-accent text-accent-foreground">
          <Icon className="size-5" aria-hidden />
        </div>
        <p className="text-xs font-medium tracking-wide text-primary uppercase">Demo {module.number}</p>
        <CardTitle className="text-lg">{module.title}</CardTitle>
        <CardDescription>{module.description}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto pt-2">
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href={module.href}>
            {module.cta}
            <ArrowRight data-icon="inline-end" aria-hidden />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
