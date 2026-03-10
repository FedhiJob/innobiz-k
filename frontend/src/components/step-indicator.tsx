const steps = ["Company Info", "Founder Info", "Business & Document"];

export const StepIndicator = ({ currentStep }: { currentStep: 1 | 2 | 3 }) => {
  const progress = currentStep === 1 ? 33 : currentStep === 2 ? 66 : 100;

  return (
    <div className="space-y-4">
      <div className="h-2 w-full rounded-full bg-slate-200">
        <div
          className="h-2 rounded-full bg-brand-green transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {steps.map((label, index) => {
          const step = (index + 1) as 1 | 2 | 3;
          const active = currentStep === step;
          const completed = currentStep > step;

          return (
            <div
              className={`rounded-xl border px-3 py-2 text-sm font-medium ${
                active
                  ? "border-brand-blue bg-brand-blue/10 text-brand-blue"
                  : completed
                    ? "border-brand-green bg-brand-green/10 text-brand-green"
                    : "border-slate-200 bg-slate-50 text-slate-500"
              }`}
              key={label}
            >
              Step {index + 1}: {label}
            </div>
          );
        })}
      </div>
    </div>
  );
};
