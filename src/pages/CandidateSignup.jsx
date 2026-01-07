import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { Web3Context } from '../context/Web3Context';
import PageHeader from '../components/ui/PageHeader';
import StatusChips from '../components/ui/StatusChips';

const API_BASE = import.meta.env.VITE_OTP_API || 'https://voting-b431.onrender.com';
const CLOUDINARY_UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const CandidateSignup = () => {
  const { votingContract, currentAccount, setIsLoading, saleActive, voteOpen } = useContext(Web3Context);
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
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    const response = await fetch(CLOUDINARY_UPLOAD_URL, { method: 'POST', body: data });
    if (!response.ok) throw new Error('Upload ảnh thất bại');
    const result = await response.json();
    return result.secure_url;
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
    const trimmedImage = formData.image;
    const trimmedBio = formData.bio.trim();

    if (!trimmedName || trimmedName.length < 3 || trimmedName.length > 100) {
      setError('Tên ứng viên phải từ 3-100 ký tự');
      return;
    }
    if (!trimmedMssv || !/^\d{10}$/.test(trimmedMssv)) {
      setError('MSSV phải là 10 chữ số');
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
      `XÁC NHẬN ĐĂNG KÝ ỨNG VIÊN\n\nTên: ${trimmedName}\nMSSV: ${trimmedMssv}\nNgành: ${trimmedMajor}\n\nBạn có chắc chắn muốn đăng ký?`
    );
    if (!confirmed) return;

    setIsLoading(true);
    try {
      const tx = await votingContract.dangKyUngVien(trimmedName, trimmedMssv, trimmedMajor, trimmedImage, trimmedBio);
      const receipt = await tx.wait();

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

  const statusChips = [
    { label: 'Sale', value: saleActive ? 'ON' : 'OFF', status: saleActive ? 'success' : 'neutral' },
    { label: 'Vote', value: voteOpen ? 'ON' : 'OFF', status: voteOpen ? 'success' : 'neutral' },
    { label: 'Ví', value: currentAccount ? 'Đã kết nối' : 'Chưa kết nối', status: currentAccount ? 'success' : 'warning' },
  ];

  // Điều kiện đăng ký
  const conditions = [
    { label: 'Kết nối ví MetaMask', done: !!currentAccount },
    { label: 'Điền đầy đủ thông tin bắt buộc', done: formData.name && formData.mssv && formData.major },
    { label: 'MSSV đúng định dạng (10 số)', done: /^\d{10}$/.test(formData.mssv) },
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] pt-20 pb-10 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-8 border border-[#E2E8F0] dark:border-gray-700 shadow-sm text-center">
            <div className="w-16 h-16 bg-[#16A34A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#16A34A]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white mb-2">Đăng ký thành công!</h2>
            <p className="text-[#64748B] mb-6">Yêu cầu của bạn đã được gửi lên blockchain. Admin sẽ xem xét và phê duyệt sớm nhất.</p>
            <div className="flex gap-3">
              <button onClick={() => setSubmitted(false)} className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-[#0F172A] dark:text-white rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                Đăng ký thêm
              </button>
              <Link to="/voting" className="flex-1 px-4 py-3 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl font-semibold transition text-center">
                Xem ứng viên
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] pt-20 pb-10">
      <div className="container mx-auto px-4">
        <PageHeader title="Đăng ký Ứng viên" subtitle="Tham gia cuộc thi QNU - Nét Đẹp Sinh Viên 2025">
          <StatusChips items={statusChips} />
        </PageHeader>

        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Sidebar - Conditions */}
            <div className="lg:col-span-1 space-y-4">
              {/* Điều kiện */}
              <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-[#E2E8F0] dark:border-gray-700 shadow-sm">
                <h3 className="font-bold text-[#0F172A] dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Điều kiện đăng ký
                </h3>
                <div className="space-y-3">
                  {conditions.map((c, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${c.done ? 'bg-[#16A34A]' : 'bg-gray-200 dark:bg-gray-700'}`}>
                        {c.done && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                      </div>
                      <span className={`text-sm ${c.done ? 'text-[#0F172A] dark:text-white' : 'text-[#64748B]'}`}>{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview ảnh */}
              <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-[#E2E8F0] dark:border-gray-700 shadow-sm">
                <h3 className="font-bold text-[#0F172A] dark:text-white mb-4">Xem trước</h3>
                <div className="aspect-square rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  {formData.image ? (
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#64748B]">
                      <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                    </div>
                  )}
                </div>
                {formData.name && (
                  <div className="mt-4 text-center">
                    <p className="font-bold text-[#0F172A] dark:text-white">{formData.name}</p>
                    <p className="text-sm text-[#64748B]">{formData.major || 'Ngành/Khoa'}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-[#E2E8F0] dark:border-gray-700 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-[#0F172A] dark:text-white mb-2">
                      Họ và tên <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-[#E2E8F0] dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-[#0F172A] dark:text-white focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition"
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </div>

                  {/* MSSV & Major */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#0F172A] dark:text-white mb-2">
                        MSSV <span className="text-[#DC2626]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.mssv}
                        onChange={(e) => setFormData({ ...formData, mssv: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        className="w-full px-4 py-3 border border-[#E2E8F0] dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-[#0F172A] dark:text-white focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition"
                        placeholder="1234567890"
                        required
                      />
                      <p className="text-xs text-[#64748B] mt-1">{formData.mssv.length}/10 số</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0F172A] dark:text-white mb-2">
                        Ngành/Khoa <span className="text-[#DC2626]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.major}
                        onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                        className="w-full px-4 py-3 border border-[#E2E8F0] dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-[#0F172A] dark:text-white focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition"
                        placeholder="Công nghệ thông tin"
                        required
                      />
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-[#0F172A] dark:text-white mb-2">Ảnh đại diện</label>
                    <div className="border-2 border-dashed border-[#E2E8F0] dark:border-gray-600 rounded-xl p-6 text-center hover:border-[#2563EB] transition cursor-pointer">
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
                              setError(err.message || 'Upload ảnh thất bại');
                            }
                            setUploading(false);
                          }
                        }}
                        className="hidden"
                        id="image-upload"
                        disabled={uploading}
                      />
                      <label htmlFor="image-upload" className={`block ${uploading ? 'cursor-wait' : 'cursor-pointer'}`}>
                        {uploading ? (
                          <div className="py-4">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#2563EB] border-t-transparent mx-auto mb-2"></div>
                            <p className="text-sm text-[#2563EB] font-semibold">Đang upload...</p>
                          </div>
                        ) : formData.image ? (
                          <div className="py-2">
                            <p className="text-sm text-[#16A34A] font-semibold">✓ Đã upload ảnh</p>
                            <p className="text-xs text-[#64748B] mt-1">Click để thay đổi</p>
                          </div>
                        ) : (
                          <div className="py-4">
                            <svg className="w-10 h-10 text-[#64748B] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-sm text-[#64748B]"><span className="text-[#2563EB] font-semibold">Click để chọn ảnh</span> hoặc kéo thả</p>
                            <p className="text-xs text-[#64748B] mt-1">PNG, JPG, GIF tối đa 5MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-semibold text-[#0F172A] dark:text-white mb-2">Giới thiệu bản thân</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full px-4 py-3 border border-[#E2E8F0] dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-[#0F172A] dark:text-white focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition resize-none"
                      placeholder="Giới thiệu về bản thân, thành tích, hoạt động..."
                      rows={4}
                      maxLength={500}
                    />
                    <p className="text-xs text-[#64748B] mt-1">{formData.bio.length}/500 ký tự</p>
                  </div>

                  {/* Wallet Info */}
                  {currentAccount && (
                    <div className="bg-[#2563EB]/5 border border-[#2563EB]/20 rounded-xl p-4">
                      <p className="text-sm text-[#0F172A] dark:text-white">
                        <span className="font-semibold">Ví của bạn:</span> {currentAccount.slice(0, 10)}...{currentAccount.slice(-8)}
                      </p>
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <div className="bg-[#DC2626]/10 border border-[#DC2626]/20 rounded-xl p-4">
                      <p className="text-sm text-[#DC2626]">{error}</p>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={!currentAccount}
                    className="w-full py-4 bg-[#2563EB] hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-bold transition shadow-lg shadow-[#2563EB]/25 disabled:shadow-none"
                  >
                    {!currentAccount ? 'Vui lòng kết nối ví' : 'Đăng ký ứng viên'}
                  </button>

                  <p className="text-xs text-center text-[#64748B]">
                    Sau khi đăng ký, admin sẽ xem xét và phê duyệt yêu cầu của bạn
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateSignup;
