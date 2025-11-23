import { useContext, useEffect, useMemo, useState } from 'react';
import { Web3Context } from '../context/Web3Context';
import CandidateCard from '../components/CandidateCard';
import { MOCK_CANDIDATES } from '../utils/mockData';

const Voting = () => {
  const { votingContract, currentAccount, setIsLoading, isLoading, candidateMedia, schedule } = useContext(Web3Context);
  const [candidates, setCandidates] = useState([]);
  const [voteStatus, setVoteStatus] = useState({ active: false, hasVoted: false });

  const isWithinVoteWindow = useMemo(() => {
    const { voteStart, voteEnd } = schedule || {};
    const now = Date.now();
    const startOk = voteStart ? now >= new Date(voteStart).getTime() : true;
    const endOk = voteEnd ? now <= new Date(voteEnd).getTime() : true;
    return startOk && endOk;
  }, [schedule]);

  const fetchCandidates = async () => {
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
  };

  useEffect(() => {
    fetchCandidates();
  }, [votingContract, currentAccount]);

  const handleVote = async (id) => {
    if (!currentAccount) {
      alert('Vui lòng kết nối ví trước khi bầu chọn!');
      return;
    }
    if (!voteStatus.active || !isWithinVoteWindow) {
      alert('Cổng bầu chọn đang đóng hoặc ngoài khung giờ quy định.');
      return;
    }
    if (voteStatus.hasVoted) {
      alert('Bạn đã hoàn thành bầu chọn rồi!');
      return;
    }

    const candidate = candidates.find((c) => c.id === id);
    const candidateName = candidate ? candidate.name : `SBD ${id}`;

    const confirmed = window.confirm(
      `XÁC NHẬN BẦU CHỌN\n\n` +
        `Bạn có chắc chắn muốn bầu chọn cho:\n` +
        `${candidateName} (SBD ${id})\n\n` +
        `Lưu ý: Bạn chỉ có thể bầu chọn 1 lần duy nhất và không thể thay đổi!`
    );

    if (!confirmed) return;

    setIsLoading(true);
    try {
      const tx = await votingContract.bauChon(id);
      await tx.wait();
      alert(`Bầu chọn thành công cho ${candidateName}!\n\nCảm ơn bạn đã tham gia bình chọn.`);
      fetchCandidates();
    } catch (error) {
      const errorMsg = error.reason || error.message || 'Lỗi không xác định';
      alert(`Lỗi bầu chọn:\n${errorMsg}\n\nVui lòng thử lại hoặc liên hệ ban tổ chức.`);
      console.error('Vote error:', error);
    }
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto py-8 px-4 animate-fadeIn">
      <div className="text-center mb-10 space-y-2">
        <h2 className="text-3xl font-bold text-qnu-500 dark:text-blue-400">Danh sách ứng cử viên</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Hãy chọn ra gương mặt xứng đáng nhất</p>
        <div className="flex flex-wrap gap-2 justify-center text-sm">
          <span className="bg-blue-50 dark:bg-blue-900/30 text-qnu-500 dark:text-blue-400 px-3 py-1 rounded-full transition-all duration-300 hover:scale-105">
            Vote: {voteStatus.active ? 'Đang mở' : 'Đang đóng'}
          </span>
          <span className="bg-blue-50 dark:bg-blue-900/30 text-qnu-500 dark:text-blue-400 px-3 py-1 rounded-full transition-all duration-300 hover:scale-105">
            Khung giờ: {isWithinVoteWindow ? 'Đúng giờ' : 'Ngoài giờ'}
          </span>
          {voteStatus.hasVoted && (
            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full font-bold animate-pulse-slow">
              Bạn đã hoàn thành bầu chọn
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {candidates.map((candidate, index) => (
          <div key={candidate.id} style={{ animationDelay: `${index * 0.1}s` }}>
            <CandidateCard
              candidate={candidate}
              onVote={handleVote}
              isVoting={isLoading}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
export default Voting;
