import { useContext, useEffect, useMemo, useState } from 'react';
import { formatUnits } from 'ethers';
import { Web3Context } from '../context/Web3Context';

const Claim = () => {
  const { votingContract, currentAccount, tokenContract, setIsLoading, schedule } = useContext(Web3Context);
  const [status, setStatus] = useState({ isClaimActive: false, hasClaimed: false, balance: '0' });
  const [loadingData, setLoadingData] = useState(false);

  const isWithinClaimWindow = useMemo(() => {
    const { claimStart, claimEnd } = schedule || {};
    const now = Date.now();
    const startOk = claimStart ? now >= new Date(claimStart).getTime() : true;
    const endOk = claimEnd ? now <= new Date(claimEnd).getTime() : true;
    return startOk && endOk;
  }, [schedule]);

  const fetchData = async () => {
    if (!votingContract || !currentAccount) return;
    setLoadingData(true);
    try {
      const active = await votingContract.moNhanPhieu();
      const claimed = await votingContract.daNhanPhieu(currentAccount);
      const bal = await tokenContract.balanceOf(currentAccount);
      const decimals = tokenContract.decimals ? await tokenContract.decimals() : 18;
      const balanceFormatted = formatUnits(bal, decimals);
      setStatus({
        isClaimActive: active,
        hasClaimed: claimed,
        balance: balanceFormatted,
      });
    } catch (error) {
      console.error('Lỗi lấy dữ liệu claim:', error);
    }
    setLoadingData(false);
  };

  useEffect(() => {
    fetchData();
  }, [votingContract, currentAccount]);

  const handleClaim = async () => {
    if (!status.isClaimActive || !isWithinClaimWindow) return alert('Chưa đến thời gian nhận token!');
    setIsLoading(true);
    try {
      const tx = await votingContract.nhanPhieu();
      await tx.wait();
      alert('Nhận token thành công!');
      fetchData();
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-qnu-500">Nhận token (QSV)</h2>
            <p className="text-gray-600">Mỗi ví chỉ nhận 1 lần xin cảm ơn.</p>
          </div>
          <div className="flex gap-2 text-sm">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-qnu-500 font-semibold">
              Claim: {status.isClaimActive ? 'Đang mở' : 'Đang đóng'}
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-qnu-500 font-semibold">
              Khung giờ: {isWithinClaimWindow ? 'Đúng giờ' : 'Ngoài giờ'}
            </span>
          </div>
        </div>

        {!currentAccount ? (
          <p className="text-red-500">Vui lòng kết nối ví để kiểm tra trạng thái.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100">
              <p className="text-gray-600">Số dư hiện tại:</p>
              <p className="text-4xl font-extrabold text-qnu-500">{status.balance} QSV</p>
            </div>

            <div className="space-y-4">
              {loadingData ? (
                <p>Đang tải...</p>
              ) : (
                <>
                  {!status.isClaimActive || !isWithinClaimWindow ? (
                    <div className="text-orange-500 font-medium bg-orange-50 p-3 rounded">
                      Claim đang đóng hoặc ngoài khung giờ.
                    </div>
                  ) : status.hasClaimed ? (
                    <div className="text-green-600 font-medium bg-green-50 p-3 rounded">
                      Bạn đã nhận token rồi. Hãy sang trang Bầu chọn!
                    </div>
                  ) : (
                    <button
                      onClick={handleClaim}
                      className="w-full bg-gradient-to-r from-qnu-500 to-blue-600 text-white py-3 rounded-lg font-bold hover:opacity-90 transition transform active:scale-95"
                    >
                      Nhận 1 Token QSV Ngay
                    </button>
                  )}
                </>
              )}
              <p className="text-sm text-gray-500">
                Nếu lỗi hãy liên hệ với ban tổ chức.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Claim;
