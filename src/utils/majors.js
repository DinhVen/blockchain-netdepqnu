// Danh sách ngành học QNU (Mã ngành - Tên ngành)
export const MAJORS = [
  { code: '7140114', name: 'Quản lý Giáo dục' },
  { code: '7140201', name: 'Giáo dục mầm non' },
  { code: '7140202', name: 'Giáo dục Tiểu học' },
  { code: '7140205', name: 'Giáo dục Chính trị' },
  { code: '7140206', name: 'Giáo dục Thể chất' },
  { code: '7140209', name: 'Sư phạm Toán học' },
  { code: '7140210', name: 'Sư phạm Tin học' },
  { code: '7140211', name: 'Sư phạm Vật lý' },
  { code: '7140212', name: 'Sư phạm Hóa học' },
  { code: '7140213', name: 'Sư phạm Sinh học' },
  { code: '7140217', name: 'Sư phạm Ngữ văn' },
  { code: '7140218', name: 'Sư phạm Lịch sử' },
  { code: '7140219', name: 'Sư phạm Địa lý' },
  { code: '7140221', name: 'Sư phạm Âm nhạc' },
  { code: '7140222', name: 'Sư phạm Mỹ thuật' },
  { code: '7140204', name: 'Sư phạm Lịch sử - Địa lý' },
  { code: '7220201', name: 'Ngôn ngữ Anh' },
  { code: '7220204', name: 'Ngôn ngữ Trung Quốc' },
  { code: '7229030', name: 'Văn học' },
  { code: '7229010', name: 'Lịch sử' },
  { code: '7310501', name: 'Địa lý học' },
  { code: '7310101', name: 'Kinh tế' },
  { code: '7340101', name: 'Quản trị kinh doanh' },
  { code: '7340121', name: 'Kinh doanh thương mại' },
  { code: '7340115', name: 'Marketing' },
  { code: '7340201', name: 'Tài chính - Ngân hàng' },
  { code: '7340301', name: 'Kế toán' },
  { code: '7340301-ACCA', name: 'Kế toán (chương trình định hướng ACCA)' },
  { code: '7340302', name: 'Kiểm toán' },
  { code: '7380101', name: 'Luật' },
  { code: '7440112', name: 'Hóa học (Hóa dược, Hóa mỹ phẩm)' },
  { code: '7460108', name: 'Khoa học dữ liệu' },
  { code: '7460112', name: 'Toán ứng dụng' },
  { code: '7480103', name: 'Kỹ thuật phần mềm' },
  { code: '7480201', name: 'Công nghệ thông tin (An toàn, an ninh mạng)' },
  { code: '7480207', name: 'Trí tuệ nhân tạo' },
  { code: '7510205', name: 'Công nghệ kỹ thuật ô tô' },
  { code: '7510401', name: 'Công nghệ kỹ thuật hóa học' },
  { code: '7510605', name: 'Logistics và quản lý chuỗi cung ứng' },
  { code: '7520116', name: 'Kỹ thuật cơ khí động lực' },
  { code: '7520201', name: 'Kỹ thuật điện' },
  { code: '7520207', name: 'Kỹ thuật điện tử - viễn thông (chuyên ngành Thiết kế vi mạch)' },
  { code: '7520216', name: 'Kỹ thuật điều khiển và Tự động hóa' },
  { code: '7520401', name: 'Vật lý kỹ thuật (chuyên ngành Công nghệ gia công, đóng gói và kiểm thử vi mạch)' },
  { code: '7540101', name: 'Công nghệ thực phẩm' },
  { code: '7580201', name: 'Kỹ thuật xây dựng' },
  { code: '7620109', name: 'Nông học' },
  { code: '7760101', name: 'Công tác xã hội' },
  { code: '7810103', name: 'Quản trị dịch vụ du lịch và lữ hành' },
  { code: '7810201', name: 'Quản trị khách sạn' },
  { code: '7850101', name: 'Quản lý tài nguyên và môi trường' },
];

// Chỉ lấy tên ngành (dùng cho dropdown)
export const MAJOR_NAMES = MAJORS.map(m => m.name);

// Tìm ngành theo tên hoặc mã
export const findMajor = (query) => {
  const q = query.toLowerCase();
  return MAJORS.find(m => 
    m.name.toLowerCase().includes(q) || 
    m.code.toLowerCase().includes(q)
  );
};
