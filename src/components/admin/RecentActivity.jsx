const RecentActivity = ({ activities, network = 'sepolia' }) => {
  const explorerBase = network === 'mainnet' 
    ? 'https://etherscan.io/tx/' 
    : 'https://sepolia.etherscan.io/tx/';

  const actionLabels = {
    OpenSale: 'Mở bán token',
    CloseSale: 'Đóng bán token',
    OpenVote: 'Mở bầu chọn',
    CloseVote: 'Đóng bầu chọn',
    SetSchedule: 'Cập nhật lịch trình',
    Withdraw: 'Rút tiền',
    AddCandidate: 'Thêm ứng viên',
    LockCandidate: 'Khóa ứng viên',
    UnlockCandidate: 'Mở khóa ứng viên',
    BanWallet: 'Ban ví',
    UpdateLimit: 'Cập nhật giới hạn',
  };

  const statusColors = {
    pending: 'bg-[#F59E0B]/10 text-[#F59E0B]',
    success: 'bg-[#16A34A]/10 text-[#16A34A]',
    error: 'bg-[#DC2626]/10 text-[#DC2626]',
  };

  const shortenHash = (hash) => hash ? `${hash.slice(0, 8)}...${hash.slice(-6)}` : '---';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#E2E8F0] dark:border-gray-700 p-6">
      <h3 className="font-bold text-[#0F172A] dark:text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Hoạt động gần đây
      </h3>

      {activities.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-[#64748B]">Chưa có hoạt động nào</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {activities.map((act, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-[#F8FAFC] dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded-full ${statusColors[act.status]}`}>
                  {act.status === 'pending' ? '⏳' : act.status === 'success' ? '✓' : '✗'}
                </span>
                <div>
                  <p className="text-sm font-medium text-[#0F172A] dark:text-white">
                    {actionLabels[act.actionType] || act.actionType}
                  </p>
                  <p className="text-xs text-[#64748B]">{act.time}</p>
                </div>
              </div>
              {act.txHash && (
                <a
                  href={`${explorerBase}${act.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-[#2563EB] hover:underline"
                >
                  {shortenHash(act.txHash)}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
