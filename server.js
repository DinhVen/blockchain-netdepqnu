import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { v4 as uuid } from 'uuid';
import mongoose from 'mongoose';

const app = express();
app.use(cors());
app.use(express.json());

// ==================== RATE LIMITING ====================
const rateLimitStore = new Map(); // IP -> { count, resetTime }

const rateLimit = (options = {}) => {
  const { windowMs = 60000, max = 100, message = 'Quá nhiều request, vui lòng thử lại sau' } = options;
  
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!rateLimitStore.has(ip)) {
      rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const record = rateLimitStore.get(ip);
    
    // Reset nếu đã qua window
    if (now > record.resetTime) {
      rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    // Tăng count
    record.count++;
    
    if (record.count > max) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.set('Retry-After', retryAfter);
      return res.status(429).json({ error: message, retryAfter });
    }
    
    next();
  };
};

// Cleanup rate limit store mỗi 5 phút
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// Rate limit configs
const otpLimiter = rateLimit({ windowMs: 60000, max: 3, message: 'Gửi OTP quá nhiều, đợi 1 phút' });
const apiLimiter = rateLimit({ windowMs: 60000, max: 60, message: 'Quá nhiều request, đợi 1 phút' });
const registrationLimiter = rateLimit({ windowMs: 60000, max: 5, message: 'Đăng ký quá nhiều, đợi 1 phút' });

// Apply global rate limit
app.use(apiLimiter);

// Email providers
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const fromAddress = process.env.RESEND_FROM || process.env.EMAIL_USER;

const smtpTransporter =
  process.env.EMAIL_USER && process.env.EMAIL_PASS
    ? nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      })
    : null;

// Mongo connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/qnu_voting';
mongoose
  .connect(MONGO_URI, { dbName: process.env.MONGO_DB || undefined })
  .then(() => console.log('Mongo connected'))
  .catch((e) => {
    console.error('Mongo connection error', e);
    process.exit(1);
  });

// Schemas
const OtpSchema = new mongoose.Schema(
  {
    email: { type: String, index: true, unique: true },
    code: String,
    exp: Number,
  },
  { timestamps: true }
);

const TokenSchema = new mongoose.Schema(
  {
    token: { type: String, index: true, unique: true },
    email: String,
    exp: Number,
  },
  { timestamps: true }
);

const BindingSchema = new mongoose.Schema(
  {
    email: { type: String, index: true, unique: true },
    wallet: String,
  },
  { timestamps: true }
);

const ConflictSchema = new mongoose.Schema(
  {
    email: String,
    walletTried: String,
    walletBound: String,
  },
  { timestamps: true }
);

const CandidateSchema = new mongoose.Schema(
  {
    name: String,
    mssv: { type: String, index: true },
    major: String,
    dob: String, // Ngày sinh
    phone: String, // Số điện thoại
    image: String,
    bio: String,
    email: String,
    wallet: String,
    txHash: String,
    contractId: Number,
    status: { type: String, default: 'pending' }, // pending | approved | rejected
    source: { type: String, default: 'self-nomination' }, // self-nomination | admin-add | csv-import
    rejectReason: String,
  },
  { timestamps: true }
);

// Registration Schema (off-chain đăng ký ứng viên)
const RegistrationSchema = new mongoose.Schema(
  {
    wallet: { type: String, index: true, required: true },
    email: { type: String, index: true },
    name: { type: String, required: true },
    mssv: { type: String, index: true, required: true },
    major: { type: String, required: true },
    dob: String,
    phone: String,
    image: String,
    bio: String,
    status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
    rejectReason: String,
    contractId: Number, // ID trên blockchain sau khi admin approve
    txHash: String, // Transaction hash khi admin thêm vào blockchain
    source: { type: String, default: 'self-registration', enum: ['self-registration', 'csv-import'] },
  },
  { timestamps: true }
);

// Nonce Schema (for wallet signature verification)
const NonceSchema = new mongoose.Schema(
  {
    wallet: { type: String, index: true, unique: true },
    nonce: String,
    exp: Number,
  },
  { timestamps: true }
);

const ReviewSchema = new mongoose.Schema(
  {
    name: String,
    major: String,
    rating: Number,
    comment: String,
    wallet: String,
    date: String,
  },
  { timestamps: true }
);

