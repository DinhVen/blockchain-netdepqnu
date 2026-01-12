# Checklist Điều Kiện Các Chức Năng - QNU StarVote

Tài liệu này liệt kê tất cả điều kiện/validation của từng chức năng trong hệ thống.

---

## 1. Xác thực Email OTP (EmailGate)

| Điều kiện | Trạng thái | Mô tả |
|-----------|:----------:|-------|
| Kết nối ví MetaMask trước | ✅ | Bắt buộc kết nối ví trước khi gửi OTP |
| Email phải là @st.qnu.edu.vn | ✅ | Chỉ chấp nhận email sinh viên QNU |
| OTP 6 chữ số | ✅ | Mã OTP phải đúng 6 số |
| OTP hết hạn sau 5 phút | ✅ | Mã OTP có hiệu lực 5 phút |
| Rate limit 60s giữa các lần gửi | ✅ | Chống spam gửi OTP |
| Bind email-wallet (1 email = 1 ví) | ✅ | Mỗi email chỉ bind được 1 ví |
| Phát hiện gian lận nếu email đã bind ví khác | ✅ | Báo lỗi + log conflict |
| Phát hiện gian lận nếu ví đã bind email khác | ✅ | Báo lỗi + log conflict |
| Disconnect + revoke ví khi phát hiện gian lận | ✅ | Tự động ngắt kết nối ví gian lận |

---

## 2. Mua Token (Claim)

| Điều kiện | Trạng thái | Mô tả |
|-----------|:----------:|-------|
| Kết nối ví MetaMask | ✅ | Bắt buộc |
| Xác thực email OTP trước | ✅ | Phải qua EmailGate |
| Sale phải đang mở (saleActive = true) | ✅ | Admin phải mở bán |
| Trong thời gian claimStart - claimEnd | ✅ | Kiểm tra lịch trình |
| Chưa mua token (mỗi ví chỉ mua 1 lần) | ✅ | Contract check daMuaToken |
| Còn token (remaining > 0) | ✅ | Chưa hết suất |
| Đúng giá 0.001 ETH | ✅ | Contract check TOKEN_PRICE |
| Không bị ban | ✅ | Contract check biBanVinh |

---

## 3. Bầu chọn (Voting)

| Điều kiện | Trạng thái | Mô tả |
|-----------|:----------:|-------|
| Kết nối ví MetaMask | ✅ | Bắt buộc |
| Đã mua token | ✅ | Contract check daMuaToken |
| Đã approve token cho contract | ✅ | User phải approve trước khi vote |
| Vote phải đang mở (voteOpen = true) | ✅ | Admin phải mở vote |
| Trong thời gian voteStart - voteEnd | ✅ | Kiểm tra lịch trình |
| Chưa vote (mỗi ví chỉ vote 1 lần) | ✅ | Contract check daBau |
| Ứng viên phải đang hoạt động | ✅ | dangHoatDong = true |
| Không bị ban | ✅ | Contract check biBanVinh |
| Nhập họ tên + MSSV trước khi vote | ✅ | MSSV 8-10 số |

---

## 4. Đăng ký ứng viên (CandidateSignup)

| Điều kiện | Trạng thái | Mô tả |
|-----------|:----------:|-------|
| Kết nối ví MetaMask | ✅ | Bắt buộc |
| Họ tên >= 3 ký tự | ✅ | Validation |
| MSSV đúng 10 số | ✅ | Regex /^\d{10}$/ |
| Chọn ngành/khoa | ✅ | Bắt buộc |
| Ngày sinh không vượt tương lai | ✅ | Validation |
| SĐT 10 số, bắt đầu 03/05/07/08/09 | ✅ | Regex VN phone |
| Email hợp lệ | ✅ | Regex email |
| Mô tả <= 500 ký tự | ✅ | Max length |
| Ảnh <= 5MB | ✅ | File size limit |
| Ví chưa đăng ký trước đó | ✅ | Backend check |
| MSSV chưa đăng ký trước đó | ✅ | Backend check |

---

## 5. Import CSV (CandidateImport)

