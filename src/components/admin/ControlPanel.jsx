const ControlPanel = ({ 
  saleActive, 
  voteOpen, 
  onOpenSale, 
  onCloseSale, 
  onOpenVote, 
  onCloseVote,
  isLoading 
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#E2E8F0] dark:border-gray-700 p-6">
      <h3 className="font-bold text-[#0F172A] dark:text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Điều khiển
      </h3>

      <div className="space-y-4">
        {/* Sale Control */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#0F172A] dark:text-white">Bán Token</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${saleActive ? 'bg-[#16A34A]/10 text-[#16A34A]' : 'bg-gray-100 dark:bg-gray-700 text-[#64748B]'}`}>
              {saleActive ? 'Đang mở' : 'Đã đóng'}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onOpenSale}
              disabled={saleActive || isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed bg-[#16A34A] hover:bg-green-700 text-white"
            >
              Mở bán
            </button>
            <button
              onClick={onCloseSale}
              disabled={!saleActive || isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed bg-[#DC2626] hover:bg-red-700 text-white"
            >
              Đóng bán
            </button>
          </div>
        </div>

        {/* Vote Control */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#0F172A] dark:text-white">Bầu chọn</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${voteOpen ? 'bg-[#16A34A]/10 text-[#16A34A]' : 'bg-gray-100 dark:bg-gray-700 text-[#64748B]'}`}>
              {voteOpen ? 'Đang mở' : 'Đã đóng'}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onOpenVote}
              disabled={voteOpen || isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed bg-[#2563EB] hover:bg-blue-700 text-white"
            >
              Mở vote
            </button>
            <button
              onClick={onCloseVote}
              disabled={!voteOpen || isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed bg-[#F59E0B] hover:bg-amber-600 text-white"
            >
              Đóng vote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
