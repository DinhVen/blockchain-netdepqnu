# TRIỂN KHAI TOKEN SALE - HOÀN THÀNH

## ✅ ĐÃ THỰC HIỆN

### 1. Cập nhật Web3Context.jsx
- ✅ Thêm state `saleActive` và `refundEnabled`
- ✅ Load trạng thái từ smart contract
- ✅ Export state mới cho các component khác sử dụng

### 2. Tạo trang BuyToken.jsx (thay thế Claim.jsx)
- ✅ Giao diện mua token với ETH
- ✅ Hiển thị giá: 0.001 ETH (~$3)
- ✅ Hiển thị số token còn lại: X/500
- ✅ Kiểm tra đã mua token chưa
- ✅ Kiểm tra đã verify email chưa
- ✅ Gọi hàm `muaToken()` với payable value
- ✅ Xử lý các trường hợp: đã mua, hết token, chưa mở bán

### 3. Cập nhật Voting.jsx
- ✅ Đổi `daBinhChon` → `daBau`
- ✅ Đổi `binhChon()` → `bauChon()`
- ✅ Kiểm tra `daMuaToken` trước khi vote
- ✅ Thông báo nếu chưa mua token

### 4. Tạo trang Refund.jsx
- ✅ Giao diện yêu cầu hoàn tiền
- ✅ Kiểm tra điều kiện refund
- ✅ Gọi hàm `yeuCauHoanTien()`
- ✅ Hiển thị thông báo: burn token + hoàn ETH

### 5. Cập nhật Admin.jsx
- ✅ Thêm nút "Mở bán token" / "Đóng bán token"
- ✅ Thêm nút "Bật Refund" / "Tắt Refund"
- ✅ Thêm section "Quản lý tiền"
- ✅ Nút "Rút tiền (trừ dự phòng)"
- ✅ Nút "Rút toàn bộ (sau khi tắt refund)"
- ✅ Thêm handler functions: `handleTokenSale`, `handleRefund`, `handleWithdraw`, `handleWithdrawAll`

### 6. Cập nhật App.jsx
- ✅ Import `BuyToken` và `Refund`
- ✅ Thêm route `/buy-token`
- ✅ Thêm route `/refund`
- ✅ Giữ route `/claim` redirect về `/buy-token`

### 7. Cập nhật Navbar.jsx
- ✅ Đổi "Nhận token" → "Mua token" (link: /buy-token)
- ✅ Thêm menu "Hoàn tiền" (link: /refund)

---

## 🎯 CHỨC NĂNG ĐÃ HOÀN THÀNH

### User Flow:

```
1. Xác thực email
   ↓
2. Kết nối ví MetaMask
   ↓
3. Vào trang "Mua token"
   ↓
4. Trả 0.001 ETH → Nhận 1 QSV token
   ↓
5. Vào trang "Bỏ phiếu"
   ↓
6. Vote cho ứng viên yêu thích
   ↓
7. Token bị burn sau khi vote
```

### Refund Flow (nếu không vote):

```
1. Kết thúc bầu chọn
   ↓
2. Admin bật Refund
   ↓
3. User vào trang "Hoàn tiền"
   ↓
4. Yêu cầu hoàn tiền
   ↓
5. Token bị burn + Nhận lại 0.001 ETH
```

### Admin Flow:

```
1. Deploy contract với treasury wallet
   ↓
2. Mở bán token
   ↓
3. User mua token (max 500 người)
   ↓
4. Mở bầu chọn
   ↓
5. User vote
   ↓
6. Đóng bầu chọn
   ↓
7. Bật Refund (cho người chưa vote)
   ↓
8. Sau thời gian refund → Tắt Refund
   ↓
9. Rút toàn bộ tiền về treasury wallet
```

---

## 📊 THỐNG KÊ

### Smart Contract Functions Đã Sử Dụng:

**Token Sale:**
- `muaToken()` - User mua token
- `moBanToken()` - Admin mở bán
- `dongBanToken()` - Admin đóng bán
- `soTokenConLai()` - Xem còn bao nhiêu token
- `daMuaToken(address)` - Kiểm tra đã mua chưa

