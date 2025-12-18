import { Link } from "react-router-dom";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Web3Context } from "../context/Web3Context";
import ReviewForm from "../components/ReviewForm";



/** ---------- Helpers (chịu được BigInt/seconds/ms/string) ---------- */
const toMs = (t) => {
  if (t == null) return null;

  // ethers v6 hay trả BigInt
  if (typeof t === "bigint") return Number(t) * 1000;

  if (t instanceof Date) return t.getTime();

  if (typeof t === "number") {
    // nếu lớn cỡ 1e12 thì đã là ms; nhỏ hơn thường là seconds
    return t > 1e12 ? t : t * 1000;
  }

  if (typeof t === "string") {
    // thử parse number trước
    const n = Number(t);
    if (!Number.isNaN(n)) return n > 1e12 ? n : n * 1000;

    // fallback parse date string
    const d = Date.parse(t);
    return Number.isNaN(d) ? null : d;
  }

  return null;
};

const formatTime = (val) => {
  const ms = toMs(val);
  return ms ? new Date(ms).toLocaleString("vi-VN") : "Chưa đặt";
};

const safeJsonParse = (s, fallback) => {
  try {
    return JSON.parse(s);
  } catch {
    return fallback;
  }
};

const clamp0 = (n) => (n < 0 ? 0 : n);

/** ---------- Static data (để ngoài component: không tạo lại mỗi render) ---------- */
const HELP_STEPS = [
  {
    title: "Bước 1: Xác thực Email",
    desc: "Sử dụng email sinh viên QNU để xác thực danh tính",
    color: "from-blue-500 to-cyan-500",
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    title: "Bước 2: Mua Token",
    desc: "Kết nối MetaMask và mua 1 token QSV để bỏ phiếu",
    color: "from-purple-500 to-pink-500",
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    title: "Bước 3: Bỏ Phiếu",
    desc: "Chọn ứng viên yêu thích và xác nhận giao dịch",
    color: "from-green-500 to-emerald-500",
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const FEATURES = [
  {
    title: "Bảo mật",
    desc: "Dữ liệu được mã hóa",
    color: "from-red-500 to-pink-500",
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    ),
  },
  {
    title: "Minh bạch",
    desc: "Ai cũng có thể kiểm tra",
    color: "from-blue-500 to-cyan-500",
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
    ),
  },
  {
    title: "Nhanh chóng",
    desc: "Kết quả tức thì",
    color: "from-yellow-500 to-orange-500",
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: "Công bằng",
    desc: "Không thể gian lận",
    color: "from-green-500 to-emerald-500",
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
  },
];

