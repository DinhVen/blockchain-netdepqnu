# 🔒 Security Policy

## Báo cáo lỗ hổng bảo mật

Nếu bạn phát hiện lỗ hổng bảo mật, vui lòng KHÔNG tạo public issue. 

Thay vào đó, liên hệ trực tiếp:
- Email: van4551050252@st.qnu.edu.vn
- Subject: [SECURITY] Mô tả ngắn gọn

## Các vấn đề bảo mật đã được xử lý

### ✅ Đã fix (2025-11-23)

1. **Credentials Exposure**
   - Thêm `.env` vào `.gitignore`
   - Tạo `.env.example` thay thế
   - Hướng dẫn rotate credentials

2. **Input Validation**
   - Sanitize tất cả user inputs
   - Validate email, MSSV, URLs
   - Rate limiting cho OTP

3. **XSS Prevention**
   - Sanitize candidate names, bios
   - Validate URLs trước khi render
   - Escape HTML characters

## Các vấn đề đang được theo dõi

### ⚠️ Known Issues

1. **Email-Wallet Linking**
   - Hiện tại: Email verify không liên kết với wallet address
   - Risk: Một email có thể dùng cho nhiều wallets
   - Mitigation: Cần implement whitelist on-chain
   - Priority: HIGH
   - Status: Planned

2. **OTP Storage**
   - Hiện tại: OTP lưu trong memory (Map)
   - Risk: Server restart = mất OTP
   - Mitigation: Dùng Redis hoặc database
   - Priority: MEDIUM
   - Status: Planned

3. **Session Management**
   - Hiện tại: Dùng localStorage
   - Risk: XSS có thể đánh cắp token
   - Mitigation: Implement httpOnly cookies
   - Priority: MEDIUM
   - Status: Planned

## Best Practices cho Developers

### Environment Variables
```bash
# ❌ KHÔNG BAO GIỜ commit .env
git add .env  # NEVER DO THIS!

# ✅ Luôn dùng .env.example
cp .env.example .env
# Sau đó điền values thật
```

### Smart Contract Interactions
```javascript
// ✅ Luôn validate trước khi gọi contract
if (!currentAccount) return;
if (!votingContract) return;

// ✅ Luôn có try-catch
try {
  const tx = await contract.method();
  await tx.wait();
} catch (error) {
  console.error(error);
  // Handle error
}
```

### User Input
```javascript
// ✅ Luôn sanitize
import { sanitizeText } from './utils/sanitize';
const safeName = sanitizeText(userInput);

// ✅ Luôn validate
if (!validateMSSV(mssv)) {
  return alert('MSSV không hợp lệ');
}
```

## Security Checklist cho Production

- [ ] Đã xóa .env khỏi git history
- [ ] Đã rotate tất cả credentials
- [ ] Đã set environment variables trên hosting
- [ ] Đã enable HTTPS
- [ ] Đã test rate limiting
- [ ] Đã test input validation
- [ ] Đã review smart contract permissions
- [ ] Đã backup private keys an toàn
- [ ] Đã setup monitoring/alerts
- [ ] Đã có incident response plan

## Liên hệ

- Email: van4551050252@st.qnu.edu.vn
- Phone: +84 963 207 146

---

**Lưu ý:** File này nên được cập nhật thường xuyên khi có security fixes mới.