| Điều kiện | Trạng thái | Mô tả |
|-----------|:----------:|-------|
| File đúng định dạng .csv | ✅ | Check extension |
| Có đủ cột bắt buộc | ✅ | hoTen, mssv, nganh, ngaySinh, sdt, email |
| MSSV 10 số | ✅ | Tự thêm 0 nếu thiếu |
| SĐT 10 số, bắt đầu 03/05/07/08/09 | ✅ | Tự thêm 0 nếu thiếu |
| Email hợp lệ | ✅ | Regex email |
| Ngày sinh hợp lệ | ✅ | Không vượt tương lai |
| Không trùng MSSV trong file | ✅ | Check duplicate |
| Không trùng Email trong file | ✅ | Check duplicate |
| Không trùng SĐT trong file | ✅ | Check duplicate |
| Báo lỗi rõ "Dòng X: lỗi gì" | ✅ | Error message chi tiết |
| Hiển thị số hợp lệ / lỗi | ✅ | Summary sau validate |

---

## 6. Admin - Thêm ứng viên (CandidateForm)

| Điều kiện | Trạng thái | Mô tả |
|-----------|:----------:|-------|
| Phải là admin | ✅ | hasRole ADMIN_ROLE |
| Họ tên không rỗng | ✅ | Bắt buộc |
| MSSV đúng 10 số | ✅ | Regex /^\d{10}$/ |
| Chọn ngành/khoa | ✅ | Bắt buộc |
| Ngày sinh hợp lệ | ✅ | Tuổi 16-50 |
| SĐT 10 số, bắt đầu 03/05/07/08/09 | ✅ | Regex VN phone |
| Email hợp lệ | ✅ | Regex email |
| Ảnh <= 5MB | ✅ | File size limit |

---

## 7. Admin - Mở bán/vote (ControlPanel)

| Điều kiện | Trạng thái | Mô tả |
|-----------|:----------:|-------|
| Phải là admin | ✅ | hasRole ADMIN_ROLE |
| Mở bán: phải có lịch trình Claim | ✅ | claimStart, claimEnd != 0 |
| Mở vote: phải có lịch trình Vote | ✅ | voteStart, voteEnd != 0 |
| Hiển thị cảnh báo nếu chưa có lịch | ✅ | UI warning |

---

## 8. Admin - Cập nhật lịch trình (ScheduleCard)

| Điều kiện | Trạng thái | Mô tả |
|-----------|:----------:|-------|
| Phải là admin | ✅ | hasRole ADMIN_ROLE |
| Điền đầy đủ 4 mốc thời gian | ✅ | claimStart, claimEnd, voteStart, voteEnd |
| Claim đóng phải sau claim mở | ✅ | claimEnd > claimStart |
| Vote đóng phải sau vote mở | ✅ | voteEnd > voteStart |

---

## 9. Admin - Cập nhật giới hạn (LimitsCard)

| Điều kiện | Trạng thái | Mô tả |
|-----------|:----------:|-------|
| Phải là admin | ✅ | hasRole ADMIN_ROLE |
| Giới hạn mới >= số đã bán | ✅ | Contract check ErrMaxTooLow |
| Giới hạn mới > 0 | ✅ | Contract check ErrMaxZero |

---

## 10. Admin - Duyệt đăng ký (OffchainRegistrations)

| Điều kiện | Trạng thái | Mô tả |
|-----------|:----------:|-------|
| Phải là admin | ✅ | hasRole ADMIN_ROLE |
| Đăng ký phải ở trạng thái pending | ✅ | status = 'pending' |
| Duyệt: thêm vào blockchain + cập nhật backend | ✅ | Gọi themUngVien + PATCH approve |
| Từ chối: cập nhật backend + lý do | ✅ | PATCH reject với reason |

---

## 11. Admin - Khóa/Mở khóa ứng viên

| Điều kiện | Trạng thái | Mô tả |
|-----------|:----------:|-------|
| Phải là admin | ✅ | hasRole ADMIN_ROLE |
| ID ứng viên hợp lệ | ✅ | 0 < id <= tongUngVien |
| Khóa: gọi khoaUngVien(id) | ✅ | dangHoatDong = false |
| Mở khóa: gọi moKhoaUngVien(id) | ✅ | dangHoatDong = true |

