import { Link } from 'react-router-dom';
import { useContext, useState } from 'react';
import { Web3Context } from '../context/Web3Context';
import WalletConnect from './WalletConnect';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const { isAdmin } = useContext(Web3Context);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-qnu-500 via-blue-600 to-cyan-500 text-white p-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          to="/"
          className="text-xl md:text-2xl font-bold flex items-center gap-2"
          onClick={() => setMobileMenuOpen(false)}
        >
          <img
            src="/assets/qnu-logo.png"
            alt="QNU"
            className="h-8 w-8 object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <span className="hidden sm:inline">QNU - Nét Đẹp Sinh Viên 2025</span>
          <span className="sm:hidden">QNU 2025</span>
          {isAdmin && <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-semibold">Admin</span>}
        </Link>

        <div className="hidden md:flex gap-6 font-medium">
          <Link to="/" className="hover:text-gray-200 transition">
            Trang chủ
          </Link>
          <Link to="/claim" className="hover:text-gray-200 transition">
            Nhận token
          </Link>
          <Link to="/vote" className="hover:text-gray-200 transition">
            Bỏ phiếu
          </Link>
          {isAdmin && (
            <Link to="/admin" className="hover:text-gray-200 transition">
              Quản trị
            </Link>
          )}
        </div>

        <div className="hidden md:block">
          <WalletConnect />
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 hover:bg-white/10 rounded-lg transition"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-white/20">
          <div className="flex flex-col gap-3 mt-4">
            <Link
              to="/"
              className="hover:bg-white/10 px-4 py-2 rounded-lg transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Trang chủ
            </Link>
            <Link
              to="/claim"
              className="hover:bg-white/10 px-4 py-2 rounded-lg transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Nhận token
            </Link>
            <Link
              to="/vote"
              className="hover:bg-white/10 px-4 py-2 rounded-lg transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Bỏ phiếu
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="hover:bg-white/10 px-4 py-2 rounded-lg transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Quản trị
              </Link>
            )}
            <div className="px-4 pt-3 border-t border-white/20">
              <WalletConnect />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
export default Navbar;
