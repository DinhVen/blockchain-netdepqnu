import { useState, useContext, useEffect } from 'react';
import { Web3Context } from '../context/Web3Context';
import WalletConnect from './WalletConnect';

const API_BASE = import.meta.env.VITE_OTP_API || 'https://voting-b431.onrender.com';

const EmailGate = ({ onVerified }) => {
  const { currentAccount, disconnectWallet } = useContext(Web3Context);
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rateLimitTimer, setRateLimitTimer] = useState(0);
  const [isFraud, setIsFraud] = useState(false);
  const [fraudMessage, setFraudMessage] = useState('');

  // Check nếu ví này đã bị đánh dấu gian lận
  useEffect(() => {
    if (currentAccount) {
      const fraudWallets = JSON.parse(localStorage.getItem('qnu-fraud-wallets') || '[]');
      if (fraudWallets.includes(currentAccount.toLowerCase())) {
        setIsFraud(true);
        setFraudMessage('Ví này đã bị phát hiện gian lận và không được phép sử dụng!');
      } else {
        setIsFraud(false);
        setFraudMessage('');
      }
    }
  }, [currentAccount]);

  const handleSendOtp = async () => {
    // Phải kết nối ví trước
    if (!currentAccount) {
      setError('Vui lòng kết nối ví MetaMask trước!');
      return;
    }

    // Check gian lận
    if (isFraud) {
      setError(fraudMessage);
      return;
    }

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
    if (!currentAccount) {
      setError('Vui lòng kết nối ví MetaMask trước!');
      return;
    }

    if (isFraud) {
      setError(fraudMessage);
      return;
    }

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

      // Bind email với ví ngay sau khi xác thực OTP
      const bindRes = await fetch(`${API_BASE}/wallet/bind`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, wallet: currentAccount }),
      });
      
      if (!bindRes.ok) {
        const bindData = await bindRes.json();
        if (bindRes.status === 409) {
          // Gian lận: email đã bind với ví khác
          // Lưu ví gian lận vào localStorage
          const fraudWallets = JSON.parse(localStorage.getItem('qnu-fraud-wallets') || '[]');
          if (!fraudWallets.includes(currentAccount.toLowerCase())) {
            fraudWallets.push(currentAccount.toLowerCase());
            localStorage.setItem('qnu-fraud-wallets', JSON.stringify(fraudWallets));
          }
          
          setIsFraud(true);
          setFraudMessage(bindData.error);
          setError(`⚠️ PHÁT HIỆN GIAN LẬN!\n${bindData.error}`);
          
          // Disconnect ví
          disconnectWallet();
          
          // Revoke permissions từ MetaMask
          try {
            await window.ethereum?.request({
              method: 'wallet_revokePermissions',
              params: [{ eth_accounts: {} }],
            });
          } catch (e) {
            console.warn('Revoke permissions error:', e);
          }
          
          setLoading(false);
          return;
        }
      }

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 w-full max-w-md border border-gray-100 dark:border-gray-700 animate-scaleIn">
        <h1 className="text-2xl font-bold text-[#2563EB] dark:text-blue-400 text-center mb-2">Xác thực sinh viên QNU</h1>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
          Kết nối ví và xác thực email sinh viên <strong>Trường Đại học Quy Nhơn</strong>
        </p>

        {/* Cảnh báo gian lận */}
        {isFraud && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-bold text-red-700 dark:text-red-400">⚠️ PHÁT HIỆN GIAN LẬN!</h3>
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">{fraudMessage}</p>
                <p className="text-xs text-red-500 dark:text-red-400 mt-2">Vui lòng liên hệ ban tổ chức nếu đây là nhầm lẫn.</p>
              </div>
            </div>
          </div>
        )}

        {/* Bước 1: Kết nối ví */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
            Bước 1: Kết nối ví MetaMask
          </label>
          <WalletConnect />
          {currentAccount && !isFraud && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Đã kết nối: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}
            </p>
          )}
        </div>

        {/* Bước 2: Xác thực email */}
        <div className={(!currentAccount || isFraud) ? 'opacity-50 pointer-events-none' : ''}>
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
            Bước 2: Xác thực email sinh viên
          </label>
          
          {step === 'email' && (
            <div className="space-y-3 animate-fadeIn">
              <input
                type="email"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#2563EB] bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
                placeholder="TenMaSV@st.qnu.edu.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || !currentAccount || isFraud}
              />
              <button
                onClick={handleSendOtp}
                disabled={loading || !currentAccount || isFraud}
                className="w-full bg-[#2563EB] hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-60 transform hover:scale-105 active:scale-95"
              >
                {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
              </button>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-3 animate-fadeIn">
              <input
                type="text"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#2563EB] bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
                placeholder="Nhập mã OTP (6 số)"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={loading || isFraud}
              />
              <button
                onClick={handleVerify}
                disabled={loading || isFraud}
                className="w-full bg-green-600 dark:bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-green-800 transition-all duration-300 disabled:opacity-60 transform hover:scale-105 active:scale-95"
              >
                {loading ? 'Đang xác nhận...' : 'Xác nhận'}
              </button>
              <button
                onClick={handleSendOtp}
                disabled={loading || rateLimitTimer > 0 || isFraud}
                className="w-full text-sm text-[#2563EB] dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {rateLimitTimer > 0 ? `Gửi lại sau ${rateLimitTimer}s` : 'Gửi lại OTP'}
              </button>
            </div>
          )}
        </div>

        {error && !isFraud && <p className="text-red-500 dark:text-red-400 text-sm mt-4 text-center animate-slideDown">{error}</p>}
      </div>
    </div>
  );
};

export default EmailGate;
