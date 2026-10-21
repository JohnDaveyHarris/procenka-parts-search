const priceFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("ru-RU");

/** «от 2 963,44 ₽»; null -> «-» */
export function formatPrice(value) {
  if (value == null || Number.isNaN(Number(value))) return "-";
  return priceFormatter.format(Number(value));
}

/** 12345 -> «12 345» */
export function formatCount(value) {
  return numberFormatter.format(value ?? 0);
}

/** ISO-дата отгрузки -> «23 окт, 13:40» */
export function formatShipment(iso) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** Русские склонения: plural(3, "предложение", "предложения", "предложений") */
export function plural(n, one, few, many) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}
