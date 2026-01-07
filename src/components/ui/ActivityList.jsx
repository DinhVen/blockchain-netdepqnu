const ActivityList = ({ activities, network = 'sepolia' }) => {
  const explorerBase = network === 'mainnet'
    ? 'https://etherscan.io/tx/'
    : 'https://sepolia.etherscan.io/tx/';

  const statusIcons = {
    success: (
      <div className="w-8 h-8 rounded-full bg-[#16A34A]/10 flex items-center justify-center">
        <svg className="w-4 h-4 text-[#16A34A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    ),
    pending: (
      <div className="w-8 h-8 rounded-full bg-[#F59E0B]/10 flex items-center justify-center">
        <svg className="w-4 h-4 text-[#F59E0B] animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    ),
    error: (
      <div className="w-8 h-8 rounded-full bg-[#DC2626]/10 flex items-center justify-center">
        <svg className="w-4 h-4 text-[#DC2626]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    ),
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-[#64748B]">Chưa có hoạt động nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((act, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-[#F8FAFC] dark:bg-gray-800 rounded-xl">
          {statusIcons[act.status] || statusIcons.success}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-[#0F172A] dark:text-white text-sm truncate">{act.type || act.action}</p>
            <p className="text-xs text-[#64748B]">{act.time}</p>
          </div>
          {act.txHash && (
            <a
              href={`${explorerBase}${act.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#2563EB] hover:underline font-mono"
            >
              {act.txHash.slice(0, 6)}...{act.txHash.slice(-4)}
            </a>
          )}
        </div>
      ))}
    </div>
  );
};

export default ActivityList;
