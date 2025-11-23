import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { v4 as uuid } from 'uuid';
import mysql from 'mysql2/promise';

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

// MySQL pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'qnu_voting',
  connectionLimit: 5,
});

const initDb = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS otp_codes (
      email VARCHAR(255) PRIMARY KEY,
      code VARCHAR(10) NOT NULL,
      exp BIGINT NOT NULL
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS otp_tokens (
      token VARCHAR(64) PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      exp BIGINT NOT NULL,
      INDEX idx_email (email)
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS bindings (
      email VARCHAR(255) PRIMARY KEY,
      wallet VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS conflicts (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      wallet_tried VARCHAR(255) NOT NULL,
      wallet_bound VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

initDb().catch((e) => {
  console.error('Init DB error', e);
  process.exit(1);
});

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
    await pool.query(
      `INSERT INTO otp_codes (email, code, exp) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE code = VALUES(code), exp = VALUES(exp)`,
      [trimmedEmail, code, exp]
    );

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
    const [rows] = await pool.query(`SELECT code, exp FROM otp_codes WHERE email = ?`, [normalizedEmail]);
    const item = rows?.[0];
    if (!item || item.code !== code || Date.now() > Number(item.exp)) {
      return res.status(400).json({ error: 'OTP sai hoac het han' });
    }
    await pool.query(`DELETE FROM otp_codes WHERE email = ?`, [normalizedEmail]);

    const token = uuid();
    const exp = Date.now() + 60 * 60 * 1000; // token valid 1h
    await pool.query(`INSERT INTO otp_tokens (token, email, exp) VALUES (?, ?, ?)`, [token, normalizedEmail, exp]);
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
    const [tRows] = await pool.query(`SELECT email, exp FROM otp_tokens WHERE token = ?`, [token]);
    const tokenRow = tRows?.[0];
    if (!tokenRow || tokenRow.email !== normalizedEmail || Date.now() > Number(tokenRow.exp)) {
      return res.status(400).json({ error: 'Token khong hop le cho email nay' });
    }

    const [bRows] = await pool.query(`SELECT wallet FROM bindings WHERE email = ?`, [normalizedEmail]);
    const existing = bRows?.[0]?.wallet;
    if (existing && existing !== normalizedWallet) {
      await pool.query(
        `INSERT INTO conflicts (email, wallet_tried, wallet_bound) VALUES (?, ?, ?)`,
        [normalizedEmail, normalizedWallet, existing]
      );
      return res.status(409).json({ error: `Email da gan voi vi ${existing}` });
    }

    await pool.query(
      `INSERT INTO bindings (email, wallet) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE wallet = VALUES(wallet)`,
      [normalizedEmail, normalizedWallet]
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
    const [rows] = await pool.query(
      `SELECT id, email, wallet_tried, wallet_bound, created_at
       FROM conflicts
       ORDER BY id DESC
       LIMIT 100`
    );
    res.json({ ok: true, data: rows });
  } catch (err) {
    console.error('fetch conflicts error', err);
    res.status(500).json({ error: 'Loi he thong' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`OTP server listening on port ${PORT}`);
});
