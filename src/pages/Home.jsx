import { useContext, useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Web3Context } from '../context/Web3Context';

// API URL
const API_URL = import.meta.env.VITE_OTP_API || 'https://voting-b431.onrender.com';

// Testimonials Section Component
const TestimonialsSection = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API_URL}/reviews`);
        const data = await res.json();
        if (data.ok && data.data?.length > 0) {
          setReviews(data.data.slice(0, 6)); // Max 6 reviews
        }
      } catch (e) {
        console.warn('Fetch reviews error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  // Loading skeleton
  if (loading) {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Placeholder reviews khi chưa có review thật
  const placeholderReviews = [
    { name: 'Nguyễn Văn A', major: 'Công nghệ thông tin', rating: 5, comment: 'Hệ thống bầu chọn rất minh bạch và dễ sử dụng. Tôi rất hài lòng!' },
    { name: 'Trần Thị B', major: 'Kinh tế', rating: 5, comment: 'Giao diện đẹp, thao tác đơn giản. Hy vọng sẽ có nhiều cuộc thi như thế này.' },
    { name: 'Lê Văn C', major: 'Sư phạm Toán học', rating: 4, comment: 'Trải nghiệm tuyệt vời! Blockchain giúp kết quả bầu chọn công bằng hơn.' },
  ];

  const displayReviews = reviews.length > 0 ? reviews : placeholderReviews;
  const isPlaceholder = reviews.length === 0;

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#0F172A] dark:text-white mb-3">Sinh viên nói gì?</h2>
          <p className="text-[#64748B]">Cảm nhận từ những người đã tham gia bầu chọn</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayReviews.map((review, i) => (
            <div
              key={review._id || i}
              className={`bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow ${isPlaceholder ? 'opacity-70' : ''}`}
            >
              {/* Rating Stars */}
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-5 h-5 ${star <= review.rating ? 'text-[#14B8A6]' : 'text-gray-300 dark:text-gray-600'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Comment */}
              <p className="text-[#64748B] text-sm leading-relaxed mb-4 line-clamp-3">
                "{review.comment}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-[#E2E8F0] dark:border-gray-700">
                <div className="w-10 h-10 bg-[#2563EB]/10 rounded-full flex items-center justify-center">
                  <span className="text-[#2563EB] font-bold text-sm">
                    {review.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-[#0F172A] dark:text-white text-sm">{review.name}</p>
                  <p className="text-xs text-[#64748B]">{review.major}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA to write review */}
        <div className="text-center mt-8 space-y-3">
          {isPlaceholder && (
            <p className="text-sm text-[#64748B]">Hãy là người đầu tiên chia sẻ cảm nhận của bạn!</p>
          )}
          <Link
            to="/reviews"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl font-semibold transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Viết đánh giá
          </Link>
        </div>
      </div>
    </section>
  );
};

const Home = () => {
  const { votingContract, currentAccount, schedule, saleActive, voteOpen } = useContext(Web3Context);
  const [stats, setStats] = useState({ totalVotes: 0, candidates: 0, participants: 0 });
  const [userStatus, setUserStatus] = useState({ hasBought: false, hasVoted: false });
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [countdownLabel, setCountdownLabel] = useState('');

  // Load stats
  useEffect(() => {
    const loadStats = async () => {
      if (!votingContract) return;
      try {
        const [total, sold, totalVotes] = await Promise.all([
          votingContract.tongUngVien(),
          votingContract.totalTokensSold(),
          votingContract.tongLichSuBauChon(),
        ]);
        setStats({
          candidates: Number(total),
          participants: Number(sold),
          totalVotes: Number(totalVotes),
        });
      } catch (e) {
        console.warn('Load stats error:', e);
      }
    };
    loadStats();
  }, [votingContract]);

  // Load user status
  useEffect(() => {
    const loadUserStatus = async () => {
      if (!votingContract || !currentAccount) return;
      try {
        const [bought, voted] = await Promise.all([
          votingContract.daMuaToken(currentAccount),
          votingContract.daBau(currentAccount),
        ]);
        setUserStatus({ hasBought: bought, hasVoted: voted });
      } catch (e) {
        console.warn('Load user status error:', e);
      }
    };
    loadUserStatus();
  }, [votingContract, currentAccount]);

  // Countdown logic
  useEffect(() => {
    const getTargetTime = () => {
      const now = Date.now();
      if (schedule.claimStart && now < schedule.claimStart) {
        setCountdownLabel('Mở bán token sau');
        return schedule.claimStart;
      }
      if (schedule.claimEnd && now < schedule.claimEnd && saleActive) {
        setCountdownLabel('Đóng bán token sau');
        return schedule.claimEnd;
      }
      if (schedule.voteStart && now < schedule.voteStart) {
        setCountdownLabel('Mở bầu chọn sau');
        return schedule.voteStart;
      }
      if (schedule.voteEnd && now < schedule.voteEnd && voteOpen) {
        setCountdownLabel('Kết thúc bầu chọn sau');
        return schedule.voteEnd;
      }
      setCountdownLabel('');
      return null;
    };

    const updateCountdown = () => {
      const target = getTargetTime();
      if (!target) {
        setCountdown({ days: 0, hours: 0, mins: 0, secs: 0 });
        return;
      }
      const diff = Math.max(0, target - Date.now());
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown({ days, hours, mins, secs });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [schedule, saleActive, voteOpen]);

  const currentPhase = useMemo(() => {
    const now = Date.now();
    if (voteOpen && schedule.voteEnd && now < schedule.voteEnd) return 'Đang bầu chọn';
    if (saleActive && schedule.claimEnd && now < schedule.claimEnd) return 'Đang bán token';
    if (schedule.voteEnd && now > schedule.voteEnd) return 'Đã kết thúc';
    return 'Chưa bắt đầu';
  }, [schedule, saleActive, voteOpen]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] transition-colors duration-300">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Hero Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#2563EB]/10 dark:bg-[#2563EB]/20 text-[#2563EB] px-4 py-2 rounded-full text-sm font-semibold">
                <span className="w-2 h-2 bg-[#2563EB] rounded-full animate-pulse"></span>
                Chủ đề: Rạng Rỡ Sắc Xuân Bính Ngọ
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black text-[#0F172A] dark:text-white leading-tight">
                Nét đẹp Sinh viên
                <span className="block text-[#2563EB]">QNU 2026</span>
              </h1>
              
              <p className="text-lg text-[#64748B] dark:text-gray-400 leading-relaxed max-w-lg">
                Tôn vinh nét đẹp sinh viên QNU — mỗi lá phiếu là một dấu vân tay bất biến trên blockchain.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/claim"
                  className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-[#2563EB]/25 hover:shadow-xl hover:shadow-[#2563EB]/30"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Mua token tham gia
                </Link>
                <Link
                  to="/voting"
                  className="inline-flex items-center gap-2 bg-white dark:bg-[#111827] hover:bg-gray-50 dark:hover:bg-gray-800 text-[#0F172A] dark:text-white px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 border border-[#E2E8F0] dark:border-gray-700 shadow-sm hover:shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Xem ứng viên
                </Link>
              </div>
            </div>

            {/* Right: Status Card */}
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-gray-700 shadow-lg p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">Trạng thái cuộc thi</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  currentPhase === 'Đang bầu chọn' ? 'bg-[#14B8A6]/10 text-[#14B8A6]' :
                  currentPhase === 'Đang bán token' ? 'bg-[#2563EB]/10 text-[#2563EB]' :
                  'bg-gray-100 dark:bg-gray-800 text-[#64748B]'
                }`}>
                  {currentPhase}
                </span>
              </div>

              {/* Sale & Vote Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border ${saleActive ? 'bg-[#14B8A6]/5 border-[#14B8A6]/20' : 'bg-gray-50 dark:bg-gray-800/50 border-[#E2E8F0] dark:border-gray-700'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${saleActive ? 'bg-[#14B8A6]' : 'bg-gray-400'}`}></div>
                    <span className="text-sm font-medium text-[#64748B]">Bán token</span>
                  </div>
                  <p className={`font-bold ${saleActive ? 'text-[#14B8A6]' : 'text-[#64748B]'}`}>
                    {saleActive ? 'Đang mở' : 'Đã đóng'}
                  </p>
                </div>
                <div className={`p-4 rounded-xl border ${voteOpen ? 'bg-[#2563EB]/5 border-[#2563EB]/20' : 'bg-gray-50 dark:bg-gray-800/50 border-[#E2E8F0] dark:border-gray-700'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${voteOpen ? 'bg-[#2563EB]' : 'bg-gray-400'}`}></div>
                    <span className="text-sm font-medium text-[#64748B]">Bầu chọn</span>
                  </div>
                  <p className={`font-bold ${voteOpen ? 'text-[#2563EB]' : 'text-[#64748B]'}`}>
                    {voteOpen ? 'Đang mở' : 'Đã đóng'}
                  </p>
                </div>
              </div>

              {/* Countdown */}
              {countdownLabel && (
                <div className="bg-[#F8FAFC] dark:bg-[#0B1220] rounded-xl p-4">
                  <p className="text-sm text-[#64748B] mb-3">{countdownLabel}</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: countdown.days, label: 'Ngày' },
                      { value: countdown.hours, label: 'Giờ' },
                      { value: countdown.mins, label: 'Phút' },
                      { value: countdown.secs, label: 'Giây' },
                    ].map((item, i) => (
                      <div key={i} className="text-center">
                        <div className="bg-white dark:bg-[#111827] rounded-lg py-2 px-1 border border-[#E2E8F0] dark:border-gray-700">
                          <span className="text-xl font-bold text-[#0F172A] dark:text-white">{String(item.value).padStart(2, '0')}</span>
                        </div>
                        <span className="text-xs text-[#64748B] mt-1 block">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* User Status */}
              {currentAccount && (
                <div className="border-t border-[#E2E8F0] dark:border-gray-700 pt-4">
                  <p className="text-sm text-[#64748B] mb-3">Trạng thái của bạn</p>
                  <div className="flex gap-3">
                    <div className={`flex-1 flex items-center gap-2 p-3 rounded-lg ${userStatus.hasBought ? 'bg-[#14B8A6]/10' : 'bg-gray-100 dark:bg-gray-800'}`}>
                      {userStatus.hasBought ? (
                        <svg className="w-5 h-5 text-[#14B8A6]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-[#64748B]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span className={`text-sm font-medium ${userStatus.hasBought ? 'text-[#14B8A6]' : 'text-[#64748B]'}`}>
                        {userStatus.hasBought ? 'Đã mua token' : 'Chưa mua token'}
                      </span>
                    </div>
                    <div className={`flex-1 flex items-center gap-2 p-3 rounded-lg ${userStatus.hasVoted ? 'bg-[#2563EB]/10' : 'bg-gray-100 dark:bg-gray-800'}`}>
                      {userStatus.hasVoted ? (
                        <svg className="w-5 h-5 text-[#2563EB]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-[#64748B]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span className={`text-sm font-medium ${userStatus.hasVoted ? 'text-[#2563EB]' : 'text-[#64748B]'}`}>
                        {userStatus.hasVoted ? 'Đã bầu chọn' : 'Chưa bầu chọn'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Tổng phiếu bầu', value: stats.totalVotes, icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )},
              { label: 'Ứng viên', value: stats.candidates, icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )},
              { label: 'Người tham gia', value: stats.participants, icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )},
              { label: 'Giai đoạn', value: currentPhase, isText: true, icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )},
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-[#2563EB]/10 text-[#2563EB] rounded-xl">
                    {stat.icon}
                  </div>
                </div>
                <p className={`font-bold text-[#0F172A] dark:text-white ${stat.isText ? 'text-lg' : 'text-3xl'}`}>
                  {stat.value}
                </p>
                <p className="text-sm text-[#64748B] mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Participate - Timeline */}
      <section className="py-16 px-4 bg-white dark:bg-[#111827]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0F172A] dark:text-white mb-3">Cách tham gia</h2>
            <p className="text-[#64748B]">3 bước đơn giản để bầu chọn cho ứng viên yêu thích</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: 1,
                title: 'Xác thực & Kết nối',
                desc: 'Xác thực email sinh viên QNU và kết nối ví MetaMask của bạn.',
                link: '/claim',
                linkText: 'Bắt đầu ngay',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
              },
              {
                step: 2,
                title: 'Mua Token',
                desc: 'Mua 1 token QSV với giá 0.001 ETH để có quyền bầu chọn.',
                link: '/claim',
                linkText: 'Mua token',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                step: 3,
                title: 'Bầu chọn',
                desc: 'Chọn ứng viên yêu thích và xác nhận phiếu bầu trên blockchain.',
                link: '/voting',
                linkText: 'Xem ứng viên',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.step} className="relative bg-[#F8FAFC] dark:bg-[#0B1220] rounded-2xl border border-[#E2E8F0] dark:border-gray-700 p-6 hover:border-[#2563EB]/50 transition-colors">
                <div className="absolute -top-4 left-6 bg-[#2563EB] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                  {item.step}
                </div>
                <div className="pt-4">
                  <div className="text-[#2563EB] mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mb-2">{item.title}</h3>
                  <p className="text-[#64748B] mb-4 text-sm leading-relaxed">{item.desc}</p>
                  <Link
                    to={item.link}
                    className="inline-flex items-center gap-1 text-[#2563EB] font-semibold text-sm hover:gap-2 transition-all"
                  >
                    {item.linkText}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Blockchain */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0F172A] dark:text-white mb-3">Tại sao Blockchain?</h2>
            <p className="text-[#64748B]">Công nghệ đảm bảo cuộc bầu chọn công bằng và minh bạch</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Minh bạch tuyệt đối',
                desc: 'Mọi phiếu bầu được ghi nhận công khai trên blockchain, ai cũng có thể kiểm tra.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ),
              },
              {
                title: 'Không thể gian lận',
                desc: 'Dữ liệu trên blockchain không thể bị sửa đổi hay xóa bỏ bởi bất kỳ ai.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
              },
              {
                title: 'Kết quả tức thì',
                desc: 'Kết quả được cập nhật realtime, không cần chờ đợi kiểm phiếu thủ công.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3 bg-[#14B8A6]/10 text-[#14B8A6] rounded-xl w-fit mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mb-2">{item.title}</h3>
                <p className="text-[#64748B] text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-r from-[#2563EB] to-[#14B8A6] rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Sẵn sàng tham gia?</h2>
            <p className="text-white/80 mb-6 max-w-lg mx-auto">
              Hãy là một phần của cuộc bầu chọn minh bạch đầu tiên tại QNU. Mỗi phiếu bầu đều có giá trị!
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/claim"
                className="inline-flex items-center gap-2 bg-white text-[#2563EB] px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
              >
                Bắt đầu ngay
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/20"
              >
                Xem thống kê
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
