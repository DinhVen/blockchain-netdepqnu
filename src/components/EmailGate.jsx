import { useState } from 'react';

const API_BASE = import.meta.env.VITE_OTP_API || 'http://localhost:3001';

const EmailGate = ({ onVerified }) => {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rateLimitTimer, setRateLimitTimer] = useState(0);

  const handleSendOtp = async () => {
    // Rate limiting check
    if (rateLimitTimer > 0) {
      setError(`Vui lòng đợi ${rateLimitTimer}s trước khi gửi lại`);
      return;
    }

    // Email validation
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
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Gửi OTP thất bại');
      
      setStep('otp');
      setEmail(trimmedEmail);
      
      // Set rate limit timer (60 seconds)
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
    // OTP validation
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
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'OTP không đúng');
      
      localStorage.setItem('qnu-email-verified', email);
      if (data.token) {
        localStorage.setItem('qnu-email-token', data.token);
      }
      onVerified(email);
    } catch (e) {
      setError(e.message || 'Xác thực thất bại. Vui lòng thử lại.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border border-gray-100">
        <h1 className="text-2xl font-bold text-qnu-500 text-center mb-2">Xác thực sinh viên QNU</h1>
        <p className="text-gray-600 text-center mb-6">
          Nhập email của sinh viên <strong>Trường Đại học Quy Nhơn</strong>
        </p>

        {step === 'email' && (
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">Email sinh viên</label>
            <input
              type="email"
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-qnu-500"
              placeholder="TenMaSV@st.qnu.edu.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full bg-qnu-500 text-white py-3 rounded-lg font-semibold hover:bg-qnu-600 transition disabled:opacity-60"
            >
              {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">Nhập mã OTP (6 số)</label>
            <input
              type="text"
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-qnu-500"
              placeholder="Nhập mã đã nhận"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={loading}
            />
            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-60"
            >
              {loading ? 'Đang xác nhận...' : 'Xác nhận'}
            </button>
            <button
              onClick={handleSendOtp}
              disabled={loading || rateLimitTimer > 0}
              className="w-full text-sm text-qnu-500 underline hover:text-qnu-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {rateLimitTimer > 0 ? `Gửi lại sau ${rateLimitTimer}s` : 'Gửi lại OTP'}
            </button>
          </div>
        )}

        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default EmailGate;
