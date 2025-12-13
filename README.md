#  QNU Voting DApp - Hệ thống bầu cử phi tập trung

Hệ thống bầu cử trực tuyến sử dụng Blockchain (Ethereum) cho bầu cử hội sinh viên trường Đại học Quy Nhơn.

## ✨ Tính năng chính

- **Xác thực ví MetaMask** - Kết nối an toàn với ví Ethereum
- **Xác thực Email OTP** - Ngăn chặn gian lận bằng email sinh viên
- **Bỏ phiếu on-chain** - Mỗi ví chỉ được vote 1 lần
- **Quản lý ứng viên** - Đăng ký, duyệt, và hiển thị ứng viên
- **Dashboard Admin** - Quản lý cuộc bầu cử, thống kê, phát hiện gian lận
- **Dark Mode** - Giao diện tối/sáng
- **Responsive** - Tương thích mọi thiết bị

## Tech Stack

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

### Bước 1: Clone repository và cài đặt dependencies

```bash
git clone https://github.com/DinhVen/blockchain-netdepqnu.git
cd blockchain-netdepqnu
npm install
```

### Bước 2: Tạo và cấu hình file .env

Tạo file `.env` từ file mẫu:

```bash
cp .env.example .env
```

Mở file `.env` và điền đầy đủ các thông tin sau:

#### 2.1. Email Configuration (để gửi OTP)

```env
EMAIL_USER=email-cua-ban@st.qnu.edu.vn
EMAIL_PASS=app-password-cua-ban
```

