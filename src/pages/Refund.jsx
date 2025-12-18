import { useContext, useState, useEffect } from 'react';
import { Web3Context } from '../context/Web3Context';

const Refund = () => {
  const { votingContract, currentAccount, setIsLoading, refundEnabled } = useContext(Web3Context);
  const [canRefund, setCanRefund] = useState(false);
  const [error, setError] = useState('');
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    checkRefund();
  }, [currentAccount, votingContract]);

  const checkRefund = async () => {
    if (!votingContract || !currentAccount) return;
    
    setLoadingData(true);
    try {
      const eligible = await votingContract.coTheRefund(currentAccount);
      setCanRefund(eligible);
    } catch (e) {
      console.error('Check refund error:', e);
    }
    setLoadingData(false);
  };

  const handleRefund = async () => {
    if (!currentAccount) {
      setError('Vui lòng kết nối ví');
      return;
    }

    const confirmed = window.confirm(
      'Xác nhận hoàn tiền?\n\n' +
      'Bạn sẽ nhận lại: 0.001 ETH\n' +
      'Token sẽ bị burn (xóa vĩnh viễn)\n\n' +
      'Bạn có chắc chắn?'
    );

    if (!confirmed) return;

    setIsLoading(true);
    setError('');

    try {
      const tx = await votingContract.yeuCauHoanTien();
      await tx.wait();
      
      alert('Hoàn tiền thành công! 0.001 ETH đã được trả lại ví của bạn.');
      checkRefund();
    } catch (e) {
      setError(e.message || 'Hoàn tiền thất bại');
      console.error('Refund error:', e);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20"></div>
      
      <div className="container mx-auto py-16 px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
              Hoàn tiền Token
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Nếu bạn đã mua token nhưng chưa vote, có thể yêu cầu hoàn tiền
            </p>
          </div>

          {!currentAccount ? (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-8 text-center backdrop-blur-md">
              <svg className="w-16 h-16 text-red-500 dark:text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">Vui lòng kết nối ví</p>
            </div>
          ) : loadingData ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : canRefund && refundEnabled ? (
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
              {/* Success Icon */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                  <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Bạn đủ điều kiện hoàn tiền!
                </h3>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                  Bạn đã mua token nhưng chưa vote. Bạn có thể yêu cầu hoàn lại 0.001 ETH.
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-bold text-blue-700 dark:text-blue-400 mb-2">Quy trình hoàn tiền:</h4>
                    <ul className="text-sm text-blue-600 dark:text-blue-500 space-y-1">
                      <li>1. Token của bạn sẽ bị burn (xóa vĩnh viễn)</li>
                      <li>2. Bạn nhận lại 0.001 ETH vào ví</li>
                      <li>3. Bạn phải trả gas fee (~$1-5)</li>
                      <li>4. Không thể hoàn tác sau khi xác nhận</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleRefund}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                Yêu cầu hoàn tiền (0.001 ETH)
              </button>
              
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                💡 Lưu ý: Bạn cần có đủ ETH để trả gas fee
              </p>
            </div>
          ) : (
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
              {/* Warning Icon */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-4">
                  <svg className="w-10 h-10 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Không đủ điều kiện hoàn tiền
                </h3>
              </div>

              {/* Reasons */}
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3">
                    Có thể do một trong các lý do sau:
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-red-500 text-xl">✗</span>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Đã vote rồi</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Token đã bị burn khi bạn vote, không thể hoàn tiền</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-red-500 text-xl">✗</span>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Chưa mua token</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Bạn cần mua token trước khi có thể yêu cầu hoàn tiền</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-red-500 text-xl">✗</span>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Đã refund rồi</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Mỗi ví chỉ được hoàn tiền một lần</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-red-500 text-xl">✗</span>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Refund chưa mở</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Admin chưa bật chức năng hoàn tiền</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Help Box */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold text-blue-700 dark:text-blue-400 mb-1">Cần hỗ trợ?</p>
                      <p className="text-sm text-blue-600 dark:text-blue-500">
                        Liên hệ ban tổ chức nếu bạn nghĩ đây là lỗi hệ thống
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mt-4">
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Refund;
