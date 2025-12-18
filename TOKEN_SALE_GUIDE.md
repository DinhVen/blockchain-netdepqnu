# HƯỚNG DẪN: TOKEN SALE CHO HỆ THỐNG BẦU CHỌN

## 🎯 MỤC ĐÍCH

Thay vì **miễn phí claim token**, hệ thống yêu cầu người dùng **mua token bằng ETH** để:
1. **Tránh gian lận** - Người dùng phải bỏ tiền ra → Giảm spam/bot
2. **Giới hạn số lượng** - Chỉ 500 người đầu tiên mua được
3. **Kêu gọi đầu tư** - Thu tiền để tổ chức sự kiện, trao giải

---

## 📊 SO SÁNH 2 PHƯƠNG PHÁP

| Tiêu chí | Miễn phí (Hiện tại) | Token Sale (Đề xuất) |
|----------|---------------------|----------------------|
| **Giá token** | Miễn phí | 0.001 ETH (~$3) |
| **Giới hạn** | Không | 500 người |
| **Chống gian lận** | Email OTP | Email OTP + Phải trả tiền |
| **Thu nhập** | $0 | 500 × $3 = $1,500 |
| **Rào cản** | Thấp | Cao hơn |
| **Tính công bằng** | Cao | Cao |

---

## 🔧 CÁCH HOẠT ĐỘNG

### 1. Admin Deploy Contract

```solidity
constructor(address _treasuryWallet)
```

- `_treasuryWallet`: Địa chỉ ví nhận tiền (ví của ban tổ chức)

**Ví dụ:**
```javascript
const treasuryWallet = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";
const contract = await factory.deploy(treasuryWallet);
```

### 2. Admin Mở Bán Token

```solidity
function moBanToken() external chiAdmin
```

- Kích hoạt chức năng mua token
- Sinh viên bắt đầu có thể mua

### 3. Sinh Viên Mua Token

```solidity
function muaToken() external payable
```

**Quy trình:**
1. Sinh viên kết nối ví MetaMask
2. Xác thực email OTP (như cũ)
3. Click "Mua token" và gửi 0.001 ETH
4. Nhận 1 QSV token vào ví

**Code Frontend:**
```javascript
const buyToken = async () => {
  // Kiểm tra đã verify email
  const emailVerified = localStorage.getItem('qnu-email-verified');
  if (!emailVerified) {
    alert('Vui lòng xác thực email trước');
    return;
  }

  // Kiểm tra đã mua chưa
  const hasBought = await contract.daMuaToken(currentAccount);
  if (hasBought) {
    alert('Bạn đã mua token rồi');
    return;
  }

  // Kiểm tra còn token không
  const remaining = await contract.soTokenConLai();
  if (remaining === 0) {
    alert('Đã hết token! Chỉ có 500 suất');
    return;
  }

  // Gửi transaction với 0.001 ETH
  const tx = await contract.muaToken({
    value: ethers.parseEther('0.001')
  });
  
  await tx.wait();
  alert('Mua token thành công!');
};
```

### 4. Sinh Viên Vote

Giống như cũ, nhưng kiểm tra `daMuaToken` thay vì `daNhanPhieu`:

```solidity
function bauChon(uint256 ungVienId) external {
    require(daMuaToken[msg.sender], "BAN_CHUA_MUA_TOKEN");
    // ... logic vote
}
```

### 5. Admin Rút Tiền

```solidity
function rutTien() external chiAdmin
```

- Rút toàn bộ ETH về `treasuryWallet`
- Dùng để tổ chức sự kiện, trao giải

**Ví dụ:**
- 500 người × 0.001 ETH = 0.5 ETH
- 0.5 ETH × $3,000 (giá ETH) = **$1,500**

---

## 💰 CẤU HÌNH GIÁ VÀ GIỚI HẠN

### Trong Smart Contract:

```solidity
uint256 public constant TOKEN_PRICE = 0.001 ether;  // Giá 1 token
uint256 public constant MAX_VOTERS = 500;           // Giới hạn 500 người
```

### Thay đổi giá:

**Giá thấp (dễ tiếp cận):**
```solidity
uint256 public constant TOKEN_PRICE = 0.0005 ether;  // ~$1.5
```

**Giá cao (chống spam mạnh):**
```solidity
uint256 public constant TOKEN_PRICE = 0.005 ether;   // ~$15
```

**Giá linh hoạt (Admin có thể thay đổi):**
```solidity
uint256 public tokenPrice = 0.001 ether;

function capNhatGiaToken(uint256 _newPrice) external chiAdmin {
    tokenPrice = _newPrice;
}
```

---

## 🎨 GIAO DIỆN FRONTEND

### Trang Mua Token (thay cho Claim)

