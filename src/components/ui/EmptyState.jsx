import { Link } from 'react-router-dom';

const EmptyState = ({ icon, headline, subtext, actions }) => {
  return (
    <div className="text-center py-16 px-4">
      {icon && (
        <div className="w-16 h-16 mx-auto mb-4 bg-[#2563EB]/10 rounded-full flex items-center justify-center text-[#2563EB]">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mb-2">{headline}</h3>
      {subtext && <p className="text-[#64748B] mb-6 max-w-md mx-auto">{subtext}</p>}
      {actions && actions.length > 0 && (
        <div className="flex flex-wrap gap-3 justify-center">
          {actions.map((action, i) => (
            action.to ? (
              <Link
                key={i}
                to={action.to}
                className={`px-5 py-2.5 rounded-xl font-semibold transition ${
                  action.primary
                    ? 'bg-[#2563EB] hover:bg-blue-700 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-[#0F172A] dark:text-white border border-[#E2E8F0] dark:border-gray-700'
                }`}
              >
                {action.label}
              </Link>
            ) : (
              <button
                key={i}
                onClick={action.onClick}
                className={`px-5 py-2.5 rounded-xl font-semibold transition ${
                  action.primary
                    ? 'bg-[#2563EB] hover:bg-blue-700 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-[#0F172A] dark:text-white border border-[#E2E8F0] dark:border-gray-700'
                }`}
              >
                {action.label}
              </button>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
