import { useContext, useEffect, useMemo, useState } from 'react';
import { Web3Context } from '../context/Web3Context';
import CandidateCard from '../components/CandidateCard';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSkeleton from '../components/LoadingSkeleton';
import PageHeader from '../components/ui/PageHeader';
import StatusChips from '../components/ui/StatusChips';
import EmptyState from '../components/ui/EmptyState';
import ActionCTA from '../components/ui/ActionCTA';

const API_BASE = import.meta.env.VITE_OTP_API || 'https://voting-b431.onrender.com';

const Voting = () => {
  const {
    votingContract,
    currentAccount,
    setIsLoading,
    isLoading,
    schedule,
    hideCandidates,
    saleActive,
    voteOpen,
    isAdmin,
  } = useContext(Web3Context);

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voteStatus, setVoteStatus] = useState({ hasVoted: false, hasBought: false, votedFor: 0 });
  const [isBanned, setIsBanned] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [filterMajor, setFilterMajor] = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showVoterInfoModal, setShowVoterInfoModal] = useState(false);
  const [voterInfo, setVoterInfo] = useState({ name: '', mssv: '' });

  const isWithinVoteWindow = useMemo(() => {
    const { voteStart, voteEnd } = schedule || {};
    const now = Date.now();
    const startOk = voteStart ? now >= voteStart : true;
    const endOk = voteEnd ? now <= voteEnd : true;
    return startOk && endOk;
  }, [schedule]);

  const fetchCandidates = async () => {
    setLoading(true);
    if (votingContract) {
      try {
        const total = await votingContract.tongUngVien();
        const list = await Promise.all(
          Array.from({ length: Number(total) }, (_, i) => votingContract.dsUngVien(i + 1))
        );
        const formatted = list
          .map((c) => ({
            id: Number(c.id),
            name: c.hoTen,
            mssv: c.mssv,
            major: c.nganh,
            votes: Number(c.soPhieu),
            isActive: c.dangHoatDong,
            image: c.anh,
            bio: c.moTa,
          }))
          .filter((c) => c.isActive);

        setCandidates(formatted);

        if (currentAccount) {
          const [hasBought, voted, banned, votedFor] = await Promise.all([
            votingContract.daMuaToken(currentAccount),
            votingContract.daBau(currentAccount),
            votingContract.biBanVinh(currentAccount),
            votingContract.bauChoId(currentAccount),
          ]);
          setVoteStatus({ hasVoted: voted, hasBought, votedFor: Number(votedFor) });
          setIsBanned(banned);
        }
      } catch (err) {
        console.warn('Load candidates error:', err);
      }
    }
    setLoading(false);
  };

  const filteredAndSortedCandidates = useMemo(() => {
    let result = [...candidates];
    if (searchTerm) {
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.mssv.includes(searchTerm) ||
          c.major.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterMajor !== 'all') {
      result = result.filter((c) => c.major === filterMajor);
    }
    result.sort((a, b) => {
      if (sortBy === 'votes') return b.votes - a.votes;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return a.id - b.id;
    });
    return result;
  }, [candidates, searchTerm, sortBy, filterMajor]);

  const majors = useMemo(() => [...new Set(candidates.map((c) => c.major))], [candidates]);

  useEffect(() => {
    fetchCandidates();
  }, [votingContract, currentAccount]);

  const handleVote = (id) => {
    if (!currentAccount || !voteOpen || !isWithinVoteWindow || voteStatus.hasVoted || isBanned) return;
    const candidate = candidates.find((c) => c.id === id);
    setSelectedCandidate(candidate);
    setShowVoterInfoModal(true);
  };

  const handleVoterInfoSubmit = () => {
    const { name, mssv } = voterInfo;
    if (!name.trim() || !mssv.trim()) return alert('Vui lòng nhập đầy đủ Họ tên và MSSV');
    if (!/^\d{8,10}$/.test(mssv.trim())) return alert('MSSV phải là 8-10 chữ số');
    setShowVoterInfoModal(false);
    setShowModal(true);
  };

  const confirmVote = async () => {
    if (!selectedCandidate || !voteStatus.hasBought) {
      alert('Bạn chưa mua token. Vui lòng mua token trước khi vote.');
      setShowModal(false);
      return;
    }
    setIsLoading(true);
    try {
      const tx = await votingContract.bauChon(selectedCandidate.id);
      await tx.wait();
      try {
        await fetch(`${API_BASE}/vote/history`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidateId: selectedCandidate.id,
            name: voterInfo.name.trim(),
            mssv: voterInfo.mssv.trim(),
            wallet: currentAccount,
          }),
        });
      } catch (e) {
        console.warn('Failed to record vote:', e);
      }
      alert('🎉 Bầu chọn thành công!');
      setShowModal(false);
      setVoterInfo({ name: '', mssv: '' });
      fetchCandidates();
    } catch (error) {
      alert(error.reason || error.message || 'Vote thất bại');
    }
    setIsLoading(false);
  };

  // Status chips data
  const statusChips = [
    { label: 'Sale', value: saleActive ? 'ON' : 'OFF', status: saleActive ? 'success' : 'neutral' },
    { label: 'Vote', value: voteOpen ? 'ON' : 'OFF', status: voteOpen ? 'success' : 'neutral' },
    { label: 'Ứng viên', value: candidates.length, status: 'info' },
  ];
  if (currentAccount) {
    statusChips.push(
      { label: 'Token', value: voteStatus.hasBought ? 'Đã mua' : 'Chưa mua', status: voteStatus.hasBought ? 'success' : 'warning' },
      { label: 'Vote', value: voteStatus.hasVoted ? 'Đã vote' : 'Chưa vote', status: voteStatus.hasVoted ? 'success' : 'neutral' }
    );
  }

  // CTA logic
  const getCTAActions = () => {
    if (!currentAccount) {
      return [{ label: 'Kết nối ví để tiếp tục', disabled: true }];
    }
    if (!voteStatus.hasBought) {
      return [
        { label: 'Mua token', to: '/claim', primary: true },
        { label: 'Xem kết quả', to: '/results' },
      ];
    }
    if (!voteStatus.hasVoted) {
      if (voteOpen && isWithinVoteWindow) {
        return [{ label: 'Chọn ứng viên bên dưới để bỏ phiếu', disabled: true }];
      }
      return [{ label: 'Chờ mở vote', disabled: true }, { label: 'Xem kết quả', to: '/results' }];
    }
    return [
      { label: `Bạn đã bầu cho #${voteStatus.votedFor}`, disabled: true },
      { label: 'Xem kết quả', to: '/results', primary: true },
    ];
  };

  // Empty state for no candidates
  const renderEmptyState = () => {
    if (candidates.length === 0) {
      return (
        <EmptyState
          icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          headline="Chưa có ứng viên"
          subtext="Admin cần thêm ứng viên hoặc duyệt đăng ký trước khi bầu chọn"
          actions={
            isAdmin
              ? [{ label: 'Đi tới Admin', to: '/admin', primary: true }]
              : [{ label: 'Đăng ký ứng viên', to: '/candidate-signup', primary: true }]
          }
        />
      );
    }
    if (filteredAndSortedCandidates.length === 0) {
      return (
        <EmptyState
          icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
          headline="Không tìm thấy ứng viên"
          subtext="Thử thay đổi từ khóa hoặc bộ lọc"
          actions={[{ label: 'Xóa bộ lọc', onClick: () => { setSearchTerm(''); setFilterMajor('all'); } }]}
        />
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-900 pt-20 pb-10">
      <div className="container mx-auto px-4">
        <PageHeader title="Danh sách Ứng cử viên" subtitle="Chọn ứng viên xứng đáng đại diện sinh viên QNU">
          <StatusChips items={statusChips} />
        </PageHeader>

        {/* CTA Section */}
        <div className="mb-8">
          <ActionCTA actions={getCTAActions()} />
        </div>

        {/* Banned Warning */}
        {isBanned && (
          <div className="max-w-3xl mx-auto mb-6 bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#DC2626] px-4 py-3 rounded-xl text-sm font-semibold text-center">
            ⛔ Ví của bạn đã bị cấm và không thể bầu chọn.
          </div>
        )}

        {/* Search & Filter */}
        {candidates.length > 0 && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, MSSV, ngành..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border border-[#E2E8F0] dark:border-gray-700 rounded-xl px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-[#0F172A] dark:text-white"
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-white dark:bg-gray-800 border border-[#E2E8F0] dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#2563EB] text-[#0F172A] dark:text-white">
                <option value="id">SBD</option>
                <option value="name">Tên</option>
                <option value="votes">Phiếu</option>
              </select>
              <select value={filterMajor} onChange={(e) => setFilterMajor(e.target.value)} className="bg-white dark:bg-gray-800 border border-[#E2E8F0] dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#2563EB] text-[#0F172A] dark:text-white">
                <option value="all">Tất cả ngành</option>
                {majors.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <p className="text-center text-sm text-[#64748B] mt-3">
              Hiển thị {filteredAndSortedCandidates.length} / {candidates.length} ứng viên
            </p>
          </div>
        )}

        {/* Content */}
        {hideCandidates ? (
          <EmptyState headline="Danh sách ứng viên đang tạm ẩn" subtext="Admin đã tạm ẩn danh sách ứng viên" />
        ) : loading ? (
          <LoadingSkeleton type="card" count={8} />
        ) : renderEmptyState() || (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedCandidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                onVote={handleVote}
                isVoting={isLoading}
                disabled={!voteOpen || !isWithinVoteWindow || voteStatus.hasVoted || isBanned || !voteStatus.hasBought}
                disabledReason={
                  !voteOpen ? 'Vote đang đóng' :
                  !voteStatus.hasBought ? 'Chưa mua token' :
                  voteStatus.hasVoted ? 'Đã bỏ phiếu' : ''
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Voter Info Modal */}
      {showVoterInfoModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mb-2">Xác nhận thông tin</h3>
            <p className="text-sm text-[#64748B] mb-4">Nhập thông tin để hoàn tất bầu chọn</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#0F172A] dark:text-white mb-1">Họ và tên *</label>
                <input type="text" placeholder="Nguyễn Văn A" value={voterInfo.name} onChange={(e) => setVoterInfo({ ...voterInfo, name: e.target.value })} className="w-full px-4 py-3 border border-[#E2E8F0] dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-[#0F172A] dark:text-white focus:ring-2 focus:ring-[#2563EB]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0F172A] dark:text-white mb-1">MSSV *</label>
                <input type="text" placeholder="12345678" maxLength={10} value={voterInfo.mssv} onChange={(e) => setVoterInfo({ ...voterInfo, mssv: e.target.value.replace(/\D/g, '') })} className="w-full px-4 py-3 border border-[#E2E8F0] dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-[#0F172A] dark:text-white focus:ring-2 focus:ring-[#2563EB]" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowVoterInfoModal(false); setVoterInfo({ name: '', mssv: '' }); }} className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-[#64748B] rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition">Hủy</button>
              <button onClick={handleVoterInfoSubmit} className="flex-1 px-4 py-3 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl font-semibold transition">Tiếp tục</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={showModal} onClose={() => setShowModal(false)} onConfirm={confirmVote} candidate={selectedCandidate} loading={isLoading} />
    </div>
  );
};

export default Voting;
