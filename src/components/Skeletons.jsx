/** Скелетоны загрузки */

export function BrandGridSkeleton() {
  return (
    <section className="step-section" aria-hidden="true">
      <div className="section-head">
        <div className="skel skel-title" />
        <div className="skel skel-sub" />
      </div>
      <div className="row g-3">
        {Array.from({ length: 8 }).map((_, index) => (
          <div className="col-6 col-md-4 col-lg-3" key={index}>
            <div className="brand-card skel-card">
              <div className="skel skel-brand" />
              <div className="skel skel-line" />
              <div className="skel skel-line skel-short" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TableSkeleton() {
  return (
    <section className="step-section" aria-hidden="true">
      <div className="section-head">
        <div className="skel skel-chip" />
        <div className="skel skel-sub" />
      </div>
      <div className="table-card">
        <table className="offers-table">
          <thead>
            <tr>
              <th>Наименование / производитель</th>
              <th className="col-price">Цена</th>
              <th className="col-stock">Остаток</th>
              <th className="d-none d-lg-table-cell">Склады</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 7 }).map((_, index) => (
              <tr key={index}>
                <td>
                  <div className="skel skel-line" />
                  <div className="skel skel-line skel-short" />
                </td>
                <td className="col-price">
                  <div className="skel skel-line skel-short" />
                </td>
                <td className="col-stock">
                  <div className="skel skel-dot" />
                </td>
                <td className="d-none d-lg-table-cell">
                  <div className="skel skel-line" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
