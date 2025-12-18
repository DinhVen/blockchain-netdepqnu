import { useState } from 'react';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    hoTen: '',
    email: '',
    sdt: '',
    lop: '',
    mssv: '',
    gopY: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validate MSSV (only numbers, max 10 digits)
    if (name === 'mssv') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, [name]: numericValue });
      return;
    }
    
    // Validate phone (only numbers)
    if (name === 'sdt') {
      const numericValue = value.replace(/\D/g, '');
      setFormData({ ...formData, [name]: numericValue });
      return;
    }
    
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // TODO: Send to backend API
      // For now, just show success message
      
      // Show success message
      setSubmitStatus('success');
      
      // Reset form
      setFormData({
        hoTen: '',
        email: '',
        sdt: '',
        lop: '',
        mssv: '',
        gopY: '',
      });
    } catch (error) {
      console.error('Error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-3xl"></div>
      <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/50 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white">Liên hệ & Góp ý</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Chúng tôi luôn lắng nghe ý kiến của bạn
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Họ tên */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="hoTen"
                value={formData.hoTen}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                placeholder="Nguyễn Văn A"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                placeholder="example@qnu.edu.vn"
              />
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="sdt"
                value={formData.sdt}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                placeholder="0123456789"
              />
            </div>

            {/* Lớp */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Lớp <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lop"
                value={formData.lop}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                placeholder="CNTT K45"
              />
            </div>
          </div>

          {/* MSSV */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Mã số sinh viên (10 số) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="mssv"
              value={formData.mssv}
              onChange={handleChange}
              required
              maxLength={10}
              pattern="[0-9]{10}"
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
              placeholder="1234567890"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.mssv.length}/10 số
            </p>
          </div>

          {/* Góp ý */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Nội dung góp ý <span className="text-red-500">*</span>
            </label>
            <textarea
              name="gopY"
              value={formData.gopY}
              onChange={handleChange}
              required
              rows={6}
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-gray-900 dark:text-white"
              placeholder="Nhập nội dung góp ý của bạn..."
            />
          </div>

          {/* Submit Status */}
          {submitStatus === 'success' && (
            <div className="bg-green-100 dark:bg-green-900/30 border border-green-500 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Gửi góp ý thành công! Cảm ơn bạn đã đóng góp.
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-500 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Có lỗi xảy ra. Vui lòng thử lại sau.
            </div>
          )}

          {/* Submit Button */}
          <style>{`
            .send-button {
              font-family: inherit;
              font-size: 18px;
              background: linear-gradient(to bottom, #4dc7d9 0%, #66a6ff 100%);
              color: white;
              padding: 0.8em 1.2em;
              display: flex;
              align-items: center;
              justify-content: center;
              border: none;
              border-radius: 25px;
              box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.2);
              transition: all 0.3s;
              width: 100%;
              cursor: pointer;
            }

            .send-button:hover:not(:disabled) {
              transform: translateY(-3px);
              box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.3);
            }

            .send-button:active:not(:disabled) {
              transform: scale(0.95);
              box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
            }

            .send-button:disabled {
              opacity: 0.6;
              cursor: not-allowed;
            }

            .send-button span {
              display: block;
              margin-left: 0.4em;
              transition: all 0.3s;
            }

            .send-button svg {
              width: 18px;
              height: 18px;
              fill: white;
              transition: all 0.3s;
              transform: rotate(-45deg);
            }

            .send-button .svg-wrapper {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 30px;
              height: 30px;
              border-radius: 50%;
              background-color: rgba(255, 255, 255, 0.2);
              margin-right: 0.5em;
              transition: all 0.3s;
            }

            .send-button:hover:not(:disabled) .svg-wrapper {
              background-color: rgba(255, 255, 255, 0.5);
            }

            .send-button:hover:not(:disabled) svg {
              transform: rotate(0deg);
            }
          `}</style>

          <button
            type="submit"
            disabled={isSubmitting}
            className="send-button"
          >
            {isSubmitting ? (
              <>
                <div className="svg-wrapper">
                  <svg className="animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <span>Đang gửi...</span>
              </>
            ) : (
              <>
                <div className="svg-wrapper">
                  <svg viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </div>
                <span>Gửi góp ý</span>
              </>
            )}
          </button>
        </form>

        {/* Contact Info */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="grid md:grid-cols-2 gap-4">
            <a
              href="mailto:contact@qnu.edu.vn"
              className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <div className="p-2 bg-blue-500 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Email hỗ trợ</p>
                <p className="font-bold text-gray-900 dark:text-white">van4551050252@st.qnu.edu.vn</p>
              </div>
            </a>

            <a
              href="tel:+84123456789"
              className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <div className="p-2 bg-green-500 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Hotline</p>
                <p className="font-bold text-gray-900 dark:text-white">+84 963 207 146</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
