import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Web3Context } from '../context/Web3Context';
import { formatUnits } from 'ethers';
import PageHeader from '../components/ui/PageHeader';
import StatusChips from '../components/ui/StatusChips';
import EmptyState from '../components/ui/EmptyState';
import Timeline from '../components/ui/Timeline';
import QuickActions from '../components/ui/QuickActions';
import ActivityList from '../components/ui/ActivityList';

const Dashboard = () => {
  const { votingContract, tokenContract, currentAccount, schedule, saleActive, voteOpen } = useContext(Web3Context);
  const [userData, setUserData] = useState({
    hasBought: false,
    hasVoted: false,
    tokenBalance: '0',
    votedForId: 0,
    votedCandidate: null,
  });
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!votingContract || !currentAccount) return;
      setLoading(true);
      try {
        const [hasBought, hasVoted, votedForId] = await Promise.all([
          votingContract.daMuaToken(currentAccount),
          votingContract.daBau(currentAccount),
          votingContract.bauChoId(currentAccount),
        ]);

        let tokenBalance = '0';
        if (tokenContract) {
          const bal = await tokenContract.balanceOf(currentAccount);
          const decimals = await tokenContract.decimals();
          tokenBalance = formatUnits(bal, decimals);
        }

        let votedCandidate = null;
        if (hasVoted && Number(votedForId) > 0) {
          try {
            const c = await votingContract.dsUngVien(Number(votedForId));
            votedCandidate = { id: Number(c.id), name: c.hoTen, image: c.anh, major: c.nganh };
          } catch (e) {
            console.log('Không lấy được thông tin ứng viên đã vote');
          }
        }

        setUserData({ hasBought, hasVoted, tokenBalance, votedForId: Number(votedForId), votedCandidate });

        const acts = [];
        if (hasBought) acts.push({ type: 'Mua token', status: 'success', time: 'Đã hoàn thành' });
        if (hasVoted && votedCandidate) acts.push({ type: `Bầu cho ${votedCandidate.name}`, status: 'success', time: 'Đã hoàn thành' });
        setActivities(acts);
      } catch (error) {
        console.error('Lỗi tải dữ liệu:', error);
      }
      setLoading(false);
    };
    fetchUserData();
  }, [votingContract, tokenContract, currentAccount]);

  const timelineSteps = [
    { label: 'Kết nối ví', status: currentAccount ? 'completed' : 'current', description: currentAccount ? `${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}` : 'Kết nối MetaMask' },
    { label: 'Mua token', status: userData.hasBought ? 'completed' : currentAccount ? 'current' : 'upcoming', description: userData.hasBought ? `Số dư: ${userData.tokenBalance} QSV` : 'Mua token để tham gia' },
    { label: 'Bỏ phiếu', status: userData.hasVoted ? 'completed' : userData.hasBought ? 'current' : 'upcoming', description: userData.hasVoted ? `Đã bầu cho #${userData.votedForId}` : 'Chọn ứng viên yêu thích' },
    { label: 'Xem kết quả', status: userData.hasVoted ? 'current' : 'upcoming', description: 'Theo dõi bảng xếp hạng' },
  ];

  const quickActions = [];
  if (!currentAccount) {
    quickActions.push({ label: 'Kết nối ví', icon: '', disabled: true });
  } else if (!userData.hasBought) {
    quickActions.push({ label: 'Mua token', to: '/claim', icon: '', primary: true });
    quickActions.push({ label: 'Xem ứng viên', to: '/voting', icon: '' });
  } else if (!userData.hasVoted) {
    quickActions.push({ label: 'Bỏ phiếu ngay', to: '/voting', icon: '', primary: true });
    quickActions.push({ label: 'Xem kết quả', to: '/results', icon: '' });
  } else {
    quickActions.push({ label: 'Xem kết quả', to: '/results', icon: '', primary: true });
    quickActions.push({ label: 'Xem ứng viên', to: '/voting', icon: '' });
  }

  const statusChips = [
    { label: 'Sale', value: saleActive ? 'ON' : 'OFF', status: saleActive ? 'success' : 'neutral' },
    { label: 'Vote', value: voteOpen ? 'ON' : 'OFF', status: voteOpen ? 'success' : 'neutral' },
  ];

  if (!currentAccount) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] pt-20 pb-10 flex items-center justify-center">
        <EmptyState
          icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
          headline="Vui lòng kết nối ví"
          subtext="Kết nối ví MetaMask để xem dashboard của bạn"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] pt-20 pb-10">
      <div className="container mx-auto px-4">
        <PageHeader title="Dashboard của bạn" subtitle={`${currentAccount.slice(0, 10)}...${currentAccount.slice(-8)}`}>
          <StatusChips items={statusChips} />
        </PageHeader>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#2563EB] border-t-transparent"></div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Stats Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-[#E2E8F0] dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#2563EB]/10 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#2563EB]" fill="currentColor" viewBox="0 0 20 20"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" /></svg>
                  </div>
                  <span className="text-sm text-[#64748B]">Số dư Token</span>
                </div>
                <p className="text-2xl font-bold text-[#0F172A] dark:text-white">{userData.tokenBalance}</p>
                <p className="text-xs text-[#64748B]">QSV</p>
              </div>

              <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-[#E2E8F0] dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${userData.hasBought ? 'bg-[#16A34A]/10' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    <svg className={`w-5 h-5 ${userData.hasBought ? 'text-[#16A34A]' : 'text-[#64748B]'}`} fill="currentColor" viewBox="0 0 20 20">{userData.hasBought ? <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /> : <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />}</svg>
                  </div>
                  <span className="text-sm text-[#64748B]">Trạng thái Token</span>
                </div>
                <p className={`text-xl font-bold ${userData.hasBought ? 'text-[#16A34A]' : 'text-[#64748B]'}`}>{userData.hasBought ? 'Đã mua' : 'Chưa mua'}</p>
              </div>

              <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-[#E2E8F0] dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${userData.hasVoted ? 'bg-[#2563EB]/10' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    <svg className={`w-5 h-5 ${userData.hasVoted ? 'text-[#2563EB]' : 'text-[#64748B]'}`} fill="currentColor" viewBox="0 0 20 20">{userData.hasVoted ? <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /> : <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />}</svg>
                  </div>
                  <span className="text-sm text-[#64748B]">Trạng thái Vote</span>
                </div>
                <p className={`text-xl font-bold ${userData.hasVoted ? 'text-[#2563EB]' : 'text-[#64748B]'}`}>{userData.hasVoted ? 'Đã bỏ phiếu' : 'Chưa vote'}</p>
              </div>

              <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-[#E2E8F0] dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#14B8A6]/10 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#14B8A6]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                  </div>
                  <span className="text-sm text-[#64748B]">Hoạt động</span>
                </div>
                <p className="text-2xl font-bold text-[#0F172A] dark:text-white">{(userData.hasBought ? 1 : 0) + (userData.hasVoted ? 1 : 0)}</p>
                <p className="text-xs text-[#64748B]">giao dịch</p>
              </div>
            </div>

            {/* Voted Candidate */}
            {userData.hasVoted && userData.votedCandidate && (
              <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-[#E2E8F0] dark:border-gray-700 shadow-sm">
                <h3 className="font-bold text-[#0F172A] dark:text-white mb-4">Ứng viên bạn đã bầu</h3>
                <div className="flex items-center gap-4">
                  {userData.votedCandidate.image ? (
                    <img src={userData.votedCandidate.image} alt={userData.votedCandidate.name} className="w-16 h-16 rounded-xl object-cover border border-[#E2E8F0] dark:border-gray-700" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[#64748B]"><svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg></div>
                  )}
                  <div>
                    <p className="font-bold text-[#0F172A] dark:text-white">{userData.votedCandidate.name}</p>
                    <p className="text-sm text-[#64748B]">{userData.votedCandidate.major}</p>
                    <p className="text-xs text-[#2563EB]">SBD #{userData.votedCandidate.id}</p>
                  </div>
                  <Link to="/results" className="ml-auto px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition">Xem kết quả</Link>
                </div>
              </div>
            )}

            {/* Timeline & Quick Actions */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-[#E2E8F0] dark:border-gray-700 shadow-sm">
                <h3 className="font-bold text-[#0F172A] dark:text-white mb-4">Tiến trình của bạn</h3>
                <Timeline steps={timelineSteps} />
              </div>
              <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-[#E2E8F0] dark:border-gray-700 shadow-sm">
                <h3 className="font-bold text-[#0F172A] dark:text-white mb-4">Hành động nhanh</h3>
                <QuickActions actions={quickActions} />
              </div>
            </div>

            {/* Activity List */}
            {activities.length > 0 && (
              <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-[#E2E8F0] dark:border-gray-700 shadow-sm">
                <h3 className="font-bold text-[#0F172A] dark:text-white mb-4">Lịch sử hoạt động</h3>
                <ActivityList activities={activities} />
              </div>
            )}

            {/* Schedule */}
            {schedule && (schedule.claimStart || schedule.voteStart) && (
              <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-[#E2E8F0] dark:border-gray-700 shadow-sm">
                <h3 className="font-bold text-[#0F172A] dark:text-white mb-4">Lịch trình sự kiện</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {schedule.claimStart && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <p className="text-sm text-[#64748B] mb-1">Mua token</p>
                      <p className="font-semibold text-[#0F172A] dark:text-white">{new Date(schedule.claimStart).toLocaleString('vi-VN')} - {schedule.claimEnd ? new Date(schedule.claimEnd).toLocaleString('vi-VN') : 'Chưa đặt'}</p>
                    </div>
                  )}
                  {schedule.voteStart && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <p className="text-sm text-[#64748B] mb-1">Bầu chọn</p>
                      <p className="font-semibold text-[#0F172A] dark:text-white">{new Date(schedule.voteStart).toLocaleString('vi-VN')} - {schedule.voteEnd ? new Date(schedule.voteEnd).toLocaleString('vi-VN') : 'Chưa đặt'}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
