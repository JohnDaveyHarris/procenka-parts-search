import { formatCount, formatPrice, formatShipment, plural } from "@/utils/format";

const MAX_CHIPS = 3;

function warehouseTitle(w) {
  const parts = [
    w.code,
    w.price != null ? formatPrice(w.price) : "цена не указана",
    `остаток ${formatCount(w.stock)}`,
  ];
  const shipment = formatShipment(w.shipmentDate);
  if (shipment) parts.push(`отгрузка ${shipment}`);
  if (w.own) parts.push("собственный склад");
  if (w.notRefund) parts.push("невозвратная позиция");
  return parts.join(" · ");
}

/**
 * Ячейка «Склады»: чипы лучших складов позиции.
 * На широких экранах - до MAX_CHIPS чипов с подсказкой (title),
 * на узких - одна строка «код цена».
 */
export default function WarehouseCell({ offer, compact = false }) {
  const warehouses = offer.warehouses;

  if (!warehouses.length) {
    return <span className="wh-empty">нет предложений по складам</span>;
  }

  if (compact) {
    const best = warehouses.find((w) => w.stock > 0) || warehouses[0];
    return (
      <span className="wh-compact" title={warehouseTitle(best)}>
        {best.code}
        {best.price != null ? ` · ${formatPrice(best.price)}` : ""}
      </span>
    );
  }

  const shown = warehouses.slice(0, MAX_CHIPS);
  const rest = warehouses.length - shown.length;

  return (
    <div className="wh-cell">
      {shown.map((w) => (
        <span
          key={w.id || `${w.code}-${w.price}`}
          className={`chip wh-chip ${w.own ? "wh-own" : ""}`}
          title={warehouseTitle(w)}
        >
          <span className="wh-code">{w.code}</span>
          {w.price != null && <span className="wh-price">{formatPrice(w.price)}</span>}
          <span className="wh-stock">{formatCount(w.stock)}</span>
        </span>
      ))}
      {rest > 0 && (
        <span
          className="chip wh-chip wh-more"
          title={warehouses
            .slice(MAX_CHIPS)
            .map(warehouseTitle)
            .join("\n")}
        >
          +{rest} {plural(rest, "склад", "склада", "складов")}
        </span>
      )}
    </div>
  );
}
