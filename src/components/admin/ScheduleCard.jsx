const ScheduleCard = ({ 
  schedule, 
  onScheduleChange, 
  onSave, 
  onLoadCurrent,
  saleActive,
  voteOpen,
  isLoading 
}) => {
  const fields = [
    { key: 'claimStart', label: 'Claim mở (GMT+7)' },
    { key: 'claimEnd', label: 'Claim đóng (GMT+7)' },
    { key: 'voteStart', label: 'Vote mở (GMT+7)' },
    { key: 'voteEnd', label: 'Vote đóng (GMT+7)' },
  ];

  const canSave = !saleActive && !voteOpen;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#E2E8F0] dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Lịch trình
        </h3>
        <button
          onClick={onLoadCurrent}
          disabled={isLoading}
          className="text-xs text-[#2563EB] hover:underline disabled:opacity-50"
        >
          Tải lịch hiện tại
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="text-xs font-medium text-[#64748B] mb-1 block">{field.label}</label>
            <input
              type="datetime-local"
              value={schedule[field.key] || ''}
              onChange={(e) => onScheduleChange(field.key, e.target.value)}
              className="w-full border border-[#E2E8F0] dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
          </div>
        ))}
      </div>

      {!canSave && (
        <p className="text-xs text-[#F59E0B] mb-3 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Đóng Sale/Vote trước khi thay đổi lịch trình
        </p>
      )}

      <button
        onClick={onSave}
        disabled={!canSave || isLoading}
        className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed bg-[#2563EB] hover:bg-blue-700 text-white"
      >
        {isLoading ? 'Đang lưu...' : 'Lưu lịch trình'}
      </button>
    </div>
  );
};

export default ScheduleCard;
