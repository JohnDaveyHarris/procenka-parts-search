"use client";

import { useDispatch, useSelector } from "react-redux";
import { formatCount, formatPrice, plural } from "@/utils/format";
import { PAGE_SIZE, showMore } from "@/redux/slices/searchSlice";
import WarehouseCell from "./WarehouseCell";

/**
 * Этап 2 (результат): итоговая таблица аналогов и предложений.
 * Сортировка уже выполнена в redux-слое: искомая деталь -> в наличии -> цена.
 */
export default function ResultsSection({ query, brand, offers, onClearBrand }) {
  const dispatch = useDispatch();
  const visibleCount = useSelector((state) => state.search.visibleCount);
  const visible = offers.slice(0, visibleCount);
  const inStock = offers.filter((offer) => offer.count > 0).length;

  return (
    <section className="step-section fade-up" aria-live="polite">
      <div className="section-head">
        <div className="result-chips">
          <span className="chip">
            Артикул: <b>{query}</b>
          </span>
          <button
            type="button"
            className="chip chip-btn"
            onClick={onClearBrand}
            title="Сбросить производителя и вернуться к выбору"
          >
            Производитель: <b>{brand}</b>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <p className="section-sub">
          Найдено {offers.length} {plural(offers.length, "предложение", "предложения", "предложений")}
          {inStock > 0 ? `, у ${inStock} - есть остаток на складах` : ", остатков нет"}.
          Сортировка: в наличии, затем по цене.
        </p>
      </div>

      <div className="table-card">
        <div className="table-responsive">
          <table className="offers-table">
            <thead>
              <tr>
                <th scope="col">Наименование / производитель</th>
                <th scope="col" className="col-price">Цена</th>
                <th scope="col" className="col-stock">Остаток</th>
                <th scope="col" className="col-wh d-none d-lg-table-cell">Склады</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((offer) => (
                <OfferRow offer={offer} key={offer.goodsID || `${offer.brand}-${offer.number}-${offer.name}`} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {offers.length > visible.length && (
        <button type="button" className="btn-more" onClick={() => dispatch(showMore())}>
          Показать ещё {Math.min(PAGE_SIZE, offers.length - visible.length)} из{" "}
          {formatCount(offers.length - visible.length)}
        </button>
      )}
    </section>
  );
}

function OfferRow({ offer }) {
  const hasStock = offer.count > 0;

  return (
    <tr className={hasStock ? undefined : "row-muted"}>
      <td>
        <div className="offer-name">
          {offer.name}
          {offer.isOriginal && <span className="tag tag-neutral">исходная позиция</span>}
          {offer.notRefund && (
            <span className="tag tag-warn" title="Предложение нельзя вернуть по причине «Отказ»">
              невозвратная
            </span>
          )}
        </div>
        <div className="offer-sub">
          {offer.brand} · {offer.number}
        </div>
        {/* Склады - на узких экранах показываем внутри первой ячейки */}
        <div className="d-lg-none pt-1">
          <WarehouseCell offer={offer} compact />
        </div>
      </td>
      <td className="col-price">
        <span className="offer-price">{formatPrice(offer.minPrice)}</span>
        {offer.minPrice != null && offer.count > 0 && (
          <span className="offer-price-label">мин. по складам</span>
        )}
      </td>
      <td className="col-stock">
        <span className={`stock-badge ${hasStock ? "" : "is-empty"}`}>
          <span className="dot" aria-hidden="true" />
          {hasStock ? `${formatCount(offer.count)} шт` : "нет"}
        </span>
      </td>
      <td className="col-wh d-none d-lg-table-cell">
        <WarehouseCell offer={offer} />
      </td>
    </tr>
  );
}
