import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import { v4 as uuid } from 'uuid';

const app = express();
app.use(cors());
app.use(express.json());

const otpStore = new Map(); // email -> { code, exp }

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post('/otp/send', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email || !/@st\.qnu\.edu\.vn$/i.test(email.trim())) {
      return res.status(400).json({ error: 'Email không hợp lệ vui lòng nhập mail sinh viên của bạn. Xin cảm ơn' });
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, { code, exp: Date.now() + 5 * 60 * 1000 });

    await transporter.sendMail({
      from: `"QNU Voting" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Mã OTP đăng nhập QNU - Nét Đẹp Sinh Viên',
      text: `Mã OTP của bạn: ${code} tuyệt đối không được chia sẻ cho ai khác kể cả ban tổ chức (Mã sẽ hết hạn trong vòng 5 phút)`,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('send otp error', err);
    res.status(500).json({ error: 'Không gửi được OTP. Kiểm tra email server.' });
  }
});

app.post('/otp/verify', (req, res) => {
  const { email, code } = req.body || {};
  const item = otpStore.get(email);
  if (!item || item.code !== code || Date.now() > item.exp) {
    return res.status(400).json({ error: 'OTP sai hoặc hết hạn' });
  }
  otpStore.delete(email);
  const token = uuid();
  res.json({ ok: true, token });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`OTP server listening on port ${PORT}`);
});
