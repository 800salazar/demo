const mxn = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMXN(amount: number): string {
  return mxn.format(amount);
}

export function formatCostInput(value: string): string {
  const raw = value.replace(/[$,\s]/g, "");
  if (!/^\d*(?:\.\d*)?$/.test(raw)) return value;
  const [integer, fraction] = raw.split(".");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fraction === undefined ? grouped : `${grouped}.${fraction}`;
}

export function parseCostInput(value: string): number | null {
  const raw = value.replace(/[$,\s]/g, "");
  if (!/^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(raw)) return null;
  const amount = Number(raw);
  return Number.isFinite(amount) && amount <= 1_000_000_000 ? amount : null;
}

export function formatMexicanDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return months[Number(month) - 1] && day && year ? `${day} ${months[Number(month) - 1]} ${year}` : "Selecciona una fecha";
}