const UniqueWalletSchema = new mongoose.Schema(
  {
    wallet: { type: String, index: true, unique: true },
  },
  { timestamps: true }
);

const VoteHistorySchema = new mongoose.Schema(
  {
    candidateId: { type: Number, index: true },
    name: String,
    mssv: String,
    wallet: { type: String, index: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const OtpModel = mongoose.model('otp_codes', OtpSchema);
const TokenModel = mongoose.model('otp_tokens', TokenSchema);
const BindingModel = mongoose.model('bindings', BindingSchema);
const ConflictModel = mongoose.model('conflicts', ConflictSchema);
const CandidateModel = mongoose.model('candidates', CandidateSchema);
const RegistrationModel = mongoose.model('registrations', RegistrationSchema);
const NonceModel = mongoose.model('nonces', NonceSchema);
const ReviewModel = mongoose.model('reviews', ReviewSchema);
const UniqueWalletModel = mongoose.model('unique_wallets', UniqueWalletSchema);
const VoteHistoryModel = mongoose.model('vote_history', VoteHistorySchema);

const sendOtpEmail = async (email, code) => {
  const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f4f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f4f8; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.15);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center;">
              <img src="https://voting-two-kohl.vercel.app/assets/logocntt.jpg" alt="Logo CNTT" style="width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: block; border: 3px solid rgba(255,255,255,0.3);" />
              <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 8px; font-weight: 700;">QNU StarVote</h1>
              <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 0;">Nét Đẹp Sinh Viên 2026</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="background: #ffffff; padding: 40px; border-radius: 20px 20px 0 0;">
              <h2 style="color: #1e3a8a; font-size: 20px; margin: 0 0 16px; text-align: center;">Xác thực tài khoản</h2>
              <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 30px; text-align: center;">
                Sử dụng mã OTP bên dưới để hoàn tất xác thực sinh viên Trường Đại học Quy Nhơn.
              </p>
              
              <!-- OTP Code -->
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px dashed #3b82f6; border-radius: 16px; padding: 30px; text-align: center; margin-bottom: 30px;">
                <p style="color: #64748b; font-size: 12px; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 2px;">Mã xác thực của bạn</p>
                <div style="font-size: 40px; font-weight: 800; color: #1e3a8a; letter-spacing: 8px; font-family: 'Courier New', monospace;">${code}</div>
              </div>
              
              <!-- Warning -->
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <p style="color: #92400e; font-size: 13px; margin: 0; line-height: 1.5;">
                  <strong>Lưu ý:</strong> Mã OTP có hiệu lực trong <strong>5 phút</strong>. Tuyệt đối không chia sẻ mã này cho bất kỳ ai, kể cả ban tổ chức.
                </p>
              </div>
              
              <!-- Info -->
              <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
                Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0 0 8px;">
                © 2026 QNU StarVote - Trường Đại học Quy Nhơn
              </p>
              <p style="color: #cbd5e1; font-size: 11px; margin: 0;">
                Email này được gửi tự động, vui lòng không trả lời.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  if (resend && fromAddress) {
    await resend.emails.send({
      from: `QNU StarVote <${fromAddress}>`,
      to: email,
      subject: 'Mã OTP xác thực - QNU StarVote',
      html: htmlTemplate,
      text: `Mã OTP của bạn: ${code}. Tuyệt đối không chia sẻ cho ai khác. Mã hết hạn trong 5 phút.`,
    });
    return;
  }

  if (smtpTransporter) {
    await smtpTransporter.sendMail({
      from: `"QNU StarVote" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Mã OTP xác thực - QNU StarVote',
      html: htmlTemplate,
      text: `Mã OTP của bạn: ${code}. Tuyệt đối không chia sẻ cho ai khác. Mã hết hạn trong 5 phút.`,
    });
    return;
  }

  throw new Error('Email server chua cau hinh (RESEND_API_KEY/RESEND_FROM hoac EMAIL_USER/EMAIL_PASS).');
};

app.post('/otp/send', otpLimiter, async (req, res) => {
  try {
    const { email } = req.body || {};
    const trimmedEmail = (email || '').trim().toLowerCase();
    if (!trimmedEmail || !/@st\.qnu\.edu\.vn$/i.test(trimmedEmail)) {
      return res.status(400).json({ error: 'Email phai la mail sinh vien Truong Dai hoc Quy Nhon (@st.qnu.edu.vn)' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const exp = Date.now() + 5 * 60 * 1000;
    await OtpModel.findOneAndUpdate({ email: trimmedEmail }, { code, exp }, { upsert: true, new: true });

    await sendOtpEmail(trimmedEmail, code);

    res.json({ ok: true });
  } catch (err) {
    console.error('send otp error', err);
    res.status(500).json({ error: err.message || 'Khong gui duoc OTP. Kiem tra email server.' });
  }
});

app.post('/otp/verify', async (req, res) => {
  const { email, code } = req.body || {};
  const normalizedEmail = (email || '').trim().toLowerCase();
  try {
    const item = await OtpModel.findOne({ email: normalizedEmail });
    if (!item || item.code !== code || Date.now() > Number(item.exp)) {
      return res.status(400).json({ error: 'OTP sai hoac het han' });
    }
    await OtpModel.deleteOne({ email: normalizedEmail });

    const token = uuid();
    const exp = Date.now() + 60 * 60 * 1000; // token valid 1h
    await TokenModel.create({ token, email: normalizedEmail, exp });
    res.json({ ok: true, token });
  } catch (err) {
    console.error('verify otp error', err);
    res.status(500).json({ error: 'Loi he thong' });
  }
});

// Bind email to wallet (detect reuse)
app.post('/wallet/bind', async (req, res) => {
  const { email, wallet } = req.body || {};
  const normalizedEmail = (email || '').trim().toLowerCase();
  const normalizedWallet = (wallet || '').trim().toLowerCase();

  if (!normalizedEmail || !normalizedWallet) {
    return res.status(400).json({ error: 'Thieu email/wallet' });
  }

  try {
    // Check if email already bound to another wallet
    const existing = await BindingModel.findOne({ email: normalizedEmail });
    if (existing && existing.wallet !== normalizedWallet) {
      // Log conflict for admin review
      await ConflictModel.create({
        email: normalizedEmail,
        walletTried: normalizedWallet,
        walletBound: existing.wallet,
      });
      return res.status(409).json({ 
        error: `Email đã được gắn với ví khác!`,
        boundWallet: existing.wallet 
      });
    }

    // Check if wallet already bound to another email
    const walletBound = await BindingModel.findOne({ wallet: normalizedWallet });
    if (walletBound && walletBound.email !== normalizedEmail) {
      await ConflictModel.create({
        email: normalizedEmail,
        walletTried: normalizedWallet,
        walletBound: walletBound.email,
      });
      return res.status(409).json({ 
        error: `Ví này đã được gắn với email khác!`,
        boundEmail: walletBound.email 
      });
    }

    // Bind email to wallet (only if not already bound)
    if (!existing) {
      await BindingModel.create({ email: normalizedEmail, wallet: normalizedWallet });
    }

    res.json({ ok: true, wallet: normalizedWallet });
  } catch (err) {
    console.error('bind wallet error', err);
    res.status(500).json({ error: 'Loi he thong' });
  }
});

// Admin view conflicts (guard by API key)
app.get('/admin/conflicts', async (req, res) => {
  const apiKey = process.env.ADMIN_API_KEY;
  if (!apiKey || req.headers['x-api-key'] !== apiKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const data = await ConflictModel.find().sort({ createdAt: -1 }).limit(100).lean();
    res.json({ ok: true, data });
  } catch (err) {
    console.error('fetch conflicts error', err);
    res.status(500).json({ error: 'Loi he thong' });
  }
});

// Public endpoint for conflicts (for admin frontend)
app.get('/conflicts', async (req, res) => {
  try {
    const data = await ConflictModel.find().sort({ createdAt: -1 }).limit(100).lean();
    res.json({ ok: true, data });
  } catch (err) {
    console.error('fetch conflicts error', err);
    res.status(500).json({ error: 'Loi he thong' });
  }
});

// Store candidate info in DB (for audit/off-chain lookup)
app.post('/candidates', async (req, res) => {
  const { name, mssv, major, dob, phone, image, bio, email, wallet, txHash, source, status } = req.body || {};
  if (!name || !mssv || !major) {
    return res.status(400).json({ error: 'Thieu truong bat buoc (name/mssv/major)' });
  }
  try {
    const doc = await CandidateModel.findOneAndUpdate(
      { mssv },
      {
        name,
        mssv,
        major,
        dob: dob || '',
        phone: phone || '',
        image: image || '',
        bio: bio || '',
        email: email || '',
        wallet: wallet || '',
        txHash: txHash || '',
        status: status || 'pending',
        source: source || 'self-nomination',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ ok: true, id: doc._id });
  } catch (err) {
    console.error('save candidate error', err);
    res.status(500).json({ error: 'Loi he thong' });
  }
});

// Admin list candidates stored off-chain
app.get('/candidates', async (req, res) => {
  const apiKey = process.env.ADMIN_API_KEY;
  if (!apiKey || req.headers['x-api-key'] !== apiKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const data = await CandidateModel.find().sort({ createdAt: -1 }).limit(200).lean();
    res.json({ ok: true, data });
  } catch (err) {
    console.error('list candidates error', err);
    res.status(500).json({ error: 'Loi he thong' });
  }
});

// Admin update status/contractId
app.patch('/candidates/:id', async (req, res) => {
  const apiKey = process.env.ADMIN_API_KEY;
  if (!apiKey || req.headers['x-api-key'] !== apiKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { id } = req.params;
  const { status, contractId } = req.body || {};
  try {
    const doc = await CandidateModel.findByIdAndUpdate(
      id,
      { ...(status ? { status } : {}), ...(contractId ? { contractId } : {}) },
      { new: true }
    );
    res.json({ ok: true, data: doc });
  } catch (err) {
    console.error('update candidate error', err);
    res.status(500).json({ error: 'Loi he thong' });
  }
});

// Reviews
app.get('/reviews', async (_req, res) => {
  try {
    const data = await ReviewModel.find().sort({ createdAt: -1 }).limit(100).lean();
    res.json({ ok: true, data });
  } catch (err) {
    console.error('list reviews error', err);
    res.status(500).json({ error: 'Loi he thong' });
  }
});

app.post('/reviews', async (req, res) => {
  const { name, major, rating, comment, wallet } = req.body || {};
  if (!name || !major || !rating || !comment) {
    return res.status(400).json({ error: 'Thieu truong bat buoc' });
  }
  try {
    const doc = await ReviewModel.create({
      name,
      major,
      rating: Number(rating),
      comment,
      wallet: wallet || '',
      date: new Date().toLocaleDateString('vi-VN'),
    });
    res.json({ ok: true, data: doc });
  } catch (err) {
    console.error('create review error', err);
    res.status(500).json({ error: 'Loi he thong' });
  }
});

// Track unique wallet
app.post('/track-wallet', async (req, res) => {
  const { wallet } = req.body;
  if (!wallet) {
    return res.status(400).json({ error: 'Missing wallet' });
  }

  try {
    // Upsert: nếu wallet đã tồn tại thì không làm gì, nếu chưa thì tạo mới
    await UniqueWalletModel.findOneAndUpdate(
      { wallet: wallet.toLowerCase() },
      { wallet: wallet.toLowerCase() },
      { upsert: true, new: true }
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('track wallet error', err);
    res.status(500).json({ error: 'Loi he thong' });
  }
});

// Get unique wallets count
app.get('/unique-wallets-count', async (req, res) => {
  try {
    const count = await UniqueWalletModel.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error('get unique wallets count error', err);
    res.status(500).json({ error: 'Loi he thong' });
  }
});

// Save vote history
app.post('/vote/history', async (req, res) => {
  const { candidateId, name, mssv, wallet } = req.body;
  
  if (!candidateId || !wallet) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const doc = await VoteHistoryModel.create({
      candidateId: Number(candidateId),
      name: name || '',
      mssv: mssv || '',
      wallet: wallet.toLowerCase(),
      timestamp: new Date(),
    });
    res.json({ ok: true, data: doc });
  } catch (err) {
    console.error('save vote history error', err);
    res.status(500).json({ error: 'Loi he thong' });
  }
});

// Get vote history by candidateId
app.get('/vote/history', async (req, res) => {
  const { candidateId } = req.query;
  
  if (!candidateId) {
    return res.status(400).json({ error: 'Missing candidateId' });
  }

  try {
    const history = await VoteHistoryModel.find({ 
      candidateId: Number(candidateId) 
    }).sort({ timestamp: -1 });
    
    res.json({ ok: true, data: history });
  } catch (err) {
    console.error('get vote history error', err);
    res.status(500).json({ error: 'Loi he thong' });
  }
});

// ============================================
// AUTH ENDPOINTS (Wallet Signature Verification)
// ============================================

// Get nonce for wallet signature
app.get('/auth/nonce', async (req, res) => {
  const { wallet } = req.query;
  const normalizedWallet = (wallet || '').trim().toLowerCase();
  
  if (!normalizedWallet) {
    return res.status(400).json({ error: 'Missing wallet address' });
  }

  try {
    const nonce = `QNU_StarVote_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const exp = Date.now() + 5 * 60 * 1000; // 5 minutes
    
    await NonceModel.findOneAndUpdate(
      { wallet: normalizedWallet },
      { nonce, exp },
      { upsert: true, new: true }
    );
    
    res.json({ ok: true, nonce, message: `Sign this message to verify your wallet: ${nonce}` });
  } catch (err) {
    console.error('get nonce error', err);
    res.status(500).json({ error: 'Loi he thong' });
  }
});

// Verify wallet signature (simplified - just check nonce exists and not expired)
app.post('/auth/verify', async (req, res) => {
  const { wallet, signature, nonce } = req.body || {};
  const normalizedWallet = (wallet || '').trim().toLowerCase();
  
  if (!normalizedWallet || !signature || !nonce) {
    return res.status(400).json({ error: 'Missing wallet/signature/nonce' });
  }

  try {
    const nonceDoc = await NonceModel.findOne({ wallet: normalizedWallet });
    
    if (!nonceDoc || nonceDoc.nonce !== nonce || Date.now() > Number(nonceDoc.exp)) {
      return res.status(400).json({ error: 'Nonce không hợp lệ hoặc đã hết hạn' });
    }
    
    // Delete used nonce
    await NonceModel.deleteOne({ wallet: normalizedWallet });
    
    // Generate simple token (in production, use JWT)
    const token = `${normalizedWallet}_${Date.now()}_${uuid()}`;
    const exp = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    
    await TokenModel.findOneAndUpdate(
      { email: normalizedWallet }, // reuse TokenModel with wallet as key
      { token, email: normalizedWallet, exp },
      { upsert: true, new: true }
    );
    
    res.json({ ok: true, token });
  } catch (err) {
    console.error('verify signature error', err);
    res.status(500).json({ error: 'Loi he thong' });
  }
});

// ============================================
// REGISTRATION ENDPOINTS (Off-chain)
// ============================================

// Create registration (user self-register)
app.post('/registrations', registrationLimiter, async (req, res) => {
  const { wallet, email, name, mssv, major, dob, phone, image, bio } = req.body || {};
  const normalizedWallet = (wallet || '').trim().toLowerCase();
  
  if (!normalizedWallet || !name || !mssv || !major) {
    return res.status(400).json({ error: 'Thiếu trường bắt buộc (wallet/name/mssv/major)' });
  }

  try {
    // Check if wallet already has a registration
    const existingWallet = await RegistrationModel.findOne({ wallet: normalizedWallet });
    if (existingWallet) {
      return res.status(409).json({ 
        error: 'Ví này đã đăng ký ứng viên rồi',
        registration: existingWallet
      });
    }

    // Check if MSSV already registered
    const existingMssv = await RegistrationModel.findOne({ mssv });
    if (existingMssv) {
      return res.status(409).json({ error: 'MSSV này đã được đăng ký' });
    }

    const doc = await RegistrationModel.create({
      wallet: normalizedWallet,
      email: email || '',
      name,
      mssv,
      major,
      dob: dob || '',
      phone: phone || '',
      image: image || '',
      bio: bio || '',
      status: 'pending',
      source: 'self-registration',
    });

    res.json({ ok: true, data: doc });
  } catch (err) {
    console.error('create registration error', err);
    res.status(500).json({ error: 'Loi he thong' });
  }
});

// Get registration status by wallet
app.get('/registrations/status', async (req, res) => {
  const { wallet } = req.query;
  const normalizedWallet = (wallet || '').trim().toLowerCase();
  
  if (!normalizedWallet) {
    return res.status(400).json({ error: 'Missing wallet' });
  }

  try {
    const registration = await RegistrationModel.findOne({ wallet: normalizedWallet });
    
    if (!registration) {
      return res.json({ ok: true, registered: false });
    }

    res.json({ 
      ok: true, 
      registered: true,
      data: {
        id: registration._id,
        name: registration.name,
        mssv: registration.mssv,
        major: registration.major,
        image: registration.image,
        status: registration.status,
        rejectReason: registration.rejectReason,
        contractId: registration.contractId,
        createdAt: registration.createdAt,
      }
    });
  } catch (err) {
    console.error('get registration status error', err);
    res.status(500).json({ error: 'Loi he thong' });
  }
});

// Admin: List all registrations
app.get('/admin/registrations', async (req, res) => {
  const apiKey = process.env.ADMIN_API_KEY;
  if (apiKey && req.headers['x-api-key'] !== apiKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { status } = req.query;
  
  try {
    const query = status ? { status } : {};
    const data = await RegistrationModel.find(query).sort({ createdAt: -1 }).limit(200).lean();
    res.json({ ok: true, data });
  } catch (err) {
    console.error('list registrations error', err);
    res.status(500).json({ error: 'Loi he thong' });
  }
});

// Public: List pending registrations (for admin frontend without API key)
app.get('/registrations', async (req, res) => {
  const { status } = req.query;
  
  try {
    const query = status ? { status } : {};
    const data = await RegistrationModel.find(query).sort({ createdAt: -1 }).limit(200).lean();
    res.json({ ok: true, data });
  } catch (err) {
    console.error('list registrations error', err);
    res.status(500).json({ error: 'Loi he thong' });
  }
});

// Admin: Approve registration (after adding to blockchain)
app.patch('/registrations/:id/approve', async (req, res) => {
  const { id } = req.params;
  const { contractId, txHash } = req.body || {};
  
  try {
    const doc = await RegistrationModel.findByIdAndUpdate(
      id,
      { 
        status: 'approved',
        contractId: contractId || null,
        txHash: txHash || '',
      },
      { new: true }
    );
    
    if (!doc) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    res.json({ ok: true, data: doc });
  } catch (err) {
    console.error('approve registration error', err);
    res.status(500).json({ error: 'Loi he thong' });
  }
});

// Admin: Reject registration
app.patch('/registrations/:id/reject', async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body || {};
  
  try {
    const doc = await RegistrationModel.findByIdAndUpdate(
      id,
      { 
        status: 'rejected',
        rejectReason: reason || 'Không đạt yêu cầu',
      },
      { new: true }
    );
    
    if (!doc) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    res.json({ ok: true, data: doc });
  } catch (err) {
    console.error('reject registration error', err);
    res.status(500).json({ error: 'Loi he thong' });
  }
});

// Admin: Import registrations from CSV
app.post('/registrations/import', async (req, res) => {
  const { rows } = req.body || {};
  
  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: 'No data to import' });
  }

  try {
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const row of rows) {
      try {
        // Check duplicate MSSV
        const existing = await RegistrationModel.findOne({ mssv: row.mssv });
        if (existing) {
          errors.push({ mssv: row.mssv, error: 'MSSV đã tồn tại' });
          errorCount++;
          continue;
        }

        await RegistrationModel.create({
          wallet: (row.wallet || '').toLowerCase() || `import_${row.mssv}`,
          email: row.email || '',
          name: row.hoTen || row.name,
          mssv: row.mssv,
          major: row.nganh || row.major,
          dob: row.ngaySinh || row.dob || '',
          phone: row.sdt || row.phone || '',
          image: row.anh || row.image || '',
          bio: row.moTa || row.bio || '',
          status: 'pending',
          source: 'csv-import',
        });
        successCount++;
      } catch (e) {
        errors.push({ mssv: row.mssv, error: e.message });
        errorCount++;
      }
    }

    res.json({ ok: true, successCount, errorCount, errors });
  } catch (err) {
    console.error('import registrations error', err);
    res.status(500).json({ error: 'Loi he thong' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`OTP server listening on port ${PORT}`);
});
