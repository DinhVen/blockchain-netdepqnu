import { Link } from 'react-router-dom';

const ActionCTA = ({ actions }) => {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {actions.map((action, i) => {
        const baseClass = `inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition ${
          action.disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`;
        
        const styleClass = action.primary
          ? 'bg-[#2563EB] hover:bg-blue-700 text-white shadow-lg shadow-[#2563EB]/25'
          : action.danger
          ? 'bg-[#DC2626] hover:bg-red-700 text-white'
          : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-[#0F172A] dark:text-white border border-[#E2E8F0] dark:border-gray-700';

        if (action.to && !action.disabled) {
          return (
            <Link key={i} to={action.to} className={`${baseClass} ${styleClass}`}>
              {action.icon && action.icon}
              {action.label}
            </Link>
          );
        }

        return (
          <button
            key={i}
            onClick={action.onClick}
            disabled={action.disabled}
            className={`${baseClass} ${styleClass}`}
          >
            {action.icon && action.icon}
            {action.label}
          </button>
        );
      })}
    </div>
  );
};

export default ActionCTA;
