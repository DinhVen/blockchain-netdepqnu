import { Link } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { Web3Context } from '../context/Web3Context';
import CandidateCarousel3D from '../components/CandidateCarousel3D';

const Home = () => {
  const { schedule, votingContract, candidateMedia } = useContext(Web3Context);
  const [stats, setStats] = useState({ totalVotes: 0, totalCandidates: 0, totalVoters: 0 });
  const [topCandidates, setTopCandidates] = useState([]);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [reviews, setReviews] = useState([]);

  const formatTime = (val) => (val ? new Date(val).toLocaleString('vi-VN') : 'Chưa đặt');

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!votingContract) return;
      try {
        const total = await votingContract.tongUngVien();
        const candidates = await Promise.all(
          Array.from({ length: Number(total) }, (_, i) => votingContract.dsUngVien(i + 1))
        );
        
        const formatted = candidates
          .map((c) => ({
            id: Number(c.id),
            name: c.hoTen,
            mssv: c.mssv,
            votes: Number(c.soPhieu),
            image: c.anh || candidateMedia?.[Number(c.id)],
            isActive: c.dangHoatDong,
          }))
          .filter((c) => c.isActive);

        const totalVotes = formatted.reduce((sum, c) => sum + c.votes, 0);
        const top = formatted.sort((a, b) => b.votes - a.votes).slice(0, 3);

        setStats({
          totalVotes,
          totalCandidates: formatted.length,
          totalVoters: totalVotes,
        });
        setTopCandidates(top);
      } catch (err) {
        console.log('Mock stats');
        setStats({ totalVotes: 156, totalCandidates: 12, totalVoters: 156 });
      }
    };
    fetchStats();
  }, [votingContract, candidateMedia]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const target = schedule?.voteEnd ? new Date(schedule.voteEnd).getTime() : now;
      const diff = target - now;

      if (diff > 0) {
        setCountdown({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [schedule]);

  // Load reviews from localStorage
  useEffect(() => {
    const savedReviews = localStorage.getItem('qnu-reviews');
    if (savedReviews) {
      const allReviews = JSON.parse(savedReviews);
      // Get latest 3 reviews
      setReviews(allReviews.slice(0, 3));
    }
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 transition-colors duration-500"></div>
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fadeIn">
            <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-qnu-500 dark:text-blue-400 font-semibold px-5 py-2.5 rounded-full shadow-lg border border-blue-200/50 dark:border-blue-500/30">
              QNU - Nét Đẹp Sinh Viên 2025
            </div>

            <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white leading-tight">
              Bầu chọn
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Sinh viên tiêu biểu
              </span>
              QNU 2025
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Hệ thống bỏ phiếu phi tập trung, minh bạch và công bằng. Mỗi phiếu bầu được ghi nhận trên blockchain, không thể thay đổi hay gian lận.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/vote"
                className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Bỏ phiếu ngay
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>

              <Link
                to="/claim"
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 px-8 py-4 rounded-xl font-bold hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Nhận token QSV
              </Link>
            </div>
          </div>

          <div className="relative animate-scaleIn">
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-gray-700/50">
              <div className="relative h-64 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 overflow-hidden flex items-center justify-center text-white">
                <div className="text-center p-6">
                  <svg className="w-20 h-20 mx-auto mb-3 opacity-90" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  <h3 className="text-2xl font-black mb-1">Nét Đẹp Tuổi Sinh Viên QNU</h3>
                  <p className="text-white/90 font-medium">Minh bạch - Công bằng - An toàn</p>
                </div>
              </div>

              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Lịch trình</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: 'Claim mở', time: schedule.claimStart, color: 'from-green-400 to-emerald-500' },
                    { label: 'Claim đóng', time: schedule.claimEnd, color: 'from-orange-400 to-red-500' },
                    { label: 'Vote mở', time: schedule.voteStart, color: 'from-blue-400 to-cyan-500' },
                    { label: 'Vote đóng', time: schedule.voteEnd, color: 'from-purple-400 to-pink-500' },
                  ].map((item, idx) => (
                    <div key={idx} className="group relative p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border border-gray-200/50 dark:border-gray-600/50">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{item.label}</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{formatTime(item.time)}</p>
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Quy trình</h4>
                  {[
                    { step: '01', title: 'Xác thực email', desc: 'Email sinh viên QNU' },
                    { step: '02', title: 'Nhận token', desc: 'Mỗi ví 1 token' },
                    { step: '03', title: 'Bỏ phiếu', desc: 'Chọn ứng viên' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-300 group cursor-pointer">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform text-xl">
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-white">{item.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-20 animate-fadeIn">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
              Hướng dẫn sử dụng
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Làm theo các bước đơn giản để tham gia bầu chọn
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: (
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ),
                title: 'Bước 1: Xác thực Email',
                desc: 'Sử dụng email sinh viên QNU để xác thực danh tính',
                color: 'from-blue-500 to-cyan-500',
              },
              {
                icon: (
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Bước 2: Nhận Token',
                desc: 'Kết nối MetaMask và nhận 1 token QSV để bỏ phiếu',
                color: 'from-purple-500 to-pink-500',
              },
              {
                icon: (
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Bước 3: Bỏ Phiếu',
                desc: 'Chọn ứng viên yêu thích và xác nhận giao dịch',
                color: 'from-green-500 to-emerald-500',
              },
            ].map((item, idx) => (
              <div key={idx} className="group relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity`}></div>
                <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <div className={`inline-flex p-4 bg-gradient-to-br ${item.color} rounded-2xl text-white mb-6 shadow-lg`}>
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 animate-fadeIn">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { 
                label: 'Tổng phiếu bầu', 
                value: stats.totalVotes, 
                icon: <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" /></svg>,
                color: 'from-blue-500 to-cyan-500' 
              },
              { 
                label: 'Ứng viên', 
                value: stats.totalCandidates, 
                icon: <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>,
                color: 'from-purple-500 to-pink-500' 
              },
              { 
                label: 'Người tham gia', 
                value: stats.totalVoters, 
                icon: <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
                color: 'from-green-500 to-emerald-500' 
              },
              { 
                label: 'Minh bạch 100%', 
                value: '✓', 
                icon: <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
                color: 'from-orange-500 to-red-500' 
              },
            ].map((item, idx) => (
              <div key={idx} className="group relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity`}></div>
                <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className={`inline-flex p-3 bg-gradient-to-br ${item.color} rounded-xl text-white mb-3`}>
                    {item.icon}
                  </div>
                  <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
                    {item.value}
                  </div>
                  <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Countdown Section */}
        {schedule?.voteEnd && (
          <div className="mt-20 animate-fadeIn">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl blur-2xl opacity-20"></div>
              <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/50">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 mb-2">
                    <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">Thời gian còn lại</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">Đến khi kết thúc bỏ phiếu</p>
                </div>
                <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
                  {[
                    { label: 'Ngày', value: countdown.days },
                    { label: 'Giờ', value: countdown.hours },
                    { label: 'Phút', value: countdown.minutes },
                    { label: 'Giây', value: countdown.seconds },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-center text-white shadow-lg">
                      <div className="text-4xl font-black mb-2">{String(item.value).padStart(2, '0')}</div>
                      <div className="text-sm font-semibold opacity-90">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3D Carousel Candidates */}
        {topCandidates.length > 0 && (
          <div className="mt-20 animate-fadeIn">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-4">
                <svg className="w-12 h-12 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
                  Ứng viên nổi bật
                </h2>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Khám phá các ứng viên trong không gian 3D
              </p>
            </div>

            {/* 3D Carousel */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-3xl"></div>
              <div className="relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/50">
                <CandidateCarousel3D candidates={topCandidates} />
              </div>
            </div>

            {/* View All Button */}
            <div className="text-center mt-8">
              <Link
                to="/vote"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                Xem tất cả ứng viên
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        )}

        {/* Timeline Section */}
        <div className="mt-20 animate-fadeIn">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
                Lộ trình sự kiện
              </h2>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Theo dõi các mốc thời gian quan trọng
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"></div>
              {[
                { 
                  title: 'Mở đăng ký ứng viên', 
                  date: 'Tháng 10/2025', 
                  icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
                  done: true 
                },
                { 
                  title: 'Mở nhận token', 
                  date: formatTime(schedule?.claimStart), 
                  icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>,
                  done: false 
                },
                { 
                  title: 'Bắt đầu bỏ phiếu', 
                  date: formatTime(schedule?.voteStart), 
                  icon: <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" /></svg>,
                  done: false 
                },
                { 
                  title: 'Kết thúc bỏ phiếu', 
                  date: formatTime(schedule?.voteEnd), 
                  icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                  done: false 
                },
                { 
                  title: 'Công bố kết quả', 
                  date: 'Sau khi đóng', 
                  icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
                  done: false 
                },
              ].map((item, idx) => (
                <div key={idx} className={`relative flex items-center mb-12 ${idx % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-1/2 ${idx % 2 === 0 ? 'pr-12 text-right' : 'pl-12 text-left'}`}>
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <div className="inline-flex p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl text-white mb-3">
                        {item.icon}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.date}</p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full border-4 border-white dark:border-gray-900 shadow-lg flex items-center justify-center">
                    {item.done && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 animate-fadeIn">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
                Câu hỏi thường gặp
              </h2>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Giải đáp những thắc mắc phổ biến
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { q: 'Làm sao để nhận token QSV?', a: 'Kết nối ví MetaMask, xác thực email sinh viên QNU, sau đó vào trang "Nhận token" để claim.' },
              { q: 'Tôi có thể bỏ phiếu nhiều lần không?', a: 'Không. Mỗi ví chỉ được bỏ phiếu 1 lần duy nhất. Điều này được đảm bảo bởi smart contract.' },
              { q: 'Phiếu bầu có được bảo mật không?', a: 'Có. Tất cả phiếu bầu được ghi nhận trên blockchain, minh bạch và không thể thay đổi.' },
              { q: 'Khi nào công bố kết quả?', a: 'Kết quả được cập nhật realtime và công bố chính thức sau khi đóng bỏ phiếu.' },
            ].map((item, idx) => (
              <details key={idx} className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden hover:shadow-xl transition-all duration-300">
                <summary className="cursor-pointer p-6 font-bold text-gray-900 dark:text-white flex items-center justify-between">
                  <span>{item.q}</span>
                  <svg className="w-5 h-5 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-6 text-gray-600 dark:text-gray-400">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/faq" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Xem thêm câu hỏi
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className="mt-20 animate-fadeIn">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-4">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
                  Sinh viên nói gì
                </h2>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Đánh giá thật từ sinh viên QNU
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">{review.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{review.major}</div>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 italic mb-4">"{review.comment}"</p>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                to="/reviews"
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Xem tất cả đánh giá
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-20 animate-fadeIn">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl blur-2xl opacity-10"></div>
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-12 border border-white/20 dark:border-gray-700/50">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
                  Tại sao chọn Blockchain?
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Công nghệ tiên tiến đảm bảo tính minh bạch và công bằng
                </p>
              </div>

              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { 
                    icon: <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
                    title: 'Bảo mật', 
                    desc: 'Dữ liệu được mã hóa',
                    color: 'from-red-500 to-pink-500'
                  },
                  { 
                    icon: <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
                    title: 'Minh bạch', 
                    desc: 'Ai cũng có thể kiểm tra',
                    color: 'from-blue-500 to-cyan-500'
                  },
                  { 
                    icon: <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
                    title: 'Nhanh chóng', 
                    desc: 'Kết quả tức thì',
                    color: 'from-yellow-500 to-orange-500'
                  },
                  { 
                    icon: <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>,
                    title: 'Công bằng', 
                    desc: 'Không thể gian lận',
                    color: 'from-green-500 to-emerald-500'
                  },
                ].map((item, idx) => (
                  <div key={idx} className="text-center p-6 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-300 group cursor-pointer">
                    <div className={`inline-flex p-4 bg-gradient-to-br ${item.color} rounded-2xl text-white mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                      {item.icon}
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
