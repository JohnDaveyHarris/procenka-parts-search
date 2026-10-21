"use client";

import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBrands,
  fetchAnalogues,
  selectBrand,
  clearBrand,
  resetSearch,
} from "@/redux/slices/searchSlice";

import Header from "./Header";
import Footer from "./Footer";
import SearchPanel from "./SearchPanel";
import StepIndicator from "./StepIndicator";
import BrandGrid from "./BrandGrid";
import ResultsSection from "./ResultsSection";
import StatusMessage from "./StatusMessage";
import { BrandGridSkeleton, TableSkeleton } from "./Skeletons";

/** Минимальная длина артикула для автоматического запроса */
const MIN_QUERY_LENGTH = 3;

/**
 * Корневой компонент двухэтапного подбора:
 *   Этап 1: артикул -> список производителей
 *   Этап 2: выбор производителя -> аналоги и предложения
 */
export default function PartsApp() {
  const dispatch = useDispatch();
  const { query, brands, selectedBrand, analogues } = useSelector(
    (state) => state.search
  );

  /** Поиск по факту ввода (c debounce из SearchPanel) */
  const handleSearch = useCallback(
    (value) => {
      const article = String(value || "").trim();
      if (article.length < MIN_QUERY_LENGTH) return;
      dispatch(fetchBrands(article));
    },
    [dispatch]
  );

  /** Этап 2: выбран производитель */
  const handleSelectBrand = useCallback(
    (brand) => {
      dispatch(selectBrand(brand));
      dispatch(fetchAnalogues({ article: query, brand }));
    },
    [dispatch, query]
  );

  const handleClearBrand = useCallback(() => dispatch(clearBrand()), [dispatch]);
  const handleReset = useCallback(() => dispatch(resetSearch()), [dispatch]);

  const step =
    selectedBrand || analogues.status !== "idle"
      ? 3
      : brands.status !== "idle"
        ? 2
        : 1;

  const renderBrands = () => {
    // Двухэтапность: когда выбран производитель (идёт загрузка или показана
    // таблица), сетку брендов скрываем - возврат к ней по чипу «Производитель»
    if (selectedBrand || analogues.status !== "idle") return null;

    if (brands.status === "loading") return <BrandGridSkeleton />;

    if (brands.status === "failed") {
      return (
        <StatusMessage
          variant="error"
          title="Не удалось получить производителей"
          detail={brands.error}
          onRetry={() => handleSearch(query)}
        />
      );
    }

    if (brands.status === "succeeded") {
      if (brands.items.length === 0) {
        return (
          <StatusMessage
            variant="empty"
            title="Ничего не найдено"
            detail={`По артикулу «${query}» предложений нет. Проверьте номер детали - возможно, в нём опечатка.`}
          />
        );
      }
      return <BrandGrid query={query} items={brands.items} onSelect={handleSelectBrand} />;
    }

    return null;
  };

  const renderResults = () => {
    if (analogues.status === "loading") return <TableSkeleton />;

    if (analogues.status === "failed") {
      return (
        <StatusMessage
          variant="error"
          title="Не удалось загрузить аналоги"
          detail={analogues.error}
          onRetry={() => handleSelectBrand(selectedBrand)}
        />
      );
    }

    if (analogues.status === "succeeded") {
      if (analogues.items.length === 0) {
        return (
          <StatusMessage
            variant="empty"
            title="Аналогов не найдено"
            detail={`Для «${query}» (${selectedBrand}) аналоги и предложения отсутствуют.`}
          />
        );
      }
      return (
        <ResultsSection
          query={query}
          brand={selectedBrand}
          offers={analogues.items}
          onClearBrand={handleClearBrand}
        />
      );
    }

    return null;
  };

  return (
    <div className="app-shell d-flex flex-column min-vh-100">
      <Header />

      <main className="flex-grow-1">
        <div className="container-xl">
          <section className="hero">
            <p className="kicker fade-up">Сервис «Проценка» · Favorit Parts</p>
            <h1 className="hero-title fade-up">
              Подбор автозапчастей
              <br />
              и аналогов
            </h1>
            <p className="hero-lead fade-up">
              Введите артикул - покажем производителей детали,
              затем цены, остатки на складах и аналоги.
            </p>
            <SearchPanel
              query={query}
              minLength={MIN_QUERY_LENGTH}
              onSearch={handleSearch}
              onReset={handleReset}
            />
          </section>

          <StepIndicator current={step} />

          {renderBrands()}
          {renderResults()}
        </div>
      </main>

      <Footer />
    </div>
  );
}
