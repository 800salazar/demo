interface ModulePlaceholderProps {
  items: string[];
}

/** Las funciones pendientes se consultan bajo demanda, sin simular controles activos. */
export function ModulePlaceholder({ items }: ModulePlaceholderProps) {
  return (
    <details className="rounded-xl border bg-card px-5">
      <summary className="min-h-11 cursor-pointer content-center rounded-lg py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring">
        Próximamente
      </summary>
      <ul className="grid list-disc gap-x-6 gap-y-2 pb-5 pl-5 text-sm text-muted-foreground sm:grid-cols-2">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </details>
  );
}
