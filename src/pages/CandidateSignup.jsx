import { useContext, useMemo, useState } from 'react';
import { Web3Context } from '../context/Web3Context';

const API_BASE = import.meta.env.VITE_OTP_API || 'http://localhost:3001';
const UPLOAD_ENDPOINT = import.meta.env.VITE_UPLOAD_URL || '';

const CandidateSignup = () => {
  const { votingContract, currentAccount, setIsLoading } = useContext(Web3Context);

  const [form, setForm] = useState({
    name: '',
    mssv: '',
    major: '',
    bio: '',
  });
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isReady = useMemo(() => {
    return (
      form.name.trim().length >= 3 &&
      /^\d{8}$/.test(form.mssv.trim()) &&
      form.major.trim().length > 0 &&
      imageUrl.length > 0 &&
      form.bio.trim().length > 0
    );
  }, [form, imageUrl]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!UPLOAD_ENDPOINT) {
      setError('Chưa cấu hình endpoint upload (VITE_UPLOAD_URL)');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Ảnh phải là JPG, PNG hoặc WEBP');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Kích thước ảnh tối đa 2MB');
      return;
    }
    setError('');
    setSuccess('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(UPLOAD_ENDPOINT, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data?.url) {
        throw new Error(data?.error || 'Upload thất bại');
      }
      setImageUrl(data.url);
      setSuccess('Upload ảnh thành công');
    } catch (err) {
      setError(err.message || 'Upload thất bại. Vui lòng thử lại');
    }
    setUploading(false);
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    if (!votingContract) {
      setError('Vui lòng kết nối ví trước khi đăng ký');
      return;
    }
    if (!isReady) {
      setError('Vui lòng điền đầy đủ thông tin và tải ảnh');
      return;
    }
    const trimmedName = form.name.trim();
    const trimmedMssv = form.mssv.trim();
    const trimmedMajor = form.major.trim();
    const trimmedBio = form.bio.trim();

    try {
      setIsLoading(true);
      const tx = await votingContract.dangKyUngVien(trimmedName, trimmedMssv, trimmedMajor, imageUrl, trimmedBio);
      const receipt = await tx.wait();

      // Lưu off-chain (Mongo) để admin tra cứu
      try {
        const email = localStorage.getItem('qnu-email-verified') || '';
        await fetch(`${API_BASE}/candidates`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: trimmedName,
            mssv: trimmedMssv,
            major: trimmedMajor,
            image: imageUrl,
            bio: trimmedBio,
            email,
            wallet: currentAccount,
            txHash: receipt?.hash || '',
          }),
        });
      } catch (logErr) {
        console.warn('Log candidate offchain error', logErr);
      }

      setSuccess('Đã gửi đăng ký, vui lòng chờ admin duyệt.');
      setForm({ name: '', mssv: '', major: '', bio: '' });
      setImageUrl('');
    } catch (err) {
      setError(err.reason || err.message || 'Đăng ký thất bại');
    }
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-qnu-500">Đăng ký ứng viên</h1>
            <p className="text-gray-600">Điền thông tin và upload ảnh để tham gia bình chọn.</p>
          </div>
          {currentAccount ? (
            <span className="text-sm text-green-700 bg-green-50 px-3 py-1 rounded-full">
              Ví: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}
            </span>
          ) : (
            <span className="text-sm text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full">
              Chưa kết nối ví
            </span>
          )}
        </div>

        <div className="grid gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Họ tên</label>
              <input
                className="w-full border rounded-lg p-3"
                placeholder="Nguyễn Văn A"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">MSSV</label>
              <input
                className="w-full border rounded-lg p-3"
                placeholder="8 chữ số"
                value={form.mssv}
                onChange={(e) => setForm({ ...form, mssv: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Ngành/Khoa</label>
              <input
                className="w-full border rounded-lg p-3"
                placeholder="CNTT, QTKD..."
                value={form.major}
                onChange={(e) => setForm({ ...form, major: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Ảnh</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="flex-1 border rounded-lg p-2 text-sm"
                />
                {imageUrl && <img src={imageUrl} alt="preview" className="h-12 w-12 object-cover rounded-lg border" />}
              </div>
              <p className="text-xs text-gray-500">Hỗ trợ JPG/PNG/WEBP, tối đa 2MB.</p>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Giới thiệu ngắn</label>
            <textarea
              rows={4}
              className="w-full border rounded-lg p-3"
              placeholder="Nêu điểm nổi bật và lý do bạn tham gia..."
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!isReady || uploading}
            className="w-full md:w-auto bg-qnu-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-qnu-600 transition disabled:opacity-60"
          >
            {uploading ? 'Đang upload...' : 'Gửi đăng ký'}
          </button>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}
        </div>
      </div>
    </div>
  );
};

export default CandidateSignup;
