import { useState } from 'react';

const PendingRequests = ({ requests, onApprove, onReject, loading }) => {
  const [selectedReq, setSelectedReq] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleAction = async () => {
    if (!selectedReq || !actionType) return;
    setProcessing(true);
    try {
      if (actionType === 'approve') {
        await onApprove(selectedReq.id);
      } else {
        await onReject(selectedReq.id);
      }
    } finally {
      setProcessing(false);
      setSelectedReq(null);
      setActionType(null);
    }
  };

  const pendingList = requests.filter(r => !r.approved && !r.rejected);

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-[#E2E8F0] dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-4">Yêu cầu đăng ký chờ duyệt</h3>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#2563EB] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-[#E2E8F0] dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">Yêu cầu đăng ký chờ duyệt</h3>
        <span className="px-3 py-1 bg-[#F59E0B]/10 text-[#F59E0B] rounded-full text-sm font-semibold">
          {pendingList.length} chờ xử lý
        </span>
      </div>

      {pendingList.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[#64748B]">Không có yêu cầu nào chờ duyệt</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingList.map((req) => (
            <div key={req.id} className="flex items-center gap-4 p-4 bg-[#F8FAFC] dark:bg-gray-800 rounded-xl">
              {req.image ? (
                <img src={req.image} alt={req.name} className="w-14 h-14 rounded-xl object-cover border border-[#E2E8F0] dark:border-gray-700" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[#64748B]">
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#0F172A] dark:text-white truncate">{req.name}</p>
                <p className="text-sm text-[#64748B]">{req.mssv} • {req.major}</p>
                <p className="text-xs text-[#64748B] truncate">Ví: {req.wallet?.slice(0, 10)}...{req.wallet?.slice(-6)}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setSelectedReq(req); setActionType('approve'); }}
                  className="px-3 py-2 bg-[#16A34A] hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition"
                >
                  Duyệt
                </button>
                <button
                  onClick={() => { setSelectedReq(req); setActionType('reject'); }}
                  className="px-3 py-2 bg-[#DC2626] hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition"
                >
                  Từ chối
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Modal */}
      {selectedReq && actionType && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mb-2">
              {actionType === 'approve' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
            </h3>
            <p className="text-[#64748B] mb-4">
              {actionType === 'approve' 
                ? `Bạn có chắc muốn duyệt ứng viên "${selectedReq.name}"? Ứng viên sẽ được thêm vào danh sách bầu chọn.`
                : `Bạn có chắc muốn từ chối yêu cầu của "${selectedReq.name}"?`
              }
            </p>
            
            <div className="bg-[#F8FAFC] dark:bg-gray-800 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3">
                {selectedReq.image && (
                  <img src={selectedReq.image} alt={selectedReq.name} className="w-12 h-12 rounded-lg object-cover" />
                )}
                <div>
                  <p className="font-semibold text-[#0F172A] dark:text-white">{selectedReq.name}</p>
                  <p className="text-sm text-[#64748B]">{selectedReq.mssv} • {selectedReq.major}</p>
                </div>
              </div>
              {selectedReq.bio && (
                <p className="text-sm text-[#64748B] mt-2 line-clamp-2">{selectedReq.bio}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setSelectedReq(null); setActionType(null); }}
                disabled={processing}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-[#64748B] rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleAction}
                disabled={processing}
                className={`flex-1 px-4 py-3 text-white rounded-xl font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2 ${
                  actionType === 'approve' ? 'bg-[#16A34A] hover:bg-green-700' : 'bg-[#DC2626] hover:bg-red-700'
                }`}
              >
                {processing && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>}
                {actionType === 'approve' ? 'Duyệt' : 'Từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingRequests;
