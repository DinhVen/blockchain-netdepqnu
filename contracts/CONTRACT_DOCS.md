# 📜 Tài liệu Smart Contract QNUBeautyVoting

## Tổng quan

Contract này là hệ thống bầu chọn "Nét đẹp Sinh viên QNU" trên blockchain, sử dụng token ERC20 (QSV - QNU StarVote) để bầu chọn.

**Contract Address:** `0x619cc6396e3b35304934EB11802422B9c0400c4b`  
**Admin Wallet:** `0x71693fAA2EA11314A7557DAc582fFd33aAff21A7`  
**Network:** Sepolia Testnet

---

## 1. Imports & Kế thừa

```solidity
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
```

| Library | Mục đích |
|---------|----------|
| **ERC20** | Tạo token chuẩn QSV |
| **AccessControl** | Quản lý quyền admin |
| **ReentrancyGuard** | Chống tấn công reentrancy khi refund |

---

## 2. Cấu hình Token Sale

```solidity
uint256 public constant TOKEN_PRICE = 0.001 ether;
uint256 public maxVoters = 500;
uint256 public totalTokensSold;
bool public saleActive;
```

| Biến | Giá trị | Mô tả |
|------|---------|-------|
| `TOKEN_PRICE` | 0.001 ETH | Giá 1 token QSV |
| `maxVoters` | 500 | Số lượng tối đa người mua |
| `totalTokensSold` | dynamic | Số token đã bán |
| `saleActive` | true/false | Trạng thái bán token |

---

## 3. Cấu trúc dữ liệu (Structs)

### 3.1 UngVien (Ứng viên)
```solidity
struct UngVien {
    uint256 id;           // ID ứng viên
    string hoTen;         // Họ tên
    string mssv;          // Mã số sinh viên
    string nganh;         // Ngành học
    string anh;           // URL ảnh
    string moTa;          // Mô tả
    uint256 soPhieu;      // Số phiếu bầu
    bool dangHoatDong;    // Còn hoạt động không
}
```

### 3.2 UngVienDangKy (Yêu cầu đăng ký)
```solidity
struct UngVienDangKy {
    uint256 id;
    address nguoiDangKy;  // Địa chỉ ví người đăng ký
    string hoTen;
    string mssv;
    string nganh;
    string anh;
    string moTa;
    bool daDuyet;         // Đã được duyệt
    bool daTuChoi;        // Đã bị từ chối
}
```

### 3.3 LichTrinh (Lịch trình)
```solidity
struct LichTrinh {
    uint64 claimStart;    // Bắt đầu mua token
    uint64 claimEnd;      // Kết thúc mua token
    uint64 voteStart;     // Bắt đầu bầu chọn
    uint64 voteEnd;       // Kết thúc bầu chọn
}
```

### 3.4 LichSuBauChon (Lịch sử bầu chọn)
```solidity
struct LichSuBauChon {
    address voter;        // Địa chỉ người bầu
    uint256 ungVienId;    // ID ứng viên được bầu
    uint256 timestamp;    // Thời gian bầu
    string ipHash;        // Hash IP (optional)
}
```

### 3.5 GianLan (Báo cáo gian lận)
```solidity
struct GianLan {
    address wallet;       // Ví bị báo cáo
    string lyDo;          // Lý do
    uint256 timestamp;    // Thời gian
    bool daXuLy;          // Đã xử lý chưa
}
```

---

## 4. Biến trạng thái (State Variables)

```solidity
// Ứng viên
uint256 public tongUngVien;                    // Tổng số ứng viên
mapping(uint256 => UngVien) public dsUngVien;  // Danh sách ứng viên

// Đăng ký
uint256 public tongDangKy;                              // Tổng yêu cầu đăng ký
mapping(uint256 => UngVienDangKy) public dsDangKy;      // DS yêu cầu
mapping(address => uint256) public yeuCauTheoDiaChi;    // Yêu cầu theo địa chỉ

// Bầu chọn
bool public moBauChon;                         // Trạng thái bầu chọn
mapping(address => bool) public daMuaToken;    // Đã mua token chưa
mapping(address => bool) public daBau;         // Đã bầu chưa
mapping(address => uint256) public bauChoId;   // Bầu cho ứng viên nào
mapping(address => uint256) public thoiGianBau; // Thời gian bầu

// Gian lận
mapping(address => bool) public biBanVinh;     // Bị ban vĩnh viễn

// Admin
address public adminWallet;                    // Ví admin nhận token
LichTrinh public lichTrinh;                    // Lịch trình
```

