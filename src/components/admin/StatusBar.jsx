const StatusBar = ({
  network,
  saleActive,
  voteOpen,
  maxVoters,
  tokensSold,
  contractBalance,
  scheduleSet,
}) => {
  const Badge = ({ label, value, status }) => {
    const statusColors = {
      success: 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20',
      danger: 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20',
      warning: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
      neutral: 'bg-gray-100 dark:bg-gray-700 text-[#64748B] border-gray-200 dark:border-gray-600',
    };

    return (
      <div className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${statusColors[status]}`}>
        <span className="text-[#64748B] mr-1">{label}:</span>
        <span className="font-semibold">{value}</span>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#E2E8F0] dark:border-gray-700 p-4">
      <div className="flex flex-wrap gap-2">
        <Badge label="Network" value={network || 'Sepolia'} status="neutral" />
        <Badge label="Sale" value={saleActive ? 'ON' : 'OFF'} status={saleActive ? 'success' : 'neutral'} />
        <Badge label="Vote" value={voteOpen ? 'ON' : 'OFF'} status={voteOpen ? 'success' : 'neutral'} />
        <Badge label="MaxVoters" value={maxVoters ?? '---'} status="neutral" />
        <Badge label="TokenSold" value={tokensSold ?? '---'} status="neutral" />
        <Badge label="Balance" value={contractBalance ? `${contractBalance} ETH` : '0 ETH'} status="neutral" />
        <Badge label="Schedule" value={scheduleSet ? 'Đã đặt' : 'Chưa đặt'} status={scheduleSet ? 'success' : 'warning'} />
      </div>
    </div>
  );
};

export default StatusBar;
