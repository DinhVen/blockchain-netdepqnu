import { Link } from 'react-router-dom';
import { useContext, useState } from 'react';
import { Web3Context } from '../context/Web3Context';
import { useTheme } from '../context/ThemeContext';
import WalletConnect from './WalletConnect';
import { Menu, X, Moon, Sun } from 'lucide-react';

const Navbar = () => {
  const { isAdmin } = useContext(Web3Context);
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto flex justify-between items-center px-4 py-3">
        <Link
          to="/"
          className="flex items-center gap-3 group"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-xl">
              <img
                src="/assets/qnu-logo.png"
                alt="QNU"
                className="h-7 w-7 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black text-gray-900 dark:text-white hidden sm:block">
              QNU Voting 2025
            </span>
            <span className="text-lg font-black text-gray-900 dark:text-white sm:hidden">
              QNU 2025
            </span>
            {isAdmin && (
              <span className="text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-0.5 rounded-full font-bold">
                Admin
              </span>
            )}
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {[
            { to: '/', label: 'Trang chủ', icon: '🏠' },
            { to: '/claim', label: 'Nhận token', icon: '🎫' },
            { to: '/vote', label: 'Bỏ phiếu', icon: '🗳️' },
            ...(isAdmin ? [{ to: '/admin', label: 'Quản trị', icon: '⚙️' }] : []),
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="px-4 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-300 transform hover:scale-110 text-gray-700 dark:text-gray-300"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <WalletConnect />
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition text-gray-700 dark:text-gray-300"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700 animate-slideDown">
          <div className="flex flex-col gap-2 mt-4">
            {[
              { to: '/', label: 'Trang chủ', icon: '🏠' },
              { to: '/claim', label: 'Nhận token', icon: '🎫' },
              { to: '/vote', label: 'Bỏ phiếu', icon: '🗳️' },
              ...(isAdmin ? [{ to: '/admin', label: 'Quản trị', icon: '⚙️' }] : []),
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-3 rounded-xl transition transform hover:translate-x-1 text-gray-700 dark:text-gray-300 font-semibold"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
            <div className="px-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-300 transform hover:scale-110 text-gray-700 dark:text-gray-300"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              <WalletConnect />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
export default Navbar;
