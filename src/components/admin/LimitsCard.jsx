import { useState } from 'react';

const LimitsCard = ({ 
  maxVoters, 
  tokensSold, 
  onUpdate, 
  isLoading 
}) => {
  const [newLimit, setNewLimit] = useState('');

  const handleSubmit = () => {
    const value = Number(newLimit);
    if (!value || value <= 0) {
      alert('Vui lòng nhập số hợp lệ');
      return;
    }
    if (value < tokensSold) {
      alert(`Không thể giảm xuống dưới ${tokensSold} (số token đã bán)`);
      return;
    }
    onUpdate(value);
    setNewLimit('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#E2E8F0] dark:border-gray-700 p-6">
      <h3 className="font-bold text-[#0F172A] dark:text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Giới hạn tham gia
      </h3>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-[#64748B]">Giới hạn hiện tại:</span>
          <span className="font-semibold text-[#0F172A] dark:text-white">{maxVoters ?? '---'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#64748B]">Đã bán:</span>
          <span className="font-semibold text-[#0F172A] dark:text-white">{tokensSold ?? '---'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#64748B]">Còn lại:</span>
          <span className="font-semibold text-[#16A34A]">{(maxVoters ?? 0) - (tokensSold ?? 0)}</span>
        </div>

        <div className="pt-3 border-t border-[#E2E8F0] dark:border-gray-700">
          <label className="text-xs font-medium text-[#64748B] mb-1 block">Giới hạn mới</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
              placeholder={`>= ${tokensSold}`}
              min={tokensSold}
              className="flex-1 border border-[#E2E8F0] dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
            <button
              onClick={handleSubmit}
              disabled={isLoading || !newLimit}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed bg-[#2563EB] hover:bg-blue-700 text-white"
            >
              Cập nhật
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LimitsCard;
