import { useContext, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Web3Context } from '../context/Web3Context';
import PageHeader from '../components/ui/PageHeader';
import StatusChips from '../components/ui/StatusChips';
import { MAJOR_NAMES } from '../utils/majors';

const API_BASE = import.meta.env.VITE_OTP_API || 'https://voting-b431.onrender.com';
const CLOUDINARY_UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

const CandidateSignup = () => {
  const { currentAccount, saleActive, voteOpen } = useContext(Web3Context);
  
  const [formData, setFormData] = useState({
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
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const recaptchaRef = useRef(null);
  const recaptchaWidgetId = useRef(null);
  
  // Load and render reCAPTCHA
  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) {
      console.log('No reCAPTCHA site key');
      return;
    }

    let retryCount = 0;
    const maxRetries = 20;

    const renderWidget = () => {
      if (recaptchaWidgetId.current !== null) return;
      
      // Wait for ref to be ready
      if (!recaptchaRef.current) {
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(renderWidget, 100);
        }
        return;
      }
      
      try {
        recaptchaWidgetId.current = window.grecaptcha.render(recaptchaRef.current, {
          sitekey: RECAPTCHA_SITE_KEY,
          callback: (token) => {
            console.log('reCAPTCHA verified');
            setRecaptchaToken(token);
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expired');
            setRecaptchaToken('');
          },
        });
        console.log('reCAPTCHA rendered, widgetId:', recaptchaWidgetId.current);
      } catch (err) {
        console.error('reCAPTCHA render error:', err);
      }
    };

    // If grecaptcha already loaded
    if (window.grecaptcha && window.grecaptcha.render) {
      window.grecaptcha.ready(renderWidget);
      return;
    }

    // Load script with callback
    window.onRecaptchaLoad = () => {
      console.log('reCAPTCHA script loaded');
      window.grecaptcha.ready(renderWidget);
    };

    const existingScript = document.querySelector('script[src*="recaptcha/api.js"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    return () => {
      delete window.onRecaptchaLoad;
    };
  }, []);
  
  // Registration status
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [existingRegistration, setExistingRegistration] = useState(null);
  
  // Major dropdown
  const [majorSearch, setMajorSearch] = useState('');
  const [showMajorDropdown, setShowMajorDropdown] = useState(false);

  // Check existing registration on wallet connect
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      if (!currentAccount) {
        setCheckingStatus(false);
        setExistingRegistration(null);
        return;
      }

      setCheckingStatus(true);
      try {
        const res = await fetch(`${API_BASE}/registrations/status?wallet=${currentAccount}`);
        const data = await res.json();
        
        if (data.ok && data.registered) {
          setExistingRegistration(data.data);
        } else {
          setExistingRegistration(null);
        }
      } catch (e) {
        console.warn('Check registration status error:', e);
      }
      setCheckingStatus(false);
    };

    checkRegistrationStatus();
  }, [currentAccount]);

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

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 3) {
      newErrors.name = 'Họ tên phải từ 3 ký tự trở lên';
    }

    if (!/^\d{10}$/.test(formData.mssv.trim())) {
      newErrors.mssv = 'MSSV phải là 10 chữ số';
    }

    if (!formData.major.trim()) {
      newErrors.major = 'Vui lòng chọn ngành/khoa';
    }

    if (!formData.dob) {
      newErrors.dob = 'Vui lòng nhập ngày sinh';
    } else {
      const dobDate = new Date(formData.dob);
      const today = new Date();
      if (dobDate > today) {
        newErrors.dob = 'Ngày sinh không được vượt quá hôm nay';
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(formData.phone.trim())) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (formData.bio.length > 500) {
      newErrors.bio = 'Mô tả không được vượt quá 500 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentAccount) {
      alert('Vui lòng kết nối ví trước khi đăng ký');
      return;
    }

    if (!validateForm()) return;

    // Check reCAPTCHA nếu đã config
    if (RECAPTCHA_SITE_KEY && !recaptchaToken) {
      alert('Vui lòng xác nhận reCAPTCHA');
      return;
    }

    const confirmed = window.confirm(
      `XÁC NHẬN ĐĂNG KÝ ỨNG VIÊN\n\nTên: ${formData.name}\nMSSV: ${formData.mssv}\nNgành: ${formData.major}\n\nBạn có chắc chắn muốn đăng ký?`
    );
    if (!confirmed) return;

    setIsLoading(true);
    try {
      const verifiedEmail = localStorage.getItem('qnu-email-verified');
      
      const res = await fetch(`${API_BASE}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: currentAccount,
          email: verifiedEmail || formData.email,
          name: formData.name.trim(),
          mssv: formData.mssv.trim(),
          major: formData.major.trim(),
          dob: formData.dob,
          phone: formData.phone.trim(),
          image: formData.image,
          bio: formData.bio.trim(),
          recaptchaToken: recaptchaToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Đăng ký thất bại');
      }

      setExistingRegistration(data.data);
      setFormData({ name: '', mssv: '', major: '', dob: '', phone: '', email: '', image: '', bio: '' });
      setRecaptchaToken('');
      // Reset reCAPTCHA widget
      if (window.grecaptcha && recaptchaWidgetId.current !== null) {
        try { window.grecaptcha.reset(recaptchaWidgetId.current); } catch (e) { console.warn('Reset reCAPTCHA:', e); }
      }
    } catch (e) {
      alert(e.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      console.error('Signup error:', e);
      // Reset reCAPTCHA on error
      setRecaptchaToken('');
      if (window.grecaptcha && recaptchaWidgetId.current !== null) {
        try { window.grecaptcha.reset(recaptchaWidgetId.current); } catch (e2) { console.warn('Reset reCAPTCHA:', e2); }
      }
    }
    setIsLoading(false);
  };

  const filteredMajors = MAJOR_NAMES.filter((m) =>
    m.toLowerCase().includes(majorSearch.toLowerCase())
  );

  const statusChips = [
    { label: 'Sale', value: saleActive ? 'ON' : 'OFF', status: saleActive ? 'success' : 'neutral' },
    { label: 'Vote', value: voteOpen ? 'ON' : 'OFF', status: voteOpen ? 'success' : 'neutral' },
    { label: 'Ví', value: currentAccount ? 'Đã kết nối' : 'Chưa kết nối', status: currentAccount ? 'success' : 'warning' },
  ];

  const conditions = [
    { label: 'Kết nối ví MetaMask', done: !!currentAccount },
    { label: 'Điền đầy đủ thông tin bắt buộc', done: formData.name && formData.mssv && formData.major && formData.dob && formData.phone && formData.email },
    { label: 'MSSV đúng định dạng (10 số)', done: /^\d{10}$/.test(formData.mssv) },
  ];

  // Loading state
  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] pt-20 pb-10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#2563EB] border-t-transparent mx-auto mb-4"></div>
          <p className="text-[#64748B]">Đang kiểm tra trạng thái đăng ký...</p>
        </div>
      </div>
    );
  }

  // Show registration status if already registered
  if (existingRegistration) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] pt-20 pb-10">
        <div className="container mx-auto px-4">
          <PageHeader title="Đăng ký Ứng viên" subtitle="Trạng thái đăng ký của bạn">
            <StatusChips items={statusChips} />
          </PageHeader>

          <div className="max-w-lg mx-auto">
            <RegistrationStatusCard registration={existingRegistration} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] pt-20 pb-10">
      <div className="container mx-auto px-4">
        <PageHeader title="Đăng ký Ứng viên" subtitle="Tham gia cuộc thi QNU - Nét Đẹp Sinh Viên 2026">
          <StatusChips items={statusChips} />
        </PageHeader>

        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Sidebar */}
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

              {/* Lưu ý */}
              <div className="bg-[#14B8A6]/10 border border-[#14B8A6]/20 rounded-xl p-4">
                <p className="text-sm text-[#0F172A] dark:text-white font-semibold mb-2">Lưu ý</p>
                <ul className="text-xs text-[#64748B] space-y-1">
                  <li>• Thông tin sẽ được lưu off-chain</li>
                  <li>• Admin sẽ xem xét và phê duyệt</li>
                  <li>• Sau khi duyệt, bạn sẽ xuất hiện trong danh sách bầu chọn</li>
                </ul>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-[#E2E8F0] dark:border-gray-700 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Row 1: Name */}
                  <div>
                    <label className="block text-sm font-semibold text-[#0F172A] dark:text-white mb-2">
                      Họ và tên <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-800 text-[#0F172A] dark:text-white focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition ${errors.name ? 'border-red-500' : 'border-[#E2E8F0] dark:border-gray-600'}`}
                      placeholder="Nguyễn Văn A"
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>

                  {/* Row 2: MSSV & Major */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#0F172A] dark:text-white mb-2">
                        MSSV <span className="text-[#DC2626]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.mssv}
                        onChange={(e) => handleChange('mssv', e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-800 text-[#0F172A] dark:text-white focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition ${errors.mssv ? 'border-red-500' : 'border-[#E2E8F0] dark:border-gray-600'}`}
                        placeholder="1234567890"
                      />
                      <p className="text-xs text-[#64748B] mt-1">{formData.mssv.length}/10 số</p>
                      {errors.mssv && <p className="text-xs text-red-500 mt-1">{errors.mssv}</p>}
                    </div>
                    
                    {/* Major Dropdown */}
                    <div className="relative">
                      <label className="block text-sm font-semibold text-[#0F172A] dark:text-white mb-2">
                        Ngành/Khoa <span className="text-[#DC2626]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.major || majorSearch}
                          onChange={(e) => {
                            setMajorSearch(e.target.value);
                            handleChange('major', '');
                            setShowMajorDropdown(true);
                          }}
                          onFocus={() => setShowMajorDropdown(true)}
                          placeholder="Tìm hoặc chọn ngành..."
                          className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-800 text-[#0F172A] dark:text-white focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition pr-10 ${errors.major ? 'border-red-500' : 'border-[#E2E8F0] dark:border-gray-600'}`}
                        />
                        <svg className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      {showMajorDropdown && (
                        <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-700 border border-[#E2E8F0] dark:border-gray-600 rounded-xl shadow-lg max-h-48 overflow-y-auto">
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
                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#2563EB]/10 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                              >
                                {m}
                              </button>
                            ))
                          ) : (
                            <p className="px-4 py-3 text-sm text-gray-500">Không tìm thấy ngành</p>
                          )}
                        </div>
                      )}
                      {errors.major && <p className="text-xs text-red-500 mt-1">{errors.major}</p>}
                    </div>
                  </div>

                  {/* Row 3: DOB & Phone */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#0F172A] dark:text-white mb-2">
                        Ngày sinh <span className="text-[#DC2626]">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.dob}
                        onChange={(e) => handleChange('dob', e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-800 text-[#0F172A] dark:text-white focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition ${errors.dob ? 'border-red-500' : 'border-[#E2E8F0] dark:border-gray-600'}`}
                      />
                      {errors.dob && <p className="text-xs text-red-500 mt-1">{errors.dob}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0F172A] dark:text-white mb-2">
                        Số điện thoại <span className="text-[#DC2626]">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-800 text-[#0F172A] dark:text-white focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition ${errors.phone ? 'border-red-500' : 'border-[#E2E8F0] dark:border-gray-600'}`}
                        placeholder="0912345678"
                      />
                      {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                    </div>
                  </div>

                  {/* Row 4: Email */}
                  <div>
                    <label className="block text-sm font-semibold text-[#0F172A] dark:text-white mb-2">
                      Email <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-800 text-[#0F172A] dark:text-white focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition ${errors.email ? 'border-red-500' : 'border-[#E2E8F0] dark:border-gray-600'}`}
                      placeholder="email@example.com"
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
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
                              alert('Kích thước ảnh không được vượt quá 5MB');
                              return;
                            }
                            setUploading(true);
                            try {
                              const imageUrl = await uploadToCloudinary(file);
                              handleChange('image', imageUrl);
                            } catch (err) {
                              alert(err.message || 'Upload ảnh thất bại');
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
                      onChange={(e) => handleChange('bio', e.target.value)}
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

                  {/* reCAPTCHA */}
                  {RECAPTCHA_SITE_KEY && (
                    <div className="flex justify-center">
                      <div ref={recaptchaRef}></div>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={!currentAccount || isLoading || (RECAPTCHA_SITE_KEY && !recaptchaToken)}
                    className="w-full py-4 bg-[#2563EB] hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-bold transition shadow-lg shadow-[#2563EB]/25 disabled:shadow-none flex items-center justify-center gap-2"
                  >
                    {isLoading && <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>}
                    {!currentAccount ? 'Vui lòng kết nối ví' : isLoading ? 'Đang gửi...' : 'Đăng ký ứng viên'}
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

      {/* Click outside to close dropdown */}
      {showMajorDropdown && (
        <div className="fixed inset-0 z-10" onClick={() => setShowMajorDropdown(false)} />
      )}
    </div>
  );
};

// Component hiển thị trạng thái đăng ký
const RegistrationStatusCard = ({ registration }) => {
  const statusConfig = {
    pending: {
      title: 'Đang chờ duyệt',
      color: 'text-[#F59E0B]',
      bg: 'bg-[#F59E0B]/10',
      border: 'border-[#F59E0B]/20',
      description: 'Yêu cầu đăng ký của bạn đang được admin xem xét.',
    },
    approved: {
      title: 'Đã được duyệt',
      color: 'text-[#16A34A]',
      bg: 'bg-[#16A34A]/10',
      border: 'border-[#16A34A]/20',
      description: 'Chúc mừng! Bạn đã trở thành ứng viên chính thức.',
    },
    rejected: {
      title: 'Bị từ chối',
      color: 'text-[#DC2626]',
      bg: 'bg-[#DC2626]/10',
      border: 'border-[#DC2626]/20',
      description: 'Yêu cầu đăng ký của bạn đã bị từ chối.',
    },
  };

  const config = statusConfig[registration.status] || statusConfig.pending;

  return (
    <div className={`${config.bg} border ${config.border} rounded-2xl p-6`}>
      <div className="text-center mb-6">
        <span className="text-5xl">{config.icon}</span>
        <h2 className={`text-2xl font-bold ${config.color} mt-4`}>{config.title}</h2>
        <p className="text-[#64748B] mt-2">{config.description}</p>
      </div>

      <div className="bg-white dark:bg-[#111827] rounded-xl p-4 space-y-3">
        {registration.image && (
          <div className="flex justify-center mb-4">
            <img src={registration.image} alt={registration.name} className="w-24 h-24 rounded-xl object-cover" />
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[#64748B]">Họ tên</p>
            <p className="font-semibold text-[#0F172A] dark:text-white">{registration.name}</p>
          </div>
          <div>
            <p className="text-[#64748B]">MSSV</p>
            <p className="font-semibold text-[#0F172A] dark:text-white">{registration.mssv}</p>
          </div>
          <div className="col-span-2">
            <p className="text-[#64748B]">Ngành</p>
            <p className="font-semibold text-[#0F172A] dark:text-white">{registration.major}</p>
          </div>
          <div className="col-span-2">
            <p className="text-[#64748B]">Ngày đăng ký</p>
            <p className="font-semibold text-[#0F172A] dark:text-white">
              {new Date(registration.createdAt).toLocaleDateString('vi-VN', { 
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
              })}
            </p>
          </div>
        </div>

        {registration.status === 'rejected' && registration.rejectReason && (
          <div className="mt-4 p-3 bg-[#DC2626]/10 rounded-lg">
            <p className="text-sm text-[#DC2626]">
              <span className="font-semibold">Lý do:</span> {registration.rejectReason}
            </p>
          </div>
        )}

        {registration.status === 'approved' && registration.contractId && (
          <div className="mt-4 p-3 bg-[#16A34A]/10 rounded-lg">
            <p className="text-sm text-[#16A34A]">
              <span className="font-semibold">ID ứng viên:</span> #{registration.contractId}
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <Link to="/voting" className="flex-1 px-4 py-3 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl font-semibold transition text-center">
          Xem danh sách ứng viên
        </Link>
      </div>
    </div>
  );
};

export default CandidateSignup;
