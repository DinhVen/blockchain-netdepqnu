import { useState } from 'react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  type = 'danger', // 'danger' | 'warning' | 'primary'
  requireInput = false,
  inputPlaceholder = 'Nhập XACNHAN để tiếp tục',
  details = [], // [{ label: 'Treasury', value: '0x...' }]
  isLoading = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  const canConfirm = requireInput ? inputValue === 'XACNHAN' : confirmed;

  const typeStyles = {
    danger: 'bg-[#DC2626] hover:bg-red-700',
    warning: 'bg-[#F59E0B] hover:bg-amber-600',
    primary: 'bg-[#2563EB] hover:bg-blue-700',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${type === 'danger' ? 'bg-red-100 text-[#DC2626]' : type === 'warning' ? 'bg-amber-100 text-[#F59E0B]' : 'bg-blue-100 text-[#2563EB]'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">{title}</h3>
            <p className="text-sm text-[#64748B] mt-1">{description}</p>
          </div>
        </div>

        {details.length > 0 && (
          <div className="bg-[#F8FAFC] dark:bg-gray-700 rounded-xl p-4 space-y-2">
            {details.map((d, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-[#64748B]">{d.label}:</span>
                <span className="font-mono text-[#0F172A] dark:text-white">{d.value}</span>
              </div>
            ))}
          </div>
        )}

        {requireInput ? (
          <div>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={inputPlaceholder}
              className="w-full border border-[#E2E8F0] dark:border-gray-600 rounded-xl p-3 text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
            <p className="text-xs text-[#64748B] mt-1">Nhập "XACNHAN" để tiếp tục</p>
          </div>
        ) : (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="w-4 h-4 rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB]"
            />
            <span className="text-sm text-[#0F172A] dark:text-white">Tôi hiểu và muốn tiếp tục</span>
          </label>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-gray-600 text-[#0F172A] dark:text-white font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={!canConfirm || isLoading}
            className={`flex-1 px-4 py-2.5 rounded-xl text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${typeStyles[type]}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Đang xử lý...
              </span>
            ) : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
