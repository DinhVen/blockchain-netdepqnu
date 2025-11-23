import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { Web3Context } from '../context/Web3Context';

const Home = () => {
  const { schedule } = useContext(Web3Context);

  const formatTime = (val) => (val ? new Date(val).toLocaleString() : 'Chưa đặt');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-10 items-center animate-fadeIn">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 text-qnu-500 dark:text-blue-400 font-semibold px-4 py-2 rounded-full shadow-lg animate-pulse-slow">
              QNU- Nét Đẹp Sinh Viên · Minh bạch trên Blockchain
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
              Bầu chọn sinh viên tiêu biểu Trường Đại học Quy Nhơn (QNU)
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Kết nối ví, nhận 1 token QSV và bỏ phiếu cho ứng viên bạn tin tưởng. Hệ thống vận hành on-chain, đảm bảo công bằng và minh bạch.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/vote"
                className="bg-qnu-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-qnu-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Bỏ phiếu ngay
              </Link>
              <Link
                to="/claim"
                className="bg-white dark:bg-gray-800 text-qnu-500 dark:text-blue-400 border border-qnu-500 dark:border-blue-400 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105"
              >
                Nhận token QSV
              </Link>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 space-y-4 animate-scaleIn">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Lịch trình cuộc thi</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-300">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 transition-all duration-300 hover:scale-105 hover:shadow-md">
                <p className="font-semibold text-qnu-500 dark:text-blue-400">Claim mở</p>
                <p>{formatTime(schedule.claimStart)}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 transition-all duration-300 hover:scale-105 hover:shadow-md">
                <p className="font-semibold text-qnu-500 dark:text-blue-400">Claim đóng</p>
                <p>{formatTime(schedule.claimEnd)}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 transition-all duration-300 hover:scale-105 hover:shadow-md">
                <p className="font-semibold text-qnu-500 dark:text-blue-400">Vote mở</p>
                <p>{formatTime(schedule.voteStart)}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 transition-all duration-300 hover:scale-105 hover:shadow-md">
                <p className="font-semibold text-qnu-500 dark:text-blue-400">Vote đóng</p>
                <p>{formatTime(schedule.voteEnd)}</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 transition-all duration-300 hover:scale-105">
                <p className="font-semibold text-gray-900 dark:text-white">1. Xác thực email</p>
                <p className="text-gray-600 dark:text-gray-400">Email của sinh viên QNU</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 transition-all duration-300 hover:scale-105">
                <p className="font-semibold text-gray-900 dark:text-white">2. Nhận token QSV</p>
                <p className="text-gray-600 dark:text-gray-400">Mỗi ví: 1 token</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 transition-all duration-300 hover:scale-105">
                <p className="font-semibold text-gray-900 dark:text-white">3. Bỏ phiếu</p>
                <p className="text-gray-600 dark:text-gray-400">Chọn ứng viên yêu thích</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Home;
