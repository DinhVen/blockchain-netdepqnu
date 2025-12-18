# THU HỒI TOKEN SAU KHI KẾT THÚC BẦU CHỌN

## ❌ VẤN ĐỀ: KHÔNG THỂ THU HỒI TOKEN TRỰC TIẾP

### Tại sao?

1. **Token đã vote bị BURN (đốt)**
   - Xóa vĩnh viễn khỏi blockchain
   - Không ai lấy lại được

2. **Token chưa vote vẫn trong ví user**
   - Blockchain phi tập trung
   - Chỉ chủ ví mới có quyền chuyển
   - Admin không có private key

---

## ✅ GIẢI PHÁP

### **So sánh 3 phương án:**

| Phương án | Ưu điểm | Nhược điểm | Phù hợp |
|-----------|---------|------------|---------|
| **1. Không làm gì** | Đơn giản | Token vô dụng nằm trong ví | ❌ Không tốt |
| **2. Refund** | Công bằng, hoàn tiền | Phức tạp, tốn gas | ✅ Khuyên dùng |
| **3. Token hết hạn** | Tự động vô hiệu | Phức tạp code | ✅ Tốt |

---

## 📋 PHƯƠNG ÁN 1: REFUND (Hoàn tiền)

### Cách hoạt động:

```
Kết thúc bầu chọn
    ↓
Admin bật Refund
    ↓
User chưa vote có thể yêu cầu hoàn tiền
    ↓
Contract burn token + trả lại ETH
```

### Timeline:

```
Ngày 1-7:   Mua token (0.001 ETH)
Ngày 8-14:  Bầu chọn
Ngày 15:    Kết thúc → Admin bật Refund
Ngày 15-30: User có thể refund
Ngày 30:    Admin tắt Refund → Rút toàn bộ tiền
```

### Code Smart Contract:

```solidity
// Admin bật refund sau khi kết thúc
function batRefund() external chiAdmin {
    refundEnabled = true;
}

// User yêu cầu hoàn tiền
function yeuCauHoanTien() external {
    require(refundEnabled, "REFUND_CHUA_MO");
    require(daMuaToken[msg.sender], "BAN_CHUA_MUA_TOKEN");
    require(!daBau[msg.sender], "BAN_DA_VOTE_ROI");
    
    // Burn token
    _burn(msg.sender, 1 * 10 ** decimals());
    
    // Hoàn ETH
    (bool success, ) = msg.sender.call{value: TOKEN_PRICE}("");
    require(success, "HOAN_TIEN_THAT_BAI");
}
```

### Frontend:

```jsx
const RefundPage = () => {
  const { contract, currentAccount } = useContext(Web3Context);
  const [canRefund, setCanRefund] = useState(false);

  useEffect(() => {
    checkRefund();
  }, [currentAccount]);

  const checkRefund = async () => {
    const eligible = await contract.coTheRefund(currentAccount);
    setCanRefund(eligible);
  };

  const handleRefund = async () => {
    try {
      const tx = await contract.yeuCauHoanTien();
      await tx.wait();
      alert('Hoàn tiền thành công! 0.001 ETH đã được trả lại.');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Hoàn tiền Token</h1>
      
      {canRefund ? (
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <p className="mb-4">
            Bạn đã mua token nhưng chưa vote. 
            Bạn có thể yêu cầu hoàn lại 0.001 ETH.
          </p>
          <button
            onClick={handleRefund}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold"
          >
            Yêu cầu hoàn tiền
          </button>
        </div>
      ) : (
        <div className="bg-gray-100 p-6 rounded-xl">
          <p>Bạn không đủ điều kiện hoàn tiền vì:</p>
          <ul className="list-disc ml-6 mt-2">
            <li>Đã vote rồi, hoặc</li>
            <li>Chưa mua token, hoặc</li>
            <li>Đã refund rồi, hoặc</li>
            <li>Refund chưa mở</li>
          </ul>
        </div>
      )}
    </div>
  );
};
```

### Ưu điểm:

✅ Công bằng cho người không vote
✅ Lấy lại tiền thực sự
✅ Linh hoạt (admin kiểm soát thời gian)

### Nhược điểm:

❌ Phức tạp hơn
❌ User phải tốn gas fee để refund
❌ Admin phải để dự phòng tiền trong contract

---

## ⏰ PHƯƠNG ÁN 2: TOKEN HẾT HẠN

### Cách hoạt động:

