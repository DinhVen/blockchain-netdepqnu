import { useContext } from 'react';
import { Web3Context } from '../context/Web3Context';
import { Wallet } from 'lucide-react';

const WalletConnect = () => {
  const { connectWallet, currentAccount, disconnectWallet } = useContext(Web3Context);

  const handleLogout = () => {
    // Clear email verification
    localStorage.removeItem('qnu-email-verified');
    localStorage.removeItem('qnu-email-token');
    // Disconnect wallet
    disconnectWallet();
    // Reload page to reset state
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={connectWallet}
        className="flex items-center gap-2 bg-white dark:bg-gray-700 text-[#2563EB] dark:text-blue-400 px-4 py-2 rounded-full font-bold hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
      >
        <Wallet size={18} />
        {currentAccount
          ? `${currentAccount.slice(0, 6)}...${currentAccount.slice(currentAccount.length - 4)}`
          : 'Kết nối ví'}
      </button>
      {currentAccount && (
        <button
          onClick={handleLogout}
          className="text-sm text-red-600 dark:text-red-400 underline hover:text-red-700 dark:hover:text-red-300 transition-all duration-300 font-semibold"
        >
          Đăng xuất
        </button>
      )}
    </div>
  );
};
export default WalletConnect;
