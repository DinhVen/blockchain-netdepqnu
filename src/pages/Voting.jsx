import { useContext, useEffect, useMemo, useState } from 'react';
import { Web3Context } from '../context/Web3Context';
import CandidateCard from '../components/CandidateCard';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { MOCK_CANDIDATES } from '../utils/mockData';

const HIDE_CANDIDATES = import.meta.env.VITE_HIDE_CANDIDATES === 'true';

const Voting = () => {
  const { votingContract, currentAccount, setIsLoading, isLoading, candidateMedia, schedule } = useContext(Web3Context);
  const [candidates, setCandidates] = useState([]);
  const [voteStatus, setVoteStatus] = useState({ active: false, hasVoted: false });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [filterMajor, setFilterMajor] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const isWithinVoteWindow = useMemo(() => {
    const { voteStart, voteEnd } = schedule || {};
    const now = Date.now();
    const startOk = voteStart ? now >= new Date(voteStart).getTime() : true;
    const endOk = voteEnd ? now <= new Date(voteEnd).getTime() : true;
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
            image: c.anh || candidateMedia?.[Number(c.id)],
            bio: c.moTa,
          }))
          .filter((c) => c.isActive);

        setCandidates(formatted);

        const active = await votingContract.moBauChon();
        const voted = await votingContract.daBau(currentAccount);
        setVoteStatus({ active, hasVoted: voted });
      } catch (err) {
        console.log('Đang Mock Data do lỗi contract hoặc chưa deploy', err);
        setCandidates(MOCK_CANDIDATES);
        setVoteStatus({ active: true, hasVoted: false });
      }
    } else {
      setCandidates(MOCK_CANDIDATES);
    }
    setLoading(false);
  };

  const filteredAndSortedCandidates = useMemo(() => {
    let result = [...candidates];

    // Search
    if (searchTerm) {
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.mssv.includes(searchTerm) ||
          c.major.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by major
    if (filterMajor !== 'all') {
      result = result.filter((c) => c.major === filterMajor);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'votes') return b.votes - a.votes;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return a.id - b.id;
    });

    return result;
  }, [candidates, searchTerm, sortBy, filterMajor]);

  const majors = useMemo(() => {
    const uniqueMajors = [...new Set(candidates.map((c) => c.major))];
    return uniqueMajors;
  }, [candidates]);

  useEffect(() => {
    fetchCandidates();
  }, [votingContract, currentAccount]);

  const handleVote = async (id) => {
    if (!currentAccount || !voteStatus.active || !isWithinVoteWindow || voteStatus.hasVoted) {
      return;
    }

    const candidate = candidates.find((c) => c.id === id);
    setSelectedCandidate(candidate);
    setShowModal(true);
  };

  const confirmVote = async () => {
    if (!selectedCandidate) return;

    setIsLoading(true);
    try {
      const tx = await votingContract.bauChon(selectedCandidate.id);
      await tx.wait();
      setShowModal(false);
      fetchCandidates();
    } catch (error) {
      console.error('Vote error:', error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/10 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      
      <div className="container mx-auto py-12 px-4 relative z-10 animate-fadeIn">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className={`inline-flex items-center gap-2 backdrop-blur-md px-5 py-2 rounded-full shadow-lg border mb-4 ${
            voteStatus.active && isWithinVoteWindow
              ? 'bg-blue-100/80 dark:bg-blue-900/30 border-blue-300 dark:border-blue-500/30'
              : 'bg-gray-100/80 dark:bg-gray-800/80 border-gray-300 dark:border-gray-700'
          }`}>
            <span className="relative flex h-2 w-2">
              {voteStatus.active && isWithinVoteWindow && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                voteStatus.active && isWithinVoteWindow ? 'bg-blue-500' : 'bg-gray-500'
              }`}></span>
            </span>
            <span className={`text-sm font-semibold ${
              voteStatus.active && isWithinVoteWindow
                ? 'text-blue-700 dark:text-blue-300'
                : 'text-gray-700 dark:text-gray-400'
            }`}>
              {voteStatus.active && isWithinVoteWindow ? 'Đang diễn ra' : 'Đang đóng'}
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white">
            Danh sách
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Ứng cử viên
            </span>
          </h2>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Hãy chọn ra gương mặt xứng đáng nhất đại diện cho sinh viên QNU
          </p>
          
          {/* Status Badges */}
          <div className="flex flex-wrap gap-3 justify-center pt-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border ${
              voteStatus.active && isWithinVoteWindow
                ? 'bg-green-100/80 dark:bg-green-900/30 border-green-300 dark:border-green-700'
                : 'bg-orange-100/80 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                voteStatus.active && isWithinVoteWindow ? 'bg-green-500 animate-pulse' : 'bg-orange-500'
              }`}></div>
              <span className={`text-sm font-semibold ${
                voteStatus.active && isWithinVoteWindow
                  ? 'text-green-700 dark:text-green-400'
                  : 'text-orange-700 dark:text-orange-400'
              }`}>
                {voteStatus.active && isWithinVoteWindow ? 'Đang mở bỏ phiếu' : 'Đã đóng bỏ phiếu'}
              </span>
            </div>
            
            {voteStatus.hasVoted && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/80 dark:bg-blue-900/30 backdrop-blur-md border border-blue-300 dark:border-blue-700 animate-pulse-slow">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-bold text-blue-700 dark:text-blue-400">
                  Bạn đã hoàn thành bầu chọn
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Search & Filter */}
        <div className="max-w-4xl mx-auto mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, MSSV, ngành..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            >
              <option value="id">Sắp xếp: SBD</option>
              <option value="name">Sắp xếp: Tên</option>
              <option value="votes">Sắp xếp: Phiếu bầu</option>
            </select>

            <select
              value={filterMajor}
              onChange={(e) => setFilterMajor(e.target.value)}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            >
              <option value="all">Tất cả ngành</option>
              {majors.map((major) => (
                <option key={major} value={major}>
                  {major}
                </option>
              ))}
            </select>
          </div>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            {HIDE_CANDIDATES
              ? 'Danh sách ứng viên đang ẩn'
              : `Hiển thị ${filteredAndSortedCandidates.length} / ${candidates.length} ứng viên`}
          </div>
        </div>

        {/* Candidates Grid */}
        {HIDE_CANDIDATES ? (
          <div className="text-center py-20">
            <p className="text-xl font-bold text-gray-600 dark:text-gray-400">
              Danh sách ứng viên đang tạm ẩn
            </p>
          </div>
        ) : loading ? (
          <LoadingSkeleton type="card" count={8} />
        ) : filteredAndSortedCandidates.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xl font-bold text-gray-600 dark:text-gray-400">Không tìm thấy ứng viên</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredAndSortedCandidates.map((candidate, index) => (
              <div key={candidate.id} style={{ animationDelay: `${index * 0.05}s` }}>
                <CandidateCard
                  candidate={candidate}
                  onVote={handleVote}
                  isVoting={isLoading}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={confirmVote}
        candidate={selectedCandidate}
        loading={isLoading}
      />
    </div>
  );
};
export default Voting;
