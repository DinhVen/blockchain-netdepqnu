const StatusChips = ({ items }) => {
  const getChipStyle = (status) => {
    switch (status) {
      case 'success':
        return 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20';
      case 'warning':
        return 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20';
      case 'danger':
        return 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20';
      case 'info':
        return 'bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/20';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-[#64748B] border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {items.map((item, i) => (
        <span
          key={i}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${getChipStyle(item.status)}`}
        >
          {item.icon && <span>{item.icon}</span>}
          {item.label}: {item.value}
        </span>
      ))}
    </div>
  );
};

export default StatusChips;
