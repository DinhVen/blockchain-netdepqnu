import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { Web3Context } from '../context/Web3Context';

const Home = () => {
  const { schedule } = useContext(Web3Context);

  const formatTime = (val) => (val ? new Date(val).toLocaleString('vi-VN') : 'Chưa đặt');

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
                  <h3 className="text-2xl font-black mb-1">QNU Voting</h3>
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
                  { icon: '🔒', title: 'Bảo mật', desc: 'Dữ liệu được mã hóa' },
                  { icon: '👁️', title: 'Minh bạch', desc: 'Ai cũng có thể kiểm tra' },
                  { icon: '⚡', title: 'Nhanh chóng', desc: 'Kết quả tức thì' },
                  { icon: '⚖️', title: 'Công bằng', desc: 'Không thể gian lận' },
                ].map((item, idx) => (
                  <div key={idx} className="text-center p-6 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-300 group cursor-pointer">
                    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
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
