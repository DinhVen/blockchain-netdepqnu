import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { Web3Context } from '../context/Web3Context';
import WalletConnect from './WalletConnect';

const Navbar = () => {
  const { isAdmin } = useContext(Web3Context);

  return (
    <nav className="bg-gradient-to-r from-qnu-500 via-blue-600 to-cyan-500 text-white p-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold flex items-center gap-2">
          <img src="/assets/qnu-logo.png" alt="QNU" className="h-8 w-8 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
          <span>QNU - Nét Đẹp Sinh Viên 2025</span>
          {isAdmin && (
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-semibold">Admin</span>
          )}
        </Link>
        <div className="hidden md:flex gap-6 font-medium">
          <Link to="/" className="hover:text-gray-200">Trang chủ</Link>
          <Link to="/claim" className="hover:text-gray-200">Nhận token</Link>
          <Link to="/vote" className="hover:text-gray-200">Bỏ phiếu</Link>
          {isAdmin && <Link to="/admin" className="hover:text-gray-200">Quản trị</Link>}
        </div>
        <WalletConnect />
      </div>
    </nav>
  );
};
export default Navbar;
