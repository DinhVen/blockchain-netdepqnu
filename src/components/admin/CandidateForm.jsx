import { useState } from 'react';
import { MAJOR_NAMES } from '../../utils/majors';

const CLOUDINARY_UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const CandidateForm = ({ onSubmit, isLoading, existingMssvList = [] }) => {
  const [form, setForm] = useState({
    name: '',
    mssv: '',
    major: '',
    dob: '',
    phone: '',
    email: '',
    image: '',
    bio: '',
  });
  const [errors, setErrors] = useState({});
  const [majorSearch, setMajorSearch] = useState('');
  const [showMajorDropdown, setShowMajorDropdown] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

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

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'Kích thước ảnh không được vượt quá 5MB' }));
      return;
    }

    setUploading(true);
    setErrors((prev) => ({ ...prev, image: '' }));
    try {
      const imageUrl = await uploadToCloudinary(file);
      handleChange('image', imageUrl);
    } catch (err) {
      setErrors((prev) => ({ ...prev, image: err.message || 'Upload ảnh thất bại' }));
    }
    setUploading(false);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = 'Vui lòng nhập họ tên';
    }

    if (!/^\d{10}$/.test(form.mssv.trim())) {
      newErrors.mssv = 'MSSV phải là 10 chữ số';
    } else if (existingMssvList.includes(form.mssv.trim())) {
      newErrors.mssv = 'MSSV đã tồn tại trên blockchain';
    }

    if (!form.major.trim()) {
      newErrors.major = 'Vui lòng chọn ngành/khoa';
    }

    if (!form.dob) {
      newErrors.dob = 'Vui lòng nhập ngày sinh';
    } else {
      const dobDate = new Date(form.dob);
      const today = new Date();
      if (dobDate > today) {
        newErrors.dob = 'Ngày sinh không được vượt quá hôm nay';
      }
      const age = today.getFullYear() - dobDate.getFullYear();
      if (age < 16 || age > 50) {
        newErrors.dob = 'Tuổi phải từ 16-50';
      }
    }

    if (!form.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(form.phone.trim())) {
      newErrors.phone = 'Số điện thoại không hợp lệ (VD: 0912345678)';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = 'Email không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    onSubmit(form);
    setForm({ name: '', mssv: '', major: '', dob: '', phone: '', email: '', image: '', bio: '' });
    setMajorSearch('');
  };

  const filteredMajors = MAJOR_NAMES.filter((m) =>
    m.toLowerCase().includes(majorSearch.toLowerCase())
  );

  const canSubmit =
    form.name.trim() &&
    /^\d{10}$/.test(form.mssv.trim()) &&
    form.major.trim() &&
    form.dob &&
    form.phone.trim() &&
    form.email.trim();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#E2E8F0] dark:border-gray-700 p-6">
      <h3 className="font-bold text-[#0F172A] dark:text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
        Thêm ứng viên
      </h3>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Cột trái */}
        <div className="space-y-3">
          {/* Họ tên */}
          <div>
            <label className="text-xs font-medium text-[#64748B] mb-1 block">Họ tên *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Nguyễn Văn A"
              className={`w-full border rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#2563EB] focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-[#E2E8F0] dark:border-gray-600'
              }`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* MSSV */}
          <div>
            <label className="text-xs font-medium text-[#64748B] mb-1 block">MSSV * (10 số)</label>
            <input
              type="text"
              value={form.mssv}
              onChange={(e) => handleChange('mssv', e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="1234567890"
              maxLength={10}
              className={`w-full border rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#2563EB] focus:border-transparent ${
                errors.mssv ? 'border-red-500' : 'border-[#E2E8F0] dark:border-gray-600'
              }`}
            />
            <p className="text-xs text-[#64748B] mt-1">{form.mssv.length}/10 số</p>
            {errors.mssv && <p className="text-xs text-red-500 mt-1">{errors.mssv}</p>}
          </div>

          {/* Ngành/Khoa - Dropdown searchable */}
          <div className="relative">
            <label className="text-xs font-medium text-[#64748B] mb-1 block">Ngành/Khoa *</label>
            <div className="relative">
              <input
                type="text"
                value={form.major || majorSearch}
                onChange={(e) => {
                  setMajorSearch(e.target.value);
                  handleChange('major', '');
                  setShowMajorDropdown(true);
                }}
                onFocus={() => setShowMajorDropdown(true)}
                placeholder="Tìm hoặc chọn ngành..."
                className={`w-full border rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#2563EB] focus:border-transparent pr-8 ${
                  errors.major ? 'border-red-500' : 'border-[#E2E8F0] dark:border-gray-600'
                }`}
              />
              <svg
                className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {showMajorDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-[#E2E8F0] dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredMajors.length > 0 ? (
                  filteredMajors.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        handleChange('major', m);
                        setMajorSearch('');
                        setShowMajorDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-[#2563EB]/10 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                    >
                      {m}
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-2 text-sm text-gray-500">Không tìm thấy</p>
                )}
              </div>
            )}
            {errors.major && <p className="text-xs text-red-500 mt-1">{errors.major}</p>}
          </div>

          {/* Ngày sinh */}
          <div>
            <label className="text-xs font-medium text-[#64748B] mb-1 block">Ngày sinh *</label>
            <input
              type="date"
              value={form.dob}
              onChange={(e) => handleChange('dob', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full border rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#2563EB] focus:border-transparent ${
                errors.dob ? 'border-red-500' : 'border-[#E2E8F0] dark:border-gray-600'
              }`}
            />
            {errors.dob && <p className="text-xs text-red-500 mt-1">{errors.dob}</p>}
          </div>
        </div>

        {/* Cột phải */}
        <div className="space-y-3">
          {/* Số điện thoại */}
          <div>
            <label className="text-xs font-medium text-[#64748B] mb-1 block">Số điện thoại *</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="0912345678"
              maxLength={10}
              className={`w-full border rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#2563EB] focus:border-transparent ${
                errors.phone ? 'border-red-500' : 'border-[#E2E8F0] dark:border-gray-600'
              }`}
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-medium text-[#64748B] mb-1 block">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="email@example.com"
              className={`w-full border rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#2563EB] focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-[#E2E8F0] dark:border-gray-600'
              }`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Upload ảnh */}
          <div>
            <label className="text-xs font-medium text-[#64748B] mb-1 block">Ảnh đại diện</label>
            <div className="border-2 border-dashed border-[#E2E8F0] dark:border-gray-600 rounded-lg p-3 text-center hover:border-[#2563EB] transition cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="admin-image-upload"
                disabled={uploading}
              />
              <label htmlFor="admin-image-upload" className={`block ${uploading ? 'cursor-wait' : 'cursor-pointer'}`}>
                {uploading ? (
                  <div className="py-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#2563EB] border-t-transparent mx-auto mb-1"></div>
                    <p className="text-xs text-[#2563EB]">Đang upload...</p>
                  </div>
                ) : form.image ? (
                  <div className="py-1">
                    <p className="text-xs text-[#16A34A] font-medium">✓ Đã upload</p>
                    <p className="text-xs text-[#64748B]">Click để thay đổi</p>
                  </div>
                ) : (
                  <div className="py-2">
                    <svg className="w-6 h-6 text-[#64748B] mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-xs text-[#64748B]">Click để chọn ảnh</p>
                  </div>
                )}
              </label>
            </div>
            {errors.image && <p className="text-xs text-red-500 mt-1">{errors.image}</p>}
          </div>

          {/* Preview ảnh */}
          <div className="h-24 rounded-lg border border-dashed border-[#E2E8F0] dark:border-gray-600 flex items-center justify-center overflow-hidden bg-[#F8FAFC] dark:bg-gray-700">
            {form.image ? (
              <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-[#64748B]">Preview ảnh</span>
            )}
          </div>
        </div>
      </div>

      {/* Mô tả */}
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
        disabled={!canSubmit || isLoading || uploading}
        className="mt-4 w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed bg-[#16A34A] hover:bg-green-700 text-white"
      >
        {isLoading ? 'Đang thêm...' : 'Thêm ứng viên'}
      </button>

      {/* Click outside to close dropdown */}
      {showMajorDropdown && (
        <div className="fixed inset-0 z-0" onClick={() => setShowMajorDropdown(false)} />
      )}
    </div>
  );
};

export default CandidateForm;
