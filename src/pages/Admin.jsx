import { useContext, useEffect, useState, useCallback } from 'react';
import { Web3Context } from '../context/Web3Context';
import StatusBar from '../components/admin/StatusBar';
import StatsCards from '../components/admin/StatsCards';
import ControlPanel from '../components/admin/ControlPanel';
import ScheduleCard from '../components/admin/ScheduleCard';
import LimitsCard from '../components/admin/LimitsCard';
import WithdrawCard from '../components/admin/WithdrawCard';
import CandidateForm from '../components/admin/CandidateForm';
import CandidateImport from '../components/admin/CandidateImport';
import CandidateTable from '../components/admin/CandidateTable';
import FraudCard from '../components/admin/FraudCard';
import RecentActivity from '../components/admin/RecentActivity';
import OffchainRegistrations from '../components/admin/OffchainRegistrations';
import ConfirmModal from '../components/admin/ConfirmModal';
import TxToast from '../components/admin/TxToast';

const API_BASE = import.meta.env.VITE_OTP_API || 'https://voting-b431.onrender.com';

const Admin = () => {
  const {
    votingContract,
    isAdmin,
    currentAccount,
    schedule,
    saveSchedule,
    saleActive,
    voteOpen,
  } = useContext(Web3Context);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    tokensSold: 0,
    maxVoters: 0,
    totalVotes: 0,
    candidates: 0,
    contractBalance: '0',
    visitors: 0,
  });
  const [candidates, setCandidates] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [registrationRefresh, setRegistrationRefresh] = useState(0); // Trigger refresh for OffchainRegistrations
  const [scheduleInput, setScheduleInput] = useState({
    claimStart: '',
    claimEnd: '',
    voteStart: '',
    voteEnd: '',
  });
  const [treasury, setTreasury] = useState('');

  // Modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    description: '',
    type: 'danger',
    details: [],
    onConfirm: () => {},
  });

  // Toast state
  const [toast, setToast] = useState({
    isOpen: false,
    status: 'pending',
    message: '',
    txHash: '',
  });

  // Helper: Add activity
  const addActivity = useCallback((actionType, status, txHash = '') => {
    const newActivity = {
      actionType,
      status,
      txHash,
      time: new Date().toLocaleString('vi-VN'),
    };
    setActivities((prev) => [newActivity, ...prev.slice(0, 9)]);
    
    // Save to localStorage
    const saved = JSON.parse(localStorage.getItem('adminActivities') || '[]');
    localStorage.setItem('adminActivities', JSON.stringify([newActivity, ...saved.slice(0, 9)]));
  }, []);

  // Helper: Show toast
  const showToast = (status, message, txHash = '') => {
    setToast({ isOpen: true, status, message, txHash });
  };

  // Helper: Execute tx with toast
  const executeTx = async (actionType, txPromise) => {
    setIsLoading(true);
    showToast('pending', 'Đang gửi giao dịch...');
    addActivity(actionType, 'pending');

    try {
      const tx = await txPromise;
      showToast('pending', 'Đang chờ xác nhận...', tx.hash);
      await tx.wait();
      showToast('success', 'Giao dịch thành công!', tx.hash);
      addActivity(actionType, 'success', tx.hash);
      await loadData();
      return true;
    } catch (e) {
      showToast('error', e.reason || e.message || 'Giao dịch thất bại');
      addActivity(actionType, 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Load data
  const loadData = useCallback(async () => {
    if (!votingContract) return;

    try {
      const [sold, max, totalVotes, totalCandidates, treasuryAddr] = await Promise.all([
        votingContract.totalTokensSold(),
        votingContract.maxVoters(),
        votingContract.tongLichSuBauChon(),
        votingContract.tongUngVien(),
        votingContract.treasuryWallet(),
      ]);

      // Get contract balance
      const provider = votingContract.runner?.provider;
      let balance = '0';
      if (provider) {
        const contractAddr = await votingContract.getAddress();
        const bal = await provider.getBalance(contractAddr);
        balance = (Number(bal) / 1e18).toFixed(4);
      }

      // Get visitors count from backend (optional - may not be deployed yet)
      let visitors = 0;
      try {
        const res = await fetch(`${API_BASE}/unique-wallets-count`);
        if (res.ok) {
          const text = await res.text();
          if (text) {
            const data = JSON.parse(text);
            visitors = data.count || 0;
          }
        }
      } catch {
        // API not available yet, ignore
      }

      setStats({
        tokensSold: Number(sold),
        maxVoters: Number(max),
        totalVotes: Number(totalVotes),
        candidates: Number(totalCandidates),
        contractBalance: balance,
        visitors,
      });
      setTreasury(treasuryAddr);

      // Load candidates
      const total = Number(totalCandidates);
      if (total > 0) {
        const list = await Promise.all(
          Array.from({ length: total }, (_, i) => votingContract.dsUngVien(i + 1))
        );
        setCandidates(
          list
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
            .filter((c) => c.id > 0)
        );
      }
    } catch (e) {
      console.warn('Load data error:', e);
    }
  }, [votingContract]);

  // Load conflicts
  const loadConflicts = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/conflicts`);
      if (res.ok) {
        const data = await res.json();
        setConflicts(data.data || []);
      }
    } catch (e) {
      console.warn('Load conflicts error:', e);
    }
  }, []);

  // Load schedule to form
  const loadScheduleToForm = () => {
    const toLocalInput = (ms) => {
      if (!ms) return '';
      const d = new Date(ms);
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    setScheduleInput({
      claimStart: toLocalInput(schedule.claimStart),
      claimEnd: toLocalInput(schedule.claimEnd),
      voteStart: toLocalInput(schedule.voteStart),
      voteEnd: toLocalInput(schedule.voteEnd),
    });
  };

  // Effects
  useEffect(() => {
    loadData();
    loadConflicts();
    // Load saved activities
    const saved = JSON.parse(localStorage.getItem('adminActivities') || '[]');
    setActivities(saved);
  }, [loadData, loadConflicts]);

  useEffect(() => {
    loadScheduleToForm();
  }, [schedule]);

  // Handlers
  const handleOpenSale = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Mở bán token',
      description: 'Người dùng sẽ có thể mua token sau khi mở.',
      type: 'primary',
      details: [],
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        await executeTx('OpenSale', votingContract.moBanToken());
      },
    });
  };

  const handleCloseSale = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Đóng bán token',
      description: 'Người dùng sẽ không thể mua token sau khi đóng.',
      type: 'danger',
      details: [
        { label: 'Token đã bán', value: stats.tokensSold },
      ],
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        await executeTx('CloseSale', votingContract.dongBanToken());
      },
    });
  };

  const handleOpenVote = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Mở bầu chọn',
      description: 'Người dùng đã mua token sẽ có thể bầu chọn.',
      type: 'primary',
      details: [],
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        await executeTx('OpenVote', votingContract.moBauChonChinhThuc());
      },
    });
  };

  const handleCloseVote = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Đóng bầu chọn',
      description: 'Cuộc bầu chọn sẽ kết thúc và không ai có thể vote thêm.',
      type: 'danger',
      details: [
        { label: 'Tổng phiếu', value: stats.totalVotes },
      ],
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        await executeTx('CloseVote', votingContract.dongBauChonChinhThuc());
      },
    });
  };

  const handleSaveSchedule = () => {
    const { claimStart, claimEnd, voteStart, voteEnd } = scheduleInput;
    if (!claimStart || !claimEnd || !voteStart || !voteEnd) {
      alert('Vui lòng điền đầy đủ lịch trình');
      return;
    }
    const cs = new Date(claimStart).getTime();
    const ce = new Date(claimEnd).getTime();
    const vs = new Date(voteStart).getTime();
    const ve = new Date(voteEnd).getTime();
    if (cs >= ce) return alert('Claim đóng phải sau claim mở');
    if (vs >= ve) return alert('Vote đóng phải sau vote mở');

    saveSchedule(scheduleInput);
    addActivity('SetSchedule', 'success');
    showToast('success', 'Đã lưu lịch trình');
  };

  const handleUpdateLimit = async (newLimit) => {
    setConfirmModal({
      isOpen: true,
      title: 'Cập nhật giới hạn',
      description: `Thay đổi giới hạn từ ${stats.maxVoters} thành ${newLimit}`,
      type: 'warning',
      details: [
        { label: 'Giới hạn cũ', value: stats.maxVoters },
        { label: 'Giới hạn mới', value: newLimit },
      ],
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        await executeTx('UpdateLimit', votingContract.capNhatMaxVoters(newLimit));
      },
    });
  };

  const handleWithdraw = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Rút tiền về Treasury',
      description: 'Toàn bộ ETH trong contract sẽ được chuyển về Treasury wallet.',
      type: 'danger',
      requireInput: true,
      details: [
        { label: 'Contract Balance', value: `${stats.contractBalance} ETH` },
        { label: 'Treasury', value: `${treasury?.slice(0, 6)}...${treasury?.slice(-4)}` },
      ],
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        await executeTx('Withdraw', votingContract.rutTien());
      },
    });
  };

  const handleAddCandidate = async (form) => {
    // Thêm vào blockchain trước
    const success = await executeTx(
      'AddCandidate',
      votingContract.themUngVien(form.name, form.mssv, form.major, form.image, form.bio)
    );

    if (success) {
      // Lưu thông tin liên lạc vào backend
      try {
        const totalCandidates = await votingContract.tongUngVien();
        await fetch(`${API_BASE}/candidates`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            mssv: form.mssv,
            major: form.major,
            image: form.image,
            bio: form.bio,
            dob: form.dob,
            phone: form.phone,
            email: form.email,
            contractId: Number(totalCandidates),
            source: 'admin-add',
            status: 'approved',
          }),
        });
      } catch (e) {
        console.warn('Save candidate to backend error:', e);
      }
    }
  };

  const handleImportCandidates = async (rows) => {
    setIsLoading(true);
    try {
      console.log('Importing rows:', rows);
      const res = await fetch(`${API_BASE}/registrations/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows }),
      });

      console.log('Import response status:', res.status);

      // Check if endpoint exists (404 = not deployed yet)
      if (res.status === 404) {
        showToast('error', 'Backend chưa deploy endpoint mới. Vui lòng deploy lại server.js');
        setIsLoading(false);
        return;
      }

      const text = await res.text();
      console.log('Import response text:', text);

      if (!text) {
        showToast('error', 'Backend trả về response rỗng');
        setIsLoading(false);
        return;
      }

      const data = JSON.parse(text);
      console.log('Import response data:', data);

      if (data.ok) {
        showToast('success', `Import thành công ${data.successCount} ứng viên${data.errorCount > 0 ? `, ${data.errorCount} lỗi` : ''}`);
        addActivity('ImportCandidates', 'success');
        // Trigger refresh for OffchainRegistrations
        setRegistrationRefresh((prev) => prev + 1);
      } else {
        showToast('error', data.error || 'Import thất bại');
      }
    } catch (e) {
      console.error('Import candidates error:', e);
      showToast('error', 'Import thất bại: ' + (e.message || 'Lỗi kết nối'));
    }
    setIsLoading(false);
  };

  const handleLockCandidate = (id) => {
    const candidate = candidates.find((c) => c.id === id);
    setConfirmModal({
      isOpen: true,
      title: 'Khóa ứng viên',
      description: `Ứng viên "${candidate?.name}" sẽ bị khóa và không nhận được phiếu bầu.`,
      type: 'danger',
      details: [
        { label: 'ID', value: id },
        { label: 'Tên', value: candidate?.name },
      ],
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        await executeTx('LockCandidate', votingContract.khoaUngVien(id));
      },
    });
  };

  const handleUnlockCandidate = async (id) => {
    // Contract may not have unlock function, check first
    if (votingContract.moKhoaUngVien) {
      await executeTx('UnlockCandidate', votingContract.moKhoaUngVien(id));
    } else {
      alert('Contract không hỗ trợ mở khóa ứng viên');
    }
  };

  const handleBanWallet = (wallet) => {
    setConfirmModal({
      isOpen: true,
      title: 'Ban ví',
      description: 'Ví này sẽ không thể tham gia bầu chọn.',
      type: 'danger',
      details: [
        { label: 'Địa chỉ', value: `${wallet.slice(0, 10)}...${wallet.slice(-8)}` },
      ],
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        if (votingContract.banVi) {
          await executeTx('BanWallet', votingContract.banVi(wallet));
        } else {
          alert('Contract không hỗ trợ ban ví');
        }
      },
    });
  };

  const handleExportCSV = async () => {
    // Fetch backend data for contact info
    let backendData = {};
    try {
      const res = await fetch(`${API_BASE}/registrations`);
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.data) {
          data.data.forEach((r) => {
            backendData[r.mssv] = r;
          });
        }
      }
    } catch (e) {
      console.warn('Fetch backend data for export error:', e);
    }

    const headers = ['ID', 'Tên', 'MSSV', 'Ngành', 'Ngày sinh', 'SĐT', 'Email', 'Mô tả', 'Số phiếu', 'Trạng thái'];
    const rows = candidates.map((c) => {
      const backend = backendData[c.mssv] || {};
      // Wrap MSSV in quotes with = prefix to prevent Excel scientific notation
      const mssvFormatted = `="${c.mssv}"`;
      // Wrap phone in quotes too
      const phoneFormatted = backend.phone ? `="${backend.phone}"` : '';
      // Escape quotes in bio
      const bioEscaped = (backend.bio || c.bio || '').replace(/"/g, '""');
      return [
        c.id,
        `"${c.name}"`,
        mssvFormatted,
        `"${c.major}"`,
        backend.dob || '',
        phoneFormatted,
        backend.email || '',
        `"${bioEscaped}"`,
        c.votes,
        c.isActive ? 'Mở' : 'Khóa',
      ];
    });
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ket-qua-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Check admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-900 pt-24 px-4">
        <div className="container mx-auto max-w-lg">
          <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] p-6 rounded-xl text-center">
            <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h2 className="text-lg font-bold mb-2">Truy cập bị từ chối</h2>
            <p className="text-sm">Vui lòng kết nối bằng tài khoản admin để truy cập trang này.</p>
          </div>
        </div>
      </div>
    );
  }

  const shortenAddress = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '---';
  const scheduleSet = schedule.claimStart || schedule.voteStart;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-900 pt-20 pb-10 transition-colors">
      <div className="container mx-auto px-4 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#E2E8F0] dark:border-gray-700 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">Bảng điều khiển Admin</h1>
              <p className="text-sm text-[#64748B] mt-1">Quản lý bán token, lịch trình, bầu chọn, ứng viên, gian lận</p>
            </div>
            <div className="text-right text-xs space-y-1">
              <p className="text-[#64748B]">Network: <span className="font-medium text-[#0F172A] dark:text-white">Sepolia</span></p>
              <p className="text-[#64748B]">Admin: <span className="font-mono text-[#0F172A] dark:text-white">{shortenAddress(currentAccount)}</span></p>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <StatusBar
          network="Sepolia"
          saleActive={saleActive}
          voteOpen={voteOpen}
          maxVoters={stats.maxVoters}
          tokensSold={stats.tokensSold}
          contractBalance={stats.contractBalance}
          treasury={treasury}
          scheduleSet={scheduleSet}
        />

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Main Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <ScheduleCard
              schedule={scheduleInput}
              onScheduleChange={(key, value) => setScheduleInput((prev) => ({ ...prev, [key]: value }))}
              onSave={handleSaveSchedule}
              onLoadCurrent={loadScheduleToForm}
              saleActive={saleActive}
              voteOpen={voteOpen}
              isLoading={isLoading}
            />
            <LimitsCard
              maxVoters={stats.maxVoters}
              tokensSold={stats.tokensSold}
              onUpdate={handleUpdateLimit}
              isLoading={isLoading}
            />
            <CandidateForm onSubmit={handleAddCandidate} isLoading={isLoading} />
            <CandidateImport onImport={handleImportCandidates} isLoading={isLoading} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <ControlPanel
              saleActive={saleActive}
              voteOpen={voteOpen}
              onOpenSale={handleOpenSale}
              onCloseSale={handleCloseSale}
              onOpenVote={handleOpenVote}
              onCloseVote={handleCloseVote}
              isLoading={isLoading}
            />
            <WithdrawCard
              contractBalance={stats.contractBalance}
              treasury={treasury}
              onWithdraw={handleWithdraw}
              isLoading={isLoading}
            />
            <FraudCard
              conflicts={conflicts}
              onBan={handleBanWallet}
              onRefresh={loadConflicts}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Full Width Sections */}
        <OffchainRegistrations
          votingContract={votingContract}
          onAddActivity={addActivity}
          onShowToast={showToast}
          refreshTrigger={registrationRefresh}
        />

        <CandidateTable
          candidates={candidates}
          onLock={handleLockCandidate}
          onUnlock={handleUnlockCandidate}
          onExport={handleExportCSV}
          isLoading={isLoading}
        />

        <RecentActivity activities={activities} network="sepolia" />

        {/* Confirm Modal */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          description={confirmModal.description}
          type={confirmModal.type}
          details={confirmModal.details}
          requireInput={confirmModal.requireInput}
          isLoading={isLoading}
        />

        {/* Toast */}
        <TxToast
          isOpen={toast.isOpen}
          onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
          status={toast.status}
          message={toast.message}
          txHash={toast.txHash}
          network="sepolia"
        />
      </div>
    </div>
  );
};

export default Admin;
