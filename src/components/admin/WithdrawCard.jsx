const WithdrawCard = ({ 
  contractBalance, 
  treasury, 
  onWithdraw, 
  isLoading 
}) => {
  const shortenAddress = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '---';
  const canWithdraw = contractBalance && Number(contractBalance) > 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#E2E8F0] dark:border-gray-700 p-6">
      <h3 className="font-bold text-[#0F172A] dark:text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        Rút tiền
      </h3>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-[#64748B]">Contract Balance:</span>
          <span className="font-semibold text-[#0F172A] dark:text-white">{contractBalance ?? '0'} ETH</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#64748B]">Treasury:</span>
          <span className="font-mono text-xs text-[#0F172A] dark:text-white">{shortenAddress(treasury)}</span>
        </div>
      </div>

      {!canWithdraw && (
        <p className="text-xs text-[#64748B] mb-3 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Không có ETH để rút
        </p>
      )}

      <button
        onClick={onWithdraw}
        disabled={!canWithdraw || isLoading}
        className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed bg-[#14B8A6] hover:bg-teal-600 text-white"
      >
        {isLoading ? 'Đang xử lý...' : 'Rút về Treasury'}
      </button>
    </div>
  );
};

export default WithdrawCard;