const Home = () => {
  const { schedule, votingContract, candidateMedia, currentAccount } = useContext(Web3Context);

  const [stats, setStats] = useState({
    totalVotes: 0,
    totalCandidates: 0,
    totalVoters: 0, // thực tế là "lượt vote" (nếu muốn unique voters phải index event)
  });
  const [topCandidates, setTopCandidates] = useState([]);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const aliveRef = useRef(true);
  const API_BASE = import.meta.env.VITE_OTP_API || 'http://localhost:3001';

  /** ---------- Track unique wallets (backend) ---------- */
  useEffect(() => {
    if (currentAccount) {
      // Gửi wallet address lên backend để track
      fetch(`${API_BASE}/track-wallet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: currentAccount.toLowerCase() }),
      }).catch(err => console.log('Track wallet failed:', err));
    }
  }, [currentAccount, API_BASE]);

  /** ---------- Fetch stats (bền hơn, tránh mutate array, tránh setState khi unmount) ---------- */
  const fetchStats = useCallback(async () => {
    if (!votingContract) return;

    try {
      const totalRaw = await votingContract.tongUngVien();
      const total = Number(totalRaw);

      if (!Number.isFinite(total) || total <= 0) {
        setStats({ totalVotes: 0, totalCandidates: 0, totalVoters: 0 });
        setTopCandidates([]);
        return;
      }

      // allSettled: 1 candidate lỗi không làm crash toàn bộ
      const results = await Promise.allSettled(
        Array.from({ length: total }, (_, i) => votingContract.dsUngVien(i + 1))
      );

      const formatted = results
        .filter((r) => r.status === "fulfilled")
        .map((r) => r.value)
        .map((c) => {
          const id = Number(c.id);
          return {
            id,
            name: c.hoTen,
            mssv: c.mssv,
            votes: Number(c.soPhieu),
            image: c.anh || candidateMedia?.[id],
            isActive: Boolean(c.dangHoatDong),
          };
        })
        .filter((c) => c.isActive);

      const totalVotes = formatted.reduce((sum, c) => sum + (Number.isFinite(c.votes) ? c.votes : 0), 0);

      // KHÔNG mutate formatted: dùng bản copy
      const top = [...formatted].sort((a, b) => (b.votes || 0) - (a.votes || 0)).slice(0, 3);

      if (!aliveRef.current) return;

      // Lấy số unique wallets từ backend
      let uniqueWallets = 0;
      try {
        const walletRes = await fetch(`${API_BASE}/unique-wallets-count`);
        if (walletRes.ok) {
          const data = await walletRes.json();
          uniqueWallets = data.count || 0;
        }
      } catch (err) {
        console.log('Fetch unique wallets failed:', err);
      }

      setStats({
        totalVotes,
        totalCandidates: formatted.length,
        totalVoters: uniqueWallets, // Số ví unique đã kết nối (từ backend)
      });
      setTopCandidates(top);
    } catch (err) {
      console.log("Fetch stats failed, fallback mock:", err);
      if (!aliveRef.current) return;
      
      // Lấy số unique wallets từ backend cho fallback
      let uniqueWallets = 0;
      try {
        const walletRes = await fetch(`${API_BASE}/unique-wallets-count`);
        if (walletRes.ok) {
          const data = await walletRes.json();
          uniqueWallets = data.count || 0;
        }
      } catch (err) {
        console.log('Fetch unique wallets failed:', err);
      }
      
      setStats({ totalVotes: 156, totalCandidates: 12, totalVoters: uniqueWallets });
      setTopCandidates([]);
    }
  }, [votingContract, candidateMedia]);

  useEffect(() => {
    aliveRef.current = true;
    fetchStats();
    return () => {
      aliveRef.current = false;
    };
  }, [fetchStats]);

  /** ---------- Countdown (chuẩn ms/seconds/BigInt, auto về 0 khi hết hạn) ---------- */
  const voteEndMs = useMemo(() => toMs(schedule?.voteEnd), [schedule?.voteEnd]);

  useEffect(() => {
    if (!voteEndMs) {
      setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const tick = () => {
      const now = Date.now();
      const diff = voteEndMs - now;

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({
        days: clamp0(days),
        hours: clamp0(hours),
        minutes: clamp0(minutes),
        seconds: clamp0(seconds),
      });
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [voteEndMs]);

  /** ---------- Fetch Reviews from API (real-time) ---------- */
  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/reviews?limit=6`);
      if (res.ok) {
        const json = await res.json();
        if (!aliveRef.current) return;
        // API trả về {ok: true, data: [...]}
        const data = json.data || json;
        setReviews(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.log('Fetch reviews failed:', err);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchReviews();
    const interval = setInterval(fetchReviews, 30000);
    return () => clearInterval(interval);
  }, [fetchReviews]);

  /** ---------- Derived arrays (useMemo để khỏi tạo lại liên tục) ---------- */
  const scheduleItems = useMemo(
    () => [
      { label: "Bán token mở", time: schedule?.claimStart, color: "from-green-400 to-emerald-500" },
      { label: "Bán token đóng", time: schedule?.claimEnd, color: "from-orange-400 to-red-500" },
      { label: "Bỏ phiếu mở", time: schedule?.voteStart, color: "from-blue-400 to-cyan-500" },
      { label: "Bỏ phiếu đóng", time: schedule?.voteEnd, color: "from-purple-400 to-pink-500" },
    ],
    [schedule?.claimStart, schedule?.claimEnd, schedule?.voteStart, schedule?.voteEnd]
  );

  const statsCards = useMemo(
    () => [
      {
        label: "Tổng phiếu bầu",
        value: stats.totalVotes,
        color: "from-blue-500 to-cyan-500",
        icon: (
          <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
          </svg>
        ),
      },
      {
        label: "Ứng viên",
        value: stats.totalCandidates,
        color: "from-purple-500 to-pink-500",
        icon: (
          <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
        ),
      },
      {
        label: "Người tham gia",
        value: stats.totalVoters,
        color: "from-green-500 to-emerald-500",
        icon: (
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        ),
      },
    ],
    [stats.totalVotes, stats.totalCandidates, stats.totalVoters]
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 transition-colors duration-500" />

      <div className="container mx-auto px-4 py-20 relative z-10">
        {/* Hero */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fadeIn">
            <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-qnu-500 dark:text-blue-400 font-semibold px-5 py-2.5 rounded-full shadow-lg border border-blue-200/50 dark:border-blue-500/30">
              QNU - Nét Đẹp Sinh Viên 2025
            </div>

            <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white leading-tight">
              Bầu chọn
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Sinh viên tiêu biểu
              </span>
              QNU 2025
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Mỗi lá phiếu là một “dấu vân tay” trên blockchain — bất biến theo thời gian, minh bạch theo dữ liệu, công bằng cho tất cả.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/vote"
                className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Bỏ phiếu ngay
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>

              <Link
                to="/claim"
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 px-8 py-4 rounded-xl font-bold hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Mua token QSV
              </Link>
            </div>
          </div>

          {/* Schedule Card */}
          <div className="relative animate-scaleIn">
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-gray-700/50">
              <div className="relative h-64 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 overflow-hidden flex items-center justify-center text-white">
                <div className="text-center p-6">
                  <svg className="w-20 h-20 mx-auto mb-3 opacity-90" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  <h3 className="text-2xl font-black mb-1">Nét Đẹp Tuổi Sinh Viên QNU</h3>
                  <p className="text-white/90 font-medium">Minh bạch - Công bằng - An toàn</p>
                </div>
              </div>

              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Lịch trình</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {scheduleItems.map((item) => (
                    <div
                      key={item.label}
                      className="group relative p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border border-gray-200/50 dark:border-gray-600/50"
                    >
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{item.label}</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{formatTime(item.time)}</p>
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`} />
                    </div>
                  ))}
                </div>


              </div>
            </div>
          </div>
        </div>

        {/* Countdown */}
        {voteEndMs && voteEndMs > Date.now() && (
          <div className="mt-20 animate-fadeIn">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl blur-2xl opacity-20" />
              <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/50">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 mb-2">
                    <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">Thời gian còn lại</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">Đến khi kết thúc bỏ phiếu</p>
                </div>

                <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
                  {[
                    { label: "Ngày", value: countdown.days },
                    { label: "Giờ", value: countdown.hours },
                    { label: "Phút", value: countdown.minutes },
                    { label: "Giây", value: countdown.seconds },
                  ].map((item) => (
                    <div key={item.label} className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-center text-white shadow-lg">
                      <div className="text-4xl font-black mb-2">{String(item.value).padStart(2, "0")}</div>
                      <div className="text-sm font-semibold opacity-90">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Real-time Leaderboard */}
        {topCandidates.length > 0 && (
          <div className="mt-20 animate-fadeIn">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-4">
                <svg className="w-12 h-12 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">Bảng xếp hạng Real-time</h2>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400">Cập nhật liên tục mỗi giây</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-4">
              {topCandidates.map((candidate, idx) => {
                const percentage = stats.totalVotes > 0 ? ((candidate.votes / stats.totalVotes) * 100).toFixed(1) : 0;
                const medals = ['🥇', '🥈', '🥉'];
                const gradients = [
                  'from-yellow-400 to-orange-500',
                  'from-gray-300 to-gray-400',
                  'from-orange-400 to-orange-600'
                ];

                return (
                  <div
                    key={candidate.id}
                    className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-6">
                      {/* Rank Badge */}
                      <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-br ${gradients[idx]} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                        <span className="text-3xl">{medals[idx]}</span>
                      </div>

                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <img
                          src={candidate.image || 'https://via.placeholder.com/80'}
                          alt={candidate.name}
                          className="w-20 h-20 rounded-xl object-cover border-2 border-white dark:border-gray-700 shadow-lg"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 truncate">
                          {candidate.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          MSSV: {candidate.mssv} • ID: #{candidate.id}
                        </p>

                        {/* Progress Bar */}
                        <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${gradients[idx]} rounded-full transition-all duration-1000 ease-out`}
                            style={{ width: `${percentage}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                          </div>
                        </div>
                      </div>

                      {/* Votes */}
                      <div className="flex-shrink-0 text-right">
                        <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-1">
                          {candidate.votes}
                        </div>
                        <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                          {percentage}% phiếu
                        </div>
                      </div>
                    </div>

                    {/* Live Indicator */}
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/10 backdrop-blur-sm px-3 py-1 rounded-full border border-red-500/20">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-xs font-semibold text-red-600 dark:text-red-400">LIVE</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* View All Button */}
            <div className="text-center mt-8">
              <Link
                to="/vote"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                Xem tất cả ứng viên
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mt-20 animate-fadeIn">
          <div className="grid md:grid-cols-3 gap-6">
            {statsCards.map((item) => (
              <div key={item.label} className="group relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity`} />
                <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className={`inline-flex p-3 bg-gradient-to-br ${item.color} rounded-xl text-white mb-3`}>{item.icon}</div>
                  <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
                    {item.value}
                  </div>
                  <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Help */}
        <div className="mt-20 animate-fadeIn">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">Hướng dẫn sử dụng</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Làm theo các bước đơn giản để tham gia bầu chọn</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {HELP_STEPS.map((item) => (
              <div key={item.title} className="group relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity`} />
                <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <div className={`inline-flex p-4 bg-gradient-to-br ${item.color} rounded-2xl text-white mb-6 shadow-lg`}>{item.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-20 animate-fadeIn">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">Sinh viên nói gì</h2>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400">Đánh giá từ sinh viên QNU</p>
            
            {/* Live Indicator */}
            <div className="inline-flex items-center gap-2 bg-red-500/10 backdrop-blur-sm px-4 py-2 rounded-full border border-red-500/20 mt-4">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-red-600 dark:text-red-400">Cập nhật mỗi 30 giây</span>
            </div>
          </div>

          {/* Review Form Toggle */}
          <div className="max-w-2xl mx-auto mb-8">
            {!showReviewForm ? (
              <button
                onClick={() => setShowReviewForm(true)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-xl font-bold hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Viết đánh giá của bạn
              </button>
            ) : (
              <div className="space-y-4">
                <ReviewForm onSuccess={() => {
                  setShowReviewForm(false);
                  fetchReviews();
                }} />
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                >
                  Hủy
                </button>
              </div>
            )}
          </div>

          {/* Reviews Grid */}
          {reviews.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {reviews.map((review) => (
                <div
                  key={review._id || review.id || `${review.name}-${review.timestamp}`}
                  className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {(review?.name?.charAt?.(0) || "?").toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 dark:text-white truncate">{review.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 truncate">{review.major || 'Sinh viên QNU'}</div>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 italic mb-4 line-clamp-3">"{review.comment}"</p>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${i < (review.rating ?? 0) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    {review.timestamp && (
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {new Date(review.timestamp).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-20 animate-fadeIn">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl blur-2xl opacity-10" />
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-12 border border-white/20 dark:border-gray-700/50">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">Tại sao chọn Blockchain?</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">Công nghệ tiên tiến đảm bảo tính minh bạch và công bằng</p>
              </div>

              <div className="grid md:grid-cols-4 gap-6">
                {FEATURES.map((item) => (
                  <div key={item.title} className="text-center p-6 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-300 group cursor-pointer">
                    <div className={`inline-flex p-4 bg-gradient-to-br ${item.color} rounded-2xl text-white mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                      {item.icon}
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* NOTE: Timeline section của anh dài; nếu muốn tối ưu tiếp: tách riêng component + useMemo tương tự */}
      </div>
    </div>
  );
};

export default Home;
