import { useState } from 'react';

const FraudCard = ({ 
  conflicts, 
  onBan, 
  onRefresh,
  isLoading 
}) => {
  const [banWallet, setBanWallet] = useState('');

  const handleBan = () => {
    if (!banWallet.trim() || !/^0x[a-fA-F0-9]{40}$/.test(banWallet.trim())) {
      alert('Vui lòng nhập địa chỉ ví hợp lệ');
      return;
    }
    onBan(banWallet.trim());
    setBanWallet('');
  };

  const shortenAddress = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '---';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#E2E8F0] dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-[#DC2626]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Phát hiện gian lận ({conflicts.length})
        </h3>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="text-xs text-[#2563EB] hover:underline disabled:opacity-50"
        >
          Tải lại
        </button>
      </div>

      {/* Manual Ban */}
      <div className="mb-4 p-3 bg-[#F8FAFC] dark:bg-gray-700 rounded-lg">
        <label className="text-xs font-medium text-[#64748B] mb-1 block">Ban ví thủ công</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={banWallet}
            onChange={(e) => setBanWallet(e.target.value)}
            placeholder="0x..."
            className="flex-1 border border-[#E2E8F0] dark:border-gray-600 rounded-lg p-2 text-sm font-mono bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
          />
          <button
            onClick={handleBan}
            disabled={isLoading || !banWallet.trim()}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed bg-[#DC2626] hover:bg-red-700 text-white"
          >
            Ban
          </button>
        </div>
      </div>

      {/* Conflicts List */}
      {conflicts.length === 0 ? (
        <div className="text-center py-6">
          <svg className="w-10 h-10 mx-auto mb-2 text-[#16A34A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-[#64748B]">Chưa phát hiện gian lận</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {conflicts.map((c, i) => (
            <div key={i} className="p-3 bg-[#DC2626]/5 border border-[#DC2626]/20 rounded-lg">
              <div className="flex justify-between items-start">
                <div className="text-xs space-y-1">
                  <p className="text-[#0F172A] dark:text-white">
                    <span className="text-[#64748B]">Email:</span> {c.email}
                  </p>
                  <p className="text-[#0F172A] dark:text-white">
                    <span className="text-[#64748B]">Ví gốc:</span>{' '}
                    <span className="font-mono">{shortenAddress(c.walletBound)}</span>
                  </p>
                  <p className="text-[#DC2626]">
                    <span className="text-[#64748B]">Ví gian lận:</span>{' '}
                    <span className="font-mono">{shortenAddress(c.walletTried)}</span>
                  </p>
                </div>
                <button
                  onClick={() => onBan(c.walletTried)}
                  disabled={isLoading}
                  className="text-xs px-3 py-1.5 rounded-lg bg-[#DC2626] hover:bg-red-700 text-white font-medium transition disabled:opacity-50"
                >
                  Ban
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FraudCard;
