# 🗳️ QNU Voting DApp - Hệ thống bầu cử phi tập trung

Hệ thống bầu cử trực tuyến sử dụng Blockchain (Ethereum) cho bầu cử hội sinh viên trường Đại học Quy Nhơn.

## ✨ Tính năng chính

- 🔐 **Xác thực ví MetaMask** - Kết nối an toàn với ví Ethereum
- 📧 **Xác thực Email OTP** - Ngăn chặn gian lận bằng email sinh viên
- 🗳️ **Bỏ phiếu on-chain** - Mỗi ví chỉ được vote 1 lần
- 👥 **Quản lý ứng viên** - Đăng ký, duyệt, và hiển thị ứng viên
- 📊 **Dashboard Admin** - Quản lý cuộc bầu cử, thống kê, phát hiện gian lận
- 🌓 **Dark Mode** - Giao diện tối/sáng
- 📱 **Responsive** - Tương thích mọi thiết bị

## 🛠️ Tech Stack

### Frontend
- **React** + **Vite** - Framework và build tool
- **TailwindCSS** - Styling
- **Ethers.js** - Tương tác với Ethereum
- **React Router** - Điều hướng

### Backend
- **Node.js** + **Express** - API server cho OTP
- **MongoDB** - Lưu trữ email và phát hiện gian lận
- **Nodemailer** - Gửi email OTP

### Blockchain
- **Solidity** - Smart contract
- **Remix IDE** - Phát triển và deploy contract
- **Ethereum Testnet** - Mạng thử nghiệm

## 📋 Yêu cầu hệ thống

- **Node.js** >= 16.x
- **npm** hoặc **yarn**
- **MongoDB** (local hoặc cloud)
- **MetaMask** extension
- **Git**

## 🚀 Hướng dẫn cài đặt

### 1. Clone repository

```bash
git clone https://github.com/DinhVen/blockchain-netdepqnu.git
cd blockchain-netdepqnu
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình môi trường

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Chỉnh sửa file `.env`:

```env
# Email Configuration (Gmail)
EMAIL_USER=your-email@st.qnu.edu.vn
EMAIL_PASS=your-app-password

# Server
PORT=3001

# MongoDB
MONGO_URI=mongodb://localhost:27017/qnu_voting

# Admin API Key
ADMIN_API_KEY=your-secret-key-123

# Frontend API (sau khi deploy backend)
VITE_OTP_API=http://localhost:3001
VITE_ADMIN_API_KEY=your-secret-key-123
```

**Lưu ý:** 
- `EMAIL_PASS` là **App Password** của Gmail (không phải mật khẩu thường)
- Hướng dẫn tạo App Password: [Google Support](https://support.google.com/accounts/answer/185833)

### 4. Khởi động MongoDB

```bash
# Windows
mongod

# Linux/Mac
sudo systemctl start mongod
```

### 5. Deploy Smart Contract

1. Mở [Remix IDE](https://remix.ethereum.org)
2. Tạo file `Voting.sol` và paste code smart contract
3. Compile contract (Solidity 0.8.x)
4. Deploy lên testnet (Sepolia, Goerli...)
5. Copy **Contract Address** và **ABI**

### 6. Cấu hình Contract trong code

Mở file `src/context/Web3Context.jsx` và cập nhật:

```javascript
const CONTRACT_ADDRESS = "0xYourContractAddress";
const CONTRACT_ABI = [...]; // Paste ABI từ Remix
```

### 7. Chạy ứng dụng

**Terminal 1 - Backend (OTP Server):**
```bash
npm run otp-server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Truy cập: `http://localhost:5173`

## 📱 Sử dụng ứng dụng

### Cho Sinh viên

1. **Kết nối ví MetaMask** - Click "Kết nối ví"
2. **Nhận token bầu cử** - Vào trang "Claim", nhập email sinh viên, xác thực OTP
3. **Bỏ phiếu** - Vào trang "Voting", chọn ứng viên và vote
4. **Xem kết quả** - Trang "Dashboard" hiển thị kết quả real-time

### Cho Ứng viên

1. Kết nối ví MetaMask
2. Vào trang "Đăng ký ứng viên"
3. Điền thông tin và submit
4. Chờ admin duyệt

### Cho Admin

1. Kết nối bằng ví admin (địa chỉ deploy contract)
2. Vào trang "Admin"
3. Quản lý:
   - Duyệt/từ chối yêu cầu ứng viên
   - Mở/đóng claim và vote
   - Xem thống kê và phát hiện gian lận
   - Export kết quả (CSV/JSON)

## 🔧 Scripts

```bash
# Development
npm run dev              # Chạy frontend (port 5173)
npm run otp-server       # Chạy backend (port 3001)

# Production
npm run build            # Build frontend
npm run preview          # Preview production build
```

## 📁 Cấu trúc thư mục

```
qnu-voting-dapp/
├── src/
│   ├── components/      # React components
│   ├── context/         # Web3 context
│   ├── pages/           # Các trang chính
│   ├── utils/           # Utilities
│   └── App.jsx          # Main app
├── public/              # Static assets
├── server.js            # Backend OTP server
├── .env                 # Environment variables
└── package.json
```

## 🔐 Bảo mật

- ✅ One-wallet-one-vote enforcement
- ✅ Email OTP verification
- ✅ Fraud detection system
- ✅ Admin-only functions
- ✅ Smart contract access control

## 🐛 Troubleshooting

### Lỗi kết nối MetaMask
- Kiểm tra đã cài MetaMask chưa
- Chuyển sang đúng network (testnet)
- Refresh trang và kết nối lại

### Lỗi OTP không gửi được
- Kiểm tra `EMAIL_USER` và `EMAIL_PASS` trong `.env`
- Đảm bảo đã bật "Less secure app access" hoặc dùng App Password
- Kiểm tra MongoDB đang chạy

### Lỗi contract
- Kiểm tra `CONTRACT_ADDRESS` và `CONTRACT_ABI` đúng chưa
- Đảm bảo contract đã deploy thành công
- Kiểm tra ví có đủ gas fee

## 📝 License

MIT License

## 👥 Contributors

- **Đinh Vẹn** - Developer

## 📞 Liên hệ

- GitHub: [@DinhVen](https://github.com/DinhVen)
- Email: your-email@st.qnu.edu.vn

---

⭐ Nếu thấy project hữu ích, hãy cho một star nhé!