```
Mua token → Token có hiệu lực 7 ngày
    ↓
Sau 7 ngày → Token tự động vô hiệu
    ↓
Không thể vote, không thể chuyển
```

### Code:

```solidity
mapping(address => uint256) public thoiGianMua;

function _tokenConHieuLuc(address user) internal view returns (bool) {
    uint256 thoiGianMuaToken = thoiGianMua[user];
    
    // Token có hiệu lực 7 ngày
    return block.timestamp <= thoiGianMuaToken + 7 days;
}

function bauChon(uint256 ungVienId) external {
    require(_tokenConHieuLuc(msg.sender), "TOKEN_HET_HAN");
    // ... vote logic
}
```

### Ưu điểm:

✅ Tự động, không cần admin can thiệp
✅ Token tự vô hiệu sau thời gian
✅ Không cần refund

### Nhược điểm:

❌ User mất tiền nếu không vote kịp
❌ Không công bằng nếu có sự cố
❌ Phức tạp hơn về code

---

## 💡 KHUYẾN NGHỊ

### Cho dự án của anh:

**Dùng PHƯƠNG ÁN 1: REFUND**

**Lý do:**
1. ✅ Công bằng nhất
2. ✅ User không mất tiền nếu không vote
3. ✅ Admin kiểm soát được
4. ✅ Phù hợp với sinh viên (có thể quên vote)

### Timeline đề xuất:

```
Tuần 1 (Ngày 1-7):   Mở bán token
Tuần 2 (Ngày 8-14):  Bầu chọn
Ngày 15:             Kết thúc → Bật Refund
Tuần 3 (Ngày 15-21): Thời gian refund
Ngày 22:             Tắt Refund → Rút tiền
```

---

## 📊 TÍNH TOÁN TÀI CHÍNH

### Ví dụ: 500 người mua token

**Tổng thu:** 500 × 0.001 ETH = 0.5 ETH = $1,500

**Kịch bản 1: 100% vote**
- Số người vote: 500
- Số người refund: 0
- Tiền thu được: $1,500 ✅

**Kịch bản 2: 80% vote, 20% refund**
- Số người vote: 400
- Số người refund: 100
- Tiền hoàn lại: 100 × $3 = $300
- Tiền thu được: $1,500 - $300 = $1,200 ✅

**Kịch bản 3: 50% vote, 50% refund**
- Số người vote: 250
- Số người refund: 250
- Tiền hoàn lại: 250 × $3 = $750
- Tiền thu được: $1,500 - $750 = $750 ✅

---

## 🔧 TRIỂN KHAI

### Bước 1: Deploy contract có refund

```bash
npx hardhat run scripts/deploy-refund.js --network sepolia
```

### Bước 2: Mở bán token

```javascript
await contract.moBanToken();
```

### Bước 3: Sau khi kết thúc vote

```javascript
await contract.batRefund();
```

### Bước 4: Thông báo cho sinh viên

"Nếu bạn đã mua token nhưng chưa vote, có thể yêu cầu hoàn tiền trong vòng 7 ngày."

### Bước 5: Sau thời gian refund

```javascript
await contract.tatRefund();
await contract.rutToanBo();
```

---

## ⚠️ LƯU Ý

### 1. Dự phòng tiền trong contract

Admin không nên rút hết tiền ngay, phải để lại cho refund:

```solidity
uint256 duPhong = TOKEN_PRICE * soNguoiChuaVote;
```

### 2. Gas fee

User phải trả gas fee (~$1-5) để refund. Cân nhắc:
- Nếu token giá $3, gas fee $2 → Refund vẫn đáng
- Nếu token giá $1, gas fee $2 → Không đáng refund

### 3. Thời gian refund

Nên cho ít nhất 7-14 ngày để user kịp refund.

---

## 📞 FAQ

**Q: Nếu user đã vote rồi có refund được không?**
A: Không. Token đã bị burn, không thể refund.

**Q: Admin có thể force burn token của user không?**
A: Không. Chỉ user mới có quyền với token của mình.

**Q: Nếu user không refund thì sao?**
A: Token vẫn nằm trong ví nhưng vô dụng. Không làm gì được.

**Q: Token có thể dùng cho cuộc thi sau không?**
A: Không. Mỗi cuộc thi nên deploy contract mới.

---

**Kết luận:** Refund là giải pháp tốt nhất để công bằng cho cả ban tổ chức và sinh viên.
