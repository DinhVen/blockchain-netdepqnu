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

    const trimmedName = formData.name.trim();
    const trimmedMssv = formData.mssv.trim();
    const trimmedMajor = formData.major.trim();
    const trimmedImage = formData.image.trim();
    const trimmedBio = formData.bio.trim();

    if (!trimmedName) {
      alert('Vui lòng nhập tên ứng viên');
      return;
    }
    if (trimmedName.length < 3 || trimmedName.length > 100) {
      alert('Tên ứng viên phải từ 3-100 ký tự');
      return;
    }
    if (!trimmedMssv) {
      alert('Vui lòng nhập MSSV');
      return;
    }
    if (!/^\d{8}$/.test(trimmedMssv)) {
      alert('MSSV phải là 8 chữ số (ví dụ: 45010203)');
      return;
    }
    if (!trimmedMajor) {
      alert('Vui lòng nhập ngành/khoa');
      return;
    }
    if (trimmedImage && !trimmedImage.match(/^https?:\/\/.+/)) {
      alert('URL ảnh không hợp lệ (phải bắt đầu bằng http:// hoặc https://)');
      return;
    }
    if (trimmedBio.length > 500) {
      alert('Mô tả không được vượt quá 500 ký tự');
      return;
    }

    const duplicate = candidates.find((c) => c.mssv === trimmedMssv && c.isActive);
    if (duplicate) {
      const confirmed = window.confirm(
        `CẢNH BÁO: Đã tồn tại ứng viên với MSSV ${trimmedMssv}\n` +
          `Tên: ${duplicate.name}\n\n` +
          `Bạn có chắc chắn muốn thêm ứng viên trùng MSSV?`
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
      alert('Đã thêm ứng viên thành công!');
      setFormData({ name: '', mssv: '', major: '', image: '', bio: '' });
      loadCandidates();
    } catch (e) {
      alert('Lỗi: ' + (e.message || 'Không thể thêm ứng viên'));
      console.error('Add candidate error:', e);
    }
    setIsLoading(false);
  };

  const handleStartStop = async (method) => {
    if (!votingContract) return alert('Chưa kết nối ví/admin');

    const actionNames = {
      moNhanPhieuBau: 'MỞ CỔNG NHẬN TOKEN',
      dongNhanPhieuBau: 'ĐÓNG CỔNG NHẬN TOKEN',
      moBauChonChinhThuc: 'MỞ CỔNG BẦU CHỌN',
      dongBauChonChinhThuc: 'ĐÓNG CỔNG BẦU CHỌN',
    };

    const confirmed = window.confirm(
      `⚠️ XÁC NHẬN HÀNH ĐỘNG\n\n` +
        `${actionNames[method] || method}\n\n` +
        `Hành động này sẽ ảnh hưởng đến tất cả người dùng.\n` +
        `Bạn có chắc chắn muốn tiếp tục?`
    );

    if (!confirmed) return;

    try {
      setIsLoading(true);
      const tx = await votingContract[method]();
      await tx.wait();
      alert(`${actionNames[method] || 'Thành công'}!`);
      loadStatus();
    } catch (e) {
      alert(`Lỗi: ${e.message || `Không thể thực hiện ${method}`}`);
      console.error('Start/Stop error:', e);
    }
    setIsLoading(false);
  };

  const handleDisable = async () => {
    if (!votingContract) return alert('Chưa kết nối ví/admin');

    const id = Number(disableId);
    if (!id || id <= 0) {
      alert('Vui lòng nhập ID ứng viên hợp lệ');
      return;
    }

    const candidate = candidates.find((c) => c.id === id);
    if (!candidate) {
      alert('Không tìm thấy ứng viên với ID này');
      return;
    }
    if (!candidate.isActive) {
      alert('Ứng viên này đã bị vô hiệu hóa rồi');
      return;
    }

    const confirmed = window.confirm(
      `XÁC NHẬN VÔ HIỆU HÓA ỨNG VIÊN\n\n` +
        `ID: ${candidate.id}\n` +
        `Tên: ${candidate.name}\n` +
        `MSSV: ${candidate.mssv}\n` +
        `Số phiếu hiện tại: ${candidate.votes}\n\n` +
        `Hành động này không thể hoàn tác!\n` +
        `Bạn có chắc chắn muốn tiếp tục?`
    );

    if (!confirmed) return;

    try {
      setIsLoading(true);
      const tx = await votingContract.khoaUngVien(id);
      await tx.wait();
      alert('Đã vô hiệu hóa ứng viên thành công');
      setDisableId('');
      loadCandidates();
    } catch (e) {
      alert('Lỗi: ' + (e.message || 'Không thể vô hiệu hóa ứng viên'));
      console.error('Disable candidate error:', e);
    }
    setIsLoading(false);
  };

  const handleSaveSchedule = () => {
    const { claimStart, claimEnd, voteStart, voteEnd } = scheduleInput;

    if (!claimStart || !claimEnd || !voteStart || !voteEnd) {
      alert('Vui lòng điền đầy đủ tất cả thời gian');
      return;
    }

    const csTime = new Date(claimStart).getTime();
    const ceTime = new Date(claimEnd).getTime();
    const vsTime = new Date(voteStart).getTime();
    const veTime = new Date(voteEnd).getTime();

    if (csTime >= ceTime) {
      alert('Thời gian đóng Claim phải sau thời gian mở Claim');
      return;
    }
    if (vsTime >= veTime) {
      alert('Thời gian đóng Vote phải sau thời gian mở Vote');
      return;
    }
    if (vsTime < ceTime) {
      const confirmed = window.confirm(
        'CẢNH BÁO: Vote mở trước khi Claim đóng\n\n' +
          'Điều này có thể gây nhầm lẫn cho người dùng.\n' +
          'Bạn có chắc chắn muốn tiếp tục?'
      );
      if (!confirmed) return;
    }

    const confirmed = window.confirm(
      `XÁC NHẬN CẬP NHẬT LỊCH TRÌNH\n\n` +
        `Claim: ${new Date(claimStart).toLocaleString('vi-VN')} → ${new Date(claimEnd).toLocaleString('vi-VN')}\n` +
        `Vote: ${new Date(voteStart).toLocaleString('vi-VN')} → ${new Date(voteEnd).toLocaleString('vi-VN')}\n\n` +
        `Lịch trình sẽ được lưu on-chain và tất cả người dùng sẽ thấy.\n` +
        `Bạn có chắc chắn?`
    );

    if (!confirmed) return;

    saveSchedule(scheduleInput);
  };

  useEffect(() => {
    loadStatus();
    loadCandidates();
  }, [votingContract]);

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-8 animate-fadeIn">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">Admin Panel</h1>
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300 p-4 rounded">
          Vui lòng kết nối bằng tài khoản admin của hợp đồng để truy cập trang này.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="container mx-auto p-8 space-y-8 animate-fadeIn">
        <div className="bg-gradient-to-r from-fuchsia-600 via-orange-500 to-amber-400 dark:from-purple-900 dark:via-blue-900 dark:to-indigo-900 text-white p-8 rounded-2xl shadow-2xl animate-scaleIn">
          <h1 className="text-3xl font-extrabold mb-2">Bảng điều khiển Admin</h1>
          <p className="text-white/90">Quản lý claim/vote, lịch trình và ứng viên.</p>
          <div className="flex gap-4 mt-4 flex-wrap">
            <div className="bg-white/15 px-4 py-2 rounded-full text-sm transition-all duration-300 hover:scale-105 hover:bg-white/25">
              Claim: {status.claim ? 'Đang mở' : 'Đang đóng'}
            </div>
            <div className="bg-white/15 px-4 py-2 rounded-full text-sm transition-all duration-300 hover:scale-105 hover:bg-white/25">
              Vote: {status.vote ? 'Đang mở' : 'Đang đóng'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 shadow-lg rounded-xl space-y-3 lg:col-span-2 transition-all duration-300 hover:shadow-xl border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-lg dark:text-white">Lịch trình (on-chain)</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-semibold dark:text-gray-300">Claim mở</label>
                <input
                  type="datetime-local"
                  value={scheduleInput.claimStart}
                  onChange={(e) => setScheduleInput({ ...scheduleInput, claimStart: e.target.value })}
                  className="w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-qnu-500 dark:focus:ring-blue-500 transition-all duration-300"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold dark:text-gray-300">Claim đóng</label>
                <input
                  type="datetime-local"
                  value={scheduleInput.claimEnd}
                  onChange={(e) => setScheduleInput({ ...scheduleInput, claimEnd: e.target.value })}
                  className="w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-qnu-500 dark:focus:ring-blue-500 transition-all duration-300"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold dark:text-gray-300">Vote mở</label>
                <input
                  type="datetime-local"
                  value={scheduleInput.voteStart}
                  onChange={(e) => setScheduleInput({ ...scheduleInput, voteStart: e.target.value })}
                  className="w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-qnu-500 dark:focus:ring-blue-500 transition-all duration-300"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold dark:text-gray-300">Vote đóng</label>
                <input
                  type="datetime-local"
                  value={scheduleInput.voteEnd}
                  onChange={(e) => setScheduleInput({ ...scheduleInput, voteEnd: e.target.value })}
                  className="w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-qnu-500 dark:focus:ring-blue-500 transition-all duration-300"
                />
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Lịch lưu on-chain; mọi user đều thấy.</p>
            <button onClick={handleSaveSchedule} className="bg-qnu-500 dark:bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-qnu-600 dark:hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
              Lưu lịch trình
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 shadow-lg rounded-xl space-y-3 transition-all duration-300 hover:shadow-xl border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-lg dark:text-white">Trạng thái & điều khiển</h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleStartStop('moNhanPhieuBau')}
                className="flex-1 bg-blue-500 dark:bg-blue-600 text-white p-2 rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                Mở Claim
              </button>
              <button
                onClick={() => handleStartStop('dongNhanPhieuBau')}
                className="flex-1 bg-blue-500/80 dark:bg-blue-600/80 text-white p-2 rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                Đóng Claim
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleStartStop('moBauChonChinhThuc')}
                className="flex-1 bg-red-500 dark:bg-red-600 text-white p-2 rounded hover:bg-red-600 dark:hover:bg-red-700 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                Mở Vote
              </button>
              <button
                onClick={() => handleStartStop('dongBauChonChinhThuc')}
                className="flex-1 bg-red-500/80 dark:bg-red-600/80 text-white p-2 rounded hover:bg-red-600 dark:hover:bg-red-700 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                Đóng Vote
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 shadow-lg rounded-xl transition-all duration-300 hover:shadow-xl border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold mb-4 text-lg dark:text-white">Thêm ứng viên</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                className="border dark:border-gray-600 p-3 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-qnu-500 dark:focus:ring-blue-500 transition-all duration-300"
                placeholder="Tên"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                className="border dark:border-gray-600 p-3 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-qnu-500 dark:focus:ring-blue-500 transition-all duration-300"
                placeholder="MSSV"
                value={formData.mssv}
                onChange={(e) => setFormData({ ...formData, mssv: e.target.value })}
              />
              <input
                className="border dark:border-gray-600 p-3 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-qnu-500 dark:focus:ring-blue-500 transition-all duration-300"
                placeholder="Ngành/Khoa"
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
              />
              <input
                className="border dark:border-gray-600 p-3 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-qnu-500 dark:focus:ring-blue-500 transition-all duration-300"
                placeholder="URL ảnh"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
            </div>
            <textarea
              className="border dark:border-gray-600 p-3 rounded-lg w-full mt-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-qnu-500 dark:focus:ring-blue-500 transition-all duration-300"
              placeholder="Mô tả ứng viên"
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
            <button
              onClick={addCandidate}
              className="mt-4 bg-green-600 dark:bg-green-700 text-white px-4 py-3 rounded-lg w-full md:w-auto font-semibold hover:bg-green-700 dark:hover:bg-green-800 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              disabled={isLoading}
            >
              Thêm ứng viên
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 shadow-lg rounded-xl space-y-3 transition-all duration-300 hover:shadow-xl border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-lg dark:text-white">Khoá / Xóa ứng viên</h3>
            <div className="flex gap-3 flex-col sm:flex-row">
              <input
                className="border dark:border-gray-600 p-2 flex-1 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-qnu-500 dark:focus:ring-blue-500 transition-all duration-300"
                placeholder="ID ứng viên"
                value={disableId}
                onChange={(e) => setDisableId(e.target.value)}
              />
              <button onClick={handleDisable} className="bg-red-600 dark:bg-red-700 text-white px-4 py-2 rounded hover:bg-red-700 dark:hover:bg-red-800 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
                Xóa (vô hiệu hóa)
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 shadow-lg rounded-xl transition-all duration-300 hover:shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg dark:text-white">Danh sách ứng viên</h3>
            <button onClick={loadCandidates} className="text-qnu-500 dark:text-blue-400 underline hover:text-qnu-600 dark:hover:text-blue-300 transition-colors duration-300">
              Tải lại
            </button>
          </div>
          {loadingCandidates ? (
            <p className="dark:text-gray-300">Đang tải...</p>
          ) : candidates.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">Chưa có ứng viên.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {candidates.map((c, index) => (
                <div key={c.id} className="border dark:border-gray-600 rounded-lg p-4 space-y-2 bg-gray-50 dark:bg-gray-700/50 transition-all duration-300 hover:shadow-lg hover:scale-105 animate-fadeIn" style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">ID #{c.id}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${c.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'}`}
                    >
                      {c.isActive ? 'Đang mở' : 'Đã khóa'}
                    </span>
                  </div>
                  {c.image && <img src={c.image} alt={c.name} className="w-full h-32 object-cover rounded transition-transform duration-300 hover:scale-110" />}
                  <p className="font-bold text-gray-900 dark:text-white">{c.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">MSSV: {c.mssv}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Ngành: {c.major}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">Mô tả: {c.bio}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Votes: {c.votes}</p>
                  {c.isActive && (
                    <button
                      onClick={() => {
                        setDisableId(c.id);
                        handleDisable();
                      }}
                      className="text-red-600 dark:text-red-400 text-sm underline hover:text-red-700 dark:hover:text-red-300 transition-colors duration-300"
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
