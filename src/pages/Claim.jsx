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
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20"></div>
      <div className="absolute top-20 right-10 w-96 h-96 bg-blue-400/10 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-400/10 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      
      <div className="container mx-auto py-16 px-4 relative z-10 animate-fadeIn">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-5 py-2 rounded-full shadow-lg border border-blue-200/50 dark:border-blue-500/30 mb-6">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Token Claim</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
              Nhận token
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                QSV
              </span>
            </h2>
            
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Mỗi ví chỉ được nhận 1 token duy nhất để bỏ phiếu
            </p>
          </div>

          {!currentAccount ? (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-8 text-center backdrop-blur-md">
              <svg className="w-16 h-16 text-red-500 dark:text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">Vui lòng kết nối ví</p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Bạn cần kết nối ví MetaMask để nhận token</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl blur-2xl opacity-20"></div>
              <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/50">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Balance Card */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-blue-500 to-purple-500 p-8 rounded-2xl shadow-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="text-white/90 font-semibold">Số dư hiện tại</p>
                      </div>
                      <p className="text-5xl font-black text-white mb-2">{status.balance}</p>
                      <p className="text-white/80 font-medium">QSV Token</p>
                    </div>
                  </div>

                  {/* Action Card */}
                  <div className="space-y-6">
                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2">
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
                        status.isClaimActive && isWithinClaimWindow
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          status.isClaimActive && isWithinClaimWindow ? 'bg-green-500 animate-pulse' : 'bg-orange-500'
                        }`}></div>
                        {status.isClaimActive && isWithinClaimWindow ? 'Đang mở' : 'Đã đóng'}
                      </div>
                    </div>

                    {loadingData ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                      </div>
                    ) : (
                      <>
                        {!status.isClaimActive || !isWithinClaimWindow ? (
                          <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-2xl p-6 animate-slideDown">
                            <div className="flex items-start gap-3">
                              <svg className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              <div>
                                <p className="font-bold text-orange-700 dark:text-orange-400 mb-1">Cổng claim đã đóng</p>
                                <p className="text-sm text-orange-600 dark:text-orange-500">Vui lòng quay lại trong khung giờ quy định</p>
                              </div>
                            </div>
                          </div>
                        ) : status.hasClaimed ? (
                          <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-6 animate-slideDown">
                            <div className="flex items-start gap-3">
                              <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <div>
                                <p className="font-bold text-green-700 dark:text-green-400 mb-1">Đã nhận token thành công!</p>
                                <p className="text-sm text-green-600 dark:text-green-500">Hãy sang trang Bầu chọn để vote cho ứng viên yêu thích</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={handleClaim}
                            className="group relative w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-bold hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
                          >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                              </svg>
                              Nhận 1 Token QSV Ngay
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </button>
                        )}
                      </>
                    )}

                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      💡 Nếu gặp lỗi, vui lòng liên hệ ban tổ chức
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Claim;
