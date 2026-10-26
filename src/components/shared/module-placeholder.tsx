import { CircleDashed, Hammer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ModulePlaceholderProps {
  phase: number;
  summary: string;
  items: string[];
}

/** Estado honesto de un módulo aún no construido: describe lo que incluirá sin simular funciones. */
export function ModulePlaceholder({ phase, summary, items }: ModulePlaceholderProps) {
  return (
    <Card>
      <CardHeader>
        <CardAction>
          <Badge variant="secondary">
            <Hammer data-icon="inline-start" aria-hidden />
            En construcción · Fase {phase}
          </Badge>
        </CardAction>
        <CardTitle>Qué incluirá este módulo</CardTitle>
        <CardDescription>{summary}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-2.5 text-sm sm:grid-cols-2">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CircleDashed className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