---

## 12. Admin - Ban/Unban ví

| Điều kiện | Trạng thái | Mô tả |
|-----------|:----------:|-------|
| Phải là admin | ✅ | hasRole ADMIN_ROLE |
| Ban: gọi banVi(wallet) | ✅ | biBanVinh[wallet] = true |
| Unban: gọi unbanVi(wallet) | ✅ | biBanVinh[wallet] = false |
| Ví bị ban không thể mua token | ✅ | Contract check |
| Ví bị ban không thể vote | ✅ | Contract check |

---

## 13. Admin - Refund ETH

| Điều kiện | Trạng thái | Mô tả |
|-----------|:----------:|-------|
| Phải là admin | ✅ | hasRole ADMIN_ROLE |
| User phải đã vote | ✅ | daBau[user] = true |
| Contract phải có đủ ETH | ✅ | balance >= TOKEN_PRICE |
| Refund 1 user: refundUser(address) | ✅ | Hoàn 0.001 ETH |
| Refund batch: refundBatch(address[]) | ✅ | Hoàn cho nhiều user |

---

## 14. Xem kết quả (Results)

| Điều kiện | Trạng thái | Mô tả |
|-----------|:----------:|-------|
| Không cần kết nối ví | ✅ | Public view |
| Hiển thị top 3 podium | ✅ | UI đặc biệt cho top 3 |
| Hiển thị % phiếu | ✅ | votes / totalVotes * 100 |
| Xem danh sách người bầu | ✅ | Click để xem voters |
| Làm mới kết quả | ✅ | Button refresh |

---

## 15. Dashboard cá nhân

| Điều kiện | Trạng thái | Mô tả |
|-----------|:----------:|-------|
| Phải kết nối ví | ✅ | Bắt buộc |
| Hiển thị số dư token | ✅ | balanceOf(account) |
| Hiển thị trạng thái mua/vote | ✅ | daMuaToken, daBau |
| Hiển thị ứng viên đã bầu | ✅ | Nếu hasVoted |
| Hiển thị timeline tiến trình | ✅ | 4 bước |
| Hiển thị lịch trình sự kiện | ✅ | Nếu có schedule |

---

## Tổng kết

| Chức năng | Số điều kiện | Đã implement |
|-----------|:------------:|:------------:|
| Xác thực OTP | 9 | 9 ✅ |
| Mua Token | 8 | 8 ✅ |
| Bầu chọn | 9 | 9 ✅ |
| Đăng ký ứng viên | 11 | 11 ✅ |
| Import CSV | 11 | 11 ✅ |
| Admin - Thêm ứng viên | 8 | 8 ✅ |
| Admin - Mở bán/vote | 4 | 4 ✅ |
| Admin - Lịch trình | 4 | 4 ✅ |
| Admin - Giới hạn | 3 | 3 ✅ |
| Admin - Duyệt đăng ký | 4 | 4 ✅ |
| Admin - Khóa/Mở khóa | 4 | 4 ✅ |
| Admin - Ban/Unban | 5 | 5 ✅ |
| Admin - Refund | 5 | 5 ✅ |
| Xem kết quả | 5 | 5 ✅ |
| Dashboard | 6 | 6 ✅ |

**Tổng: 96 điều kiện - Đã implement đầy đủ ✅**

---

## Những điểm có thể cải thiện thêm

1. **Check trùng MSSV khi admin thêm ứng viên** - Hiện chưa check trùng với ứng viên đã có trên blockchain
2. **Validate ngày sinh trong Import CSV** - Có thể thêm check tuổi 16-50 như CandidateForm
3. **Auto-close sale/vote khi hết thời gian** - Hiện contract chỉ chặn user, không tự đóng trạng thái
4. **Rate limit cho API backend** - Chống spam request
5. **Captcha cho form đăng ký** - Chống bot

---

*Cập nhật: 12/01/2026*
