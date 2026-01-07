import { Link } from 'react-router-dom';

const QuickActions = ({ actions }) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action, i) => {
        const content = (
          <>
            <div className={`text-2xl mb-2`}>{action.icon}</div>
            <p className={`font-semibold text-sm ${action.disabled ? 'text-[#64748B]' : 'text-[#0F172A] dark:text-white'}`}>
              {action.label}
            </p>
          </>
        );

        const baseClass = `block p-4 rounded-xl border text-center transition ${
          action.disabled
            ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-60'
            : action.primary
            ? 'bg-[#2563EB] border-[#2563EB] text-white hover:bg-blue-700'
            : 'bg-white dark:bg-gray-800 border-[#E2E8F0] dark:border-gray-700 hover:border-[#2563EB] hover:shadow-md'
        }`;

        if (action.to && !action.disabled) {
          return (
            <Link key={i} to={action.to} className={baseClass}>
              {action.primary ? (
                <>
                  <div className="text-2xl mb-2">{action.icon}</div>
                  <p className="font-semibold text-sm text-white">{action.label}</p>
                </>
              ) : content}
            </Link>
          );
        }

        return (
          <button key={i} onClick={action.onClick} disabled={action.disabled} className={baseClass}>
            {content}
          </button>
        );
      })}
    </div>
  );
};

export default QuickActions;