---

## 5. Events (Sự kiện)

| Event | Mô tả |
|-------|-------|
| `ThemUngVien` | Khi thêm ứng viên mới |
| `KhoaUngVien` | Khi khóa ứng viên |
| `DangKyUngVien` | Khi có yêu cầu đăng ký |
| `DuyetUngVien` | Khi duyệt yêu cầu |
| `TuChoiUngVien` | Khi từ chối yêu cầu |
| `TokenPurchased` | Khi mua token thành công |
| `SaleStarted` / `SaleStopped` | Bật/tắt bán token |
| `BatDauBauChon` / `DungBauChon` | Bật/tắt bầu chọn |
| `DaBauChon` | Khi bầu chọn thành công |
| `GianLanPhatHien` | Khi phát hiện gian lận |
| `WalletBanned` | Khi ban ví |
| `Refunded` | Khi hoàn tiền |

---

## 6. Errors (Lỗi)

| Error | Mô tả |
|-------|-------|
| `ErrAdmin` | Không phải admin |
| `ErrBan` | Ví bị ban |
| `ErrClaimEarly` | Chưa đến giờ mua token |
| `ErrClaimLate` | Đã hết giờ mua token |
| `ErrVoteClosed` | Bầu chọn đã đóng |
| `ErrVoteEarly` | Chưa đến giờ bầu |
| `ErrVoteLate` | Đã hết giờ bầu |
| `ErrSoldOut` | Hết token |
| `ErrWrongPrice` | Sai giá |
| `ErrBought` | Đã mua rồi |
| `ErrNotBought` | Chưa mua token |
| `ErrVoted` | Đã bầu rồi |
| `ErrCandidateInvalid` | Ứng viên không hợp lệ |
| `ErrCandidateLocked` | Ứng viên bị khóa |

---

## 7. Functions

### 7.1 Admin Functions

#### Quản lý ứng viên
```solidity
// Thêm ứng viên mới
function themUngVien(
    string memory _hoTen,
    string memory _mssv,
    string memory _nganh,
    string memory _anh,
    string memory _moTa
) external chiAdmin

// Duyệt yêu cầu đăng ký
function duyetDangKy(uint256 reqId) external chiAdmin

// Từ chối yêu cầu đăng ký
function tuChoiDangKy(uint256 reqId) external chiAdmin

// Khóa ứng viên
function khoaUngVien(uint256 id) external chiAdmin
```

#### Quản lý trạng thái
```solidity
// Bật/tắt bán token
function moBanToken() external chiAdmin
function dongBanToken() external chiAdmin

// Bật/tắt bầu chọn
function moBauChonChinhThuc() external chiAdmin
function dongBauChonChinhThuc() external chiAdmin

// Cập nhật lịch trình
function capNhatLichTrinh(
    uint64 _claimStart,
    uint64 _claimEnd,
    uint64 _voteStart,
    uint64 _voteEnd
) external chiAdmin

// Cập nhật số lượng tối đa
function capNhatMaxVoters(uint256 _maxVotersMoi) external chiAdmin
```

#### Refund
```solidity
// Hoàn tiền cho 1 user
function refundUser(address user) external chiAdmin

// Hoàn tiền cho nhiều user
function refundBatch(address[] calldata users) external chiAdmin
```

#### Gian lận
```solidity
// Báo cáo gian lận
function baoCaoGianLan(address wallet, string memory lyDo) external chiAdmin

// Ban/Unban ví
function banVi(address wallet) external chiAdmin
function unbanVi(address wallet) external chiAdmin

// Đánh dấu đã xử lý
function daXuLyGianLan(uint256 index) external chiAdmin
```

---

### 7.2 User Functions

#### Mua token
```solidity
function muaToken() external payable
```
- **Yêu cầu:** Gửi đúng 0.001 ETH
- **Điều kiện:** Sale đang mở, chưa mua, còn slot
- **Kết quả:** Nhận 1 QSV token

