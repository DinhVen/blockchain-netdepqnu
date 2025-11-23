# 🚀 Hướng dẫn Deploy An toàn

## ⚠️ QUAN TRỌNG: Trước khi deploy

### 1. Bảo mật Credentials

**NGAY LẬP TỨC:**
```bash
# Xóa .env khỏi git history (nếu đã commit)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Hoặc dùng git-filter-repo (khuyến nghị)
git filter-repo --path .env --invert-paths

# Force push (cẩn thận!)
git push origin --force --all
```

**Tạo App Password mới cho Gmail:**
1. Vào https://myaccount.google.com/security
2. Bật 2-Step Verification
3. Tạo App Password mới
4. Cập nhật vào Vercel Environment Variables

### 2. Cấu hình Vercel Environment Variables

**Frontend (Vercel Project Settings):**
```
VITE_OTP_API=https://your-backend-url.vercel.app
```

**Backend (Vercel Project Settings hoặc deploy riêng):**
```
EMAIL_USER=van4551050252@st.qnu.edu.vn
EMAIL_PASS=your-new-app-password-here
PORT=3001
NODE_ENV=production
```

### 3. Deploy Backend (OTP Server)

**Option A: Deploy cùng Vercel (Serverless)**
```bash
# Tạo vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

**Option B: Deploy riêng (Railway, Render, Heroku)**
- Tạo project mới
- Connect GitHub repo
- Set environment variables
- Deploy

### 4. Cập nhật Smart Contract Addresses

**Kiểm tra lại trong `src/utils/constants.js`:**
```javascript
export const TOKEN_ADDRESS = "0x..."; // Địa chỉ Token contract
export const VOTING_ADDRESS = "0x..."; // Địa chỉ Voting contract
```

⚠️ **Lưu ý:** Hai địa chỉ này PHẢI KHÁC NHAU nếu deploy 2 contract riêng!

### 5. Test trước khi deploy Production

```bash
# Build local
npm run build

# Preview build
npm run preview

# Test các chức năng:
# ✅ Email OTP
# ✅ Wallet connect
# ✅ Claim token
# ✅ Vote
# ✅ Admin panel
```

## 📋 Checklist Deploy

- [ ] Đã xóa .env khỏi git history
- [ ] Đã tạo App Password mới
- [ ] Đã set Environment Variables trên Vercel
- [ ] Đã deploy Backend và có URL
- [ ] Đã cập nhật VITE_OTP_API
- [ ] Đã kiểm tra TOKEN_ADDRESS và VOTING_ADDRESS
- [ ] Đã test build local
- [ ] Đã test trên Sepolia testnet
- [ ] Đã thông báo cho users về thời gian bảo trì (nếu có)

## 🔄 Deploy Commands

```bash
# Deploy Frontend
git add .
git commit -m "fix: improve security and validation"
git push origin main

# Vercel sẽ tự động deploy
```

## 🐛 Troubleshooting

**Lỗi OTP không gửi được:**
- Kiểm tra EMAIL_PASS có đúng không
- Kiểm tra VITE_OTP_API có đúng URL backend không
- Kiểm tra CORS settings

**Lỗi Contract:**
- Kiểm tra địa chỉ contract
- Kiểm tra network (Sepolia)
- Kiểm tra ABI có khớp với contract không

**Lỗi Build:**
- Xóa node_modules và npm install lại
- Clear cache: `npm run build -- --force`

## 📞 Support

Nếu gặp vấn đề, liên hệ:
- Email: van4551050252@st.qnu.edu.vn
- Phone: +84 963 207 146
