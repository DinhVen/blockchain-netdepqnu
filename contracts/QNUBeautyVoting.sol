// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract QNUBeautyVoting is ERC20, AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = DEFAULT_ADMIN_ROLE;

    // ==================== TOKEN SALE CONFIG ====================
    uint256 public constant TOKEN_PRICE = 0.001 ether;
    uint256 public maxVoters = 500;
    uint256 public totalTokensSold;
    bool public saleActive;

    // ==================== STRUCTS ====================
    struct UngVien {
        uint256 id;
        string hoTen;
        string mssv;
        string nganh;
        string anh;
        string moTa;
        uint256 soPhieu;
        bool dangHoatDong;
    }

    struct UngVienDangKy {
        uint256 id;
        address nguoiDangKy;
        string hoTen;
        string mssv;
        string nganh;
        string anh;
        string moTa;
        bool daDuyet;
        bool daTuChoi;
    }

    struct LichTrinh {
        uint64 claimStart;
        uint64 claimEnd;
        uint64 voteStart;
        uint64 voteEnd;
    }

    // ==================== STATE VARIABLES ====================
    uint256 public tongUngVien;
    mapping(uint256 => UngVien) public dsUngVien;

    uint256 public tongDangKy;
    mapping(uint256 => UngVienDangKy) public dsDangKy;
    mapping(address => uint256) public yeuCauTheoDiaChi;

    bool public moBauChon;
    mapping(address => bool) public daMuaToken;
    mapping(address => bool) public daBau;
    mapping(address => uint256) public bauChoId;
    mapping(address => uint256) public thoiGianBau;

    // ==================== LỊCH SỬ BẦU CHỌN ====================
    struct LichSuBauChon {
        address voter;
        uint256 ungVienId;
        uint256 timestamp;
        string ipHash;
    }

    LichSuBauChon[] public lichSuBauChon;
    mapping(address => uint256) public chiSoLichSu;

    // ==================== PHÁT HIỆN GIAN LẬN ====================
    struct GianLan {
        address wallet;
        string lyDo;
        uint256 timestamp;
        bool daXuLy;
    }

    GianLan[] public dsGianLan;
    mapping(address => bool) public biBanVinh;

    LichTrinh public lichTrinh;
    address public adminWallet;

    // ==================== EVENTS ====================
    event ThemUngVien(uint256 indexed id, string hoTen, string mssv, string nganh, string anh, string moTa);
    event KhoaUngVien(uint256 indexed id);
    event MoKhoaUngVien(uint256 indexed id);
    event DangKyUngVien(uint256 indexed reqId, address indexed nguoiDangKy, string mssv);
    event DuyetUngVien(uint256 indexed reqId, uint256 indexed ungVienId);
    event TuChoiUngVien(uint256 indexed reqId);
    event TokenPurchased(address indexed buyer, uint256 amount, uint256 ethPaid);
    event SaleStarted();
    event SaleStopped();
    event BatDauBauChon();
    event DungBauChon();
    event DaBauChon(address indexed voter, uint256 indexed ungVienId, uint256 timestamp);
    event GianLanPhatHien(address indexed wallet, string lyDo, uint256 timestamp);
    event WalletBanned(address indexed wallet);
    event CapNhatLichTrinh(uint64 claimStart, uint64 claimEnd, uint64 voteStart, uint64 voteEnd);
    event CapNhatMaxVoters(uint256 maxVotersMoi);
    event Refunded(address indexed user, uint256 amount);

    // ==================== ERRORS ====================
    error ErrAdmin();
    error ErrBan();
    error ErrClaimEarly();
    error ErrClaimLate();
    error ErrVoteClosed();
    error ErrVoteEarly();
    error ErrVoteLate();
    error ErrEmpty();
    error ErrReqInvalid();
    error ErrReqProcessed();
    error ErrSoldOut();
    error ErrWrongPrice();
    error ErrBought();
    error ErrNotBought();
    error ErrVoted();
    error ErrNotVoted();
    error ErrCandidateInvalid();
    error ErrCandidateLocked();
    error ErrIndexInvalid();
    error ErrMaxTooLow();
    error ErrMaxZero();
    error ErrSaleClosed();
    error ErrTransferFail();
    error ErrScheduleNotSet();

    // ==================== CONSTRUCTOR ====================
    constructor() ERC20("QNU StarVote", "QSV") {
        _grantRole(ADMIN_ROLE, msg.sender);
        adminWallet = msg.sender;
        saleActive = false;
        moBauChon = false;
    }

    // ==================== MODIFIERS ====================
    modifier chiAdmin() {
        if (!hasRole(ADMIN_ROLE, msg.sender)) revert ErrAdmin();
        _;
    }

    modifier khongBiBan() {
        if (biBanVinh[msg.sender]) revert ErrBan();
        _;
    }

    // ==================== INTERNAL ====================
    function _requireClaimTimeOK() internal view {
        if (lichTrinh.claimStart != 0 && block.timestamp < lichTrinh.claimStart) revert ErrClaimEarly();
        if (lichTrinh.claimEnd != 0 && block.timestamp > lichTrinh.claimEnd) revert ErrClaimLate();
    }

    function _requireVoteOpen() internal view {
        if (!moBauChon) revert ErrVoteClosed();
        if (lichTrinh.voteStart != 0 && block.timestamp < lichTrinh.voteStart) revert ErrVoteEarly();
        if (lichTrinh.voteEnd != 0 && block.timestamp > lichTrinh.voteEnd) revert ErrVoteLate();
    }

    // ==================== ADMIN: ỨNG VIÊN ====================
    function themUngVien(
        string memory _hoTen,
        string memory _mssv,
        string memory _nganh,
        string memory _anh,
        string memory _moTa
    ) external chiAdmin {
        if (bytes(_hoTen).length == 0) revert ErrEmpty();
        if (bytes(_mssv).length == 0) revert ErrEmpty();

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

        emit ThemUngVien(tongUngVien, _hoTen, _mssv, _nganh, _anh, _moTa);
    }

    function duyetDangKy(uint256 reqId) external chiAdmin {
        if (reqId == 0 || reqId > tongDangKy) revert ErrReqInvalid();
        UngVienDangKy storage req = dsDangKy[reqId];
        if (req.daDuyet || req.daTuChoi) revert ErrReqProcessed();

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

        req.daDuyet = true;
        emit DuyetUngVien(reqId, tongUngVien);
        emit ThemUngVien(tongUngVien, req.hoTen, req.mssv, req.nganh, req.anh, req.moTa);
    }

    function tuChoiDangKy(uint256 reqId) external chiAdmin {
        if (reqId == 0 || reqId > tongDangKy) revert ErrReqInvalid();
        UngVienDangKy storage req = dsDangKy[reqId];
        if (req.daDuyet || req.daTuChoi) revert ErrReqProcessed();
        req.daTuChoi = true;
        emit TuChoiUngVien(reqId);
    }

    function khoaUngVien(uint256 id) external chiAdmin {
        if (id == 0 || id > tongUngVien) revert ErrCandidateInvalid();
        dsUngVien[id].dangHoatDong = false;
        emit KhoaUngVien(id);
    }

    function moKhoaUngVien(uint256 id) external chiAdmin {
        if (id == 0 || id > tongUngVien) revert ErrCandidateInvalid();
        dsUngVien[id].dangHoatDong = true;
        emit MoKhoaUngVien(id);
    }

    // ==================== ADMIN: TRẠNG THÁI & LỊCH ====================
    function moBauChonChinhThuc() external chiAdmin {
        if (lichTrinh.voteStart == 0 || lichTrinh.voteEnd == 0) revert ErrScheduleNotSet();
        moBauChon = true;
        emit BatDauBauChon();
    }

    function dongBauChonChinhThuc() external chiAdmin {
        moBauChon = false;
        emit DungBauChon();
    }

    function capNhatLichTrinh(
        uint64 _claimStart,
        uint64 _claimEnd,
        uint64 _voteStart,
        uint64 _voteEnd
    ) external chiAdmin {
        lichTrinh = LichTrinh(_claimStart, _claimEnd, _voteStart, _voteEnd);
        emit CapNhatLichTrinh(_claimStart, _claimEnd, _voteStart, _voteEnd);
    }

    function capNhatMaxVoters(uint256 _maxVotersMoi) external chiAdmin {
        if (_maxVotersMoi < totalTokensSold) revert ErrMaxTooLow();
        if (_maxVotersMoi == 0) revert ErrMaxZero();
        maxVoters = _maxVotersMoi;
        emit CapNhatMaxVoters(_maxVotersMoi);
    }

    // ==================== PUBLIC: ĐĂNG KÝ ỨNG VIÊN ====================
    function dangKyUngVien(
        string memory _hoTen,
        string memory _mssv,
        string memory _nganh,
        string memory _anh,
        string memory _moTa
    ) external returns (uint256) {
        if (bytes(_hoTen).length == 0) revert ErrEmpty();
        if (bytes(_mssv).length == 0) revert ErrEmpty();

        uint256 existed = yeuCauTheoDiaChi[msg.sender];
        if (existed != 0) {
            UngVienDangKy storage oldReq = dsDangKy[existed];
            if (!oldReq.daDuyet && !oldReq.daTuChoi) revert ErrReqProcessed();
        }

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
    function moBanToken() external chiAdmin {
        if (lichTrinh.claimStart == 0 || lichTrinh.claimEnd == 0) revert ErrScheduleNotSet();
        saleActive = true;
        emit SaleStarted();
    }

    function dongBanToken() external chiAdmin {
        saleActive = false;
        emit SaleStopped();
    }

    function muaToken() external payable khongBiBan {
        if (!saleActive) revert ErrSaleClosed();
        _requireClaimTimeOK();
        if (msg.value != TOKEN_PRICE) revert ErrWrongPrice();
        if (daMuaToken[msg.sender]) revert ErrBought();
        if (totalTokensSold >= maxVoters) revert ErrSoldOut();

        daMuaToken[msg.sender] = true;
        totalTokensSold++;
        _mint(msg.sender, 1 * 10 ** decimals());

        emit TokenPurchased(msg.sender, 1, msg.value);
    }

    // ==================== BẦU CHỌN ====================
    function bauChon(uint256 ungVienId) external khongBiBan {
        _requireVoteOpen();
        if (!daMuaToken[msg.sender]) revert ErrNotBought();
        if (daBau[msg.sender]) revert ErrVoted();
        if (ungVienId == 0 || ungVienId > tongUngVien) revert ErrCandidateInvalid();
        if (!dsUngVien[ungVienId].dangHoatDong) revert ErrCandidateLocked();

        // Lấy token về ví admin (cần user approve trước)
        uint256 amount = 1 * 10 ** decimals();
        require(allowance(msg.sender, address(this)) >= amount, "Chua approve token");
        _transfer(msg.sender, adminWallet, amount);

        daBau[msg.sender] = true;
        bauChoId[msg.sender] = ungVienId;
        thoiGianBau[msg.sender] = block.timestamp;
        dsUngVien[ungVienId].soPhieu++;

        chiSoLichSu[msg.sender] = lichSuBauChon.length;
        lichSuBauChon.push(LichSuBauChon({
            voter: msg.sender,
            ungVienId: ungVienId,
            timestamp: block.timestamp,
            ipHash: ""
        }));

        emit DaBauChon(msg.sender, ungVienId, block.timestamp);
    }

    // ==================== REFUND ====================
    // Admin refund ETH cho 1 user đã vote
    function refundUser(address user) external chiAdmin nonReentrant {
        require(daBau[user], "User chua vote");
        require(address(this).balance >= TOKEN_PRICE, "Contract khong du ETH");
        
        (bool success, ) = user.call{value: TOKEN_PRICE}("");
        require(success, "Refund that bai");
        
        emit Refunded(user, TOKEN_PRICE);
    }

    // Admin refund ETH cho nhiều user
    function refundBatch(address[] calldata users) external chiAdmin nonReentrant {
        for (uint i = 0; i < users.length; i++) {
            if (daBau[users[i]] && address(this).balance >= TOKEN_PRICE) {
                (bool success, ) = users[i].call{value: TOKEN_PRICE}("");
                if (success) {
                    emit Refunded(users[i], TOKEN_PRICE);
                }
            }
        }
    }

    // Kiểm tra user đã approve chưa
    function daApprove(address user) external view returns (bool) {
        return allowance(user, address(this)) >= 1 * 10 ** decimals();
    }

    // ==================== GIAN LẬN ====================
    function baoCaoGianLan(address wallet, string memory lyDo) external chiAdmin {
        dsGianLan.push(GianLan({
            wallet: wallet,
            lyDo: lyDo,
            timestamp: block.timestamp,
            daXuLy: false
        }));
        emit GianLanPhatHien(wallet, lyDo, block.timestamp);
    }

    function banVi(address wallet) external chiAdmin {
        biBanVinh[wallet] = true;
        emit WalletBanned(wallet);
    }

    function unbanVi(address wallet) external chiAdmin {
        biBanVinh[wallet] = false;
    }

    function daXuLyGianLan(uint256 index) external chiAdmin {
        if (index >= dsGianLan.length) revert ErrIndexInvalid();
        dsGianLan[index].daXuLy = true;
    }

    // ==================== VIEW ====================
    function layNguoiThang() external view returns (uint256 idThang) {
        uint256 maxPhieu;
        for (uint256 i = 1; i <= tongUngVien; i++) {
            if (dsUngVien[i].soPhieu > maxPhieu) {
                maxPhieu = dsUngVien[i].soPhieu;
                idThang = i;
            }
        }
    }

    function tongLichSuBauChon() external view returns (uint256) {
        return lichSuBauChon.length;
    }

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

    function layLichSuCuaToi() external view returns (uint256 ungVienId, uint256 timestamp) {
        if (!daBau[msg.sender]) revert ErrNotVoted();
        return (bauChoId[msg.sender], thoiGianBau[msg.sender]);
    }

    function tongGianLan() external view returns (uint256) {
        return dsGianLan.length;
    }

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

    function soTokenConLai() external view returns (uint256) {
        return maxVoters - totalTokensSold;
    }

    function tongTienThu() external view returns (uint256) {
        return totalTokensSold * TOKEN_PRICE;
    }

    receive() external payable {}
}
