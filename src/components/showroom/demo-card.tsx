import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DemoModule } from "@/config/site";
import { cn } from "@/lib/utils";
import styles from "@/components/layout/demo-theme.module.css";

export function DemoCard({ module, className }: { module: DemoModule; className?: string }) {
  const Icon = module.icon;

  return (
    <Card
      className={cn(
        "transition duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        styles.moduleCard,
        className,
      )}
    >
      <CardHeader>
        <div className={styles.moduleIcon}>
          <Icon className="size-5" aria-hidden />
        </div>
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
