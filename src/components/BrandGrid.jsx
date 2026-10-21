"use client";

import { formatCount, formatPrice, plural } from "@/utils/format";

/**
 * Этап 1 (результат): сетка карточек производителей.
 * Клики по карточке запускают этап 2.
 */
export default function BrandGrid({ query, items, onSelect }) {
  const withStock = items.filter((item) => item.count > 0).length;

  return (
    <section className="step-section fade-up" aria-live="polite">
      <div className="section-head">
        <h2 className="section-title">Производители</h2>
        <p className="section-sub">
          Артикул «{query}» выпускают {items.length}{" "}
          {plural(items.length, "производитель", "производителя", "производителей")}
          {withStock > 0
            ? `, у ${withStock} - есть в наличии.`
            : " - предложений в наличии нет."}{" "}
          Выберите производителя, чтобы получить аналоги и цены.
        </p>
      </div>

      <div className="row g-3">
        {items.map((item) => (
          <div className="col-6 col-md-4 col-lg-3" key={item.brand}>
            <button
              type="button"
              className="brand-card"
              onClick={() => onSelect(item.brand)}
              title={`Подобрать аналоги: ${item.brand}`}
            >
              <span className="brand-name">{item.brand}</span>
              <span className="brand-detail">{item.name}</span>
              <span className="brand-meta">
                {item.count > 0
                  ? `${formatCount(item.count)} ${plural(item.count, "штука", "штуки", "штук")} на складах`
                  : "нет в наличии"}
              </span>
              <span className="brand-price">
                {item.minPrice != null ? `от ${formatPrice(item.minPrice)}` : "-"}
              </span>
              <span className="brand-arrow" aria-hidden="true">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12h14m-6-6 6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
