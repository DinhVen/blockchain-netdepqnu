import { useState, useMemo } from 'react';

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
              <th className="text-right py-3 px-2 text-[#64748B] font-medium">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-[#64748B]">
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
    </div>
  );
};

export default CandidateTable;
