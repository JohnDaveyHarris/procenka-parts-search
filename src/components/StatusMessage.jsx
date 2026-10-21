"use client";

/** Единый блок состояний: ошибка (с повтором) и «ничего не найдено» */
export default function StatusMessage({ variant, title, detail, onRetry }) {
  const isError = variant === "error";

  return (
    <section className={`status-section fade-up ${isError ? "status-error" : ""}`} aria-live="polite">
      <div className={isError ? "alert-card" : "empty-state"}>
        <span className={isError ? "alert-icon" : "empty-icon"} aria-hidden="true">
          {isError ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 8v5m0 3.5v.01M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
              <path d="m20 20-3.8-3.8M8.5 11h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          )}
        </span>

        <h3 className="status-title">{title}</h3>
        {detail && <p className="status-detail">{detail}</p>}

        {isError && onRetry && (
          <button type="button" className="btn-retry" onClick={onRetry}>
            Повторить запрос
          </button>
        )}
      </div>
    </section>
  );
}
