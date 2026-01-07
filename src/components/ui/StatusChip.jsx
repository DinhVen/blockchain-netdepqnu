const StatusChip = ({ label, value, status = 'neutral' }) => {
  const statusColors = {
    success: 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20',
    danger: 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20',
    warning: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
    primary: 'bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/20',
    neutral: 'bg-gray-100 dark:bg-gray-700 text-[#64748B] border-gray-200 dark:border-gray-600',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${statusColors[status]}`}>
      {label && <span className="text-[#64748B]">{label}:</span>}
      <span className="font-semibold">{value}</span>
    </span>
  );
};

export default StatusChip;