**Voting:**
- `bauChon(uint256)` - User vote
- `daBau(address)` - Kiểm tra đã vote chưa
- `moBauChonChinhThuc()` - Admin mở vote
- `dongBauChonChinhThuc()` - Admin đóng vote

**Refund:**
- `batRefund()` - Admin bật refund
- `tatRefund()` - Admin tắt refund
- `yeuCauHoanTien()` - User yêu cầu hoàn tiền
- `coTheRefund(address)` - Kiểm tra có thể refund không

**Withdraw:**
- `rutTien()` - Admin rút tiền (trừ dự phòng)
- `rutToanBo()` - Admin rút toàn bộ

---

## 🔧 CẦN LÀM TIẾP

### 1. Cập nhật ABI
```bash
# Compile contract trong Remix
# Copy ABI mới
# Paste vào src/utils/abis.js
```

### 2. Deploy Contract Mới
```solidity
// Constructor cần treasury wallet
constructor(address _treasuryWallet)

// Ví dụ:
// Deploy với treasury wallet: 0x1234...
```

### 3. Cập nhật Contract Address
```javascript
// src/utils/constants.js
export const VOTING_ADDRESS = '0x...'; // Contract mới
```

### 4. Test Flow
- [ ] Test mua token
- [ ] Test vote
- [ ] Test refund
- [ ] Test admin controls
- [ ] Test withdraw

---

## 💰 TÍNH TOÁN TÀI CHÍNH

### Kịch bản: 500 người mua token

**Tổng thu:** 500 × 0.001 ETH = 0.5 ETH

**Giả sử:**
- 400 người vote (80%)
- 80 người refund (16%)
- 20 người không làm gì (4%)

**Kết quả:**
- Tiền hoàn lại: 80 × 0.001 ETH = 0.08 ETH
- Tiền thu được: 0.5 - 0.08 = **0.42 ETH**
- Token còn lại: 20 token (vô dụng trong ví user)

**Với giá ETH = $3,000:**
- Tổng thu: $1,500
- Hoàn lại: $240
- Thu ròng: **$1,260** ✅

---

## 📝 LƯU Ý QUAN TRỌNG

### 1. Treasury Wallet
- Phải là địa chỉ ví hợp lệ
- Nhận tất cả tiền từ token sale
- Admin có thể rút tiền về ví này

### 2. Dự phòng Refund
- Hàm `rutTien()` để lại dự phòng cho 50 người refund
- Hàm `rutToanBo()` chỉ dùng sau khi tắt refund

### 3. Gas Fee
- User phải trả gas fee khi:
  - Mua token (~$1-5)
  - Vote (~$1-5)
  - Refund (~$1-5)
- Đảm bảo user có đủ ETH trong ví

### 4. Giới hạn 500 người
- Hardcoded trong contract: `MAX_VOTERS = 500`
- Không thể thay đổi sau khi deploy
- Nếu muốn thay đổi → Deploy contract mới

---

## ✅ CHECKLIST HOÀN THÀNH

- [x] Cập nhật Web3Context.jsx
- [x] Tạo BuyToken.jsx
- [x] Cập nhật Voting.jsx
- [x] Tạo Refund.jsx
- [x] Cập nhật Admin.jsx
- [x] Cập nhật App.jsx
- [x] Cập nhật Navbar.jsx
- [ ] Cập nhật ABI mới
- [ ] Deploy contract mới
- [ ] Test toàn bộ flow

---

## 🎉 KẾT QUẢ

Đã triển khai đầy đủ cơ chế Token Sale theo yêu cầu của thầy:

1. ✅ **Kêu gọi đầu tư**: User phải trả 0.001 ETH để mua token
2. ✅ **Giới hạn 500 người**: Chỉ có 500 suất token
3. ✅ **Lưu lịch sử bầu chọn**: Đã có trong contract
4. ✅ **Phát hiện gian lận**: Đã có trong contract
5. ✅ **Thu hồi token**: Refund cho người chưa vote

Hệ thống vừa công bằng, vừa minh bạch, vừa có thể thu được kinh phí để tổ chức cuộc thi!
