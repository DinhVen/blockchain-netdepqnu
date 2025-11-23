import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { Web3Context } from '../context/Web3Context';

const FloatingActions = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentAccount } = useContext(Web3Context);

  const actions = [
    ...(currentAccount ? [
      { 
        to: '/dashboard', 
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
        label: 'Dashboard',
        color: 'from-blue-500 to-cyan-500'
      }
    ] : []),
    { 
      to: '/faq', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: 'FAQ',
      color: 'from-purple-500 to-pink-500'
    },
    { 
      href: 'mailto:van45.1050252@st.qnu.edu.vn', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      label: 'Liên hệ',
      color: 'from-green-500 to-emerald-500'
    },
  ];

  return (
    <div className="fixed bottom-8 left-8 z-40 flex flex-col-reverse items-start gap-4">
      {/* Action Buttons */}
      {isOpen && actions.map((action, index) => (
        action.to ? (
          <Link
            key={index}
            to={action.to}
            onClick={() => setIsOpen(false)}
            className={`group flex items-center gap-3 animate-fadeIn`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className={`w-14 h-14 bg-gradient-to-br ${action.color} rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform cursor-pointer`}>
              {action.icon}
            </div>
            <span className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-full shadow-lg text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {action.label}
            </span>
          </Link>
        ) : (
          <a
            key={index}
            href={action.href}
            onClick={() => setIsOpen(false)}
            className={`group flex items-center gap-3 animate-fadeIn`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className={`w-14 h-14 bg-gradient-to-br ${action.color} rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform cursor-pointer`}>
              {action.icon}
            </div>
            <span className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-full shadow-lg text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {action.label}
            </span>
          </a>
        )
      ))}

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:shadow-3xl transition-all duration-300 ${
          isOpen ? 'rotate-45' : ''
        }`}
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
};

export default FloatingActions;
