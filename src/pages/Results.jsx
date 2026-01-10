import { useContext, useEffect, useState } from 'react';
import { Web3Context } from '../context/Web3Context';
import PageHeader from '../components/ui/PageHeader';
import StatusChips from '../components/ui/StatusChips';
import EmptyState from '../components/ui/EmptyState';

const API_BASE = import.meta.env.VITE_OTP_API || 'https://voting-b431.onrender.com';

const Results = () => {
  const { votingContract, candidateMedia, voteOpen } = useContext(Web3Context);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalVotes, setTotalVotes] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [viewMode, setViewMode] = useState('ranking'); // 'ranking' | 'chart'
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [voterList, setVoterList] = useState([]);
  const [loadingVoters, setLoadingVoters] = useState(false);

  const fetchResults = async () => {
    if (!votingContract) return;
    setLoading(true);
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
        .filter((c) => c.isActive)
        .sort((a, b) => b.votes - a.votes);

      const total_votes = formatted.reduce((sum, c) => sum + c.votes, 0);
      setCandidates(formatted);
      setTotalVotes(total_votes);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Lỗi tải kết quả:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchResults();
  }, [votingContract]);

  const getPercentage = (votes) => {
    if (totalVotes === 0) return 0;
    return ((votes / totalVotes) * 100).toFixed(1);
  };

  const getMedalEmoji = (rank) => {
    if (rank === 0) return '1st';
    if (rank === 1) return '2nd';
    if (rank === 2) return '3rd';
    return `#${rank + 1}`;
  };

  // Fetch voters for a candidate
  const fetchVotersForCandidate = async (candidate) => {
    setSelectedCandidate(candidate);
    setLoadingVoters(true);
    setVoterList([]);
    
    try {
      // Fetch from backend (has name, mssv)
      const backendRes = await fetch(`${API_BASE}/vote/history`);
      const backendData = backendRes.ok ? await backendRes.json() : [];
      
      // Fetch from blockchain
      const totalHistory = await votingContract.tongLichSuBauChon();
      const voters = [];
      
      for (let i = 0; i < Number(totalHistory); i++) {
        const history = await votingContract.layLichSuBauChon(i);
        if (Number(history.ungVienId) === candidate.id) {
          // Find matching backend data
          const backendVoter = backendData.find(
            (v) => v.wallet?.toLowerCase() === history.voter?.toLowerCase() && v.candidateId === candidate.id
          );
          
          voters.push({
            address: history.voter,
            timestamp: Number(history.timestamp),
            name: backendVoter?.name || '',
            mssv: backendVoter?.mssv || '',
          });
        }
      }
      
      // Sort by timestamp desc
      voters.sort((a, b) => b.timestamp - a.timestamp);
      setVoterList(voters);
    } catch (e) {
      console.error('Fetch voters error:', e);
    }
    setLoadingVoters(false);
  };

  const shortenAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const formatDate = (timestamp) => new Date(timestamp * 1000).toLocaleString('vi-VN');

  const statusChips = [
    { label: 'Vote', value: voteOpen ? 'Đang mở' : 'Đã đóng', status: voteOpen ? 'success' : 'neutral' },
    { label: 'Ứng viên', value: candidates.length, status: 'info' },
    { label: 'Tổng phiếu', value: totalVotes, status: 'info' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] pt-20 pb-10">
      <div className="container mx-auto px-4">
        <PageHeader 
          title="Bảng xếp hạng" 
          highlight="Trực tiếp"
          subtitle="Kết quả bầu chọn được cập nhật trực tiếp từ Blockchain"
        >
          <StatusChips items={statusChips} />
        </PageHeader>

        {/* Last Updated & View Toggle */}
        <div className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-[#64748B]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]"></span>
            </span>
            {lastUpdated && `Cập nhật lúc ${lastUpdated.toLocaleTimeString('vi-VN')}`}
          </div>
          
          <div className="flex items-center gap-2">
            <div className="bg-white dark:bg-[#111827] rounded-xl p-1 border border-[#E2E8F0] dark:border-gray-700">
              <button
                onClick={() => setViewMode('ranking')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${viewMode === 'ranking' ? 'bg-[#2563EB] text-white' : 'text-[#64748B] hover:text-[#0F172A] dark:hover:text-white'}`}
              >
                Xếp hạng
              </button>
              <button
                onClick={() => setViewMode('chart')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${viewMode === 'chart' ? 'bg-[#2563EB] text-white' : 'text-[#64748B] hover:text-[#0F172A] dark:hover:text-white'}`}
              >
                Biểu đồ
              </button>
            </div>
            <button
              onClick={fetchResults}
              className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Làm mới
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#2563EB] border-t-transparent mx-auto mb-4"></div>
              <p className="text-[#64748B]">Đang tải kết quả...</p>
            </div>
          </div>
        ) : candidates.length === 0 ? (
          <EmptyState
            icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
            headline="Chưa có kết quả"
            subtext="Chưa có ứng viên nào hoặc chưa có phiếu bầu"
            actions={[{ label: 'Đi tới Bầu chọn', to: '/voting', primary: true }]}
          />
        ) : (
          <>
            {/* Top 3 Podium */}
            {candidates.length >= 3 && viewMode === 'ranking' && (
              <div className="mb-10 max-w-4xl mx-auto">
                <div className="grid grid-cols-3 gap-4 items-end">
                  {/* 2nd Place */}
                  <div className="order-1">
                    <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-[#E2E8F0] dark:border-gray-700 shadow-sm hover:shadow-lg transition text-center">
                      <div className="text-4xl mb-3 font-bold text-gray-400">2nd</div>
                      {candidates[1].image && (
                        <img src={candidates[1].image} alt={candidates[1].name} className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-4 border-gray-300" />
                      )}
                      <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-1">{candidates[1].name}</h3>
                      <p className="text-xs text-[#64748B] mb-3">{candidates[1].major}</p>
                      <div className="text-2xl font-bold text-[#64748B]">{candidates[1].votes}</div>
                      <div className="text-xs text-[#64748B]">phiếu ({getPercentage(candidates[1].votes)}%)</div>
                    </div>
                  </div>

                  {/* 1st Place */}
                  <div className="order-2">
                    <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border-2 border-[#F59E0B] shadow-lg hover:shadow-xl transition text-center relative">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F59E0B] text-white px-3 py-1 rounded-full text-xs font-bold">
                        Dẫn đầu
                      </div>
                      <div className="text-5xl mb-3 mt-2 font-bold text-[#F59E0B]">1st</div>
                      {candidates[0].image && (
                        <img src={candidates[0].image} alt={candidates[0].name} className="w-24 h-24 rounded-full mx-auto mb-3 object-cover border-4 border-[#F59E0B]" />
                      )}
                      <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mb-1">{candidates[0].name}</h3>
                      <p className="text-sm text-[#64748B] mb-3">{candidates[0].major}</p>
                      <div className="text-3xl font-bold text-[#F59E0B]">{candidates[0].votes}</div>
                      <div className="text-xs text-[#64748B]">phiếu ({getPercentage(candidates[0].votes)}%)</div>
                    </div>
                  </div>

                  {/* 3rd Place */}
                  <div className="order-3">
                    <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-[#E2E8F0] dark:border-gray-700 shadow-sm hover:shadow-lg transition text-center">
                      <div className="text-4xl mb-3 font-bold text-orange-400">3rd</div>
                      {candidates[2].image && (
                        <img src={candidates[2].image} alt={candidates[2].name} className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-4 border-orange-400" />
                      )}
                      <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-1">{candidates[2].name}</h3>
                      <p className="text-xs text-[#64748B] mb-3">{candidates[2].major}</p>
                      <div className="text-2xl font-bold text-orange-500">{candidates[2].votes}</div>
                      <div className="text-xs text-[#64748B]">phiếu ({getPercentage(candidates[2].votes)}%)</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Chart View */}
            {viewMode === 'chart' && (
              <div className="max-w-4xl mx-auto mb-10">
                <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-[#E2E8F0] dark:border-gray-700 shadow-sm">
                  <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-6">Phân bố phiếu bầu</h3>
                  <div className="space-y-4">
                    {candidates.map((candidate, index) => (
                      <div key={candidate.id} className="flex items-center gap-4">
                        <div className="w-8 text-center font-bold text-[#64748B]">{getMedalEmoji(index)}</div>
                        <div className="w-24 truncate text-sm font-medium text-[#0F172A] dark:text-white">{candidate.name}</div>
                        <div className="flex-1">
                          <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#2563EB] to-[#14B8A6] rounded-lg flex items-center justify-end pr-2 transition-all duration-1000"
                              style={{ width: `${Math.max(getPercentage(candidate.votes), 5)}%` }}
                            >
                              <span className="text-xs font-bold text-white">{candidate.votes}</span>
                            </div>
                          </div>
                        </div>
                        <div className="w-16 text-right text-sm font-semibold text-[#64748B]">{getPercentage(candidate.votes)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Full Leaderboard */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-sm border border-[#E2E8F0] dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-[#E2E8F0] dark:border-gray-700">
                  <h3 className="text-xl font-bold text-[#0F172A] dark:text-white">Bảng xếp hạng đầy đủ</h3>
                </div>
                <div className="divide-y divide-[#E2E8F0] dark:divide-gray-700">
                  {candidates.map((candidate, index) => (
                    <div key={candidate.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${index < 3 ? 'bg-[#2563EB]/10 text-[#2563EB]' : 'bg-gray-100 dark:bg-gray-800 text-[#64748B]'}`}>
                        {getMedalEmoji(index)}
                      </div>
                      {candidate.image ? (
                        <img src={candidate.image} alt={candidate.name} className="w-12 h-12 rounded-xl object-cover border border-[#E2E8F0] dark:border-gray-700" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[#64748B]">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[#0F172A] dark:text-white truncate">{candidate.name}</h4>
                        <p className="text-sm text-[#64748B]">{candidate.major} • {candidate.mssv}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-[#0F172A] dark:text-white">{candidate.votes}</div>
                        <div className="text-sm text-[#64748B]">{getPercentage(candidate.votes)}%</div>
                      </div>
                      <div className="w-24 hidden sm:block">
                        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-[#2563EB] rounded-full" style={{ width: `${getPercentage(candidate.votes)}%` }}></div>
                        </div>
                      </div>
                      <button
                        onClick={() => fetchVotersForCandidate(candidate)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#14B8A6]/10 text-[#14B8A6] hover:bg-[#14B8A6]/20 transition"
                        title="Xem danh sách người bầu"
                      >
                        Xem Danh sách bầu chọn
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Voter List Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#111827] rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[#E2E8F0] dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedCandidate.image && (
                  <img src={selectedCandidate.image} alt={selectedCandidate.name} className="w-10 h-10 rounded-full object-cover" />
                )}
                <div>
                  <h3 className="font-bold text-[#0F172A] dark:text-white">{selectedCandidate.name}</h3>
                  <p className="text-xs text-[#64748B]">{voterList.length} người đã bầu</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="text-[#64748B] hover:text-[#0F172A] dark:hover:text-white p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {loadingVoters ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#2563EB] border-t-transparent mx-auto mb-2"></div>
                  <p className="text-sm text-[#64748B]">Đang tải...</p>
                </div>
              ) : voterList.length === 0 ? (
                <div className="text-center py-8 text-[#64748B]">
                  Chưa có ai bầu cho ứng viên này
                </div>
              ) : (
                <div className="space-y-3">
                  {voterList.map((voter, idx) => (
                    <div key={voter.address + idx} className="flex items-center gap-3 p-3 bg-[#F8FAFC] dark:bg-gray-800 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        {voter.name ? (
                          <>
                            <p className="font-medium text-[#0F172A] dark:text-white truncate">{voter.name}</p>
                            <p className="text-xs text-[#64748B]">MSSV: {voter.mssv}</p>
                          </>
                        ) : (
                          <p className="font-mono text-sm text-[#0F172A] dark:text-white">{shortenAddress(voter.address)}</p>
                        )}
                        <p className="text-xs text-[#64748B] mt-0.5">{formatDate(voter.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#E2E8F0] dark:border-gray-700">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
