import { Link } from 'react-router-dom';
import { useContext, useState } from 'react';
import { Web3Context } from '../context/Web3Context';
import WalletConnect from './WalletConnect';
import ThemeToggle from './ThemeToggle';
import { Menu, X } from 'lucide-react';
import '../styles/ThemeToggle.css';

const NAV_ITEMS = [
  { to: '/', label: 'Trang chủ', icon: '🏠' },
  { to: '/vote', label: 'Bỏ phiếu', icon: '🗳️' },
  { to: '/results', label: 'Kết quả', icon: '📊' },
  { to: '/claim', label: 'Nhận token', icon: '🎁' },
  { to: '/faq', label: 'FAQ', icon: '❓' },
];

const Navbar = () => {
  const { isAdmin, currentAccount } = useContext(Web3Context);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    ...NAV_ITEMS,
    ...(currentAccount ? [{ to: '/dashboard', label: 'Dashboard', icon: '📈' }] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Quản trị', icon: '⚙️' }] : []),
  ];

  return (
    <nav className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" onClick={() => setMobileMenuOpen(false)}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-1.5 rounded-lg">
                <img src="/assets/qnu-logo.png" alt="QNU" className="h-6 w-6" onError={(e) => (e.target.style.display = 'none')} />
              </div>
            </div>
            <div>
              <span className="text-base font-black text-gray-900 dark:text-white">QNU Voting</span>
              {isAdmin && <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">Admin</span>}
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to} className="px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-2">
            <ThemeToggle />
            <WalletConnect />
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition" aria-label="Menu">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-700 animate-slideDown">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <div className="flex items-center gap-2 px-4 pt-4 mt-2 border-t border-gray-200 dark:border-gray-700">
              <ThemeToggle />
              <WalletConnect />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
export default Navbar;
