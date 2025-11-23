import { useContext, useState } from 'react';
import { Web3Context } from '../context/Web3Context';

const API_BASE = import.meta.env.VITE_OTP_API || 'http://localhost:3001';
const CLOUDINARY_UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const CandidateSignup = () => {
  const { votingContract, currentAccount, setIsLoading } = useContext(Web3Context);
  const [formData, setFormData] = useState({
    name: '',
    mssv: '',
    major: '',
    image: '',
    bio: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const uploadToCloudinary = async (file) => {
    if (!CLOUDINARY_UPLOAD_URL || !CLOUDINARY_UPLOAD_PRESET) {
      throw new Error('Cloudinary chưa được cấu hình');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload ảnh thất bại');
    }

    const data = await response.json();
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentAccount) {
      setError('Vui lòng kết nối ví trước khi đăng ký');
      return;
    }

    const trimmedName = formData.name.trim();
    const trimmedMssv = formData.mssv.trim();
    const trimmedMajor = formData.major.trim();
    const trimmedImage = formData.image; // Cloudinary URL
    const trimmedBio = formData.bio.trim();

    // Validation
    if (!trimmedName || trimmedName.length < 3 || trimmedName.length > 100) {
      setError('Tên ứng viên phải từ 3-100 ký tự');
      return;
    }
    if (!trimmedMssv || !/^\d{8}$/.test(trimmedMssv)) {
      setError('MSSV phải là 8 chữ số (ví dụ: 45010203)');
      return;
    }
    if (!trimmedMajor) {
      setError('Vui lòng nhập ngành/khoa');
      return;
    }
    if (trimmedBio.length > 500) {
      setError('Mô tả không được vượt quá 500 ký tự');
      return;
    }

    const confirmed = window.confirm(
      `XÁC NHẬN ĐĂNG KÝ ỨNG VIÊN\n\n` +
        `Tên: ${trimmedName}\n` +
        `MSSV: ${trimmedMssv}\n` +
        `Ngành: ${trimmedMajor}\n\n` +
        `Bạn có chắc chắn muốn đăng ký?`
    );

    if (!confirmed) return;

    setIsLoading(true);
    try {
      // Call smart contract
      const tx = await votingContract.dangKyUngVien(
        trimmedName,
        trimmedMssv,
        trimmedMajor,
        trimmedImage,
        trimmedBio
      );
      const receipt = await tx.wait();

      // Save to backend for audit
      const email = localStorage.getItem('qnu-email-verified');
      try {
        await fetch(`${API_BASE}/candidates`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: trimmedName,
            mssv: trimmedMssv,
            major: trimmedMajor,
            image: trimmedImage,
            bio: trimmedBio,
            email: email || '',
            wallet: currentAccount,
            txHash: receipt.hash,
          }),
        });
      } catch (e) {
        console.warn('Failed to save to backend:', e);
      }

      setSubmitted(true);
      setFormData({ name: '', mssv: '', major: '', image: '', bio: '' });
    } catch (e) {
      setError(e.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      console.error('Signup error:', e);
    }
    setIsLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20"></div>
        <div className="container mx-auto py-16 px-4 relative z-10">
          <div className="max-w-2xl mx-auto">
            <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-8 text-center backdrop-blur-md animate-scaleIn">
              <svg className="w-20 h-20 text-green-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <h2 className="text-3xl font-bold text-green-700 dark:text-green-400 mb-4">
                Đăng ký thành công!
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Yêu cầu của bạn đã được gửi lên blockchain. Admin sẽ xem xét và phê duyệt trong thời gian sớm nhất.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Đăng ký ứng viên khác
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20"></div>
      <div className="absolute top-20 right-10 w-96 h-96 bg-blue-400/10 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-400/10 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

      <div className="container mx-auto py-16 px-4 relative z-10 animate-fadeIn">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-5 py-2 rounded-full shadow-lg border border-blue-200/50 dark:border-blue-500/30 mb-6">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Đăng ký ứng viên</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
              Trở thành
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Ứng cử viên
              </span>
            </h2>

            <p className="text-lg text-gray-600 dark:text-gray-400">
              Đăng ký tham gia cuộc thi QNU - Nét Đẹp Sinh Viên 2025
            </p>
          </div>

          {/* Form */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl blur-2xl opacity-20"></div>
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/50">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border dark:border-gray-600 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>

                {/* MSSV & Major */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      MSSV <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.mssv}
                      onChange={(e) => setFormData({ ...formData, mssv: e.target.value })}
                      className="w-full border dark:border-gray-600 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
                      placeholder="45010203"
                      pattern="\d{8}"
                      required
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">8 chữ số</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Ngành/Khoa <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.major}
                      onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                      className="w-full border dark:border-gray-600 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
                      placeholder="Công nghệ thông tin"
                      required
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Ảnh đại diện
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            setError('Kích thước ảnh không được vượt quá 5MB');
                            return;
                          }
                          
                          setUploading(true);
                          setError('');
                          try {
                            const imageUrl = await uploadToCloudinary(file);
                            setFormData({ ...formData, image: imageUrl });
                          } catch (err) {
                            setError(err.message || 'Upload ảnh thất bại. Vui lòng thử lại.');
                          }
                          setUploading(false);
                        }
                      }}
                      className="hidden"
                      id="image-upload"
                      disabled={uploading}
                    />
                    <label
                      htmlFor="image-upload"
                      className={`flex flex-col items-center gap-2 ${uploading ? 'cursor-wait' : 'cursor-pointer'}`}
                    >
                      {uploading ? (
                        <div className="space-y-2">
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
                          <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                            Đang upload...
                          </p>
                        </div>
                      ) : formData.image ? (
                        <div className="space-y-2">
                          <img
                            src={formData.image}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-xl mx-auto"
                          />
                          <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
                            ✓ Đã upload ảnh
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Click để thay đổi
                          </p>
                        </div>
                      ) : (
                        <>
                          <svg
                            className="w-12 h-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="text-blue-600 dark:text-blue-400 font-semibold">
                              Click để chọn ảnh
                            </span>{' '}
                            hoặc kéo thả vào đây
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            PNG, JPG, GIF tối đa 5MB
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Giới thiệu bản thân
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full border dark:border-gray-600 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
                    placeholder="Giới thiệu về bản thân, thành tích, hoạt động..."
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formData.bio.length}/500 ký tự
                  </p>
                </div>

                {/* Wallet Info */}
                {currentAccount && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Ví của bạn:</span>{' '}
                      {currentAccount.slice(0, 10)}...{currentAccount.slice(-8)}
                    </p>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 animate-slideDown">
                    <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!currentAccount}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {!currentAccount ? 'Vui lòng kết nối ví' : 'Đăng ký ứng viên'}
                </button>

                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  Sau khi đăng ký, admin sẽ xem xét và phê duyệt yêu cầu của bạn
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateSignup;
