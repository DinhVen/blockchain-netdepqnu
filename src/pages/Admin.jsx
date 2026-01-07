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
  const [status, setStatus] = useState({ sale: false, vote: false });
  const [stats, setStats] = useState({ remaining: null, sold: null, max: null, revenue: null });
  const [newMaxVoters, setNewMaxVoters] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  const [loadingConflicts, setLoadingConflicts] = useState(false);
  const [scheduleInput, setScheduleInput] = useState({
    claimStart: '', claimEnd: '', voteStart: '', voteEnd: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  const API_BASE = import.meta.env.VITE_OTP_API || 'http://localhost:3001';
  const ADMIN_API_KEY = import.meta.env.VITE_ADMIN_API_KEY || '';

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
      const [sale, vote] = await Promise.all([
        votingContract.saleActive(),
        votingContract.moBauChon(),
      ]);
      setStatus({ sale, vote });

      const [remaining, sold, max, revenue] = await Promise.all([
        votingContract.soTokenConLai(),
        votingContract.totalTokensSold(),
        votingContract.maxVoters(),
        votingContract.tongTienThu(),
      ]);
      setStats({
        remaining: Number(remaining),
        sold: Number(sold),
        max: Number(max),
        revenue: revenue.toString(),
      });
    } catch (e) {
      console.warn('Không lấy được trạng thái', e);
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
      console.warn('Không tải được danh sách ứng viên', e);
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
      console.warn('Không tải được danh sách yêu cầu', e);
    }
    setLoadingRequests(false);
  };

  const loadConflicts = async () => {
    if (!ADMIN_API_KEY) return;
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
      console.warn('Không tải được conflicts', e);
    }
    setLoadingConflicts(false);
  };

  const addCandidate = async () => {
    if (!votingContract) return alert('Chưa kết nối ví/admin');
    const { name, mssv, major, image, bio } = formData;
    if (!name.trim()) return alert('Vui lòng nhập tên ứng viên');
    if (!/^\d{8}$/.test(mssv.trim())) return alert('MSSV phải là 8 chữ số');
    if (!major.trim()) return alert('Vui lòng nhập ngành/khoa');

    try {
      setIsLoading(true);
      const tx = await votingContract.themUngVien(name.trim(), mssv.trim(), major.trim(), image.trim(), bio.trim());
      await tx.wait();
      alert('Đã thêm ứng viên thành công!');
      setFormData({ name: '', mssv: '', major: '', image: '', bio: '' });
      loadCandidates();
    } catch (e) {
      alert(e.reason || e.message || 'Không thể thêm ứng viên');
    }
    setIsLoading(false);
  };

  const handleTokenSale = async (method) => {
    if (!votingContract) return alert('Chưa kết nối ví/admin');
    const names = { moBanToken: 'Mở bán token', dongBanToken: 'Đóng bán token' };
    if (!window.confirm(`Xác nhận: ${names[method]}?`)) return;
    try {
      setIsLoading(true);
      const tx = await votingContract[method]();
      await tx.wait();
      alert(`${names[method]} thành công`);
      loadStatus();
    } catch (e) {
      alert(e.reason || e.message || 'Lỗi');
    }
    setIsLoading(false);
  };

  const handleVote = async (method) => {
    if (!votingContract) return alert('Chưa kết nối ví/admin');
    const names = { moBauChonChinhThuc: 'Mở bầu chọn', dongBauChonChinhThuc: 'Đóng bầu chọn' };
    if (!window.confirm(`Xác nhận: ${names[method]}?`)) return;
    try {
      setIsLoading(true);
      const tx = await votingContract[method]();
      await tx.wait();
      alert(`${names[method]} thành công`);
      loadStatus();
    } catch (e) {
      alert(e.reason || e.message || 'Lỗi');
    }
    setIsLoading(false);
  };

  const handleWithdraw = async () => {
    if (!votingContract) return alert('Chưa kết nối ví/admin');
    if (!window.confirm('Xác nhận rút toàn bộ tiền về treasury wallet?')) return;
    try {
      setIsLoading(true);
      const tx = await votingContract.rutTien();
      await tx.wait();
      alert('Rút tiền thành công');
      loadStatus();
    } catch (e) {
      alert(e.reason || e.message || 'Không thể rút tiền');
    }
    setIsLoading(false);
  };

  const handleUpdateMaxVoters = async () => {
    if (!votingContract) return alert('Chưa kết nối ví/admin');
    const newMax = Number(newMaxVoters);
    if (!newMax || newMax <= 0) return alert('Vui lòng nhập số hợp lệ');
    if (newMax < (stats.sold || 0)) return alert(`Không thể giảm xuống dưới ${stats.sold}`);
    if (!window.confirm(`Cập nhật giới hạn từ ${stats.max} thành ${newMax}?`)) return;
    try {
      setIsLoading(true);
      const tx = await votingContract.capNhatMaxVoters(newMax);
      await tx.wait();
      alert('Cập nhật thành công!');
      setNewMaxVoters('');
      loadStatus();
    } catch (e) {
      alert(e.reason || e.message || 'Lỗi');
    }
    setIsLoading(false);
  };

  const handleDisable = async () => {
    if (!votingContract) return alert('Chưa kết nối ví/admin');
    const id = Number(disableId);
    if (!id) return alert('Vui lòng nhập ID');
    const candidate = candidates.find((c) => c.id === id);
    if (!candidate) return alert('Không tìm thấy ứng viên');
    if (!window.confirm(`Khóa ứng viên #${id} - ${candidate.name}?`)) return;
    try {
      setIsLoading(true);
      const tx = await votingContract.khoaUngVien(id);
      await tx.wait();
      alert('Đã khóa ứng viên');
      setDisableId('');
      loadCandidates();
    } catch (e) {
      alert(e.reason || e.message || 'Lỗi');
    }
    setIsLoading(false);
  };

  const handleSaveSchedule = () => {
    const { claimStart, claimEnd, voteStart, voteEnd } = scheduleInput;
    if (!claimStart || !claimEnd || !voteStart || !voteEnd) return alert('Vui lòng điền đầy đủ');
    const cs = new Date(claimStart).getTime();
    const ce = new Date(claimEnd).getTime();
    const vs = new Date(voteStart).getTime();
    const ve = new Date(voteEnd).getTime();
    if (cs >= ce) return alert('Claim đóng phải sau claim mở');
    if (vs >= ve) return alert('Vote đóng phải sau vote mở');
    if (!window.confirm('Xác nhận cập nhật lịch trình?')) return;
    saveSchedule(scheduleInput);
  };

  const handleApprove = async (id) => {
    if (!votingContract) return;
    if (!window.confirm(`Duyệt yêu cầu #${id}?`)) return;
    try {
      setIsLoading(true);
      const tx = await votingContract.duyetDangKy(id);
      await tx.wait();
      loadRequests();
      loadCandidates();
    } catch (e) {
      alert(e.reason || e.message || 'Lỗi');
    }
    setIsLoading(false);
  };

  const handleReject = async (id) => {
    if (!votingContract) return;
    if (!window.confirm(`Từ chối yêu cầu #${id}?`)) return;
    try {
      setIsLoading(true);
      const tx = await votingContract.tuChoiDangKy(id);
      await tx.wait();
      loadRequests();
    } catch (e) {
      alert(e.reason || e.message || 'Lỗi');
    }
    setIsLoading(false);
  };

  const handleBanWallet = async (wallet) => {
    if (!votingContract) return;
    if (!window.confirm(`Ban ví ${wallet}?`)) return;
    try {
      setIsLoading(true);
      const tx = await votingContract.banVi(wallet);
      await tx.wait();
      alert('Đã ban ví');
    } catch (e) {
      alert(e.reason || e.message || 'Lỗi');
    }
    setIsLoading(false);
  };

  const handleUnbanWallet = async (wallet) => {
    if (!votingContract) return;
    if (!window.confirm(`Ân xá ví ${wallet}?`)) return;
    try {
      setIsLoading(true);
      const tx = await votingContract.unbanVi(wallet);
      await tx.wait();
      alert('Đã ân xá ví');
    } catch (e) {
      alert(e.reason || e.message || 'Lỗi');
    }
    setIsLoading(false);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Tên', 'MSSV', 'Ngành', 'Số phiếu', 'Trạng thái'];
    const rows = candidates.map((c) => [c.id, c.name, c.mssv, c.major, c.votes, c.isActive ? 'Mở' : 'Khóa']);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ket-qua-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredCandidates = candidates.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mssv.includes(searchTerm) || c.major.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && c.isActive) || (filterStatus === 'inactive' && !c.isActive);
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
  const paginatedCandidates = filteredCandidates.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    loadStatus();
    loadCandidates();
    loadRequests();
    loadConflicts();
  }, [votingContract]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterStatus]);

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-8 pt-24">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-400 p-4 rounded-xl">
          Vui lòng kết nối bằng tài khoản admin để truy cập trang này.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20 transition-colors duration-300">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-fuchsia-600 via-orange-500 to-amber-400 text-white p-6 rounded-2xl shadow-xl">
          <h1 className="text-2xl font-bold mb-2">Bảng điều khiển Admin</h1>
          <div className="flex gap-3 flex-wrap">
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Bán token: {status.sale ? '✅ Mở' : '❌ Đóng'}</span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Bầu chọn: {status.vote ? '✅ Mở' : '❌ Đóng'}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.sold ?? '...'}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Token đã bán</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg text-center">
            <p className="text-2xl font-bold text-green-600">{stats.remaining ?? '...'}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Còn lại</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.max ?? '...'}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Giới hạn</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg text-center">
            <p className="text-2xl font-bold text-amber-600">
              {stats.revenue ? `${(Number(stats.revenue) / 1e18).toFixed(4)} ETH` : '...'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tổng thu</p>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Schedule */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-4">
            <h3 className="font-bold text-lg dark:text-white">Lịch trình</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold dark:text-gray-300">Claim mở</label>
                <input type="datetime-local" value={scheduleInput.claimStart}
                  onChange={(e) => setScheduleInput({ ...scheduleInput, claimStart: e.target.value })}
                  className="w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="text-sm font-semibold dark:text-gray-300">Claim đóng</label>
                <input type="datetime-local" value={scheduleInput.claimEnd}
                  onChange={(e) => setScheduleInput({ ...scheduleInput, claimEnd: e.target.value })}
                  className="w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="text-sm font-semibold dark:text-gray-300">Vote mở</label>
                <input type="datetime-local" value={scheduleInput.voteStart}
                  onChange={(e) => setScheduleInput({ ...scheduleInput, voteStart: e.target.value })}
                  className="w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="text-sm font-semibold dark:text-gray-300">Vote đóng</label>
                <input type="datetime-local" value={scheduleInput.voteEnd}
                  onChange={(e) => setScheduleInput({ ...scheduleInput, voteEnd: e.target.value })}
                  className="w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 dark:text-white" />
              </div>
            </div>
            <button onClick={handleSaveSchedule} className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700">
              Lưu lịch trình
            </button>
          </div>

          {/* Status Controls */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-4">
            <h3 className="font-bold text-lg dark:text-white">Điều khiển</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold dark:text-gray-300 mb-2">Bán Token</p>
                <div className="flex gap-2">
                  <button onClick={() => handleTokenSale('moBanToken')} className="flex-1 bg-green-500 text-white p-2 rounded font-semibold hover:bg-green-600">Mở bán</button>
                  <button onClick={() => handleTokenSale('dongBanToken')} className="flex-1 bg-red-500 text-white p-2 rounded font-semibold hover:bg-red-600">Đóng bán</button>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold dark:text-gray-300 mb-2">Bầu chọn</p>
                <div className="flex gap-2">
                  <button onClick={() => handleVote('moBauChonChinhThuc')} className="flex-1 bg-blue-500 text-white p-2 rounded font-semibold hover:bg-blue-600">Mở vote</button>
                  <button onClick={() => handleVote('dongBauChonChinhThuc')} className="flex-1 bg-orange-500 text-white p-2 rounded font-semibold hover:bg-orange-600">Đóng vote</button>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold dark:text-gray-300 mb-2">Ẩn/hiện ứng viên</p>
                <button onClick={() => setHideCandidates(!hideCandidates)}
                  className={`w-full p-2 rounded font-semibold ${hideCandidates ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'} text-white`}>
                  {hideCandidates ? 'Đang ẩn - Click để hiện' : 'Đang hiện - Click để ẩn'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Finance & Max Voters */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="font-bold text-lg dark:text-white mb-4">Rút tiền</h3>
            <button onClick={handleWithdraw} className="w-full bg-purple-600 text-white p-3 rounded-lg font-semibold hover:bg-purple-700">
              Rút toàn bộ về Treasury
            </button>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-3">
            <h3 className="font-bold text-lg dark:text-white">Cập nhật giới hạn</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Hiện tại: {stats.max} | Đã bán: {stats.sold}</p>
            <input type="number" placeholder="Giới hạn mới" value={newMaxVoters}
              onChange={(e) => setNewMaxVoters(e.target.value)}
              className="w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 dark:text-white" />
            <button onClick={handleUpdateMaxVoters} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2 rounded font-semibold hover:from-purple-700 hover:to-pink-700">
              Cập nhật
            </button>
          </div>
        </div>

        {/* Add Candidate */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="font-bold text-lg dark:text-white mb-4">Thêm ứng viên</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input placeholder="Tên" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 dark:text-white" />
            <input placeholder="MSSV (8 số)" value={formData.mssv} onChange={(e) => setFormData({ ...formData, mssv: e.target.value })}
              className="border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 dark:text-white" />
            <input placeholder="Ngành/Khoa" value={formData.major} onChange={(e) => setFormData({ ...formData, major: e.target.value })}
              className="border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 dark:text-white" />
            <input placeholder="URL ảnh" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 dark:text-white md:col-span-3" />
          </div>
          <textarea placeholder="Mô tả" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full border dark:border-gray-600 p-2 rounded mt-3 bg-white dark:bg-gray-700 dark:text-white" rows={2} />
          <button onClick={addCandidate} disabled={isLoading} className="mt-3 bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 disabled:opacity-50">
            Thêm ứng viên
          </button>
        </div>

        {/* Disable Candidate */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="font-bold text-lg dark:text-white mb-4">Khóa ứng viên</h3>
          <div className="flex gap-3">
            <input placeholder="ID ứng viên" value={disableId} onChange={(e) => setDisableId(e.target.value)}
              className="flex-1 border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 dark:text-white" />
            <button onClick={handleDisable} className="bg-red-600 text-white px-4 py-2 rounded font-semibold hover:bg-red-700">
              Khóa
            </button>
          </div>
        </div>

        {/* Conflicts */}
        {conflicts.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-xl">
            <h3 className="font-bold text-lg text-red-700 dark:text-red-400 mb-4">⚠️ Phát hiện gian lận ({conflicts.length})</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {conflicts.map((c, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-red-200 dark:border-red-700">
                  <p className="text-sm dark:text-gray-300"><strong>Email:</strong> {c.email}</p>
                  <p className="text-sm dark:text-gray-300"><strong>Ví gian lận:</strong> {c.walletTried}</p>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => handleBanWallet(c.walletTried)} className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">Ban</button>
                    <button onClick={() => handleUnbanWallet(c.walletTried)} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">Ân xá</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Requests */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg dark:text-white">Yêu cầu đăng ký ({requests.filter(r => !r.approved && !r.rejected).length} chờ)</h3>
            <button onClick={loadRequests} className="text-blue-600 dark:text-blue-400 underline text-sm">Tải lại</button>
          </div>
          {loadingRequests ? <p className="dark:text-gray-400">Đang tải...</p> : requests.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">Chưa có yêu cầu</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {requests.map((r) => (
                <div key={r.id} className="border dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold dark:text-white">#{r.id}</span>
                    <span className={`text-xs px-2 py-1 rounded ${r.approved ? 'bg-green-100 text-green-700' : r.rejected ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {r.approved ? 'Đã duyệt' : r.rejected ? 'Từ chối' : 'Chờ'}
                    </span>
                  </div>
                  {r.image && <img src={r.image} alt={r.name} className="w-full h-24 object-cover rounded mb-2" />}
                  <p className="font-bold dark:text-white">{r.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">MSSV: {r.mssv}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Ngành: {r.major}</p>
                  {!r.approved && !r.rejected && (
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => handleApprove(r.id)} className="flex-1 bg-green-600 text-white py-1 rounded text-sm hover:bg-green-700">Duyệt</button>
                      <button onClick={() => handleReject(r.id)} className="flex-1 bg-red-600 text-white py-1 rounded text-sm hover:bg-red-700">Từ chối</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Candidates List */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
            <h3 className="font-bold text-lg dark:text-white">Danh sách ứng viên ({candidates.length})</h3>
            <div className="flex gap-2">
              <button onClick={exportToCSV} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">Export CSV</button>
              <button onClick={loadCandidates} className="text-blue-600 dark:text-blue-400 underline text-sm">Tải lại</button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3 mb-4">
            <input type="text" placeholder="Tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 dark:text-white" />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 dark:text-white">
              <option value="all">Tất cả</option>
              <option value="active">Đang mở</option>
              <option value="inactive">Đã khóa</option>
            </select>
          </div>
          {loadingCandidates ? <p className="dark:text-gray-400">Đang tải...</p> : filteredCandidates.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">Không có ứng viên</p>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedCandidates.map((c) => (
                  <div key={c.id} className="border dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold dark:text-white">#{c.id}</span>
                      <span className={`text-xs px-2 py-1 rounded ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                        {c.isActive ? 'Mở' : 'Khóa'}
                      </span>
                    </div>
                    {c.image && <img src={c.image} alt={c.name} className="w-full h-24 object-cover rounded mb-2" />}
                    <p className="font-bold dark:text-white">{c.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">MSSV: {c.mssv}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ngành: {c.major}</p>
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">Phiếu: {c.votes}</p>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50">Trước</button>
                  <span className="px-3 py-1 dark:text-white">{currentPage}/{totalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50">Sau</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
