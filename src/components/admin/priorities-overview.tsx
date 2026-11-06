"use client";

import { ColorBadge } from "@/components/shared/color-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDemoData } from "@/lib/demo/use-demo-data";

export function PrioritiesOverview() {
  const data = useDemoData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prioridades actuales</CardTitle>
        <CardDescription>
          Vista previa · Edición próximamente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data ? (
          <ul data-guide="priorities" className="flex flex-wrap gap-2">
            {[...data.priorities]
              .sort((a, b) => a.order - b.order)
              .map((priority) => (
                <li key={priority.id}>
                  <ColorBadge color={priority.color}>{priority.name}</ColorBadge>
                </li>
              ))}
          </ul>
        ) : (
          <Skeleton className="h-6 w-56" aria-busy="true" aria-label="Cargando prioridades" />
        )}
      </CardContent>
    </Card>
  );
}
