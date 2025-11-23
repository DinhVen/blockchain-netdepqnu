# 📝 Changelog - QNU Voting DApp

## [Unreleased] - 2025-11-23

### 🔒 Security
- **CRITICAL:** Thêm `.env` vào `.gitignore` để bảo vệ credentials
- Tạo `.env.example` làm template
- Sanitize user inputs để phòng chống XSS
- Validate URLs trước khi sử dụng

### ✨ Features
- Thêm mobile responsive menu với hamburger icon
- Thêm global loading overlay khi xử lý transactions
- Thêm confirmation dialogs cho các actions quan trọng:
  - Vote confirmation với thông tin ứng viên
  - Admin actions (thêm/xóa ứng viên, mở/đóng cổng)
  - Schedule updates với preview thời gian

### 🛡️ Validation & Error Handling
- **Email Gate:**
  - Rate limiting 60s giữa các lần gửi OTP
  - Validate email format (@st.qnu.edu.vn)
  - Validate OTP format (6 chữ số)
  - Better error messages

- **Admin Panel:**
  - Validate tên ứng viên (3-100 ký tự)
  - Validate MSSV format (8 chữ số)
  - Check duplicate MSSV với warning
  - Validate URL ảnh (http/https)
  - Giới hạn mô tả (500 ký tự)
  - Validate schedule logic (start < end)
  - Warning khi vote mở trước claim đóng

- **Voting:**
  - Better error messages với emoji
  - Confirmation trước khi vote
  - Hiển thị tên ứng viên trong confirmation

### 🎨 UI/UX Improvements
- Responsive navbar cho mobile
- Loading component với spinner
- Better button states (disabled, loading)
- Emoji trong alerts để dễ nhìn
- Countdown timer cho rate limiting

### 🔧 Code Quality
- Tạo utility functions cho sanitization
- Tách AppContent component để dùng Context
- Consistent error handling
- Better console logging

### 📚 Documentation
- Tạo `DEPLOYMENT.md` với hướng dẫn deploy an toàn
- Tạo `.env.example` với comments
- Tạo `CHANGELOG.md` này

### ⚠️ Breaking Changes
- KHÔNG CÓ - Tất cả changes đều backward compatible

### 🐛 Bug Fixes
- Fix mobile menu không hiển thị
- Fix loader component trống
- Fix missing validation trong forms

### 📝 Notes
- Web đang chạy KHÔNG bị ảnh hưởng
- Cần rotate EMAIL_PASS sau khi deploy
- Cần kiểm tra TOKEN_ADDRESS vs VOTING_ADDRESS

---

## [1.0.0] - Initial Release

### Features
- Email verification với OTP
- Wallet connection (MetaMask)
- Token claiming system
- Voting system
- Admin panel
- Schedule management
- Candidate management
