import { useState, useRef } from 'react';

const REQUIRED_COLUMNS = ['hoTen', 'mssv', 'nganh', 'ngaySinh', 'sdt', 'email'];
const OPTIONAL_COLUMNS = ['anh', 'moTa', 'wallet'];

const CandidateImport = ({ onImport, isLoading }) => {
  const [preview, setPreview] = useState([]);
  const [errors, setErrors] = useState([]);
  const [step, setStep] = useState('upload'); // upload | preview | done
  const fileInputRef = useRef(null);

  const parseCSV = (text) => {
    const lines = text.split('\n').filter((line) => line.trim());
    if (lines.length < 2) return { headers: [], rows: [] };

    const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
    const rows = lines.slice(1).map((line, idx) => {
      const values = line.split(',').map((v) => v.trim().replace(/"/g, ''));
      const row = { _rowIndex: idx + 2 };
      headers.forEach((h, i) => {
        row[h] = values[i] || '';
      });
      return row;
    });

    return { headers, rows };
  };

  // Normalize SĐT: thêm số 0 nếu Excel đã bỏ mất
  const normalizePhone = (phone) => {
    if (!phone) return '';
    let p = String(phone).trim().replace(/\D/g, ''); // Chỉ giữ số
    // Nếu có 9 số và bắt đầu bằng 3,5,7,8,9 → thêm 0 đầu
    if (p.length === 9 && /^[35789]/.test(p)) {
      p = '0' + p;
    }
    return p;
  };

  // Normalize MSSV: đảm bảo đủ 10 số (thêm 0 đầu nếu thiếu)
  const normalizeMssv = (mssv) => {
    if (!mssv) return '';
    let m = String(mssv).trim().replace(/\D/g, '');
    // Nếu là số khoa học (4.55E+09) thì convert
    if (String(mssv).includes('E') || String(mssv).includes('e')) {
      m = String(Math.round(Number(mssv)));
    }
    // Pad với số 0 nếu thiếu
    while (m.length < 10 && m.length > 0) {
      m = '0' + m;
    }
    return m;
  };

  const validateRow = (row, allRows) => {
    const rowErrors = [];

    // Normalize trước khi validate
    row.sdt = normalizePhone(row.sdt);
    row.mssv = normalizeMssv(row.mssv);

    // Họ tên
    if (!row.hoTen?.trim()) {
      rowErrors.push('Thiếu họ tên');
    }

    // MSSV
    if (!/^\d{10}$/.test(row.mssv || '')) {
      rowErrors.push('MSSV phải là 10 chữ số');
    }

    // Ngành
    if (!row.nganh?.trim()) {
      rowErrors.push('Thiếu ngành');
    }

    // Ngày sinh
    if (!row.ngaySinh?.trim()) {
      rowErrors.push('Thiếu ngày sinh');
    } else {
      const dob = new Date(row.ngaySinh);
      if (isNaN(dob.getTime())) {
        rowErrors.push('Ngày sinh không hợp lệ');
      } else if (dob > new Date()) {
        rowErrors.push('Ngày sinh vượt tương lai');
      }
    }

    // SĐT (đã normalize)
    if (!row.sdt) {
      rowErrors.push('Thiếu SĐT');
    } else if (!/^(0[35789])\d{8}$/.test(row.sdt)) {
      rowErrors.push('SĐT không hợp lệ');
    }

    // Email
    if (!row.email?.trim()) {
      rowErrors.push('Thiếu email');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email.trim())) {
      rowErrors.push('Email không hợp lệ');
    }

    // Check trùng trong file
    const duplicateMssv = allRows.filter((r) => r.mssv === row.mssv && r._rowIndex !== row._rowIndex);
    if (duplicateMssv.length > 0) {
      rowErrors.push(`Trùng MSSV với dòng ${duplicateMssv.map((r) => r._rowIndex).join(', ')}`);
    }

    const duplicateEmail = allRows.filter(
      (r) => r.email?.toLowerCase() === row.email?.toLowerCase() && r._rowIndex !== row._rowIndex
    );
    if (duplicateEmail.length > 0) {
      rowErrors.push(`Trùng email với dòng ${duplicateEmail.map((r) => r._rowIndex).join(', ')}`);
    }

    const duplicatePhone = allRows.filter((r) => r.sdt === row.sdt && r._rowIndex !== row._rowIndex);
    if (duplicatePhone.length > 0) {
      rowErrors.push(`Trùng SĐT với dòng ${duplicatePhone.map((r) => r._rowIndex).join(', ')}`);
    }

    return rowErrors;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      alert('Vui lòng chọn file CSV');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      const { headers, rows } = parseCSV(text);

      // Check required columns
      const missingColumns = REQUIRED_COLUMNS.filter((col) => !headers.includes(col));
      if (missingColumns.length > 0) {
        alert(`File thiếu các cột bắt buộc: ${missingColumns.join(', ')}`);
        return;
      }

      // Validate all rows
      const rowErrors = rows.map((row) => ({
        row,
        errors: validateRow(row, rows),
      }));

      setPreview(rowErrors);
      setErrors(rowErrors.filter((r) => r.errors.length > 0));
      setStep('preview');
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = () => {
    const validRows = preview.filter((r) => r.errors.length === 0).map((r) => r.row);
    if (validRows.length === 0) {
      alert('Không có dòng hợp lệ để import');
      return;
    }

    onImport(validRows);
    setStep('done');
  };

  const handleReset = () => {
    setPreview([]);
    setErrors([]);
    setStep('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validCount = preview.filter((r) => r.errors.length === 0).length;
  const errorCount = preview.filter((r) => r.errors.length > 0).length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#E2E8F0] dark:border-gray-700 p-6">
      <h3 className="font-bold text-[#0F172A] dark:text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        Import danh sách ứng viên (CSV)
      </h3>

      {step === 'upload' && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-[#E2E8F0] dark:border-gray-600 rounded-xl p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <svg className="w-10 h-10 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-sm text-[#64748B]">Click để chọn file CSV</span>
              <span className="text-xs text-[#94A3B8]">Hoặc kéo thả file vào đây</span>
            </label>
          </div>

          <div className="bg-[#F8FAFC] dark:bg-gray-700 rounded-lg p-4">
            <p className="text-xs font-medium text-[#64748B] mb-2">Cột bắt buộc:</p>
            <div className="flex flex-wrap gap-1">
              {REQUIRED_COLUMNS.map((col) => (
                <span key={col} className="px-2 py-1 bg-[#2563EB]/10 text-[#2563EB] text-xs rounded">
                  {col}
                </span>
              ))}
            </div>
            <p className="text-xs font-medium text-[#64748B] mt-3 mb-2">Cột tùy chọn:</p>
            <div className="flex flex-wrap gap-1">
              {OPTIONAL_COLUMNS.map((col) => (
                <span key={col} className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs rounded">
                  {col}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 'preview' && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="flex gap-4">
            <div className="flex-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{validCount}</p>
              <p className="text-xs text-green-600">Hợp lệ</p>
            </div>
            <div className="flex-1 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-red-600">{errorCount}</p>
              <p className="text-xs text-red-600">Lỗi</p>
            </div>
          </div>

          {/* Error list */}
          {errors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 max-h-48 overflow-y-auto">
              <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">Các dòng lỗi:</p>
              {errors.map((e, i) => (
                <div key={i} className="text-xs text-red-600 dark:text-red-300 mb-1">
                  <span className="font-medium">Dòng {e.row._rowIndex}:</span> {e.errors.join(', ')}
                </div>
              ))}
            </div>
          )}

          {/* Preview table */}
          <div className="border border-[#E2E8F0] dark:border-gray-600 rounded-lg overflow-hidden">
            <div className="overflow-x-auto max-h-64">
              <table className="w-full text-xs">
                <thead className="bg-[#F8FAFC] dark:bg-gray-700 sticky top-0">
                  <tr>
                    <th className="px-2 py-2 text-left text-[#64748B]">#</th>
                    <th className="px-2 py-2 text-left text-[#64748B]">Họ tên</th>
                    <th className="px-2 py-2 text-left text-[#64748B]">MSSV</th>
                    <th className="px-2 py-2 text-left text-[#64748B]">SĐT</th>
                    <th className="px-2 py-2 text-left text-[#64748B]">Email</th>
                    <th className="px-2 py-2 text-left text-[#64748B]">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 20).map((item, i) => (
                    <tr
                      key={i}
                      className={`border-t border-[#E2E8F0] dark:border-gray-600 ${
                        item.errors.length > 0 ? 'bg-red-50 dark:bg-red-900/10' : ''
                      }`}
                    >
                      <td className="px-2 py-2 text-gray-500">{item.row._rowIndex}</td>
                      <td className="px-2 py-2 text-gray-700 dark:text-gray-300">{item.row.hoTen}</td>
                      <td className="px-2 py-2 text-gray-700 dark:text-gray-300">{item.row.mssv}</td>
                      <td className="px-2 py-2 text-gray-700 dark:text-gray-300">{item.row.sdt}</td>
                      <td className="px-2 py-2 text-gray-700 dark:text-gray-300">{item.row.email}</td>
                      <td className="px-2 py-2">
                        {item.errors.length > 0 ? (
                          <span className="text-red-500">Lỗi</span>
                        ) : (
                          <span className="text-green-500">OK</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {preview.length > 20 && (
              <p className="text-xs text-center text-[#64748B] py-2 bg-[#F8FAFC] dark:bg-gray-700">
                ... và {preview.length - 20} dòng khác
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border border-[#E2E8F0] dark:border-gray-600 text-[#64748B] hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Hủy
            </button>
            <button
              onClick={handleImport}
              disabled={validCount === 0 || isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#2563EB] hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang import...' : `Import ${validCount} ứng viên`}
            </button>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="text-center py-6">
          <svg className="w-16 h-16 mx-auto text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-bold text-[#0F172A] dark:text-white mb-2">Import thành công!</p>
          <p className="text-sm text-[#64748B] mb-4">Đã tạo {validCount} yêu cầu đăng ký ứng viên</p>
          <button
            onClick={handleReset}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-[#2563EB] hover:bg-blue-700 text-white"
          >
            Import thêm
          </button>
        </div>
      )}
    </div>
  );
};

export default CandidateImport;