#### Bầu chọn
```solidity
function bauChon(uint256 ungVienId) external
```
- **Yêu cầu:** Đã approve token cho contract
- **Điều kiện:** Đã mua token, chưa bầu, ứng viên hợp lệ
- **Kết quả:** Token chuyển về ví admin, tăng số phiếu ứng viên

#### Đăng ký ứng viên
```solidity
function dangKyUngVien(
    string memory _hoTen,
    string memory _mssv,
    string memory _nganh,
    string memory _anh,
    string memory _moTa
) external returns (uint256)
```
- **Kết quả:** Tạo yêu cầu đăng ký, chờ admin duyệt

---

### 7.3 View Functions (Đọc dữ liệu)

```solidity
// Lấy ID người thắng
function layNguoiThang() external view returns (uint256 idThang)

// Tổng số lượt bầu
function tongLichSuBauChon() external view returns (uint256)

// Xem chi tiết 1 lượt bầu
function layLichSuBauChon(uint256 index) external view returns (
    address voter,
    uint256 ungVienId,
    uint256 timestamp,
    string memory ipHash
)

// Xem lịch sử bầu của mình
function layLichSuCuaToi() external view returns (
    uint256 ungVienId,
    uint256 timestamp
)

// Kiểm tra đã approve chưa
function daApprove(address user) external view returns (bool)

// Số token còn lại
function soTokenConLai() external view returns (uint256)

// Tổng ETH đã thu
function tongTienThu() external view returns (uint256)

// Tổng báo cáo gian lận
function tongGianLan() external view returns (uint256)

// Xem chi tiết gian lận
function layGianLan(uint256 index) external view returns (
    address wallet,
    string memory lyDo,
    uint256 timestamp,
    bool daXuLy
)
```

---

## 8. Flow bầu chọn

```
┌─────────────────────────────────────────────────────────────┐
│                    FLOW BẦU CHỌN                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. ADMIN mở bán token                                      │
│     └── moBanToken()                                        │
│                                                             │
│  2. USER mua token (0.001 ETH)                              │
│     └── muaToken() → nhận 1 QSV                             │
│                                                             │
│  3. ADMIN mở bầu chọn                                       │
│     └── moBauChonChinhThuc()                                │
│                                                             │
│  4. USER approve token cho contract                         │
│     └── approve(contractAddress, 1 QSV)                     │
│                                                             │
│  5. USER bầu chọn                                           │
│     └── bauChon(ungVienId)                                  │
│     └── Token chuyển về ví admin                            │
│     └── Số phiếu ứng viên +1                                │
│                                                             │
│  6. ADMIN đóng bầu chọn                                     │
│     └── dongBauChonChinhThuc()                              │
│                                                             │
│  7. ADMIN refund ETH cho users (optional)                   │
│     └── refundUser() hoặc refundBatch()                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Lưu ý quan trọng

### Token Flow
```
User mua token:
  ETH (0.001) → Contract
  QSV (1)     → User

User bầu chọn:
  QSV (1)     → Admin Wallet (0x71693fAA...)
```

### Refund Flow
```
Admin refund:
  ETH (0.001) → User (từ balance contract)
```

### Điều kiện bầu chọn
1. ✅ Đã mua token (`daMuaToken[user] == true`)
2. ✅ Chưa bầu (`daBau[user] == false`)
3. ✅ Đã approve token (`allowance >= 1 QSV`)
4. ✅ Bầu chọn đang mở (`moBauChon == true`)
5. ✅ Trong thời gian cho phép
6. ✅ Ứng viên hợp lệ và đang hoạt động
7. ✅ Không bị ban (`biBanVinh[user] == false`)

---

## 10. Security Features

| Feature | Mô tả |
|---------|-------|
| **AccessControl** | Chỉ admin mới gọi được các hàm quản lý |
| **ReentrancyGuard** | Chống tấn công reentrancy khi refund |
| **Ban System** | Có thể ban ví gian lận vĩnh viễn |
| **Time Lock** | Kiểm tra thời gian mua token và bầu chọn |
| **One Vote Per Wallet** | Mỗi ví chỉ bầu được 1 lần |
| **Approve Required** | User phải approve trước khi bầu |

---

*Tài liệu được tạo tự động - Cập nhật: 12/01/2026*