```jsx
// src/pages/BuyToken.jsx
const BuyToken = () => {
  const { contract, currentAccount } = useContext(Web3Context);
  const [remaining, setRemaining] = useState(0);
  const [hasBought, setHasBought] = useState(false);

  useEffect(() => {
    loadData();
  }, [currentAccount]);

  const loadData = async () => {
    if (!contract || !currentAccount) return;
    
    const rem = await contract.soTokenConLai();
    const bought = await contract.daMuaToken(currentAccount);
    
    setRemaining(Number(rem));
    setHasBought(bought);
  };

  const handleBuy = async () => {
    try {
      const tx = await contract.muaToken({
        value: ethers.parseEther('0.001')
      });
      await tx.wait();
      alert('Mua token thành công!');
      loadData();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Mua Token Bầu Chọn</h1>
      
      {/* Thống kê */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-gray-600">Giá token</p>
            <p className="text-2xl font-bold">0.001 ETH</p>
            <p className="text-sm text-gray-500">~$3</p>
          </div>
          <div>
            <p className="text-gray-600">Còn lại</p>
            <p className="text-2xl font-bold text-blue-600">{remaining}/500</p>
          </div>
          <div>
            <p className="text-gray-600">Trạng thái</p>
            <p className="text-2xl font-bold">
              {hasBought ? '✅ Đã mua' : '⏳ Chưa mua'}
            </p>
          </div>
        </div>
      </div>

      {/* Nút mua */}
      {!hasBought && remaining > 0 && (
        <button
          onClick={handleBuy}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all"
        >
          Mua Token (0.001 ETH)
        </button>
      )}

      {hasBought && (
        <div className="bg-green-50 border-2 border-green-200 p-6 rounded-xl">
          <p className="text-green-700 font-bold">
            ✅ Bạn đã mua token thành công! Giờ có thể vote rồi.
          </p>
        </div>
      )}

      {remaining === 0 && (
        <div className="bg-red-50 border-2 border-red-200 p-6 rounded-xl">
          <p className="text-red-700 font-bold">
            ❌ Đã hết token! Chỉ có 500 suất và đã bán hết.
          </p>
        </div>
      )}
    </div>
  );
};
```

---

## 🔐 BẢO MẬT

### 1. Chống mua nhiều lần

```solidity
mapping(address => bool) public daMuaToken;

require(!daMuaToken[msg.sender], "BAN_DA_MUA_TOKEN");
```

### 2. Giới hạn số lượng

```solidity
require(totalVotersSold < MAX_VOTERS, "DA_HET_TOKEN");
```

### 3. Kiểm tra giá chính xác

```solidity
require(msg.value == TOKEN_PRICE, "GIA_KHONG_DUNG");
```

### 4. Kết hợp Email OTP

- Vẫn giữ xác thực email như cũ
- Chỉ email @st.qnu.edu.vn mới mua được
- 1 email chỉ bind 1 ví

---

## 📈 LỢI ÍCH

### Đối với Ban Tổ Chức:

✅ **Thu nhập:** $1,500 để tổ chức sự kiện, trao giải
✅ **Chống spam:** Người dùng phải bỏ tiền → Giảm bot/fake
✅ **Giới hạn:** Chỉ 500 người → Dễ quản lý
✅ **Tính khan hiếm:** Token có giá trị → Người dùng trân trọng hơn

### Đối với Sinh Viên:

✅ **Công bằng:** First-come-first-served
✅ **Minh bạch:** Biết rõ còn bao nhiêu token
✅ **Có giá trị:** Token có giá → Vote có ý nghĩa hơn

---

## ⚠️ LƯU Ý

### 1. Giá ETH biến động

- 0.001 ETH hôm nay = $3
- Ngày mai có thể = $2 hoặc $4
- Nên fix giá bằng stablecoin (USDT/USDC) nếu muốn ổn định

### 2. Gas fee

- Mỗi transaction mua token tốn ~$1-5 gas fee
- Tổng chi phí = 0.001 ETH + gas fee

### 3. Pháp lý

- Cần kiểm tra quy định về bán token
- Có thể coi là "phí tham gia" thay vì "bán token"

---

## 🚀 TRIỂN KHAI

### Bước 1: Deploy Contract

```bash
# Deploy với treasury wallet
npx hardhat run scripts/deploy-tokensale.js --network sepolia
```

### Bước 2: Verify Contract

```bash
npx hardhat verify --network sepolia CONTRACT_ADDRESS TREASURY_WALLET
```

### Bước 3: Admin mở bán

```javascript
await contract.moBanToken();
```

### Bước 4: Thông báo cho sinh viên

- Giá: 0.001 ETH (~$3)
- Giới hạn: 500 suất
- First-come-first-served

---

## 📞 HỖ TRỢ

Nếu sinh viên gặp vấn đề:
1. Không đủ ETH → Hướng dẫn mua ETH
2. Transaction failed → Kiểm tra gas fee
3. Đã hết token → Thông báo đã sold out

---

**Kết luận:** Token Sale là cách hiệu quả để vừa chống gian lận, vừa thu tiền tổ chức sự kiện, vừa tạo giá trị cho token vote.
