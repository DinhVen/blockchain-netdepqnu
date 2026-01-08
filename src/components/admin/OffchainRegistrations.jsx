import { useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_OTP_API || 'https://voting-b431.onrender.com';

const OffchainRegistrations = ({ votingContract, onAddActivity, onShowToast, refreshTrigger }) => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // pending | approved | rejected | all
  const [selectedReg, setSelectedReg] = useState(null);
  const [actionType, setActionType] = useState(null); // approve | reject
  const [processing, setProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const loadRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const url = filter === 'all' 
        ? `${API_BASE}/registrations` 
        : `${API_BASE}/registrations?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      setRegistrations(data.data || []);
    } catch (e) {
      console.warn('Load registrations error:', e);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    loadRegistrations();
  }, [loadRegistrations]);

  // Refresh when triggered from parent (after import)
  useEffect(() => {
    if (refreshTrigger > 0) {
      loadRegistrations();
    }
  }, [refreshTrigger, loadRegistrations]);

  const handleApprove = async () => {
    if (!selectedReg || !votingContract) return;
    setProcessing(true);

    try {
      // 1. Add candidate to blockchain
      onShowToast?.('pending', 'Đang thêm ứng viên vào blockchain...');
      
      const tx = await votingContract.themUngVien(
        selectedReg.name,
        selectedReg.mssv,
        selectedReg.major,
        selectedReg.image || '',
        selectedReg.bio || ''
      );
      
      onShowToast?.('pending', 'Đang chờ xác nhận...', tx.hash);
      const receipt = await tx.wait();

      // 2. Get new candidate ID from contract
      const totalCandidates = await votingContract.tongUngVien();
      const contractId = Number(totalCandidates);

      // 3. Update registration status in backend
      await fetch(`${API_BASE}/registrations/${selectedReg._id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId, txHash: receipt.hash }),
      });

      onShowToast?.('success', 'Đã duyệt và thêm ứng viên thành công!', receipt.hash);
      onAddActivity?.('ApproveRegistration', 'success', receipt.hash);
      
      await loadRegistrations();
    } catch (e) {
      console.error('Approve error:', e);
      onShowToast?.('error', e.reason || e.message || 'Duyệt thất bại');
      onAddActivity?.('ApproveRegistration', 'error');
    }

    setProcessing(false);
    setSelectedReg(null);
    setActionType(null);
  };

  const handleReject = async () => {
    if (!selectedReg) return;
    setProcessing(true);

    try {
      await fetch(`${API_BASE}/registrations/${selectedReg._id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason || 'Không đạt yêu cầu' }),
      });

      onShowToast?.('success', 'Đã từ chối yêu cầu đăng ký');
      onAddActivity?.('RejectRegistration', 'success');
      
      await loadRegistrations();
    } catch (e) {
      console.error('Reject error:', e);
      onShowToast?.('error', 'Từ chối thất bại');
    }

    setProcessing(false);
    setSelectedReg(null);
    setActionType(null);
    setRejectReason('');
  };

  const pendingCount = registrations.filter(r => r.status === 'pending').length;

  const statusBadge = (status) => {
    const config = {
      pending: { bg: 'bg-[#F59E0B]/10', text: 'text-[#F59E0B]', label: 'Chờ duyệt' },
      approved: { bg: 'bg-[#16A34A]/10', text: 'text-[#16A34A]', label: 'Đã duyệt' },
      rejected: { bg: 'bg-[#DC2626]/10', text: 'text-[#DC2626]', label: 'Từ chối' },
    };
    const c = config[status] || config.pending;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>{c.label}</span>;
  };

  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-[#E2E8F0] dark:border-gray-700 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h3 className="text-lg font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Đăng ký ứng viên (Off-chain)
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 bg-[#F59E0B] text-white rounded-full text-xs font-bold">
              {pendingCount}
            </span>
          )}
        </h3>

        <div className="flex items-center gap-2">
          {/* Filter tabs */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {[
              { key: 'pending', label: 'Chờ duyệt' },
              { key: 'approved', label: 'Đã duyệt' },
              { key: 'rejected', label: 'Từ chối' },
              { key: 'all', label: 'Tất cả' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                  filter === tab.key
                    ? 'bg-white dark:bg-gray-700 text-[#2563EB] shadow-sm'
                    : 'text-[#64748B] hover:text-[#0F172A] dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={loadRegistrations}
            disabled={loading}
            className="p-2 text-[#64748B] hover:text-[#2563EB] hover:bg-[#2563EB]/10 rounded-lg transition"
          >
            <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#2563EB] border-t-transparent"></div>
        </div>
      ) : registrations.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[#64748B]">Không có yêu cầu nào</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {registrations.map((reg) => (
            <div key={reg._id} className="flex items-center gap-4 p-4 bg-[#F8FAFC] dark:bg-gray-800 rounded-xl">
              {reg.image ? (
                <img src={reg.image} alt={reg.name} className="w-14 h-14 rounded-xl object-cover border border-[#E2E8F0] dark:border-gray-700" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[#64748B]">
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-[#0F172A] dark:text-white truncate">{reg.name}</p>
                  {statusBadge(reg.status)}
                </div>
                <p className="text-sm text-[#64748B]">{reg.mssv} • {reg.major}</p>
                <p className="text-xs text-[#64748B]">
                  {reg.source === 'csv-import' ? '📁 Import CSV' : '📝 Tự đăng ký'} • {new Date(reg.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>

              {reg.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => { setSelectedReg(reg); setActionType('approve'); }}
                    className="px-3 py-2 bg-[#16A34A] hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition"
                  >
                    Duyệt
                  </button>
                  <button
                    onClick={() => { setSelectedReg(reg); setActionType('reject'); }}
                    className="px-3 py-2 bg-[#DC2626] hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition"
                  >
                    Từ chối
                  </button>
                </div>
              )}

              {reg.status === 'approved' && reg.contractId && (
                <span className="px-3 py-1 bg-[#2563EB]/10 text-[#2563EB] rounded-lg text-sm font-medium">
                  ID #{reg.contractId}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Confirm Modal */}
      {selectedReg && actionType && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mb-2">
              {actionType === 'approve' ? 'Xác nhận duyệt ứng viên' : 'Xác nhận từ chối'}
            </h3>
            <p className="text-[#64748B] mb-4">
              {actionType === 'approve' 
                ? `Ứng viên "${selectedReg.name}" sẽ được thêm vào blockchain và xuất hiện trong danh sách bầu chọn.`
                : `Yêu cầu đăng ký của "${selectedReg.name}" sẽ bị từ chối.`
              }
            </p>
            
            {/* Registration details */}
            <div className="bg-[#F8FAFC] dark:bg-gray-800 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                {selectedReg.image && (
                  <img src={selectedReg.image} alt={selectedReg.name} className="w-16 h-16 rounded-lg object-cover" />
                )}
                <div>
                  <p className="font-semibold text-[#0F172A] dark:text-white">{selectedReg.name}</p>
                  <p className="text-sm text-[#64748B]">{selectedReg.mssv}</p>
                  <p className="text-sm text-[#64748B]">{selectedReg.major}</p>
                </div>
              </div>
              
              {selectedReg.phone && (
                <p className="text-sm text-[#64748B]">📞 {selectedReg.phone}</p>
              )}
              {selectedReg.email && (
                <p className="text-sm text-[#64748B]">📧 {selectedReg.email}</p>
              )}
              {selectedReg.dob && (
                <p className="text-sm text-[#64748B]">🎂 {selectedReg.dob}</p>
              )}
              {selectedReg.bio && (
                <p className="text-sm text-[#64748B] mt-2 line-clamp-2">{selectedReg.bio}</p>
              )}
            </div>

            {/* Reject reason input */}
            {actionType === 'reject' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#64748B] mb-2">Lý do từ chối</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Nhập lý do từ chối..."
                  className="w-full px-3 py-2 border border-[#E2E8F0] dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#0F172A] dark:text-white text-sm resize-none"
                  rows={2}
                />
              </div>
            )}

            {actionType === 'approve' && (
              <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-lg p-3 mb-4">
                <p className="text-sm text-[#F59E0B]">
                  ⚠️ Hành động này sẽ gọi smart contract và tốn gas fee
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setSelectedReg(null); setActionType(null); setRejectReason(''); }}
                disabled={processing}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-[#64748B] rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={actionType === 'approve' ? handleApprove : handleReject}
                disabled={processing}
                className={`flex-1 px-4 py-3 text-white rounded-xl font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2 ${
                  actionType === 'approve' ? 'bg-[#16A34A] hover:bg-green-700' : 'bg-[#DC2626] hover:bg-red-700'
                }`}
              >
                {processing && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>}
                {actionType === 'approve' ? 'Duyệt & Thêm vào blockchain' : 'Từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OffchainRegistrations;
