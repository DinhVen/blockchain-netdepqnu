import { useState } from 'react';

const CandidateForm = ({ onSubmit, isLoading }) => {
  const [form, setForm] = useState({
    name: '',
    mssv: '',
    major: '',
    image: '',
    bio: '',
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return alert('Vui lòng nhập tên');
    if (!/^\d{8}$/.test(form.mssv.trim())) return alert('MSSV phải là 8 chữ số');
    if (!form.major.trim()) return alert('Vui lòng nhập ngành/khoa');
    
    onSubmit(form);
    setForm({ name: '', mssv: '', major: '', image: '', bio: '' });
  };

  const isValidUrl = (url) => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const canSubmit = form.name.trim() && /^\d{8}$/.test(form.mssv.trim()) && form.major.trim();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#E2E8F0] dark:border-gray-700 p-6">
      <h3 className="font-bold text-[#0F172A] dark:text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
        Thêm ứng viên
      </h3>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-[#64748B] mb-1 block">Họ tên *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full border border-[#E2E8F0] dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#64748B] mb-1 block">MSSV * (8 số)</label>
            <input
              type="text"
              value={form.mssv}
              onChange={(e) => handleChange('mssv', e.target.value)}
              placeholder="12345678"
              maxLength={8}
              className="w-full border border-[#E2E8F0] dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#64748B] mb-1 block">Ngành/Khoa *</label>
            <input
              type="text"
              value={form.major}
              onChange={(e) => handleChange('major', e.target.value)}
              placeholder="Công nghệ thông tin"
              className="w-full border border-[#E2E8F0] dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-[#64748B] mb-1 block">URL ảnh</label>
            <input
              type="url"
              value={form.image}
              onChange={(e) => handleChange('image', e.target.value)}
              placeholder="https://..."
              className="w-full border border-[#E2E8F0] dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
          </div>
          <div className="h-24 rounded-lg border border-dashed border-[#E2E8F0] dark:border-gray-600 flex items-center justify-center overflow-hidden bg-[#F8FAFC] dark:bg-gray-700">
            {isValidUrl(form.image) ? (
              <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-[#64748B]">Preview ảnh</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3">
        <label className="text-xs font-medium text-[#64748B] mb-1 block">Mô tả</label>
        <textarea
          value={form.bio}
          onChange={(e) => handleChange('bio', e.target.value)}
          placeholder="Giới thiệu ngắn về ứng viên..."
          rows={2}
          className="w-full border border-[#E2E8F0] dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#2563EB] focus:border-transparent resize-none"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit || isLoading}
        className="mt-4 w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed bg-[#16A34A] hover:bg-green-700 text-white"
      >
        {isLoading ? 'Đang thêm...' : 'Thêm ứng viên'}
      </button>
    </div>
  );
};

export default CandidateForm;
