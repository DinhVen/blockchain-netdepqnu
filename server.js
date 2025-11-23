import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { v4 as uuid } from 'uuid';

const app = express();
app.use(cors());
app.use(express.json());

const otpStore = new Map(); // email -> { code, exp }
const tokenStore = new Map(); // token -> email
const emailWalletMap = new Map(); // email -> wallet
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const fromAddress = process.env.RESEND_FROM || process.env.EMAIL_USER;

const smtpTransporter = process.env.EMAIL_USER && process.env.EMAIL_PASS
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  : null;

const sendOtpEmail = async (email, code) => {
  if (resend && fromAddress) {
    await resend.emails.send({
      from: `QNU Voting <${fromAddress}>`,
      to: email,
      subject: 'Mã OTP đăng nhập QNU - Xác thực sinh viên',
      text: `Mã OTP của bạn: ${code}. Tuyệt đối không chia sẻ cho ai khác. Mã hết hạn trong 5 phút.`,
    });
    return;
  }

  if (smtpTransporter) {
    await smtpTransporter.sendMail({
      from: `"QNU Voting" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Mã OTP đăng nhập QNU - Nét Đẹp Sinh Viên',
      text: `Mã OTP của bạn: ${code} tuyệt đối không được chia sẻ cho ai khác kể cả ban tổ chức (Mã sẽ hết hạn trong vòng 5 phút)`,
    });
    return;
  }

  throw new Error('Email server chưa cấu hình (RESEND_API_KEY/RESEND_FROM hoặc EMAIL_USER/EMAIL_PASS).');
};

app.post('/otp/send', async (req, res) => {
  try {
    const { email } = req.body || {};
    const trimmedEmail = (email || '').trim().toLowerCase();
    if (!trimmedEmail || !/@st\.qnu\.edu\.vn$/i.test(trimmedEmail)) {
      return res.status(400).json({ error: 'Email phải là mail sinh viên Trường Đại học Quy Nhơn (@st.qnu.edu.vn)' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(trimmedEmail, { code, exp: Date.now() + 5 * 60 * 1000 });

    await sendOtpEmail(trimmedEmail, code);

    res.json({ ok: true });
  } catch (err) {
    console.error('send otp error', err);
    res.status(500).json({ error: err.message || 'Không gửi được OTP. Kiểm tra email server.' });
  }
});

app.post('/otp/verify', (req, res) => {
  const { email, code } = req.body || {};
  const normalizedEmail = (email || '').trim().toLowerCase();
  const item = otpStore.get(normalizedEmail);
  if (!item || item.code !== code || Date.now() > item.exp) {
    return res.status(400).json({ error: 'OTP sai hoặc hết hạn' });
  }
  otpStore.delete(normalizedEmail);
  const token = uuid();
  tokenStore.set(token, normalizedEmail);
  res.json({ ok: true, token });
});

// Bind email to wallet (detect reuse)
app.post('/wallet/bind', (req, res) => {
  const { email, token, wallet } = req.body || {};
  const normalizedEmail = (email || '').trim().toLowerCase();
  const normalizedWallet = (wallet || '').trim().toLowerCase();

  if (!normalizedEmail || !normalizedWallet || !token) {
    return res.status(400).json({ error: 'Thiếu email/token/wallet' });
  }

  const tokenEmail = tokenStore.get(token);
  if (!tokenEmail || tokenEmail !== normalizedEmail) {
    return res.status(400).json({ error: 'Token không hợp lệ cho email này' });
  }

  const existing = emailWalletMap.get(normalizedEmail);
  if (existing && existing !== normalizedWallet) {
    return res.status(409).json({ error: `Email đã gắn với ví ${existing}` });
  }

  emailWalletMap.set(normalizedEmail, normalizedWallet);
  res.json({ ok: true, wallet: normalizedWallet });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`OTP server listening on port ${PORT}`);
});
