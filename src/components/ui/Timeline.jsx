import { Link } from 'react-router-dom';

const Timeline = ({ steps }) => {
  return (
    <div className="space-y-4">
      {steps.map((step, i) => {
        const isCompleted = step.status === 'completed';
        const isCurrent = step.status === 'current';
        
        return (
          <div key={i} className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                isCompleted
                  ? 'bg-[#16A34A] text-white'
                  : isCurrent
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-[#64748B]'
              }`}>
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-sm font-bold">{i + 1}</span>
                )}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-0.5 h-8 mt-2 ${isCompleted ? 'bg-[#16A34A]' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
              )}
            </div>
            <div className="flex-1 pb-2">
              <p className={`font-semibold ${isCompleted ? 'text-[#16A34A]' : isCurrent ? 'text-[#2563EB]' : 'text-[#0F172A] dark:text-white'}`}>
                {step.label}
              </p>
              {step.description && <p className="text-sm text-[#64748B] mt-0.5">{step.description}</p>}
              {step.action && !isCompleted && (
                step.action.to ? (
                  <Link
                    to={step.action.to}
                    className="inline-block mt-2 text-sm px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-medium transition"
                  >
                    {step.action.label}
                  </Link>
                ) : (
                  <button
                    onClick={step.action.onClick}
                    disabled={step.action.disabled}
                    className="mt-2 text-sm px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-medium transition disabled:opacity-50"
                  >
                    {step.action.label}
                  </button>
                )
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
