// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title QNUBeautyVoting - Phiên bản đầy đủ
 * @dev Smart Contract cho hệ thống bầu chọn Nét đẹp Sinh viên QNU
 * @notice Bao gồm: Token Sale, Lưu lịch sử vote, Phát hiện gian lận, Refund
 * @author Nhóm sinh viên CNTT 45B - Đại học Quy Nhơn
 */
contract QNUBeautyVoting is ERC20, AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = DEFAULT_ADMIN_ROLE;

    // ==================== TOKEN SALE CONFIG ====================
    
    uint256 public constant TOKEN_PRICE = 0.001 ether;  // Giá 1 token
    uint256 public maxVoters = 500;                     // Giới hạn số người được mua (có thể đổi bởi admin)
    uint256 public totalTokensSold;                     // Số token đã bán
    
    address public treasuryWallet;                      // Ví nhận tiền
    bool public saleActive;                             // Trạng thái bán token
    bool public refundEnabled;                          // Cho phép refund

    // ==================== STRUCTS ====================
    
    /**
     * @dev Cấu trúc thông tin ứng viên
     */
    struct UngVien {
        uint256 id;              // ID duy nhất
        string hoTen;            // Họ và tên
        string mssv;             // Mã số sinh viên
        string nganh;            // Ngành học
        string anh;              // URL ảnh đại diện
        string moTa;             // Mô tả bản thân
        uint256 soPhieu;         // Số phiếu bầu hiện tại
        bool dangHoatDong;       // Trạng thái hoạt động
    }

    /**
     * @dev Cấu trúc yêu cầu đăng ký ứng viên
     */
    struct UngVienDangKy {
        uint256 id;              // ID yêu cầu
        address nguoiDangKy;     // Địa chỉ ví đăng ký
        string hoTen;            // Họ và tên
        string mssv;             // Mã số sinh viên
        string nganh;            // Ngành học
        string anh;              // URL ảnh
        string moTa;             // Mô tả
        bool daDuyet;            // Đã được duyệt
        bool daTuChoi;           // Đã bị từ chối
    }

    /**
     * @dev Cấu trúc lịch trình sự kiện
     */
    struct LichTrinh {
        uint64 claimStart;       // Thời gian bắt đầu nhận token
        uint64 claimEnd;         // Thời gian kết thúc nhận token
        uint64 voteStart;        // Thời gian bắt đầu bầu chọn
        uint64 voteEnd;          // Thời gian kết thúc bầu chọn
    }

    // ==================== STATE VARIABLES ====================
    
    // Quản lý ứng viên
    uint256 public tongUngVien;
    mapping(uint256 => UngVien) public dsUngVien;
    
    // Quản lý yêu cầu đăng ký
    uint256 public tongDangKy;
    mapping(uint256 => UngVienDangKy) public dsDangKy;
    mapping(address => uint256) public yeuCauTheoDiaChi;  // 1 địa chỉ 1 yêu cầu pending
    
    // Chống trùng MSSV
    mapping(bytes32 => bool) private mssvDaDung;
    
    // Trạng thái hệ thống
    bool public moNhanPhieu;
    bool public moBauChon;
    
    // Trạng thái voter
    mapping(address => bool) public daMuaToken;         // Đã mua token chưa
    mapping(address => bool) public daBau;              // Đã bầu chưa
    mapping(address => uint256) public bauChoId;        // Bầu cho ứng viên nào
    mapping(address => uint256) public thoiGianBau;     // Thời gian bầu
    mapping(address => bool) public daRefund;           // Đã refund chưa
    uint256 public tongRefund;                          // Tổng số refund đã xử lý
    
    // ==================== LỊCH SỬ BẦU CHỌN ====================
    
    struct LichSuBauChon {
        address voter;                                  // Địa chỉ ví
        uint256 ungVienId;                              // ID ứng viên
        uint256 timestamp;                              // Thời gian
        string ipHash;                                  // Hash IP (optional)
    }
    
    LichSuBauChon[] public lichSuBauChon;              // Mảng lưu lịch sử
    mapping(address => uint256) public chiSoLichSu;     // Index trong mảng
    
    // ==================== PHÁT HIỆN GIAN LẬN ====================
    
    struct GianLan {
        address wallet;                                 // Ví gian lận
        string lyDo;                                    // Lý do
        uint256 timestamp;                              // Thời gian phát hiện
        bool daXuLy;                                    // Đã xử lý chưa
    }
    
    GianLan[] public dsGianLan;                        // Danh sách gian lận
    mapping(address => bool) public biBanVinh;          // Bị ban vĩnh viễn
    
    // Lịch trình
    LichTrinh public lichTrinh;

    // ==================== EVENTS ====================
    
    // Quản lý ứng viên
    event ThemUngVien(uint256 indexed id, string hoTen, string mssv, string nganh, string anh, string moTa);
    event KhoaUngVien(uint256 indexed id);
    event DangKyUngVien(uint256 indexed reqId, address indexed nguoiDangKy, string mssv);
    event DuyetUngVien(uint256 indexed reqId, uint256 indexed ungVienId);
    event TuChoiUngVien(uint256 indexed reqId);
    
    // Token Sale
    event TokenPurchased(address indexed buyer, uint256 amount, uint256 ethPaid);
    event SaleStarted();
    event SaleStopped();
    event FundsWithdrawn(address indexed to, uint256 amount);
    event BatDauNhanPhieu();
    event DungNhanPhieu();
    
    // Bầu chọn
    event BatDauBauChon();
    event DungBauChon();
    event DaBauChon(address indexed voter, uint256 indexed ungVienId, uint256 timestamp);
    
    // Refund
    event RefundEnabled();
    event RefundDisabled();
    event Refunded(address indexed user, uint256 ethAmount);
    
    // Gian lận
    event GianLanPhatHien(address indexed wallet, string lyDo, uint256 timestamp);
    event WalletBanned(address indexed wallet);
    
    // Lịch trình
    event CapNhatLichTrinh(uint64 claimStart, uint64 claimEnd, uint64 voteStart, uint64 voteEnd);
    event CapNhatMaxVoters(uint256 maxVotersMoi);

    // Errors
    error ErrAdmin();
    error ErrBan();
    error ErrClaimClosed();
    error ErrClaimEarly();
    error ErrClaimLate();
    error ErrVoteClosed();
    error ErrVoteEarly();
    error ErrVoteLate();
    error ErrEmpty();
    error ErrMSSVUsed();
    error ErrReqInvalid();
    error ErrReqProcessed();
    error ErrSoldOut();
    error ErrWrongPrice();
    error ErrBought();
    error ErrNotBought();
    error ErrVoted();
    error ErrNotVoted();
    error ErrRefunded();
    error ErrCandidateInvalid();
    error ErrCandidateLocked();
    error ErrBalanceLow();
    error ErrRefundData();
    error ErrWithdrawBlocked();
    error ErrNoFunds();
    error ErrIndexInvalid();
    error ErrMaxTooLow();
    error ErrMaxZero();
    error ErrSaleClosed();
    error ErrRefundClosed();
    error ErrTreasuryInvalid();
    error ErrTransferFail();

    // ==================== CONSTRUCTOR ====================
    
    /**
     * @dev Khởi tạo contract với token name, symbol và treasury wallet
     * Người deploy tự động trở thành admin
     */
    constructor(address _treasuryWallet) ERC20("QNU StarVote", "QSV") {
        if (_treasuryWallet == address(0)) revert ErrTreasuryInvalid();
        _grantRole(ADMIN_ROLE, msg.sender);
        treasuryWallet = _treasuryWallet;
        saleActive = false;
        refundEnabled = false;
    }

    // ==================== MODIFIERS ====================
    
    /**
     * @dev Chỉ cho phép admin thực thi
     */
    modifier chiAdmin() {
        if (!hasRole(ADMIN_ROLE, msg.sender)) revert ErrAdmin();
        _;
    }

    /**
     * @dev Kiểm tra không bị ban
     */
    modifier khongBiBan() {
        if (biBanVinh[msg.sender]) revert ErrBan();
        _;
    }

    // ==================== INTERNAL FUNCTIONS ====================
    
    /**
     * @dev Kiểm tra MSSV chưa được sử dụng
     */
    function _requireMSSVChuaDung(string memory _mssv) internal view {
        bytes32 key = keccak256(bytes(_mssv));
        if (mssvDaDung[key]) revert ErrMSSVUsed();
    }

    /**
     * @dev Đánh dấu MSSV đã được sử dụng
     */
    function _markMSSVDaDung(string memory _mssv) internal {
        bytes32 key = keccak256(bytes(_mssv));
        mssvDaDung[key] = true;
    }

    function _requireClaimOpen() internal view {
        if (!moNhanPhieu) revert ErrClaimClosed();
        if (lichTrinh.claimStart != 0 && block.timestamp < lichTrinh.claimStart) revert ErrClaimEarly();
        if (lichTrinh.claimEnd != 0 && block.timestamp > lichTrinh.claimEnd) revert ErrClaimLate();
    }

    function _requireVoteOpen() internal view {
        if (!moBauChon) revert ErrVoteClosed();
        if (lichTrinh.voteStart != 0 && block.timestamp < lichTrinh.voteStart) revert ErrVoteEarly();
        if (lichTrinh.voteEnd != 0 && block.timestamp > lichTrinh.voteEnd) revert ErrVoteLate();
    }

    // ==================== ADMIN FUNCTIONS ====================
    
    /**
     * @dev Admin thêm ứng viên trực tiếp
     */
    function themUngVien(
        string memory _hoTen,
        string memory _mssv,
        string memory _nganh,
        string memory _anh,
        string memory _moTa
    ) external chiAdmin {
        if (bytes(_hoTen).length == 0) revert ErrEmpty();
        if (bytes(_mssv).length == 0) revert ErrEmpty();
        _requireMSSVChuaDung(_mssv);

        tongUngVien++;
        dsUngVien[tongUngVien] = UngVien({
            id: tongUngVien,
            hoTen: _hoTen,
            mssv: _mssv,
            nganh: _nganh,
            anh: _anh,
            moTa: _moTa,
            soPhieu: 0,
            dangHoatDong: true
        });

        _markMSSVDaDung(_mssv);
        emit ThemUngVien(tongUngVien, _hoTen, _mssv, _nganh, _anh, _moTa);
    }

    /**
     * @dev Admin duyệt yêu cầu đăng ký -> trở thành ứng viên chính thức
     */
    function duyetDangKy(uint256 reqId) external chiAdmin {
        if (reqId == 0 || reqId > tongDangKy) revert ErrReqInvalid();
        UngVienDangKy storage req = dsDangKy[reqId];
        if (req.daDuyet || req.daTuChoi) revert ErrReqProcessed();
        _requireMSSVChuaDung(req.mssv);

        tongUngVien++;
        dsUngVien[tongUngVien] = UngVien({
            id: tongUngVien,
            hoTen: req.hoTen,
            mssv: req.mssv,
            nganh: req.nganh,
            anh: req.anh,
            moTa: req.moTa,
            soPhieu: 0,
            dangHoatDong: true
        });

        _markMSSVDaDung(req.mssv);
        req.daDuyet = true;

        emit DuyetUngVien(reqId, tongUngVien);
        emit ThemUngVien(tongUngVien, req.hoTen, req.mssv, req.nganh, req.anh, req.moTa);
    }

    /**
     * @dev Admin từ chối yêu cầu đăng ký
     */
    function tuChoiDangKy(uint256 reqId) external chiAdmin {
        if (reqId == 0 || reqId > tongDangKy) revert ErrReqInvalid();
        UngVienDangKy storage req = dsDangKy[reqId];
        if (req.daDuyet || req.daTuChoi) revert ErrReqProcessed();

        req.daTuChoi = true;
        emit TuChoiUngVien(reqId);
    }

    /**
     * @dev Admin khóa ứng viên (không thể bầu cho ứng viên này nữa)
     */
    function khoaUngVien(uint256 id) external chiAdmin {
        if (id == 0 || id > tongUngVien) revert ErrCandidateInvalid();
        dsUngVien[id].dangHoatDong = false;
        emit KhoaUngVien(id);
    }

    /**
     * @dev Admin mở cổng nhận token
     */
    function moNhanPhieuBau() external chiAdmin {
        moNhanPhieu = true;
        emit BatDauNhanPhieu();
    }

    /**
     * @dev Admin đóng cổng nhận token
     */
    function dongNhanPhieuBau() external chiAdmin {
        moNhanPhieu = false;
        emit DungNhanPhieu();
    }

    /**
     * @dev Admin mở cổng bầu chọn
     */
    function moBauChonChinhThuc() external chiAdmin {
        moBauChon = true;
        emit BatDauBauChon();
    }

    /**
     * @dev Admin đóng cổng bầu chọn
     */
    function dongBauChonChinhThuc() external chiAdmin {
        moBauChon = false;
        emit DungBauChon();
    }

    /**
     * @dev Admin cập nhật lịch trình sự kiện
     */
    function capNhatLichTrinh(
        uint64 _claimStart,
        uint64 _claimEnd,
        uint64 _voteStart,
        uint64 _voteEnd
    ) external chiAdmin {
        lichTrinh = LichTrinh(_claimStart, _claimEnd, _voteStart, _voteEnd);
        emit CapNhatLichTrinh(_claimStart, _claimEnd, _voteStart, _voteEnd);
    }

    /**
     * @dev Admin cập nhật số lượng người tối đa được mua token
     */
    function capNhatMaxVoters(uint256 _maxVotersMoi) external chiAdmin {
        if (_maxVotersMoi < totalTokensSold) revert ErrMaxTooLow();
        if (_maxVotersMoi == 0) revert ErrMaxZero();
        maxVoters = _maxVotersMoi;
        emit CapNhatMaxVoters(_maxVotersMoi);
    }

    // ==================== PUBLIC FUNCTIONS ====================
    
    /**
     * @dev Ứng viên tự đăng ký (pending, chờ admin duyệt)
     */
    function dangKyUngVien(
        string memory _hoTen,
        string memory _mssv,
        string memory _nganh,
        string memory _anh,
        string memory _moTa
    ) external returns (uint256) {
        if (bytes(_hoTen).length == 0) revert ErrEmpty();
        if (bytes(_mssv).length == 0) revert ErrEmpty();

        // Kiểm tra 1 địa chỉ chỉ có 1 yêu cầu pending
        uint256 existed = yeuCauTheoDiaChi[msg.sender];
        if (existed != 0) {
            UngVienDangKy storage req = dsDangKy[existed];
            if (!req.daDuyet && !req.daTuChoi) revert ErrReqProcessed();
        }

        // Không cho trùng MSSV đã duyệt
        _requireMSSVChuaDung(_mssv);

        tongDangKy++;
        dsDangKy[tongDangKy] = UngVienDangKy({
            id: tongDangKy,
            nguoiDangKy: msg.sender,
            hoTen: _hoTen,
            mssv: _mssv,
            nganh: _nganh,
            anh: _anh,
            moTa: _moTa,
            daDuyet: false,
            daTuChoi: false
        });

        yeuCauTheoDiaChi[msg.sender] = tongDangKy;
        emit DangKyUngVien(tongDangKy, msg.sender, _mssv);
        return tongDangKy;
    }

    // ==================== TOKEN SALE ====================
    
    /**
     * @dev Admin mở bán token
     */
    function moBanToken() external chiAdmin {
        saleActive = true;
        emit SaleStarted();
    }

    /**
     * @dev Admin đóng bán token
     */
    function dongBanToken() external chiAdmin {
        saleActive = false;
        emit SaleStopped();
    }

    /**
     * @dev Sinh viên mua token để bầu chọn (payable)
     * Phải gửi đúng 0.001 ETH
     */
    function muaToken() external payable khongBiBan {
        if (!saleActive) revert ErrSaleClosed();
        _requireClaimOpen();
        if (msg.value != TOKEN_PRICE) revert ErrWrongPrice();
        if (daMuaToken[msg.sender]) revert ErrBought();
        if (totalTokensSold >= maxVoters) revert ErrSoldOut();

        daMuaToken[msg.sender] = true;
        totalTokensSold++;
        _mint(msg.sender, 1 * 10 ** decimals());

        emit TokenPurchased(msg.sender, 1, msg.value);
    }

    /**
     * @dev Admin rút tiền về treasury (trừ dự phòng refund)
     */
    function rutTien() external chiAdmin nonReentrant {
        uint256 balance = address(this).balance;
        if (tongRefund > totalTokensSold) revert ErrRefundData();

        uint256 refundable = totalTokensSold - tongRefund;
        uint256 requiredBuffer = refundable * TOKEN_PRICE;
        if (balance <= requiredBuffer) revert ErrWithdrawBlocked();

        uint256 amountToWithdraw = balance - requiredBuffer;
        (bool success, ) = treasuryWallet.call{value: amountToWithdraw}("");
        if (!success) revert ErrTransferFail();

        emit FundsWithdrawn(treasuryWallet, amountToWithdraw);
    }

    /**
     * @dev Admin rút toàn bộ sau khi đóng refund
     */
    function rutToanBo() external chiAdmin nonReentrant {
        if (refundEnabled) revert ErrWithdrawBlocked();
        
        uint256 balance = address(this).balance;
        if (balance == 0) revert ErrNoFunds();
        
        (bool success, ) = treasuryWallet.call{value: balance}("");
        if (!success) revert ErrTransferFail();
        
        emit FundsWithdrawn(treasuryWallet, balance);
    }

    /**
     * @dev Bầu chọn cho ứng viên
     * Token sẽ bị burn sau khi vote
     * LƯU LỊCH SỬ BẦU CHỌN
     */
    function bauChon(uint256 ungVienId) external khongBiBan {
        _requireVoteOpen();
        if (!daMuaToken[msg.sender]) revert ErrNotBought();
        if (daBau[msg.sender]) revert ErrVoted();
        if (ungVienId == 0 || ungVienId > tongUngVien) revert ErrCandidateInvalid();
        if (!dsUngVien[ungVienId].dangHoatDong) revert ErrCandidateLocked();

        // Burn token
        _burn(msg.sender, 1 * 10 ** decimals());
        
        // Đánh dấu đã bầu
        daBau[msg.sender] = true;
        bauChoId[msg.sender] = ungVienId;
        thoiGianBau[msg.sender] = block.timestamp;
        
        // Tăng số phiếu
        dsUngVien[ungVienId].soPhieu++;

        //  LƯU LỊCH SỬ BẦU CHỌN
        chiSoLichSu[msg.sender] = lichSuBauChon.length;
        lichSuBauChon.push(LichSuBauChon({
            voter: msg.sender,
            ungVienId: ungVienId,
            timestamp: block.timestamp,
            ipHash: ""  // Có thể thêm hash IP từ off-chain
        }));

        emit DaBauChon(msg.sender, ungVienId, block.timestamp);
    }

    // ==================== REFUND (THU HỒI TOKEN) ====================
    
    /**
     * @dev Admin bật refund sau khi kết thúc bầu chọn
     */
    function batRefund() external chiAdmin {
        refundEnabled = true;
        emit RefundEnabled();
    }

    /**
     * @dev Admin tắt refund
     */
    function tatRefund() external chiAdmin {
        refundEnabled = false;
        emit RefundDisabled();
    }

    /**
     * @dev Người dùng yêu cầu hoàn tiền nếu không vote
     *  THU HỒI TOKEN: Burn token + Hoàn ETH
     */
    function yeuCauHoanTien() external nonReentrant {
        if (!refundEnabled) revert ErrRefundClosed();
        if (!daMuaToken[msg.sender]) revert ErrNotBought();
        if (daBau[msg.sender]) revert ErrVoted();
        if (daRefund[msg.sender]) revert ErrRefunded();
        if (balanceOf(msg.sender) < 1 * 10 ** decimals()) revert ErrBalanceLow();

        // Burn token
        _burn(msg.sender, 1 * 10 ** decimals());
        
        // Đánh dấu đã refund
        daRefund[msg.sender] = true;
        tongRefund++;

        // Hoàn ETH
        (bool success, ) = msg.sender.call{value: TOKEN_PRICE}("");
        if (!success) revert ErrTransferFail();

        emit Refunded(msg.sender, TOKEN_PRICE);
    }

    // ==================== PHÁT HIỆN GIAN LẬN ====================
    
    /**
     * @dev Admin báo cáo gian lận
     *  KIỂM TRA GIAN LẬN: Lưu lại để xử lý
     */
    function baoCaoGianLan(address wallet, string memory lyDo) external chiAdmin {
        dsGianLan.push(GianLan({
            wallet: wallet,
            lyDo: lyDo,
            timestamp: block.timestamp,
            daXuLy: false
        }));

        emit GianLanPhatHien(wallet, lyDo, block.timestamp);
    }

    /**
     * @dev Admin ban ví vĩnh viễn
     */
    function banVi(address wallet) external chiAdmin {
        biBanVinh[wallet] = true;
        emit WalletBanned(wallet);
    }

    /**
     * @dev Admin unban ví
     */
    function unbanVi(address wallet) external chiAdmin {
        biBanVinh[wallet] = false;
    }

    /**
     * @dev Đánh dấu gian lận đã xử lý
     */
    function daXuLyGianLan(uint256 index) external chiAdmin {
        if (index >= dsGianLan.length) revert ErrIndexInvalid();
        dsGianLan[index].daXuLy = true;
    }

    // ==================== VIEW FUNCTIONS ====================
    
    /**
     * @dev Lấy ID ứng viên có số phiếu cao nhất
     * @return idThang ID của ứng viên thắng cuộc
     */
    function layNguoiThang() external view returns (uint256 idThang) {
        uint256 maxPhieu;
        for (uint256 i = 1; i <= tongUngVien; i++) {
            if (dsUngVien[i].soPhieu > maxPhieu) {
                maxPhieu = dsUngVien[i].soPhieu;
                idThang = i;
            }
        }
    }

    /**
     * @dev Lấy tổng số lịch sử bầu chọn
     */
    function tongLichSuBauChon() external view returns (uint256) {
        return lichSuBauChon.length;
    }

    /**
     * @dev Lấy lịch sử bầu chọn theo index
     */
    function layLichSuBauChon(uint256 index) external view returns (
        address voter,
        uint256 ungVienId,
        uint256 timestamp,
        string memory ipHash
    ) {
        if (index >= lichSuBauChon.length) revert ErrIndexInvalid();
        LichSuBauChon memory ls = lichSuBauChon[index];
        return (ls.voter, ls.ungVienId, ls.timestamp, ls.ipHash);
    }

    /**
     * @dev Lấy lịch sử bầu chọn của một địa chỉ
     */
    function layLichSuCuaToi() external view returns (
        uint256 ungVienId,
        uint256 timestamp
    ) {
        if (!daBau[msg.sender]) revert ErrNotVoted();
        return (bauChoId[msg.sender], thoiGianBau[msg.sender]);
    }

    /**
     * @dev Lấy tổng số gian lận
     */
    function tongGianLan() external view returns (uint256) {
        return dsGianLan.length;
    }

    /**
     * @dev Lấy thông tin gian lận theo index
     */
    function layGianLan(uint256 index) external view returns (
        address wallet,
        string memory lyDo,
        uint256 timestamp,
        bool daXuLy
    ) {
        if (index >= dsGianLan.length) revert ErrIndexInvalid();
        GianLan memory gl = dsGianLan[index];
        return (gl.wallet, gl.lyDo, gl.timestamp, gl.daXuLy);
    }

    /**
     * @dev Kiểm tra user có thể refund không
     */
    function coTheRefund(address user) external view returns (bool) {
        return refundEnabled 
            && daMuaToken[user] 
            && !daBau[user] 
            && !daRefund[user]
            && balanceOf(user) >= 1 * 10 ** decimals();
    }

    /**
     * @dev Lấy số token còn lại có thể mua
     */
    function soTokenConLai() external view returns (uint256) {
        return maxVoters - totalTokensSold;
    }

    /**
     * @dev Lấy tổng tiền đã thu
     */
    function tongTienThu() external view returns (uint256) {
        return totalTokensSold * TOKEN_PRICE;
    }

    // Fallback để nhận ETH
    receive() external payable {}
}
