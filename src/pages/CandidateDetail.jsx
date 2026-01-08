import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Web3Context } from '../context/Web3Context';

const CandidateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { votingContract, candidateMedia, setIsLoading, isLoading } = useContext(Web3Context);
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidate = async () => {
      if (!votingContract || !id) return;
      setLoading(true);
      try {
        const c = await votingContract.dsUngVien(id);
        setCandidate({
          id: Number(c.id),
          name: c.hoTen,
          mssv: c.mssv,
          major: c.nganh,
          votes: Number(c.soPhieu),
          isActive: c.dangHoatDong,
          image: c.anh || candidateMedia?.[Number(c.id)],
          bio: c.moTa,
        });
      } catch (error) {
        console.error('Lỗi tải ứng viên:', error);
      }
      setLoading(false);
    };

    fetchCandidate();
  }, [votingContract, id]);

  const handleVote = async () => {
    if (!candidate) return;
    const confirmed = window.confirm(`Xác nhận bỏ phiếu cho ${candidate.name}?`);
    if (!confirmed) return;

    setIsLoading(true);
    try {
      const tx = await votingContract.bauChon(candidate.id);
      await tx.wait();
      alert('Bỏ phiếu thành công!');
      navigate('/results');
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Không tìm thấy ứng viên</h2>
          <button onClick={() => navigate('/vote')} className="text-blue-600 hover:underline">
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-teal-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>
      
      <div className="container mx-auto py-12 px-4 relative z-10">
        <button
          onClick={() => navigate('/vote')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại
        </button>

        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-teal-500 rounded-3xl blur-2xl opacity-20"></div>
              <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-gray-700/50">
                {candidate.image ? (
                  <img src={candidate.image} alt={candidate.name} className="w-full h-[500px] object-cover" />
                ) : (
                  <div className="w-full h-[500px] bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
                    <svg className="w-32 h-32 text-white opacity-50" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-bold mb-4">
                  SBD #{candidate.id}
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
                  {candidate.name}
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">{candidate.major}</p>
                <p className="text-gray-500 dark:text-gray-500">MSSV: {candidate.mssv}</p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Giới thiệu</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {candidate.bio || 'Chưa có thông tin giới thiệu'}
                </p>
              </div>

              <div className="bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Số phiếu bầu</p>
                    <p className="text-4xl font-black bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                      {candidate.votes}
                    </p>
                  </div>
                  <div className="text-6xl font-bold text-[#2563EB]">#</div>
                </div>
              </div>

              <button
                onClick={handleVote}
                disabled={isLoading || !candidate.isActive}
                className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-4 rounded-2xl font-bold hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              >
                {isLoading ? 'Đang xử lý...' : 'Bỏ phiếu cho ứng viên này'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetail;