**Cách lấy App Password Gmail:**
1. Vào [Google Account](https://myaccount.google.com/)
2. Security → 2-Step Verification (bật nếu chưa có)
3. App passwords → Tạo mật khẩu ứng dụng mới
4. Copy mật khẩu 16 ký tự và paste vào `EMAIL_PASS`

**Lưu ý:** `EMAIL_PASS` là **App Password** (16 ký tự), KHÔNG phải mật khẩu Gmail thường

#### 2.2. Server Port

```env
PORT=3001
```

#### 2.3. MongoDB Configuration

**Option 1 - MongoDB Local:**
```env
MONGO_URI=mongodb://localhost:27017/qnu_voting
```

**Option 2 - MongoDB Atlas (Cloud - Khuyên dùng):**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/qnu_voting
```

**Cách tạo MongoDB Atlas:**
1. Đăng ký free tại [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Tạo cluster mới (chọn Free tier)
3. Tạo Database User (username + password)
4. Whitelist IP: 0.0.0.0/0 (cho phép mọi IP)
5. Copy Connection String và thay username/password

#### 2.4. Admin API Key

```env
ADMIN_API_KEY=dat-mat-khau-manh-o-day-123456
```

**Lưu ý:** Tự đặt một chuỗi bí mật mạnh, dùng để bảo vệ API admin

#### 2.5. Backend URL

**Khi chạy local:**
```env
VITE_OTP_API=http://localhost:3001
```

**Khi deploy lên Vercel/Render:**
```env
VITE_OTP_API=https://ten-backend-cua-ban.vercel.app
```

#### 2.6. Cloudinary Configuration (Upload ảnh ứng viên)

```env
VITE_UPLOAD_URL=https://api.cloudinary.com/v1_1/TEN_CLOUD_NAME/image/upload
VITE_CLOUDINARY_UPLOAD_PRESET=ten_preset
VITE_CLOUDINARY_CLOUD_NAME=TEN_CLOUD_NAME
```

**Cách setup Cloudinary:**
1. Đăng ký free tại [Cloudinary](https://cloudinary.com)
2. Vào Dashboard → Copy **Cloud Name**
3. Vào Settings → Upload → Upload presets
4. Tạo preset mới với mode **Unsigned**
5. Copy tên preset

### Bước 3: Cấu hình Smart Contract

Mở file `src/utils/constants.js` và thay đổi địa chỉ contract:

```javascript
export const TOKEN_ADDRESS = "0xDIA_CHI_CONTRACT_CUA_BAN";
export const VOTING_ADDRESS = "0xDIA_CHI_CONTRACT_CUA_BAN";
export const SEPOLIA_CHAIN_ID = 11155111; // Sepolia testnet
```

**Nếu chưa có contract:**
1. Mở [Remix IDE](https://remix.ethereum.org)
2. Tạo file `Voting.sol` và paste code smart contract
3. Compile contract (Solidity 0.8.x)
4. Deploy lên Sepolia testnet
5. Copy **Contract Address** và cập nhật vào file trên

**Lưu ý:** Địa chỉ ví deploy contract tự động là admin đầu tiên

### Bước 4: Cấu hình ABI Contract

Mở file `src/utils/abis.js` và paste ABI từ Remix IDE:

```javascript
export const VOTING_ABI = [...]; // Paste ABI từ Remix
export const TOKEN_ABI = [...];  // Paste ABI từ Remix
```

### Bước 5: Khởi động MongoDB (nếu dùng local)

```bash
# Windows
mongod

# Linux/Mac
sudo systemctl start mongod

# Hoặc dùng MongoDB Compass (GUI)
```

**Nếu dùng MongoDB Atlas:** Bỏ qua bước này

### Bước 6: Chạy ứng dụng

Mở **2 terminal** và chạy đồng thời:

**Terminal 1 - Backend (OTP Server):**
```bash
npm run otp-server
```
Sẽ chạy tại: `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Sẽ chạy tại: `http://localhost:5173`

### Bước 7: Kết nối MetaMask và Test

1. Mở trình duyệt và vào `http://localhost:5173`
2. Cài đặt [MetaMask Extension](https://metamask.io/)
3. Chuyển MetaMask sang **Sepolia Testnet**
4. Lấy test ETH tại [Sepolia Faucet](https://sepoliafaucet.com/)
5. Click "Kết nối ví" trên website
6. Test các chức năng: Claim token → Vote

### Bước 8: Cấp quyền Admin cho ví khác (Optional)

Nếu muốn thêm admin:

1. Vào [Remix IDE](https://remix.ethereum.org)
2. Load contract đã deploy (At Address)
3. Gọi hàm `ADMIN_ROLE()` để lấy role hash
4. Gọi hàm `grantRole(roleHash, 0xDIA_CHI_VI_ADMIN_MOI)`
5. Confirm transaction

---

## ✅ Checklist Setup Hoàn Chỉnh

- [ ] Clone code và `npm install`
- [ ] Tạo file `.env` với đầy đủ thông tin
- [ ] Cấu hình Email (App Password)
- [ ] Cấu hình MongoDB (Local hoặc Atlas)
- [ ] Cấu hình Cloudinary
- [ ] Cập nhật Contract Address trong `constants.js`
- [ ] Cập nhật ABI trong `abis.js`
- [ ] Chạy backend (`npm run otp-server`)
- [ ] Chạy frontend (`npm run dev`)
- [ ] Kết nối MetaMask và test

---

## 🔧 Troubleshooting

### ❌ Lỗi: "Cannot connect to MongoDB"
- Kiểm tra MongoDB đang chạy (nếu dùng local)
- Kiểm tra `MONGO_URI` đúng format
- Nếu dùng Atlas: Kiểm tra IP Whitelist và username/password

### ❌ Lỗi: "OTP email not sent"
- Kiểm tra `EMAIL_USER` và `EMAIL_PASS` trong `.env`
- Đảm bảo dùng **App Password**, không phải mật khẩu Gmail thường
- Kiểm tra 2-Step Verification đã bật

### ❌ Lỗi: "Contract not found"
- Kiểm tra `CONTRACT_ADDRESS` trong `constants.js`
- Đảm bảo contract đã deploy thành công
- Kiểm tra MetaMask đang ở đúng network (Sepolia)

### ❌ Lỗi: "Upload image failed"
- Kiểm tra Cloudinary config trong `.env`
- Đảm bảo upload preset là **Unsigned**
- Kiểm tra Cloud Name đúng

### ❌ Lỗi: "Insufficient funds"
- Lấy test ETH tại [Sepolia Faucet](https://sepoliafaucet.com/)
- Đợi vài phút để ETH về ví

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

- **Nguyễn Đình Văn** - Developer

## 📞 Liên hệ

- GitHub: [@DinhVen](https://github.com/DinhVen)
- Email: van4551050252@st.qnu.edu.vn

---

⭐ Nếu thấy project hữu ích, hãy cho một star nhé!
