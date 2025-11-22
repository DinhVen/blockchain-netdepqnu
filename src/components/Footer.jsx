import { MapPin, Mail, Phone, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-auto text-white">
      <div
        className="bg-[#06457a]"
        style={{
          backgroundImage: "url('/assets/footer-line.png'), url('/assets/footer-pattern.png')",
          backgroundRepeat: 'no-repeat, repeat',
          backgroundSize: '100% 50px, contain',
          backgroundPosition: 'top center, center',
        }}
      >
        
        <div className="container mx-auto px-6 pt-24 pb-14 grid gap-10 lg:grid-cols-4 text-sm items-start">
          <div className="flex flex-col items-center text-center gap-4">
          </div>

          <div className="space-y-3 lg:col-span-1">
            <p className="font-semibold text-lg">Thông tin liên hệ</p>
            <div className="flex items-center gap-2 text-white/90">
              <MapPin size={18} />
              <span>Quy Nhơn Tây, Gia Lai</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <Mail size={18} />
              <span>van4551050252@st.qnu.edu.vn</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <Phone size={18} />
              <span>+84 963 207 146</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-lg">Giới Thiệu</p>
            <ul className="space-y-1 text-white/85">
            <li>Về QNU - Nét Đẹp Sinh Viên</li>
              <li>Quy trình bình chọn</li>
              <li>Tính minh bạch & Blockchain</li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-lg">Liên kết</p>
            <ul className="space-y-1 text-white/85">
              <li>Bộ GD &amp; ĐT</li>
              <li>Trang chủ QNU</li>
              <li>Fanpage Đoàn – Hội</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="bg-[#045a97] text-center text-sm py-3 font-medium">
        © 2025 Đại học Quy Nhơn · Quy Nhơn University
      </div>
    </footer>
  );
};

export default Footer;
