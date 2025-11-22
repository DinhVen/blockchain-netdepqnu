import { useContext } from 'react';
import { Web3Context } from '../context/Web3Context';
import { Wallet } from 'lucide-react';

const WalletConnect = () => {
  const { connectWallet, currentAccount, logout } = useContext(Web3Context);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={connectWallet}
        className="flex items-center gap-2 bg-white text-qnu-500 px-4 py-2 rounded-full font-bold hover:bg-gray-100 transition"
      >
        <Wallet size={18} />
        {currentAccount
          ? `${currentAccount.slice(0, 6)}...${currentAccount.slice(currentAccount.length - 4)}`
          : 'Kết nối ví'}
      </button>
      {currentAccount && (
        <button
          onClick={logout}
          className="text-sm text-white/80 underline hover:text-white transition"
        >
          Đăng xuất
        </button>
      )}
    </div>
  );
};
export default WalletConnect;
