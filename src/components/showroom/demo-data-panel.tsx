"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDemoData } from "@/lib/demo/use-demo-data";

export function DemoDataPanel() {
  const data = useDemoData();

  const stats = data
    ? [
        { label: "Departamentos", value: data.departments.length },
        { label: "Prioridades", value: data.priorities.length },
        { label: "Estados", value: data.statuses.length },
        { label: "Órdenes de trabajo", value: data.orders.length },
      ]
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tu demo en cifras</CardTitle>
      </CardHeader>
      <CardContent>
        {stats ? (
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-lg bg-muted/60 px-4 py-3">
                <dt className="text-xs text-muted-foreground">{stat.label}</dt>
                <dd className="text-2xl font-semibold tabular-nums">{stat.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4" aria-busy="true" aria-label="Cargando datos">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-[4.25rem] rounded-lg" />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
