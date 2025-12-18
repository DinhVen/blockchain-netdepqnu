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
    image: String,
    bio: String,
    email: String,
    wallet: String,
    txHash: String,
    contractId: Number,
    status: { type: String, default: 'pending' }, // pending | approved | rejected
    source: { type: String, default: 'self-nomination' },
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
const ReviewModel = mongoose.model('reviews', ReviewSchema);
const UniqueWalletModel = mongoose.model('unique_wallets', UniqueWalletSchema);
const VoteHistoryModel = mongoose.model('vote_history', VoteHistorySchema);

const sendOtpEmail = async (email, code) => {
  if (resend && fromAddress) {
    await resend.emails.send({
      from: `QNU Voting <${fromAddress}>`,
      to: email,
      subject: 'Ma OTP dang nhap QNU - Xac thuc sinh vien',
      text: `Ma OTP cua ban: ${code}. Tuyet doi khong chia se cho ai khac. Ma het han trong 5 phut.`,
    });
    return;
  }

  if (smtpTransporter) {
    await smtpTransporter.sendMail({
      from: `"QNU Voting" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Ma OTP dang nhap QNU - Net Dep Sinh Vien',
      text: `Ma OTP cua ban: ${code} tuyet doi khong duoc chia se cho ai khac ke ca ban to chuc (Ma se het han trong vong 5 phut)`,
    });
    return;
  }

  throw new Error('Email server chua cau hinh (RESEND_API_KEY/RESEND_FROM hoac EMAIL_USER/EMAIL_PASS).');
};

app.post('/otp/send', async (req, res) => {
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
  const { email, token, wallet } = req.body || {};
  const normalizedEmail = (email || '').trim().toLowerCase();
  const normalizedWallet = (wallet || '').trim().toLowerCase();

  if (!normalizedEmail || !normalizedWallet || !token) {
    return res.status(400).json({ error: 'Thieu email/token/wallet' });
  }

  try {
    const tokenRow = await TokenModel.findOne({ token });
    if (!tokenRow || tokenRow.email !== normalizedEmail || Date.now() > Number(tokenRow.exp)) {
      return res.status(400).json({ error: 'Token khong hop le cho email nay' });
    }

    const existing = await BindingModel.findOne({ email: normalizedEmail });
    if (existing && existing.wallet !== normalizedWallet) {
      await ConflictModel.create({
        email: normalizedEmail,
        walletTried: normalizedWallet,
        walletBound: existing.wallet,
      });
      return res.status(409).json({ error: `Email da gan voi vi ${existing.wallet}` });
    }

    await BindingModel.findOneAndUpdate(
      { email: normalizedEmail },
      { wallet: normalizedWallet },
      { upsert: true, new: true }
    );

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

// Store candidate info in DB (for audit/off-chain lookup)
app.post('/candidates', async (req, res) => {
  const { name, mssv, major, image, bio, email, wallet, txHash } = req.body || {};
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
        image,
        bio,
        email: email || '',
        wallet: wallet || '',
        txHash: txHash || '',
        status: 'pending',
        source: 'self-nomination',
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`OTP server listening on port ${PORT}`);
});
