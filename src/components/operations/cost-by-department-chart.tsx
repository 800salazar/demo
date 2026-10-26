"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMXN } from "@/lib/format";
import { summarizeByDepartment } from "@/lib/demo/selectors";
import { useDemoData } from "@/lib/demo/use-demo-data";

const chartConfig = {
  actualCost: { label: "Costo real", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function CostByDepartmentChart() {
  const data = useDemoData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Costo real por departamento</CardTitle>
        <CardDescription>Calculado en vivo con las órdenes de la demostración.</CardDescription>
      </CardHeader>
      <CardContent>
        {data ? (
          <ChartContainer config={chartConfig} className="h-72 w-full">
            <BarChart data={summarizeByDepartment(data)} layout="vertical" margin={{ left: 0, right: 16 }}>
              <CartesianGrid horizontal={false} />
              <YAxis dataKey="department" type="category" tickLine={false} axisLine={false} width={104} />
              <XAxis type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel formatter={(value) => formatMXN(Number(value))} />}
              />
              <Bar dataKey="actualCost" fill="var(--color-actualCost)" radius={6} />
            </BarChart>
          </ChartContainer>
        ) : (
          <Skeleton className="h-72 w-full" aria-busy="true" aria-label="Cargando gráfica" />
        )}
      </CardContent>
    </Card>
  );
}
