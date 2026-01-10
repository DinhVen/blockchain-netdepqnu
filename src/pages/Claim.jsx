import { useContext, useEffect, useState } from 'react';
import { Web3Context } from '../context/Web3Context';
import { ethers } from 'ethers';
import EmailGate from '../components/EmailGate';
import { TOKEN_PRICE } from '../utils/constants';

const Claim = () => {
  const { votingContract, currentAccount, isLoading, setIsLoading, saleActive, schedule } = useContext(Web3Context);
  const [hasBought, setHasBought] = useState(false);
  const [remaining, setRemaining] = useState(null);
  const [sold, setSold] = useState(null);
  const [maxVoters, setMaxVoters] = useState(null);
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem('qnu-email-verified');
    setEmailVerified(!!verified);
  }, []);

  const loadData = async () => {
    if (!votingContract || !currentAccount) return;
    try {
      const [bought, rem, soldCount, max] = await Promise.all([
        votingContract.daMuaToken(currentAccount),
        votingContract.soTokenConLai(),
        votingContract.totalTokensSold(),
        votingContract.maxVoters(),
      ]);
      setHasBought(bought);
      setRemaining(Number(rem));
      setSold(Number(soldCount));
      setMaxVoters(Number(max));
    } catch (e) {
      console.warn('Load data error:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, [votingContract, currentAccount]);

  const handleBuy = async () => {
    if (!votingContract) return alert('Vui lòng kết nối ví!');
    if (!emailVerified) return alert('Vui lòng xác thực email trước!');

    const confirmed = window.confirm(
      `Xác nhận mua token?\n\nGiá: ${TOKEN_PRICE} ETH\nSố lượng: 1 QSV\n\nToken sẽ được dùng để bỏ phiếu.`
    );
    if (!confirmed) return;

    try {
      setIsLoading(true);
      const tx = await votingContract.muaToken({
        value: ethers.parseEther(TOKEN_PRICE),
      });
      await tx.wait();
      alert('Mua token thành công! Bạn có thể bỏ phiếu ngay.');
      loadData();
    } catch (e) {
      console.error('Buy token error:', e);
      const msg = e.reason || e.message || 'Không thể mua token';
      alert(`Lỗi: ${msg}`);
    }
    setIsLoading(false);
  };

  const now = Date.now();
  const claimNotStarted = schedule.claimStart && now < schedule.claimStart;
  const claimEnded = schedule.claimEnd && now > schedule.claimEnd;

  if (!emailVerified) {
    return <EmailGate onVerified={() => setEmailVerified(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-24 pb-12 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black leading-tight mb-3">
            <span className="text-gray-900 dark:text-white">Nhận Token</span>
            <span className="block text-[#2563EB]">Bầu Chọn</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Sở hữu token QSV để tham gia bình chọn cho ứng viên yêu thích</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400">Giá token</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{TOKEN_PRICE} ETH</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400">Còn lại</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {remaining !== null ? remaining : '...'}
              </p>
            </div>
            <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400">Đã bán</p>
              <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                {sold !== null ? `${sold}/${maxVoters}` : '...'}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          {maxVoters && sold !== null && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-teal-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(sold / maxVoters) * 100}%` }}
              />
            </div>
          )}

          {/* Status */}
          {!currentAccount ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-xl text-center">
              <p className="text-yellow-700 dark:text-yellow-400 font-semibold">
                Vui lòng kết nối ví MetaMask để mua token
              </p>
            </div>
          ) : hasBought ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6 rounded-xl text-center">
              <p className="text-green-700 dark:text-green-400 font-bold text-lg">Bạn đã mua token!</p>
              <p className="text-green-600 dark:text-green-500 mt-2">
                Hãy vào trang <a href="/voting" className="underline font-semibold">Bình chọn</a> để vote cho ứng viên yêu thích.
              </p>
            </div>
          ) : !saleActive ? (
            <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 p-6 rounded-xl text-center">
              <p className="text-gray-700 dark:text-gray-300 font-bold text-lg">Chưa mở bán token</p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Vui lòng chờ admin mở bán.</p>
            </div>
          ) : claimNotStarted ? (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-6 rounded-xl text-center">
              <p className="text-blue-700 dark:text-blue-400 font-bold text-lg">Chưa đến thời gian mua token</p>
              <p className="text-blue-600 dark:text-blue-500 mt-2">
                Bắt đầu: {new Date(schedule.claimStart).toLocaleString('vi-VN')}
              </p>
            </div>
          ) : claimEnded ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-xl text-center">
              <div className="text-4xl mb-2">⌛</div>
              <p className="text-red-700 dark:text-red-400 font-bold text-lg">Đã hết thời gian mua token</p>
            </div>
          ) : remaining === 0 ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-xl text-center">
              <p className="text-red-700 dark:text-red-400 font-bold text-lg">Đã hết token!</p>
              <p className="text-red-600 dark:text-red-500 mt-2">Tất cả {maxVoters} suất đã được bán hết.</p>
            </div>
          ) : (
            <button
              onClick={handleBuy}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
            >
              {isLoading ? 'Đang xử lý...' : `Mua Token (${TOKEN_PRICE} ETH)`}
            </button>
          )}

          {/* Info */}
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Lưu ý:</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Mỗi ví chỉ được nhận 1 token</li>
              <li>• Token sẽ được chuyển về hệ thống sau khi bỏ phiếu</li>
              <li>• Sau khi kết thúc, BTC sẽ hoàn lại ETH cho bạn</li>
              <li>• Đảm bảo đang ở mạng Sepolia Testnet</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Claim;
