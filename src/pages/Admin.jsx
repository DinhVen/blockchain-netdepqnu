import { useContext, useEffect, useState } from 'react';
import { Web3Context } from '../context/Web3Context';

const Admin = () => {
  const { votingContract, isAdmin, schedule, saveSchedule, isLoading, setIsLoading } = useContext(Web3Context);

  const [formData, setFormData] = useState({ name: '', mssv: '', major: '', image: '', bio: '' });
  const [disableId, setDisableId] = useState('');
  const [status, setStatus] = useState({ claim: false, vote: false });
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [scheduleInput, setScheduleInput] = useState({
    claimStart: '',
    claimEnd: '',
    voteStart: '',
    voteEnd: '',
  });

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
      setStatus({ claim, vote });
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

  const addCandidate = async () => {
    if (!votingContract) return alert('Chưa kết nối ví/admin');
    try {
      setIsLoading(true);
      const tx = await votingContract.themUngVien(
        formData.name,
        formData.mssv,
        formData.major,
        formData.image,
        formData.bio
      );
      await tx.wait();
      alert('Đã thêm ứng viên!');
      setFormData({ name: '', mssv: '', major: '', image: '', bio: '' });
      loadCandidates();
    } catch (e) {
      alert(e.message || 'Lỗi themUngVien');
    }
    setIsLoading(false);
  };

  const handleStartStop = async (method) => {
    if (!votingContract) return alert('Chưa kết nối ví/admin');
    try {
      setIsLoading(true);
      const tx = await votingContract[method]();
      await tx.wait();
      alert('Thành công!');
      loadStatus();
    } catch (e) {
      alert(e.message || `Lỗi ${method}`);
    }
    setIsLoading(false);
  };

  const handleDisable = async () => {
    if (!votingContract) return alert('Chưa kết nối ví/admin');
    try {
      setIsLoading(true);
      const tx = await votingContract.khoaUngVien(Number(disableId));
      await tx.wait();
      alert('Đã vô hiệu hóa ứng viên');
      setDisableId('');
      loadCandidates();
    } catch (e) {
      alert(e.message || 'Lỗi khoaUngVien');
    }
    setIsLoading(false);
  };

  const handleSaveSchedule = () => {
    saveSchedule(scheduleInput);
  };

  useEffect(() => {
    loadStatus();
    loadCandidates();
  }, [votingContract]);

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded">
          Vui lòng kết nối bằng tài khoản admin của hợp đồng để truy cập trang này.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="container mx-auto p-8 space-y-8">
        <div className="bg-gradient-to-r from-fuchsia-600 via-orange-500 to-amber-400 text-white p-8 rounded-2xl shadow-2xl">
          <h1 className="text-3xl font-extrabold mb-2">Bảng điều khiển Admin</h1>
          <p className="text-white/90">Quản lý claim/vote, lịch trình và ứng viên.</p>
          <div className="flex gap-4 mt-4 flex-wrap">
            <div className="bg-white/15 px-4 py-2 rounded-full text-sm">
              Claim: {status.claim ? 'Đang mở' : 'Đang đóng'}
            </div>
            <div className="bg-white/15 px-4 py-2 rounded-full text-sm">
              Vote: {status.vote ? 'Đang mở' : 'Đang đóng'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 shadow-lg rounded-xl space-y-3 lg:col-span-2">
            <h3 className="font-bold text-lg">Lịch trình (on-chain)</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-semibold">Claim mở</label>
                <input
                  type="datetime-local"
                  value={scheduleInput.claimStart}
                  onChange={(e) => setScheduleInput({ ...scheduleInput, claimStart: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Claim đóng</label>
                <input
                  type="datetime-local"
                  value={scheduleInput.claimEnd}
                  onChange={(e) => setScheduleInput({ ...scheduleInput, claimEnd: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Vote mở</label>
                <input
                  type="datetime-local"
                  value={scheduleInput.voteStart}
                  onChange={(e) => setScheduleInput({ ...scheduleInput, voteStart: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Vote đóng</label>
                <input
                  type="datetime-local"
                  value={scheduleInput.voteEnd}
                  onChange={(e) => setScheduleInput({ ...scheduleInput, voteEnd: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>
            <p className="text-sm text-gray-500">Lịch lưu on-chain; mọi user đều thấy.</p>
            <button onClick={handleSaveSchedule} className="bg-qnu-500 text-white px-4 py-2 rounded font-semibold">
              Lưu lịch trình
            </button>
          </div>

          <div className="bg-white p-6 shadow-lg rounded-xl space-y-3">
            <h3 className="font-bold text-lg">Trạng thái & điều khiển</h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleStartStop('moNhanPhieuBau')}
                className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Mở Claim
              </button>
              <button
                onClick={() => handleStartStop('dongNhanPhieuBau')}
                className="flex-1 bg-blue-500/80 text-white p-2 rounded hover:bg-blue-600"
              >
                Đóng Claim
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleStartStop('moBauChonChinhThuc')}
                className="flex-1 bg-red-500 text-white p-2 rounded hover:bg-red-600"
              >
                Mở Vote
              </button>
              <button
                onClick={() => handleStartStop('dongBauChonChinhThuc')}
                className="flex-1 bg-red-500/80 text-white p-2 rounded hover:bg-red-600"
              >
                Đóng Vote
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 shadow-lg rounded-xl">
            <h3 className="font-bold mb-4 text-lg">Thêm ứng viên</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                className="border p-3 rounded-lg"
                placeholder="Tên"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                className="border p-3 rounded-lg"
                placeholder="MSSV"
                value={formData.mssv}
                onChange={(e) => setFormData({ ...formData, mssv: e.target.value })}
              />
              <input
                className="border p-3 rounded-lg"
                placeholder="Ngành/Khoa"
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
              />
              <input
                className="border p-3 rounded-lg"
                placeholder="URL ảnh"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
            </div>
            <textarea
              className="border p-3 rounded-lg w-full mt-3"
              placeholder="Mô tả ứng viên"
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
            <button
              onClick={addCandidate}
              className="mt-4 bg-green-600 text-white px-4 py-3 rounded-lg w-full md:w-auto font-semibold hover:bg-green-700 transition"
              disabled={isLoading}
            >
              Thêm ứng viên
            </button>
          </div>

          <div className="bg-white p-6 shadow-lg rounded-xl space-y-3">
            <h3 className="font-bold text-lg">Khoá / Xóa ứng viên</h3>
            <div className="flex gap-3 flex-col sm:flex-row">
              <input
                className="border p-2 flex-1 rounded"
                placeholder="ID ứng viên"
                value={disableId}
                onChange={(e) => setDisableId(e.target.value)}
              />
              <button onClick={handleDisable} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                Xóa (vô hiệu hóa)
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 shadow-lg rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Danh sách ứng viên</h3>
            <button onClick={loadCandidates} className="text-qnu-500 underline">Tải lại</button>
          </div>
          {loadingCandidates ? (
            <p>Đang tải...</p>
          ) : candidates.length === 0 ? (
            <p className="text-gray-500">Chưa có ứng viên.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {candidates.map((c) => (
                <div key={c.id} className="border rounded-lg p-4 space-y-2 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">ID #{c.id}</span>
                    <span className={`text-xs px-2 py-1 rounded ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                      {c.isActive ? 'Đang mở' : 'Đã khóa'}
                    </span>
                  </div>
                  {c.image && <img src={c.image} alt={c.name} className="w-full h-32 object-cover rounded" />}
                  <p className="font-bold text-gray-900">{c.name}</p>
                  <p className="text-sm text-gray-600">MSSV: {c.mssv}</p>
                  <p className="text-sm text-gray-600">Ngành: {c.major}</p>
                  <p className="text-sm text-gray-600 line-clamp-3">Mô tả: {c.bio}</p>
                  <p className="text-sm text-gray-600">Votes: {c.votes}</p>
                  {c.isActive && (
                    <button
                      onClick={() => { setDisableId(c.id); handleDisable(); }}
                      className="text-red-600 text-sm underline"
                    >
                      Xóa (vô hiệu hóa)
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
