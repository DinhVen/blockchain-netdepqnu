import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { Web3Context } from '../context/Web3Context';

const Home = () => {
  const { schedule } = useContext(Web3Context);

  const formatTime = (val) => (val ? new Date(val).toLocaleString() : 'Chưa đặt');

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 transition-colors duration-500"></div>
      
      {/* Floating Shapes */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fadeIn">
            <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-qnu-500 dark:text-blue-400 font-semibold px-5 py-2.5 rounded-full shadow-lg border border-blue-200/50 dark:border-blue-500/30">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              QNU - Nét Đẹp Sinh Viên · Blockchain
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white leading-tight">
              Bầu chọn
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Sinh viên tiêu biểu
              </span>
              QNU 2025
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Hệ thống bỏ phiếu phi tập trung, minh bạch và công bằng. Mỗi phiếu bầu được ghi nhận trên blockchain, không thể thay đổi hay giả mạo.
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
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              
              <Link
                to="/claim"
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 px-8 py-4 rounded-xl font-bold hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Nhận token QSV
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="text-center">
                <div className="text-3xl font-black text-blue-600 dark:text-blue-400">100%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Minh bạch</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-purple-600 dark:text-purple-400">1</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Token/Ví</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-pink-600 dark:text-pink-400">∞</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Bảo mật</div>
              </div>
            </div>
          </div>

          {/* Right Content - Schedule Card */}
          <div className="relative animate-scaleIn">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl blur-2xl opacity-20"></div>
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/50">
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
                  { label: 'Claim mở', time: schedule.claimStart, icon: '🎫', color: 'from-green-400 to-emerald-500' },
                  { label: 'Claim đóng', time: schedule.claimEnd, icon: '⏰', color: 'from-orange-400 to-red-500' },
                  { label: 'Vote mở', time: schedule.voteStart, icon: '🗳️', color: 'from-blue-400 to-cyan-500' },
                  { label: 'Vote đóng', time: schedule.voteEnd, icon: '🏁', color: 'from-purple-400 to-pink-500' },
                ].map((item, idx) => (
                  <div key={idx} className="group relative p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border border-gray-200/50 dark:border-gray-600/50">
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{item.label}</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{formatTime(item.time)}</p>
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
                  </div>
                ))}
              </div>

              {/* Steps */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Quy trình</h4>
                {[
                  { step: '01', title: 'Xác thực email', desc: 'Email sinh viên QNU', icon: '📧' },
                  { step: '02', title: 'Nhận token', desc: 'Mỗi ví 1 token', icon: '🪙' },
                  { step: '03', title: 'Bỏ phiếu', desc: 'Chọn ứng viên', icon: '✅' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-300 group cursor-pointer">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 dark:text-white">{item.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                    </div>
                    <div className="text-2xl font-black text-gray-200 dark:text-gray-700">{item.step}</div>
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
