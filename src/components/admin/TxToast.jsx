import { useEffect } from 'react';

const TxToast = ({ 
  isOpen, 
  onClose, 
  status, // 'pending' | 'success' | 'error'
  message,
  txHash,
  network = 'sepolia',
  autoClose = true,
}) => {
  useEffect(() => {
    if (isOpen && autoClose && status !== 'pending') {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, status, autoClose, onClose]);

  if (!isOpen) return null;

  const explorerUrl = network === 'mainnet' 
    ? `https://etherscan.io/tx/${txHash}`
    : `https://sepolia.etherscan.io/tx/${txHash}`;

  const statusConfig = {
    pending: {
      bg: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700',
      icon: (
        <svg className="w-5 h-5 text-[#2563EB] animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ),
      title: 'Đang gửi giao dịch...',
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700',
      icon: (
        <svg className="w-5 h-5 text-[#16A34A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Giao dịch thành công!',
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700',
      icon: (
        <svg className="w-5 h-5 text-[#DC2626]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Giao dịch thất bại',
    },
  };

  const config = statusConfig[status];

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slideUp">
      <div className={`${config.bg} border rounded-xl p-4 shadow-lg max-w-sm`}>
        <div className="flex items-start gap-3">
          {config.icon}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[#0F172A] dark:text-white text-sm">{config.title}</p>
            {message && <p className="text-xs text-[#64748B] mt-0.5">{message}</p>}
            {txHash && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-mono text-[#64748B] truncate">
                  {txHash.slice(0, 10)}...{txHash.slice(-8)}
                </span>
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#2563EB] hover:underline flex items-center gap-1"
                >
                  Etherscan
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}
          </div>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] dark:hover:text-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TxToast;
