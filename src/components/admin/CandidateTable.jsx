import { useState, useMemo, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_OTP_API || 'https://voting-b431.onrender.com';

const CandidateTable = ({ 
  candidates, 
  onLock, 
  onUnlock, 
  onExport,
  isLoading 
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | active | locked
  const [sortBy, setSortBy] = useState('votes'); // votes | id | name
  const [detailModal, setDetailModal] = useState({ isOpen: false, candidate: null });
  const [backendData, setBackendData] = useState({}); // mssv -> backend info
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Fetch backend data for contact info
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const res = await fetch(`${API_BASE}/registrations`);
        if (res.ok) {
          const data = await res.json();
          if (data.ok && data.data) {
            const map = {};
            data.data.forEach(r => {
              map[r.mssv] = r;
            });
            setBackendData(map);
          }
        }
      } catch (e) {
        console.warn('Fetch backend data error:', e);
      }
    };
    fetchBackendData();
  }, [candidates]);

  const handleViewDetail = (candidate) => {
    const backendInfo = backendData[candidate.mssv] || {};
    setDetailModal({
      isOpen: true,
      candidate: { ...candidate, ...backendInfo }
    });
  };

  const filtered = useMemo(() => {
    let list = [...candidates];
    
    // Search
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(c => 
        c.name.toLowerCase().includes(s) || 
        c.mssv.includes(s) ||
        c.major.toLowerCase().includes(s)
      );
    }
    
    // Filter
    if (filter === 'active') list = list.filter(c => c.isActive);
    if (filter === 'locked') list = list.filter(c => !c.isActive);
    
    // Sort
    if (sortBy === 'votes') list.sort((a, b) => b.votes - a.votes);
    if (sortBy === 'id') list.sort((a, b) => a.id - b.id);
    if (sortBy === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    
    return list;
  }, [candidates, search, filter, sortBy]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#E2E8F0] dark:border-gray-700 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Danh sách ứng viên ({candidates.length})
        </h3>
        <button
          onClick={onExport}
          className="text-xs px-3 py-1.5 rounded-lg bg-[#16A34A] hover:bg-green-700 text-white font-medium transition"
        >
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm..."
          className="flex-1 min-w-[200px] border border-[#E2E8F0] dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-[#E2E8F0] dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
        >
          <option value="all">Tất cả</option>
          <option value="active">Đang mở</option>
          <option value="locked">Đã khóa</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-[#E2E8F0] dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
        >
          <option value="votes">Sắp xếp: Phiếu</option>
          <option value="id">Sắp xếp: ID</option>
          <option value="name">Sắp xếp: Tên</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E2E8F0] dark:border-gray-700">
              <th className="text-left py-3 px-2 text-[#64748B] font-medium">ID</th>
              <th className="text-left py-3 px-2 text-[#64748B] font-medium">Ảnh</th>
              <th className="text-left py-3 px-2 text-[#64748B] font-medium">Họ tên</th>
              <th className="text-left py-3 px-2 text-[#64748B] font-medium">MSSV</th>
              <th className="text-left py-3 px-2 text-[#64748B] font-medium">Ngành</th>
              <th className="text-right py-3 px-2 text-[#64748B] font-medium">Phiếu</th>
              <th className="text-center py-3 px-2 text-[#64748B] font-medium">Trạng thái</th>
              <th className="text-center py-3 px-2 text-[#64748B] font-medium">Chi tiết</th>
              <th className="text-right py-3 px-2 text-[#64748B] font-medium">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-[#64748B]">
                  Không có ứng viên
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="border-b border-[#E2E8F0] dark:border-gray-700 hover:bg-[#F8FAFC] dark:hover:bg-gray-700/50">
                  <td className="py-3 px-2 font-medium text-[#0F172A] dark:text-white">#{c.id}</td>
                  <td className="py-3 px-2">
                    {c.image ? (
                      <img src={c.image} alt={c.name} className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[#E2E8F0] dark:bg-gray-600 flex items-center justify-center text-[#64748B] text-xs">
                        N/A
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-2 font-medium text-[#0F172A] dark:text-white">{c.name}</td>
                  <td className="py-3 px-2 text-[#64748B] font-mono">{c.mssv}</td>
                  <td className="py-3 px-2 text-[#64748B]">{c.major}</td>
                  <td className="py-3 px-2 text-right font-bold text-[#2563EB]">{c.votes}</td>
                  <td className="py-3 px-2 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${c.isActive ? 'bg-[#16A34A]/10 text-[#16A34A]' : 'bg-gray-100 dark:bg-gray-700 text-[#64748B]'}`}>
                      {c.isActive ? 'Mở' : 'Khóa'}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <button
                      onClick={() => handleViewDetail(c)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-medium transition"
                    >
                      Xem
                    </button>
                  </td>
                  <td className="py-3 px-2 text-right">
                    {c.isActive ? (
                      <button
                        onClick={() => onLock(c.id)}
                        disabled={isLoading}
                        className="text-xs px-3 py-1.5 rounded-lg bg-[#DC2626] hover:bg-red-700 text-white font-medium transition disabled:opacity-50"
                      >
                        Khóa
                      </button>
                    ) : (
                      <button
                        onClick={() => onUnlock(c.id)}
                        disabled={isLoading}
                        className="text-xs px-3 py-1.5 rounded-lg bg-[#16A34A] hover:bg-green-700 text-white font-medium transition disabled:opacity-50"
                      >
                        Mở khóa
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {detailModal.isOpen && detailModal.candidate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">
                  Thông tin ứng viên
                </h3>
                <button
                  onClick={() => setDetailModal({ isOpen: false, candidate: null })}
                  className="text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Avatar & Name */}
              <div className="flex items-center gap-4 mb-6">
                {detailModal.candidate.image ? (
                  <img 
                    src={detailModal.candidate.image} 
                    alt={detailModal.candidate.name}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-[#E2E8F0] dark:bg-gray-600 flex items-center justify-center text-[#64748B] text-xl font-bold">
                    {detailModal.candidate.name?.charAt(0) || '?'}
                  </div>
                )}
                <div>
                  <h4 className="text-xl font-bold text-[#0F172A] dark:text-white">
                    {detailModal.candidate.name}
                  </h4>
                  <p className="text-sm text-[#64748B]">ID: #{detailModal.candidate.id}</p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-[#E2E8F0] dark:border-gray-700">
                  <span className="text-[#64748B]">MSSV</span>
                  <span className="font-mono text-[#0F172A] dark:text-white">{detailModal.candidate.mssv}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#E2E8F0] dark:border-gray-700">
                  <span className="text-[#64748B]">Ngành</span>
                  <span className="text-[#0F172A] dark:text-white text-right max-w-[200px]">{detailModal.candidate.major}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#E2E8F0] dark:border-gray-700">
                  <span className="text-[#64748B]">Số phiếu</span>
                  <span className="font-bold text-[#2563EB]">{detailModal.candidate.votes}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#E2E8F0] dark:border-gray-700">
                  <span className="text-[#64748B]">Trạng thái</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${detailModal.candidate.isActive ? 'bg-[#16A34A]/10 text-[#16A34A]' : 'bg-gray-100 dark:bg-gray-700 text-[#64748B]'}`}>
                    {detailModal.candidate.isActive ? 'Đang mở' : 'Đã khóa'}
                  </span>
                </div>

                {/* Contact Info Section */}
                <div className="pt-3">
                  <h5 className="text-sm font-semibold text-[#0F172A] dark:text-white mb-3">Thông tin liên lạc</h5>
                  
                  <div className="flex justify-between py-2 border-b border-[#E2E8F0] dark:border-gray-700">
                    <span className="text-[#64748B]">Ngày sinh</span>
                    <span className="text-[#0F172A] dark:text-white">
                      {detailModal.candidate.dob || '---'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#E2E8F0] dark:border-gray-700">
                    <span className="text-[#64748B]">Số điện thoại</span>
                    {detailModal.candidate.phone ? (
                      <a href={`tel:${detailModal.candidate.phone}`} className="text-[#2563EB] hover:underline">
                        {detailModal.candidate.phone}
                      </a>
                    ) : (
                      <span className="text-[#64748B]">---</span>
                    )}
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#E2E8F0] dark:border-gray-700">
                    <span className="text-[#64748B]">Email</span>
                    {detailModal.candidate.email ? (
                      <a href={`mailto:${detailModal.candidate.email}`} className="text-[#2563EB] hover:underline text-right max-w-[200px] truncate">
                        {detailModal.candidate.email}
                      </a>
                    ) : (
                      <span className="text-[#64748B]">---</span>
                    )}
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#E2E8F0] dark:border-gray-700">
                    <span className="text-[#64748B]">Ví</span>
                    {detailModal.candidate.wallet ? (
                      <span className="font-mono text-xs text-[#0F172A] dark:text-white">
                        {detailModal.candidate.wallet.slice(0, 6)}...{detailModal.candidate.wallet.slice(-4)}
                      </span>
                    ) : (
                      <span className="text-[#64748B]">---</span>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {detailModal.candidate.bio && (
                  <div className="pt-3">
                    <h5 className="text-sm font-semibold text-[#0F172A] dark:text-white mb-2">Giới thiệu</h5>
                    <p className="text-sm text-[#64748B] whitespace-pre-wrap">{detailModal.candidate.bio}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-[#E2E8F0] dark:border-gray-700">
                <button
                  onClick={() => setDetailModal({ isOpen: false, candidate: null })}
                  className="flex-1 px-4 py-2 rounded-lg border border-[#E2E8F0] dark:border-gray-600 text-[#64748B] hover:bg-[#F8FAFC] dark:hover:bg-gray-700 transition"
                >
                  Đóng
                </button>
                {detailModal.candidate.phone && (
                  <a
                    href={`tel:${detailModal.candidate.phone}`}
                    className="flex-1 px-4 py-2 rounded-lg bg-[#16A34A] hover:bg-green-700 text-white text-center font-medium transition"
                  >
                    Gọi điện
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateTable;
