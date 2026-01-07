import { useState } from 'react';
import ContactForm from '../components/ContactForm';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'Làm thế nào để tham gia bầu chọn?',
      answer: 'Bạn cần: 1) Xác thực email sinh viên QNU, 2) Cài đặt và kết nối ví MetaMask, 3) Nhận 1 token QSV từ trang Claim, 4) Bỏ phiếu cho ứng viên yêu thích.',
    },
    {
      question: 'MetaMask là gì và làm sao cài đặt?',
      answer: 'MetaMask là ví điện tử để tương tác với blockchain. Tải extension tại metamask.io, tạo ví mới, sao lưu cụm từ khôi phục 12 từ an toàn. Sau đó kết nối với mạng Sepolia testnet.',
    },
    {
      question: 'Tôi có thể bỏ phiếu nhiều lần không?',
      answer: 'Không. Mỗi ví chỉ được nhận 1 token QSV và chỉ bỏ phiếu 1 lần duy nhất. Điều này được đảm bảo bởi smart contract trên blockchain.',
    },
    {
      question: 'Tại sao phải trả phí gas?',
      answer: 'Phí gas là chi phí để thực hiện giao dịch trên blockchain Ethereum. Bạn cần có một ít ETH trong ví để trả phí này. Có thể lấy ETH test miễn phí từ Sepolia faucet.',
    },
    {
      question: 'Làm sao biết phiếu bầu của tôi được ghi nhận?',
      answer: 'Sau khi bỏ phiếu thành công, bạn sẽ nhận được transaction hash. Có thể kiểm tra trên Etherscan (Sepolia) để xem chi tiết giao dịch. Kết quả cũng được cập nhật ngay trên trang Kết quả.',
    },
    {
      question: 'Email của tôi có bị lộ không?',
      answer: 'Không. Email chỉ dùng để xác thực bạn là sinh viên QNU. Hệ thống chỉ lưu hash của email, không lưu email gốc. Địa chỉ ví của bạn cũng được bảo mật.',
    },
    {
      question: 'Tôi quên mật khẩu ví MetaMask thì sao?',
      answer: 'Bạn có thể khôi phục ví bằng cụm từ 12 từ (seed phrase) đã sao lưu khi tạo ví. Nếu mất cụm từ này, không thể khôi phục ví. Vì vậy hãy lưu giữ cẩn thận!',
    },
    {
      question: 'Kết quả bầu chọn có thể bị giả mạo không?',
      answer: 'Không. Tất cả phiếu bầu được ghi trên blockchain Ethereum, công khai, minh bạch và không thể thay đổi. Bất kỳ ai cũng có thể kiểm tra tính chính xác.',
    },
    {
      question: 'Tôi gặp lỗi khi giao dịch, phải làm sao?',
      answer: 'Kiểm tra: 1) Đã kết nối đúng mạng Sepolia chưa, 2) Có đủ ETH để trả phí gas không, 3) Đã xác thực email chưa, 4) Thử refresh trang và kết nối lại ví. Nếu vẫn lỗi, liên hệ ban tổ chức.',
    },
    {
      question: 'Làm sao liên hệ hỗ trợ?',
      answer: 'Bạn có thể liên hệ qua: Email: van4551050252@st.qnu.edu.vn, Fanpage QNU, hoặc gặp trực tiếp ban tổ chức tại Đại học Quy Nhơn.',
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-teal-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>
      <div className="absolute top-20 right-10 w-96 h-96 bg-blue-400/10 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"></div>

      <div className="container mx-auto py-12 px-4 relative z-10 animate-fadeIn">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-5 py-2 rounded-full shadow-lg border border-blue-200/50 dark:border-blue-500/30 mb-4">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Trợ giúp</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
              Câu hỏi
              <span className="block bg-gradient-to-r from-blue-600 to-teal-600 dark:from-blue-400 dark:to-teal-400 bg-clip-text text-transparent">
                Thường gặp
              </span>
            </h2>

            <p className="text-lg text-gray-600 dark:text-gray-400">
              Tìm câu trả lời cho các thắc mắc của bạn
            </p>
          </div>

          {/* FAQ List */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-teal-500 rounded-3xl blur-2xl opacity-10"></div>
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/50">
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg"
                  >
                    <button
                      onClick={() => setOpenIndex(openIndex === index ? null : index)}
                      className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <span className="font-bold text-gray-900 dark:text-white pr-4">{faq.question}</span>
                      <svg
                        className={`w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 transition-transform duration-300 ${
                          openIndex === index ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openIndex === index && (
                      <div className="px-6 pb-6 text-gray-600 dark:text-gray-400 animate-slideDown">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="mt-12">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
