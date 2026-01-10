import { useState, useEffect } from 'react';

const RefundCard = ({
  contractBalance,
  onRefundUser,
  onRefundBatch,
  isLoading,
  votingContract,
}) => {
  const [userAddress, setUserAddress] = useState('');
  const [showVoterList, setShowVoterList] = useState(false);
  const [voters, setVoters] = useState([]);
  const [loadingVoters, setLoadingVoters] = useState(false);

  const handleRefundSingle = () => {
    if (!userAddress.trim() || !/^0x[a-fA-F0-9]{40}$/.test(userAddress.trim())) {
      alert('Vui lòng nhập địa chỉ ví hợp lệ (0x...)');
      return;
    }
    onRefundUser(userAddress.trim());
    setUserAddress('');
  };

  const loadVoters = async () => {
    if (!votingContract) return;
    setLoadingVoters(true);
    try {
      const totalHistory = await votingContract.tongLichSuBauChon();
      const voterList = [];
      const seen = new Set();

      for (let i = 0; i < Number(totalHistory); i++) {
        const history = await votingContract.layLichSuBauChon(i);
        if (history.voter && !seen.has(history.voter.toLowerCase())) {
          seen.add(history.voter.toLowerCase());
          // Check if approved
          let hasApproved = false;
          try {
            const contractAddress = await votingContract.getAddress();
            const allowance = await votingContract.allowance(history.voter, contractAddress);
            hasApproved = allowance > 0;
          } catch (e) {
            console.warn('Check allowance error:', e);
          }

          voterList.push({
            address: history.voter,
            candidateId: Number(history.ungVienId),
            timestamp: Number(history.timestamp),
            hasApproved,
            hasVoted: true,
          });
        }
      }

      setVoters(voterList);
    } catch (e) {
      console.error('Load voters error:', e);
    }
    setLoadingVoters(false);
  };

  const handleShowList = () => {
    setShowVoterList(true);
    loadVoters();
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString('vi-VN');
  };

  const shortenAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#E2E8F0] dark:border-gray-700 p-6">
      <h3 className="font-bold text-[#0F172A] dark:text-white mb-4 flex items-center gap-2">
        <svg
          className="w-5 h-5 text-[#14B8A6]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
          />
        </svg>
        Refund ETH cho User
      </h3>

      <p className="text-sm text-[#64748B] mb-4">
        Hoàn trả 0.001 ETH cho user đã vote. Contract cần có đủ ETH.
      </p>

      <div className="bg-[#F8FAFC] dark:bg-gray-700/50 rounded-lg p-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-[#64748B]">Contract Balance</span>
          <span className="font-semibold text-[#0F172A] dark:text-white">
            {contractBalance} ETH
          </span>
        </div>
      </div>

      {/* Xem danh sách */}
      <button
        onClick={handleShowList}
        className="w-full mb-4 px-4 py-2 rounded-lg border border-[#2563EB] text-[#2563EB] hover:bg-[#2563EB]/10 font-medium text-sm transition"
      >
        Xem danh sách user đã vote
      </button>

      {/* Refund 1 user */}
      <div className="space-y-3 mb-4">
        <label className="block text-sm font-medium text-[#0F172A] dark:text-white">
          Refund 1 user
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={userAddress}
            onChange={(e) => setUserAddress(e.target.value)}
            placeholder="0x..."
            className="flex-1 border border-[#E2E8F0] dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent"
          />
          <button
            onClick={handleRefundSingle}
            disabled={isLoading || !userAddress.trim()}
            className="px-4 py-2 rounded-lg bg-[#14B8A6] hover:bg-teal-600 text-white font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Refund
          </button>
        </div>
      </div>

      {/* Refund tất cả */}
      <div className="pt-4 border-t border-[#E2E8F0] dark:border-gray-700">
        <button
          onClick={onRefundBatch}
          disabled={isLoading}
          className="w-full px-4 py-3 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Refund tất cả user đã vote
        </button>
        <p className="text-xs text-[#64748B] mt-2 text-center">
          Tự động refund cho tất cả user có trong lịch sử vote
        </p>
      </div>

      {/* Modal danh sách voter */}
      {showVoterList && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-[#E2E8F0] dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-bold text-[#0F172A] dark:text-white">
                Danh sách user đã vote ({voters.length})
              </h3>
              <button
                onClick={() => setShowVoterList(false)}
                className="text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {loadingVoters ? (
                <div className="text-center py-8 text-[#64748B]">Đang tải...</div>
              ) : voters.length === 0 ? (
                <div className="text-center py-8 text-[#64748B]">Chưa có ai vote</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] dark:border-gray-700">
                      <th className="text-left py-2 px-2 text-[#64748B] font-medium">#</th>
                      <th className="text-left py-2 px-2 text-[#64748B] font-medium">Địa chỉ ví</th>
                      <th className="text-center py-2 px-2 text-[#64748B] font-medium">
                        Ứng viên
                      </th>
                      <th className="text-center py-2 px-2 text-[#64748B] font-medium">
                        Trạng thái
                      </th>
                      <th className="text-right py-2 px-2 text-[#64748B] font-medium">
                        Thời gian
                      </th>
                      <th className="text-right py-2 px-2 text-[#64748B] font-medium">
                        Refund
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {voters.map((v, idx) => (
                      <tr
                        key={v.address}
                        className="border-b border-[#E2E8F0] dark:border-gray-700 hover:bg-[#F8FAFC] dark:hover:bg-gray-700/50"
                      >
                        <td className="py-2 px-2 text-[#64748B]">{idx + 1}</td>
                        <td className="py-2 px-2 font-mono text-[#0F172A] dark:text-white">
                          {shortenAddress(v.address)}
                        </td>
                        <td className="py-2 px-2 text-center font-bold text-[#2563EB]">
                          #{v.candidateId}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${v.hasApproved ? 'bg-[#16A34A]/10 text-[#16A34A]' : 'bg-gray-100 dark:bg-gray-700 text-[#64748B]'}`}
                            >
                              {v.hasApproved ? 'Approved' : 'No'}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[#2563EB]/10 text-[#2563EB]">
                              Voted
                            </span>
                          </div>
                        </td>
                        <td className="py-2 px-2 text-right text-[#64748B] text-xs">
                          {formatDate(v.timestamp)}
                        </td>
                        <td className="py-2 px-2 text-right">
                          <button
                            onClick={() => {
                              onRefundUser(v.address);
                              setShowVoterList(false);
                            }}
                            disabled={isLoading}
                            className="text-xs px-2 py-1 rounded bg-[#14B8A6] hover:bg-teal-600 text-white transition disabled:opacity-50"
                          >
                            Refund
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="p-4 border-t border-[#E2E8F0] dark:border-gray-700 flex gap-3">
              <button
                onClick={() => setShowVoterList(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-[#E2E8F0] dark:border-gray-600 text-[#64748B] hover:bg-[#F8FAFC] dark:hover:bg-gray-700 transition"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  onRefundBatch();
                  setShowVoterList(false);
                }}
                disabled={isLoading || voters.length === 0}
                className="flex-1 px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-medium transition disabled:opacity-50"
              >
                Refund tất cả ({voters.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefundCard;
