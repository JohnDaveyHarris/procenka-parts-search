"use client";

import { useEffect, useRef, useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

/**
 * Поле ввода артикула. Кнопки «Подобрать» нет сознательно:
 * запрос выполняется «по факту ввода» (debounce 450 мс),
 * а Enter позволяет искать мгновенно, не дожидаясь debounce.
 */
export default function SearchPanel({ query, minLength, onSearch, onReset }) {
  const [value, setValue] = useState(query);
  const debounced = useDebouncedValue(value, 450);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Автопоиск по факту ввода
  useEffect(() => {
    const trimmed = debounced.trim();
    if (trimmed === "") {
      if (query !== "") onReset();
      return;
    }
    if (trimmed.length >= minLength && trimmed !== query) {
      onSearch(trimmed);
    }
  }, [debounced]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (trimmed.length >= minLength) onSearch(trimmed);
  };

  const handleClear = () => {
    setValue("");
    onReset();
    inputRef.current?.focus();
  };

  return (
    <form className="search-box fade-up" onSubmit={handleSubmit} role="search">
      <label className="visually-hidden" htmlFor="article-input">
        Артикул (номер) автозапчасти
      </label>
      <span className="search-icon" aria-hidden="true">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
          <path d="m20 20-3.8-3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>

      <input
        id="article-input"
        ref={inputRef}
        className="search-input"
        type="text"
        inputMode="search"
        autoComplete="off"
        spellCheck="false"
        placeholder="Например, 7160500039S"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />

      {value && (
        <button
          type="button"
          className="search-clear"
          onClick={handleClear}
          aria-label="Очистить поле ввода"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 6l12 12M18 6 6 18"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}

      <p className="search-hint">
        Минимум {minLength} символа - подбор начнётся автоматически,
        Enter - искать сразу
      </p>
    </form>
  );
}
