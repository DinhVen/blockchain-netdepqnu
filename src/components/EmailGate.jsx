import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const API_BASE = import.meta.env.VITE_OTP_API || 'https://voting-b431.onrender.com';

const EmailGate = ({ onVerified }) => {
  const { theme, toggleTheme } = useTheme();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rateLimitTimer, setRateLimitTimer] = useState(0);

  const handleSendOtp = async () => {
    if (rateLimitTimer > 0) {
      setError(`Vui lòng đợi ${rateLimitTimer}s trước khi gửi lại`);
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Vui lòng nhập email');
      return;
    }
    if (!/@st\.qnu\.edu\.vn$/i.test(trimmedEmail)) {
      setError('Email phải là mail sinh viên Trường Đại học Quy Nhơn (@st.qnu.edu.vn)');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      
      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error('Server trả về dữ liệu không hợp lệ');
      }
      
      if (!res.ok) throw new Error(data?.error || 'Gửi OTP thất bại');

      setStep('otp');
      setEmail(trimmedEmail);

      setRateLimitTimer(60);
      const interval = setInterval(() => {
        setRateLimitTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (e) {
      setError(e.message || 'Không thể kết nối đến server. Vui lòng thử lại.');
    }
    setLoading(false);
  };

  const handleVerify = async () => {
    const trimmedOtp = otp.trim();
    if (!trimmedOtp) {
      setError('Vui lòng nhập mã OTP');
      return;
    }
    if (!/^\d{6}$/.test(trimmedOtp)) {
      setError('Mã OTP phải là 6 chữ số');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: trimmedOtp }),
      });
      
      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error('Server trả về dữ liệu không hợp lệ');
      }
      
      if (!res.ok) throw new Error(data?.error || 'OTP không đúng');

      localStorage.setItem('qnu-email-verified', email);
      if (data.token) {
        localStorage.setItem('qnu-email-token', data.token);
      }
      
      // Note: Wallet binding will be done automatically when user connects wallet
      // via Web3Context.bindEmailWallet() function
      
      onVerified(email);
    } catch (e) {
      setError(e.message || 'Xác thực thất bại. Vui lòng thử lại.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 transition-colors duration-300">
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-50"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? <Moon size={24} className="text-gray-700" /> : <Sun size={24} className="text-yellow-400" />}
      </button>
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 w-full max-w-md border border-gray-100 dark:border-gray-700 animate-scaleIn">
        <h1 className="text-2xl font-bold text-qnu-500 dark:text-blue-400 text-center mb-2">Xác thực sinh viên QNU</h1>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
          Nhập email của sinh viên <strong>Trường Đại học Quy Nhơn</strong>
        </p>

        {step === 'email' && (
          <div className="space-y-3 animate-fadeIn">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email sinh viên</label>
            <input
              type="email"
              className="w-full border dark:border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-qnu-500 dark:focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
              placeholder="TenMaSV@st.qnu.edu.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full bg-qnu-500 dark:bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-qnu-600 dark:hover:bg-blue-700 transition-all duration-300 disabled:opacity-60 transform hover:scale-105 active:scale-95"
            >
              {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-3 animate-fadeIn">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nhập mã OTP (6 số)</label>
            <input
              type="text"
              className="w-full border dark:border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-qnu-500 dark:focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
              placeholder="Nhập mã đã nhận"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={loading}
            />
            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full bg-green-600 dark:bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-green-800 transition-all duration-300 disabled:opacity-60 transform hover:scale-105 active:scale-95"
            >
              {loading ? 'Đang xác nhận...' : 'Xác nhận'}
            </button>
            <button
              onClick={handleSendOtp}
              disabled={loading || rateLimitTimer > 0}
              className="w-full text-sm text-qnu-500 dark:text-blue-400 underline hover:text-qnu-600 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {rateLimitTimer > 0 ? `Gửi lại sau ${rateLimitTimer}s` : 'Gửi lại OTP'}
            </button>
          </div>
        )}

        {error && <p className="text-red-500 dark:text-red-400 text-sm mt-4 text-center animate-slideDown">{error}</p>}
      </div>
    </div>
  );
};

export default EmailGate;
