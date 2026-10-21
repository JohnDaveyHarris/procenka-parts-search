const STEPS = [
  { id: 1, label: "Артикул" },
  { id: 2, label: "Производитель" },
  { id: 3, label: "Аналоги и цены" },
];

/** Трёхшаговый индикатор прогресса подбора */
export default function StepIndicator({ current }) {
  return (
    <nav className="stepper" aria-label="Этапы подбора">
      {STEPS.map((step, index) => {
        const state =
          step.id < current ? "done" : step.id === current ? "current" : "next";
        return (
          <div className="stepper-item" key={step.id}>
            {index > 0 && <span className="step-line" aria-hidden="true" />}
            <span className={`step is-${state}`}>
              <span className="step-dot" aria-hidden="true">
                {state === "done" ? (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 13l4 4L19 7"
                      stroke="currentColor"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  String(step.id).padStart(2, "0")
                )}
              </span>
              <span className="step-label">{step.label}</span>
            </span>
          </div>
        );
      })}
    </nav>
  );
}
