import { useContext, useEffect, useState } from 'react';
import { Web3Context } from '../context/Web3Context';

const Admin = () => {
  const {
    votingContract,
    isAdmin,
    schedule,
    saveSchedule,
    isLoading,
    setIsLoading,
    hideCandidates,
    setHideCandidates,
  } = useContext(Web3Context);

  const [formData, setFormData] = useState({ name: '', mssv: '', major: '', image: '', bio: '' });
  const [disableId, setDisableId] = useState('');
  const [status, setStatus] = useState({ claim: false, vote: false, sale: false, refund: false });
  const [stats, setStats] = useState({ remaining: null, sold: null, max: null, revenue: null });
  const [newMaxVoters, setNewMaxVoters] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  const [loadingConflicts, setLoadingConflicts] = useState(false);
  const [scheduleInput, setScheduleInput] = useState({
    claimStart: '',
    claimEnd: '',
    voteStart: '',
    voteEnd: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [voteHistory, setVoteHistory] = useState([]);
  const [loadingVoteHistory, setLoadingVoteHistory] = useState(false);

  const API_BASE = import.meta.env.VITE_OTP_API || 'http://localhost:3001';
  const ADMIN_API_KEY = import.meta.env.VITE_ADMIN_API_KEY || '';
  const toggleHideCandidates = () => setHideCandidates(!hideCandidates);

  const toLocalInput = (ms) => {
    if (!ms) return '';
    const d = new Date(ms);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  useEffect(() => {
    setScheduleInput({
      claimStart: toLocalInput(schedule.claimStart),
      claimEnd: toLocalInput(schedule.claimEnd),
      voteStart: toLocalInput(schedule.voteStart),
      voteEnd: toLocalInput(schedule.voteEnd),
    });
  }, [schedule]);

  const loadStatus = async () => {
    if (!votingContract) return;
    try {
      const claim = await votingContract.moNhanPhieu();
      const vote = await votingContract.moBauChon();
      const sale = await votingContract.saleActive();
      const refund = await votingContract.refundEnabled();
      setStatus({ claim, vote, sale, refund });

      try {
        const remaining = await votingContract.soTokenConLai();
        const sold = await votingContract.totalTokensSold();
        const max = await votingContract.maxVoters();
        const revenue = await votingContract.tongTienThu();
        setStats({
          remaining: Number(remaining),
          sold: Number(sold),
          max: Number(max),
          revenue: revenue.toString(),
        });
      } catch (e) {
        console.warn('Khong lay duoc thong ke token', e);
      }
    } catch (e) {
      console.warn('Khong lay duoc trang thai claim/vote', e);
    }
  };

  const loadCandidates = async () => {
    if (!votingContract) return;
    setLoadingCandidates(true);
    try {
      const total = await votingContract.tongUngVien();
      const list = await Promise.all(
        Array.from({ length: Number(total) }, (_, i) => votingContract.dsUngVien(i + 1))
      );
      const formatted = list
        .map((c) => ({
          id: Number(c.id),
          name: c.hoTen,
          mssv: c.mssv,
          major: c.nganh,
          votes: Number(c.soPhieu),
          isActive: c.dangHoatDong,
          image: c.anh,
          bio: c.moTa,
        }))
        .filter((c) => c.id > 0);
      setCandidates(formatted);
    } catch (e) {
      console.warn('Khong tai duoc danh sach ung vien', e);
    }
    setLoadingCandidates(false);
  };

  const loadRequests = async () => {
    if (!votingContract) return;
    setLoadingRequests(true);
    try {
      const total = await votingContract.tongDangKy();
      const list = await Promise.all(
        Array.from({ length: Number(total) }, (_, i) => votingContract.dsDangKy(i + 1))
      );
      const formatted = list
        .map((r) => ({
          id: Number(r.id),
          from: r.nguoiDangKy,
          name: r.hoTen,
          mssv: r.mssv,
          major: r.nganh,
          image: r.anh,
          bio: r.moTa,
          approved: r.daDuyet,
          rejected: r.daTuChoi,
        }))
        .filter((r) => r.id > 0);
      setRequests(formatted);
    } catch (e) {
      console.warn('Khong tai duoc danh sach yeu cau', e);
    }
    setLoadingRequests(false);
  };

  const loadConflicts = async () => {
    if (!ADMIN_API_KEY) {
      console.warn('No ADMIN_API_KEY configured');
      return;
    }
    setLoadingConflicts(true);
    try {
      const res = await fetch(`${API_BASE}/admin/conflicts`, {
        headers: { 'x-api-key': ADMIN_API_KEY },
      });
      if (res.ok) {
        const data = await res.json();
        setConflicts(data.data || []);
      }
    } catch (e) {
      console.warn('Khong tai duoc conflicts', e);
    }
    setLoadingConflicts(false);
  };

  const loadVoteHistory = async () => {
    setLoadingVoteHistory(true);
    try {
      const res = await fetch(`${API_BASE}/vote/history`);
      if (res.ok) {
        const data = await res.json();
        setVoteHistory(data.votes || []);
      }
    } catch (e) {
      console.warn('Khong tai duoc lich su bau chon', e);
    }
    setLoadingVoteHistory(false);
  };



  const addCandidate = async () => {
    if (!votingContract) return alert('Chua ket noi vi/admin');

    const trimmedName = formData.name.trim();
    const trimmedMssv = formData.mssv.trim();
    const trimmedMajor = formData.major.trim();
    const trimmedImage = formData.image.trim();
    const trimmedBio = formData.bio.trim();

    if (!trimmedName) return alert('Vui long nhap ten ung vien');
    if (trimmedName.length < 3 || trimmedName.length > 100) return alert('Ten ung vien phai 3-100 ky tu');
    if (!trimmedMssv) return alert('Vui long nhap MSSV');
    if (!/^\d{8}$/.test(trimmedMssv)) return alert('MSSV phai la 8 chu so');
    if (!trimmedMajor) return alert('Vui long nhap nganh/khoa');
    if (trimmedImage && !/^https?:\/\/.+/.test(trimmedImage)) return alert('URL anh khong hop le');
    if (trimmedBio.length > 500) return alert('Mo ta toi da 500 ky tu');

    const duplicate = candidates.find((c) => c.mssv === trimmedMssv && c.isActive);
    if (duplicate) {
      const confirmed = window.confirm(
        `Da ton tai ung vien MSSV ${trimmedMssv}\nTen: ${duplicate.name}\n\nBan co chac muon them?`
      );
      if (!confirmed) return;
    }

    try {
      setIsLoading(true);
      const tx = await votingContract.themUngVien(
        trimmedName,
        trimmedMssv,
        trimmedMajor,
        trimmedImage,
        trimmedBio
      );
      await tx.wait();
      alert('Da them ung vien thanh cong!');
      setFormData({ name: '', mssv: '', major: '', image: '', bio: '' });
      loadCandidates();
    } catch (e) {
      alert(e.message || 'Khong the them ung vien');
      console.error('Add candidate error:', e);
    }
    setIsLoading(false);
  };

  const handleStartStop = async (method) => {
    if (!votingContract) return alert('Chua ket noi vi/admin');

    const actionNames = {
      moNhanPhieuBau: 'Mo cong nhan token',
      dongNhanPhieuBau: 'Dong cong nhan token',
      moBauChonChinhThuc: 'Mo cong bau chon',
      dongBauChonChinhThuc: 'Dong cong bau chon',
    };

    const confirmed = window.confirm(
      `Xac nhan hanh dong:\n${actionNames[method] || method}\n\nHanh dong nay anh huong den tat ca nguoi dung.`
    );
    if (!confirmed) return;

    try {
      setIsLoading(true);
      const tx = await votingContract[method]();
      await tx.wait();
      alert(actionNames[method] || 'Thanh cong');
      loadStatus();
    } catch (e) {
      alert(e.message || `Khong the thuc hien ${method}`);
      console.error('Start/Stop error:', e);
    }
    setIsLoading(false);
  };

  const handleTokenSale = async (method) => {
    if (!votingContract) return alert('Chua ket noi vi/admin');

    const actionNames = {
      moBanToken: 'Mo ban token',
      dongBanToken: 'Dong ban token',
    };

    const confirmed = window.confirm(
      `Xac nhan hanh dong:\n${actionNames[method]}\n\nHanh dong nay anh huong den viec mua token.`
    );
    if (!confirmed) return;

    try {
      setIsLoading(true);
      const tx = await votingContract[method]();
      await tx.wait();
      alert(actionNames[method] + ' thanh cong');
      loadStatus();
    } catch (e) {
      alert(e.message || `Khong the thuc hien ${method}`);
      console.error('Token sale error:', e);
    }
    setIsLoading(false);
  };

  const handleRefund = async (method) => {
    if (!votingContract) return alert('Chua ket noi vi/admin');

    const actionNames = {
      batRefund: 'Bat refund',
      tatRefund: 'Tat refund',
    };

    const confirmed = window.confirm(
      `Xac nhan hanh dong:\n${actionNames[method]}\n\nHanh dong nay anh huong den viec hoan tien.`
    );
    if (!confirmed) return;

    try {
      setIsLoading(true);
      const tx = await votingContract[method]();
      await tx.wait();
      alert(actionNames[method] + ' thanh cong');
      loadStatus();
    } catch (e) {
      alert(e.message || `Khong the thuc hien ${method}`);
      console.error('Refund error:', e);
    }
    setIsLoading(false);
  };

  const handleBanWallet = async (wallet) => {
    if (!votingContract) return alert('Chua ket noi vi/admin');

    const confirmed = window.confirm(
      `Ban vi vinh vien?\n\nVi: ${wallet}\n\nVi nay se khong the mua token hoac bo phieu nua.`
    );
    if (!confirmed) return;

    try {
      setIsLoading(true);
      const tx = await votingContract.banVi(wallet);
      await tx.wait();
      alert('Da ban vi thanh cong!');
      loadConflicts();
    } catch (e) {
      alert(e.message || 'Khong the ban vi');
      console.error('Ban wallet error:', e);
    }
    setIsLoading(false);
  };

  const handleUnbanWallet = async (wallet) => {
    if (!votingContract) return alert('Chua ket noi vi/admin');

    const confirmed = window.confirm(
      `An xa cho vi nay?\n\nVi: ${wallet}\n\nVi nay se duoc phep tham gia lai.`
    );
    if (!confirmed) return;

    try {
      setIsLoading(true);
      const tx = await votingContract.unbanVi(wallet);
      await tx.wait();
      alert('Da an xa vi thanh cong!');
      loadConflicts();
    } catch (e) {
      alert(e.message || 'Khong the an xa vi');
      console.error('Unban wallet error:', e);
    }
    setIsLoading(false);
  };

  const handleWithdraw = async () => {
    if (!votingContract) return alert('Chua ket noi vi/admin');

    const confirmed = window.confirm(
      'Xac nhan rut tien?\n\nSe rut tien ve treasury wallet (tru du phong cho refund).'
    );
    if (!confirmed) return;

    try {
      setIsLoading(true);
      const tx = await votingContract.rutTien();
      await tx.wait();
      alert('Rut tien thanh cong');
    } catch (e) {
      alert(e.message || 'Khong the rut tien');
      console.error('Withdraw error:', e);
    }
    setIsLoading(false);
  };

  const handleWithdrawAll = async () => {
    if (!votingContract) return alert('Chua ket noi vi/admin');

    const confirmed = window.confirm(
      'Xac nhan rut toan bo?\n\nCHI DUNG SAU KHI TAT REFUND!\nSe rut toan bo tien ve treasury wallet.'
    );
    if (!confirmed) return;

    try {
      setIsLoading(true);
      const tx = await votingContract.rutToanBo();
      await tx.wait();
      alert('Rut toan bo thanh cong');
    } catch (e) {
      alert(e.message || 'Khong the rut toan bo');
      console.error('Withdraw all error:', e);
    }
    setIsLoading(false);
  };

  const handleUpdateMaxVoters = async () => {
    if (!votingContract) return alert('Chua ket noi vi/admin');
    
    const newMax = Number(newMaxVoters);
    if (!newMax || newMax <= 0) return alert('Vui long nhap so nguoi toi da hop le');
    
    const currentSold = stats.sold || 0;
    if (newMax < currentSold) {
      return alert(`Khong the giam xuong duoi ${currentSold} (so token da ban)!`);
    }

    const confirmed = window.confirm(
      `Xac nhan thay doi gioi han?\n\nHien tai: ${stats.max}\nMoi: ${newMax}\n\nToken da ban: ${currentSold}`
    );
    if (!confirmed) return;

    try {
      setIsLoading(true);
      const tx = await votingContract.capNhatMaxVoters(newMax);
      await tx.wait();
      alert('Cap nhat gioi han thanh cong!');
      setNewMaxVoters('');
      loadStatus();
    } catch (e) {
      alert(e.message || 'Khong the cap nhat gioi han');
      console.error('Update max voters error:', e);
    }
    setIsLoading(false);
  };

  const handleDisable = async () => {
    if (!votingContract) return alert('Chua ket noi vi/admin');
    const id = Number(disableId);
    if (!id || id <= 0) return alert('Vui long nhap ID ung vien hop le');

    const candidate = candidates.find((c) => c.id === id);
    if (!candidate) return alert('Khong tim thay ung vien nay');
    if (!candidate.isActive) return alert('Ung vien da bi khoa');

    const confirmed = window.confirm(
      `Xac nhan khoa ung vien:\nID: ${candidate.id}\nTen: ${candidate.name}\nMSSV: ${candidate.mssv}\nSo phieu: ${candidate.votes}\n\nHanh dong nay khong the hoan tac.`
    );
    if (!confirmed) return;

    try {
      setIsLoading(true);
      const tx = await votingContract.khoaUngVien(id);
      await tx.wait();
      alert('Da khoa ung vien');
      setDisableId('');
      loadCandidates();
    } catch (e) {
      alert(e.message || 'Khong the khoa ung vien');
      console.error('Disable candidate error:', e);
    }
    setIsLoading(false);
  };

  const handleSaveSchedule = () => {
    const { claimStart, claimEnd, voteStart, voteEnd } = scheduleInput;
    if (!claimStart || !claimEnd || !voteStart || !voteEnd) return alert('Vui long dien day du thoi gian');

    const csTime = new Date(claimStart).getTime();
    const ceTime = new Date(claimEnd).getTime();
    const vsTime = new Date(voteStart).getTime();
    const veTime = new Date(voteEnd).getTime();
    if (csTime >= ceTime) return alert('Claim dong phai sau claim mo');
    if (vsTime >= veTime) return alert('Vote dong phai sau vote mo');
    if (vsTime < ceTime) {
      const ok = window.confirm('Canh bao: Vote mo truoc khi Claim dong. Ban co muon tiep tuc?');
      if (!ok) return;
    }
    const ok = window.confirm(
      `Xac nhan cap nhat:\nClaim: ${new Date(claimStart).toLocaleString('vi-VN')} -> ${new Date(claimEnd).toLocaleString('vi-VN')}\nVote: ${new Date(voteStart).toLocaleString('vi-VN')} -> ${new Date(voteEnd).toLocaleString('vi-VN')}`
    );
    if (!ok) return;
    saveSchedule(scheduleInput);
  };

  const handleApprove = async (id) => {
    if (!votingContract) return;
    const ok = window.confirm(`Duyet yeu cau #${id}?`);
    if (!ok) return;
    try {
      setIsLoading(true);
      const tx = await votingContract.duyetDangKy(id);
      await tx.wait();
      loadRequests();
      loadCandidates();
    } catch (e) {
      alert(e.message || 'Khong the duyet');
    }
    setIsLoading(false);
  };

  const handleReject = async (id) => {
    if (!votingContract) return;
    const ok = window.confirm(`Tu choi yeu cau #${id}?`);
    if (!ok) return;
    try {
      setIsLoading(true);
      const tx = await votingContract.tuChoiDangKy(id);
      await tx.wait();
      loadRequests();
    } catch (e) {
      alert(e.message || 'Khong the tu choi');
    }
    setIsLoading(false);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Tên', 'MSSV', 'Ngành', 'Số phiếu', 'Trạng thái'];
    const rows = candidates.map((c) => [
      c.id,
      c.name,
      c.mssv,
      c.major,
      c.votes,
      c.isActive ? 'Đang mở' : 'Đã khóa',
    ]);
    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ket-qua-bau-cu-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      totalCandidates: candidates.length,
      totalVotes: candidates.reduce((sum, c) => sum + c.votes, 0),
      candidates: candidates.map((c) => ({
        id: c.id,
        name: c.name,
        mssv: c.mssv,
        major: c.major,
        votes: c.votes,
        isActive: c.isActive,
        image: c.image,
        bio: c.bio,
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ket-qua-bau-cu-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const filteredCandidates = candidates.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mssv.includes(searchTerm) ||
      c.major.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && c.isActive) ||
      (filterStatus === 'inactive' && !c.isActive);
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const dashboardStats = {
    totalCandidates: candidates.length,
    activeCandidates: candidates.filter((c) => c.isActive).length,
    totalVotes: candidates.reduce((sum, c) => sum + c.votes, 0),
    pendingRequests: requests.filter((r) => !r.approved && !r.rejected).length,
    fraudDetected: conflicts.length,
  };

  useEffect(() => {
    loadStatus();
    loadCandidates();
    loadRequests();
    loadConflicts();
    loadVoteHistory();
  }, [votingContract]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded">
          Vui long ket noi bang tai khoan admin de truy cap trang nay.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="container mx-auto p-8 space-y-8">
        

        <div className="bg-gradient-to-r from-fuchsia-600 via-orange-500 to-amber-400 text-white p-8 rounded-2xl shadow-2xl">
          <h1 className="text-3xl font-extrabold mb-2">Bảng điều khiển Admin</h1>
          <p className="text-white/90">Quản lý claim/vote, lịch trình, ứng viên và yêu cầu.</p>
          <div className="flex gap-4 mt-4 flex-wrap">
            <div className="bg-white/15 px-4 py-2 rounded-full text-sm">Claim: {status.claim ? 'Đang mở' : 'Đang đóng'}</div>
            <div className="bg-white/15 px-4 py-2 rounded-full text-sm">Vote: {status.vote ? 'Đang mở' : 'Đang đóng'}</div>
            <div className="bg-white/15 px-4 py-2 rounded-full text-sm">Bán token: {status.sale ? 'Mở' : 'Đóng'}</div>
            <div className="bg-white/15 px-4 py-2 rounded-full text-sm">Refund: {status.refund ? 'Mở' : 'Đóng'}</div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{dashboardStats.totalCandidates}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Tổng ứng viên</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{dashboardStats.activeCandidates}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Đang hoạt động</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{dashboardStats.totalVotes}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Tổng phiếu bầu</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center">
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{dashboardStats.pendingRequests}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Yêu cầu chờ</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{dashboardStats.fraudDetected}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Gian lận phát hiện</div>
          </div>
        </div>

        {/* Token sale stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Token đã bán</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.sold ?? '...'}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Còn lại</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.remaining ?? '...'}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Giới hạn tối đa</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.max ?? '...'}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Tổng tiền thu</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {stats.revenue ? `${(Number(stats.revenue) / 1e18).toFixed(4)} ETH` : '...'}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 shadow-lg rounded-xl space-y-3 lg:col-span-2">
            <h3 className="font-bold text-lg dark:text-white">Lịch trình (on-chain)</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-semibold dark:text-gray-300">Claim mở</label>
                <input
                  type="datetime-local"
                  value={scheduleInput.claimStart}
                  onChange={(e) => setScheduleInput({ ...scheduleInput, claimStart: e.target.value })}
                  className="w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold dark:text-gray-300">Claim đóng</label>
                <input
                  type="datetime-local"
                  value={scheduleInput.claimEnd}
                  onChange={(e) => setScheduleInput({ ...scheduleInput, claimEnd: e.target.value })}
                  className="w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold dark:text-gray-300">Vote mở</label>
                <input
                  type="datetime-local"
                  value={scheduleInput.voteStart}
                  onChange={(e) => setScheduleInput({ ...scheduleInput, voteStart: e.target.value })}
                  className="w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold dark:text-gray-300">Vote đóng</label>
                <input
                  type="datetime-local"
                  value={scheduleInput.voteEnd}
                  onChange={(e) => setScheduleInput({ ...scheduleInput, voteEnd: e.target.value })}
                  className="w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Lịch lưu on-chain; mọi user đều thấy.</p>
            <button onClick={handleSaveSchedule} className="bg-qnu-500 dark:bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-qnu-600 dark:hover:bg-blue-700 transition-all duration-300">
              Lưu lịch trình
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 shadow-lg rounded-xl space-y-3">
            <h3 className="font-bold text-lg dark:text-white">Trạng thái & điều khiển</h3>
            
            {/* Bán Token (saleActive) */}
            <div>
              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Bán Token: <span className={status.sale ? 'text-green-600' : 'text-red-600'}>{status.sale ? 'Mở' : 'Đóng'}</span>
              </h4>
              <div className="flex gap-2">
                <button onClick={() => handleTokenSale('moBanToken')} className="flex-1 bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-all duration-300 font-semibold">
                  Mở bán
                </button>
                <button onClick={() => handleTokenSale('dongBanToken')} className="flex-1 bg-green-500/80 text-white p-2 rounded hover:bg-green-600 transition-all duration-300 font-semibold">
                  Đóng bán
                </button>
              </div>
            </div>

            {/* Cổng nhận token (moNhanPhieu) */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Cổng nhận token: <span className={status.claim ? 'text-green-600' : 'text-red-600'}>{status.claim ? 'Đang mở' : 'Đã đóng'}</span>
              </h4>
              <div className="flex gap-2">
                <button onClick={() => handleStartStop('moNhanPhieuBau')} className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-all duration-300 font-semibold">
                  Mở cổng
                </button>
                <button onClick={() => handleStartStop('dongNhanPhieuBau')} className="flex-1 bg-blue-500/80 text-white p-2 rounded hover:bg-blue-600 transition-all duration-300 font-semibold">
                  Đóng cổng
                </button>
              </div>
            </div>

            {/* Vote */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Bầu chọn</h4>
              <div className="flex gap-2">
                <button onClick={() => handleStartStop('moBauChonChinhThuc')} className="flex-1 bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-all duration-300 font-semibold">
                  Mở Vote
                </button>
                <button onClick={() => handleStartStop('dongBauChonChinhThuc')} className="flex-1 bg-red-500/80 text-white p-2 rounded hover:bg-red-600 transition-all duration-300 font-semibold">
                  Đóng Vote
                </button>
              </div>
            </div>

            {/* Refund Controls */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Hoàn tiền</h4>
              <div className="flex gap-2">
                <button onClick={() => handleRefund('batRefund')} className="flex-1 bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 transition-all duration-300 font-semibold">
                  Bật Refund
                </button>
                <button onClick={() => handleRefund('tatRefund')} className="flex-1 bg-yellow-500/80 text-white p-2 rounded hover:bg-yellow-600 transition-all duration-300 font-semibold">
                  Tắt Refund
                </button>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Ẩn/hiện danh sách ứng viên</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Chỉ admin mới có thể bật tắt.</p>
                </div>
                <button
                  onClick={toggleHideCandidates}
                  className={`px-3 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    hideCandidates
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {hideCandidates ? 'Đang ẩn' : 'Đang hiển thị'}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Quản lý tiền & giới hạn */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 shadow-lg rounded-xl">
            <h3 className="font-bold text-lg dark:text-white mb-4">Quản lý tiền</h3>
            <div className="space-y-3">
              <button
                onClick={handleWithdraw}
                className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300"
              >
                Rút tiền (trừ dự phòng)
              </button>
              <button
                onClick={handleWithdrawAll}
                className="w-full bg-purple-600 text-white p-3 rounded-lg font-semibold hover:bg-purple-700 transition-all duration-300"
              >
                Rút toàn bộ (sau khi tắt refund)
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 shadow-lg rounded-xl">
            <h3 className="font-bold text-lg dark:text-white mb-4">Cập nhật giới hạn người mua</h3>
            <div className="space-y-3">
              <div className="bg-gray-50 dark:bg-gray-700/40 p-3 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">Hiện tại: <span className="font-bold text-purple-600 dark:text-purple-400">{stats.max || '...'}</span> người</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Đã bán: <span className="font-bold text-blue-600 dark:text-blue-400">{stats.sold || 0}</span> token</p>
              </div>
              <input
                type="number"
                placeholder="Nhập giới hạn mới (VD: 300)"
                value={newMaxVoters}
                onChange={(e) => setNewMaxVoters(e.target.value)}
                className="w-full border dark:border-gray-600 p-3 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleUpdateMaxVoters}
                disabled={!newMaxVoters}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cập nhật giới hạn
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Chỉ có thể tăng lên, không thể giảm xuống dưới số token đã bán
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 shadow-lg rounded-xl">
            <h3 className="font-bold mb-4 text-lg dark:text-white">Thêm ứng viên</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input className="border dark:border-gray-600 p-3 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 transition-all" placeholder="Tên" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <input className="border dark:border-gray-600 p-3 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 transition-all" placeholder="MSSV" value={formData.mssv} onChange={(e) => setFormData({ ...formData, mssv: e.target.value })} />
              <input className="border dark:border-gray-600 p-3 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 transition-all" placeholder="Ngành/Khoa" value={formData.major} onChange={(e) => setFormData({ ...formData, major: e.target.value })} />
              <input className="border dark:border-gray-600 p-3 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 transition-all md:col-span-3" placeholder="URL ảnh" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} />
            </div>
            <textarea className="border dark:border-gray-600 p-3 rounded-lg w-full mt-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 transition-all" placeholder="Mô tả ứng viên" rows={3} value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} />
            <button onClick={addCandidate} className="mt-4 bg-green-600 text-white px-4 py-3 rounded-lg w-full md:w-auto font-semibold hover:bg-green-700 transition-all duration-300 transform hover:scale-105" disabled={isLoading}>
              Thêm ứng viên
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 shadow-lg rounded-xl space-y-3">
            <h3 className="font-bold text-lg dark:text-white">Khóa / Xóa ứng viên</h3>
            <div className="flex gap-3 flex-col sm:flex-row">
              <input className="border dark:border-gray-600 p-2 flex-1 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 transition-all" placeholder="ID ứng viên" value={disableId} onChange={(e) => setDisableId(e.target.value)} />
              <button onClick={handleDisable} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-all duration-300 font-semibold transform hover:scale-105">
                Xóa (vô hiệu hóa)
              </button>
            </div>
          </div>
        </div>



        {/* Fraud Detection */}
        {(conflicts.length > 0 || loadingConflicts) && (
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 p-6 shadow-lg rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <h3 className="font-bold text-lg text-red-700 dark:text-red-400">Phát hiện gian lận ({conflicts.length})</h3>
              </div>
              <button onClick={loadConflicts} className="text-red-600 dark:text-red-400 underline text-sm hover:text-red-700 dark:hover:text-red-300 transition-all">
                Tải lại
              </button>
            </div>
            {loadingConflicts ? (
              <p className="dark:text-gray-300">Đang tải...</p>
            ) : conflicts.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">Không có gian lận nào được phát hiện.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {(() => {
                  // Nhóm conflicts theo walletTried
                  const grouped = conflicts.reduce((acc, c) => {
                    const key = c.walletTried.toLowerCase();
                    if (!acc[key]) {
                      acc[key] = {
                        walletTried: c.walletTried,
                        walletBound: c.walletBound,
                        email: c.email,
                        attempts: [],
                      };
                    }
                    acc[key].attempts.push({
                      createdAt: c.createdAt,
                    });
                    return acc;
                  }, {});

                  // Chuyển thành array và sort theo thời gian mới nhất
                  const uniqueConflicts = Object.values(grouped).map((g) => ({
                    ...g,
                    latestAttempt: g.attempts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0].createdAt,
                    attemptCount: g.attempts.length,
                  })).sort((a, b) => new Date(b.latestAttempt) - new Date(a.latestAttempt));

                  return uniqueConflicts.map((c, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Email:</span>
                          <p className="text-gray-900 dark:text-white">{c.email}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Lần thử gần nhất:</span>
                          <p className="text-gray-900 dark:text-white">{new Date(c.latestAttempt).toLocaleString('vi-VN')}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Ví đã gắn:</span>
                          <p className="text-gray-900 dark:text-white font-mono text-xs">{c.walletBound}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Ví gian lận:</span>
                          <p className="text-red-600 dark:text-red-400 font-mono text-xs">{c.walletTried}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-bold">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Đã thử {c.attemptCount} lần
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => handleBanWallet(c.walletTried)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                          Ban ví gian lận
                        </button>
                        <button
                          onClick={() => handleUnbanWallet(c.walletTried)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Ân xá
                        </button>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 p-6 shadow-lg rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg dark:text-white">Yêu cầu ứng viên</h3>
            <button onClick={loadRequests} className="text-qnu-500 dark:text-blue-400 underline hover:text-qnu-600 dark:hover:text-blue-300 transition-all">
              Tải lại
            </button>
          </div>
          {loadingRequests ? (
            <p className="dark:text-gray-300">Đang tải...</p>
          ) : requests.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">Chưa có yêu cầu nào.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {requests.map((r) => {
                const state = r.approved ? 'approved' : r.rejected ? 'rejected' : 'pending';
                const badge =
                  state === 'approved'
                    ? 'bg-green-100 text-green-700'
                    : state === 'rejected'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700';
                const label = state === 'approved' ? 'Đã duyệt' : state === 'rejected' ? 'Từ chối' : 'Chờ duyệt';
                return (
                  <div key={r.id} className="border dark:border-gray-600 rounded-lg p-4 space-y-2 bg-gray-50 dark:bg-gray-700/50 hover:shadow-lg transition-all duration-300">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Yêu cầu #{r.id}</span>
                      <span className={`text-xs px-2 py-1 rounded font-semibold ${badge}`}>{label}</span>
                    </div>
                    {r.image && <img src={r.image} alt={r.name} className="w-full h-28 object-cover rounded" />}
                    <p className="font-bold text-gray-900 dark:text-white">{r.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">MSSV: {r.mssv}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Ngành: {r.major}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">Mô tả: {r.bio}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">Từ: {r.from.slice(0, 10)}...{r.from.slice(-8)}</p>
                    {state === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(r.id)} className="flex-1 bg-green-600 text-white rounded py-2 hover:bg-green-700 transition-all duration-300 font-semibold">
                          Duyệt
                        </button>
                        <button onClick={() => handleReject(r.id)} className="flex-1 bg-red-600 text-white rounded py-2 hover:bg-red-700 transition-all duration-300 font-semibold">
                          Từ chối
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 shadow-lg rounded-xl">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h3 className="font-bold text-lg dark:text-white">Danh sách ứng viên</h3>
            <div className="flex gap-2 flex-wrap">
              <button onClick={exportToCSV} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-all text-sm font-semibold">
                Export CSV
              </button>
              <button onClick={exportToJSON} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-all text-sm font-semibold">
                Export JSON
              </button>
              <button onClick={loadCandidates} className="text-qnu-500 dark:text-blue-400 underline hover:text-qnu-600 dark:hover:text-blue-300 transition-all">
                Tải lại
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, MSSV, ngành..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border dark:border-gray-600 p-3 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border dark:border-gray-600 p-3 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Đã khóa</option>
            </select>
          </div>

          {loadingCandidates ? (
            <p className="dark:text-gray-300">Đang tải...</p>
          ) : filteredCandidates.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              {candidates.length === 0 ? 'Chưa có ứng viên.' : 'Không tìm thấy ứng viên phù hợp.'}
            </p>
          ) : (
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Hiển thị {paginatedCandidates.length} / {filteredCandidates.length} ứng viên
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedCandidates.map((c) => (
                <div key={c.id} className="border dark:border-gray-600 rounded-lg p-4 space-y-2 bg-gray-50 dark:bg-gray-700/50 hover:shadow-lg transition-all duration-300">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">ID #{c.id}</span>
                    <span className={`text-xs px-2 py-1 rounded font-semibold ${c.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                      {c.isActive ? 'Đang mở' : 'Đã khóa'}
                    </span>
                  </div>
                  {c.image && <img src={c.image} alt={c.name} className="w-full h-32 object-cover rounded" />}
                  <p className="font-bold text-gray-900 dark:text-white">{c.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">MSSV: {c.mssv}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Ngành: {c.major}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">Mô tả: {c.bio}</p>
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">Phiếu bầu: {c.votes}</p>
                  {c.isActive && (
                    <button
                      onClick={() => {
                        setDisableId(c.id);
                        handleDisable();
                      }}
                      className="text-red-600 dark:text-red-400 text-sm underline hover:text-red-700 dark:hover:text-red-300 transition-all font-semibold"
                    >
                      Xóa (vô hiệu hóa)
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                >
                  Trước
                </button>
                <span className="text-gray-700 dark:text-gray-300 font-semibold">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                >
                  Sau
                </button>
              </div>
            )}
            </div>
          )}
        </div>

        {/* Lịch sử bầu chọn */}
        <div className="bg-white dark:bg-gray-800 p-6 shadow-lg rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg dark:text-white">Lịch sử bầu chọn</h3>
            <button
              onClick={loadVoteHistory}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-all text-sm font-semibold"
            >
              Tải lại
            </button>
          </div>
          
          {loadingVoteHistory ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">Đang tải...</div>
          ) : voteHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">Chưa có lịch sử bầu chọn</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Họ tên</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">MSSV</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Ứng viên</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Địa chỉ ví</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {voteHistory.map((vote, idx) => (
                    <tr key={idx} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="p-3 text-sm text-gray-900 dark:text-white font-medium">{vote.name}</td>
                      <td className="p-3 text-sm text-gray-700 dark:text-gray-300">{vote.mssv}</td>
                      <td className="p-3 text-sm text-gray-700 dark:text-gray-300">
                        #{vote.candidateId} - {vote.candidateName}
                      </td>
                      <td className="p-3 text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {vote.wallet.slice(0, 6)}...{vote.wallet.slice(-4)}
                      </td>
                      <td className="p-3 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(vote.timestamp).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
