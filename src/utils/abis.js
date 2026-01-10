export const VOTING_ABI = [
  // Constructor - no parameters (removed treasuryWallet)
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  // Errors
  { inputs: [], name: "ErrAdmin", type: "error" },
  { inputs: [], name: "ErrBan", type: "error" },
  { inputs: [], name: "ErrBought", type: "error" },
  { inputs: [], name: "ErrCandidateInvalid", type: "error" },
  { inputs: [], name: "ErrCandidateLocked", type: "error" },
  { inputs: [], name: "ErrClaimEarly", type: "error" },
  { inputs: [], name: "ErrClaimLate", type: "error" },
  { inputs: [], name: "ErrEmpty", type: "error" },
  { inputs: [], name: "ErrIndexInvalid", type: "error" },
  { inputs: [], name: "ErrMaxTooLow", type: "error" },
  { inputs: [], name: "ErrMaxZero", type: "error" },
  { inputs: [], name: "ErrNotApproved", type: "error" },
  { inputs: [], name: "ErrNotBought", type: "error" },
  { inputs: [], name: "ErrNotVoted", type: "error" },
  { inputs: [], name: "ErrReqInvalid", type: "error" },
  { inputs: [], name: "ErrReqProcessed", type: "error" },
  { inputs: [], name: "ErrSaleClosed", type: "error" },
  { inputs: [], name: "ErrSoldOut", type: "error" },
  { inputs: [], name: "ErrTransferFail", type: "error" },
  { inputs: [], name: "ErrVoteClosed", type: "error" },
  { inputs: [], name: "ErrVoteEarly", type: "error" },
  { inputs: [], name: "ErrVoteLate", type: "error" },
  { inputs: [], name: "ErrVoted", type: "error" },
  { inputs: [], name: "ErrWrongPrice", type: "error" },
  { inputs: [], name: "ErrInsufficientBalance", type: "error" },
  { inputs: [], name: "ErrInsufficientAllowance", type: "error" },
  // Events
  { anonymous: false, inputs: [], name: "BatDauBauChon", type: "event" },
  { anonymous: false, inputs: [], name: "DungBauChon", type: "event" },
  { anonymous: false, inputs: [], name: "SaleStarted", type: "event" },
  { anonymous: false, inputs: [], name: "SaleStopped", type: "event" },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "voter", type: "address" },
      { indexed: true, internalType: "uint256", name: "ungVienId", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" }
    ],
    name: "DaBauChon",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "buyer", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "ethPaid", type: "uint256" }
    ],
    name: "TokenPurchased",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "owner", type: "address" },
      { indexed: true, internalType: "address", name: "spender", type: "address" },
      { indexed: false, internalType: "uint256", name: "value", type: "uint256" }
    ],
    name: "Approval",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      { indexed: false, internalType: "uint256", name: "value", type: "uint256" }
    ],
    name: "Transfer",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "Refunded",
    type: "event"
  },
  // ERC20 View functions
  { inputs: [], name: "name", outputs: [{ type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "symbol", outputs: [{ type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "decimals", outputs: [{ type: "uint8" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalSupply", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ type: "address" }], name: "balanceOf", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ type: "address" }, { type: "address" }], name: "allowance", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  // Contract View functions
  { inputs: [], name: "ADMIN_ROLE", outputs: [{ type: "bytes32" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "TOKEN_PRICE", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "maxVoters", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalTokensSold", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "saleActive", outputs: [{ type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "moBauChon", outputs: [{ type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "tongUngVien", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "tongDangKy", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "soTokenConLai", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "tongTienThu", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "tongLichSuBauChon", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "tongGianLan", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "layNguoiThang", outputs: [{ internalType: "uint256", name: "idThang", type: "uint256" }], stateMutability: "view", type: "function" },
  {
    inputs: [],
    name: "lichTrinh",
    outputs: [
      { internalType: "uint64", name: "claimStart", type: "uint64" },
      { internalType: "uint64", name: "claimEnd", type: "uint64" },
      { internalType: "uint64", name: "voteStart", type: "uint64" },
      { internalType: "uint64", name: "voteEnd", type: "uint64" }
    ],
    stateMutability: "view",
    type: "function"
  },
  // Mappings
  { inputs: [{ type: "address" }], name: "daMuaToken", outputs: [{ type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [{ type: "address" }], name: "daBau", outputs: [{ type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [{ type: "address" }], name: "daApprove", outputs: [{ type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [{ type: "address" }], name: "bauChoId", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ type: "address" }], name: "thoiGianBau", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ type: "address" }], name: "biBanVinh", outputs: [{ type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [{ type: "address" }], name: "ethPaid", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  {
    inputs: [{ type: "uint256" }],
    name: "dsUngVien",
    outputs: [
      { name: "id", type: "uint256" },
      { name: "hoTen", type: "string" },
      { name: "mssv", type: "string" },
      { name: "nganh", type: "string" },
      { name: "anh", type: "string" },
      { name: "moTa", type: "string" },
      { name: "soPhieu", type: "uint256" },
      { name: "dangHoatDong", type: "bool" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ type: "uint256" }],
    name: "dsDangKy",
    outputs: [
      { name: "id", type: "uint256" },
      { name: "nguoiDangKy", type: "address" },
      { name: "hoTen", type: "string" },
      { name: "mssv", type: "string" },
      { name: "nganh", type: "string" },
      { name: "anh", type: "string" },
      { name: "moTa", type: "string" },
      { name: "daDuyet", type: "bool" },
      { name: "daTuChoi", type: "bool" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ type: "uint256" }],
    name: "layLichSuBauChon",
    outputs: [
      { name: "voter", type: "address" },
      { name: "ungVienId", type: "uint256" },
      { name: "timestamp", type: "uint256" },
      { name: "ipHash", type: "string" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "layLichSuCuaToi",
    outputs: [
      { name: "ungVienId", type: "uint256" },
      { name: "timestamp", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ type: "uint256" }],
    name: "layGianLan",
    outputs: [
      { name: "wallet", type: "address" },
      { name: "lyDo", type: "string" },
      { name: "timestamp", type: "uint256" },
      { name: "daXuLy", type: "bool" }
    ],
    stateMutability: "view",
    type: "function"
  },
  { inputs: [{ type: "bytes32" }, { type: "address" }], name: "hasRole", outputs: [{ type: "bool" }], stateMutability: "view", type: "function" },
  // ERC20 functions
  { 
    inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], 
    name: "approve", 
    outputs: [{ type: "bool" }], 
    stateMutability: "nonpayable", 
    type: "function" 
  },
  { 
    inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }], 
    name: "transfer", 
    outputs: [{ type: "bool" }], 
    stateMutability: "nonpayable", 
    type: "function" 
  },
  { 
    inputs: [{ name: "from", type: "address" }, { name: "to", type: "address" }, { name: "amount", type: "uint256" }], 
    name: "transferFrom", 
    outputs: [{ type: "bool" }], 
    stateMutability: "nonpayable", 
    type: "function" 
  },
  // User functions
  { inputs: [], name: "muaToken", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [{ internalType: "uint256", name: "ungVienId", type: "uint256" }], name: "bauChon", outputs: [], stateMutability: "nonpayable", type: "function" },
  {
    inputs: [
      { name: "_hoTen", type: "string" },
      { name: "_mssv", type: "string" },
      { name: "_nganh", type: "string" },
      { name: "_anh", type: "string" },
      { name: "_moTa", type: "string" }
    ],
    name: "dangKyUngVien",
    outputs: [{ type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  // Admin functions
  { inputs: [], name: "moBanToken", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "dongBanToken", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "moBauChonChinhThuc", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "dongBauChonChinhThuc", outputs: [], stateMutability: "nonpayable", type: "function" },
  {
    inputs: [
      { name: "_hoTen", type: "string" },
      { name: "_mssv", type: "string" },
      { name: "_nganh", type: "string" },
      { name: "_anh", type: "string" },
      { name: "_moTa", type: "string" }
    ],
    name: "themUngVien",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  { inputs: [{ name: "id", type: "uint256" }], name: "khoaUngVien", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "reqId", type: "uint256" }], name: "duyetDangKy", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "reqId", type: "uint256" }], name: "tuChoiDangKy", outputs: [], stateMutability: "nonpayable", type: "function" },
  {
    inputs: [
      { name: "_claimStart", type: "uint64" },
      { name: "_claimEnd", type: "uint64" },
      { name: "_voteStart", type: "uint64" },
      { name: "_voteEnd", type: "uint64" }
    ],
    name: "capNhatLichTrinh",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  { inputs: [{ name: "_maxVotersMoi", type: "uint256" }], name: "capNhatMaxVoters", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "wallet", type: "address" }], name: "banVi", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "wallet", type: "address" }], name: "unbanVi", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "wallet", type: "address" }, { name: "lyDo", type: "string" }], name: "baoCaoGianLan", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "index", type: "uint256" }], name: "daXuLyGianLan", outputs: [], stateMutability: "nonpayable", type: "function" },
  // Refund functions (Admin only)
  { inputs: [{ name: "user", type: "address" }], name: "refundUser", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "users", type: "address[]" }], name: "refundBatch", outputs: [], stateMutability: "nonpayable", type: "function" },
  // Receive ETH
  { stateMutability: "payable", type: "receive" }
];
