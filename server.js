'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { promisify } = require('node:util');
const { DatabaseSync } = require('node:sqlite');

const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || '127.0.0.1';
const ROOT = __dirname;
const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(ROOT, 'data');
const DB_PATH = process.env.DB_PATH ? path.resolve(process.env.DB_PATH) : path.join(DATA_DIR, 'app.db');
const SESSION_COOKIE = 'nc_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true';
const MAX_BODY_BYTES = 64 * 1024;

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;
const SCRYPT_OPTIONS = {
  N: SCRYPT_N,
  r: SCRYPT_R,
  p: SCRYPT_P,
  maxmem: 64 * 1024 * 1024
};

const scryptAsync = promisify(crypto.scrypt);

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "img-src 'self' data:",
    "style-src 'self' 'unsafe-inline'",
    "script-src 'self'",
    "connect-src 'self'",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join('; ')
};

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8'
};

const STATIC_FILES = new Set(['index.html', 'styles.css', 'app.js', 'auth.js']);
const STATIC_DIRS = ['assets/', 'screenshots/'];

class ApiError extends Error {
  constructor(status, code, message, headers = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.headers = headers;
  }
}

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  PRAGMA busy_timeout = 3000;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
`);

db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(Date.now());

const rateLimitBuckets = new Map();
const rateLimitCleanup = setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateLimitBuckets.entries()) {
    if (bucket.resetAt <= now) rateLimitBuckets.delete(key);
  }
}, 10 * 60 * 1000);
rateLimitCleanup.unref();

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeName(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function validateEmail(email) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateName(name) {
  const length = Array.from(name).length;
  return length >= 2 && length <= 32 && !/[\u0000-\u001f\u007f]/.test(name);
}

function validatePassword(password) {
  return typeof password === 'string' && password.length >= 8 && password.length <= 128 && password.trim().length > 0;
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const derived = await scryptAsync(password, salt, KEY_LENGTH, SCRYPT_OPTIONS);
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString('base64')}$${Buffer.from(derived).toString('base64')}`;
}

async function verifyPassword(password, stored) {
  try {
    const parts = String(stored || '').split('$');
    if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
    const N = Number(parts[1]);
    const r = Number(parts[2]);
    const p = Number(parts[3]);
    if (!Number.isInteger(N) || !Number.isInteger(r) || !Number.isInteger(p)) return false;
    const salt = Buffer.from(parts[4], 'base64');
    const expected = Buffer.from(parts[5], 'base64');
    if (expected.length === 0) return false;
    const actual = await scryptAsync(password, salt, expected.length, {
      N,
      r,
      p,
      maxmem: Math.max(64 * 1024 * 1024, 128 * N * r * 2)
    });
    return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

// Keep invalid-login timing closer to valid-login timing.
const DUMMY_HASH = (() => {
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync('not-a-real-password', salt, KEY_LENGTH, SCRYPT_OPTIONS);
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString('base64')}$${derived.toString('base64')}`;
})();

function publicUser(row) {
  return {
    id: Number(row.id),
    email: row.email,
    name: row.name,
    createdAt: row.created_at
  };
}

function parseCookies(req) {
  const result = {};
  const header = req.headers.cookie;
  if (!header) return result;
  for (const pair of header.split(';')) {
    const separator = pair.indexOf('=');
    if (separator === -1) continue;
    const key = pair.slice(0, separator).trim();
    const value = pair.slice(separator + 1).trim();
    if (!key) continue;
    try {
      result[key] = decodeURIComponent(value);
    } catch {
      result[key] = value;
    }
  }
  return result;
}

function cookieValue(req, name) {
  return parseCookies(req)[name] || '';
}

function sessionCookie(token) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}${COOKIE_SECURE ? '; Secure' : ''}`;
}

function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${COOKIE_SECURE ? '; Secure' : ''}`;
}

function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  db.prepare('INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').run(
    hashToken(token),
    userId,
    now,
    now + SESSION_TTL_MS
  );
  return token;
}

function sessionUser(req) {
  const token = cookieValue(req, SESSION_COOKIE);
  if (!token) return null;
  const row = db.prepare(`
    SELECT u.id, u.email, u.name, u.created_at, s.expires_at
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ? AND s.expires_at > ?
  `).get(hashToken(token), Date.now());
  if (!row) return null;
  return row;
}

function deleteSession(req) {
  const token = cookieValue(req, SESSION_COOKIE);
  if (token) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hashToken(token));
}

function getClientIp(req) {
  return req.socket.remoteAddress || 'unknown';
}

function consumeRateLimit(key, limit, windowMs) {
  const now = Date.now();
  let bucket = rateLimitBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs };
    rateLimitBuckets.set(key, bucket);
  }
  if (bucket.count >= limit) {
    return Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
  }
  bucket.count += 1;
  return 0;
}

function sendJson(res, status, payload, extraHeaders = {}) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    ...SECURITY_HEADERS,
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    ...extraHeaders
  });
  res.end(body);
}

function sendError(res, error) {
  if (error instanceof ApiError) {
    sendJson(res, error.status, { ok: false, error: { code: error.code, message: error.message } }, error.headers);
    return;
  }
  console.error('[server]', error);
  sendJson(res, 500, { ok: false, error: { code: 'INTERNAL_ERROR', message: '服务器暂时开小差了，请稍后重试。' } });
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let total = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > MAX_BODY_BYTES) {
        reject(new ApiError(413, 'BODY_TOO_LARGE', '请求内容过大。'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (total === 0) {
        resolve({});
        return;
      }
      try {
        const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          throw new Error('not an object');
        }
        resolve(parsed);
      } catch {
        reject(new ApiError(400, 'INVALID_JSON', '请求格式不正确。'));
      }
    });
    req.on('error', reject);
  });
}

function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    const parsed = new URL(origin);
    return parsed.host === req.headers.host;
  } catch {
    return false;
  }
}

function ensureJsonContentType(req) {
  const contentType = String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
  if (contentType !== 'application/json') {
    throw new ApiError(415, 'UNSUPPORTED_MEDIA_TYPE', '请使用 JSON 提交请求。');
  }
}

async function handleRegister(req, res) {
  ensureJsonContentType(req);
  if (!sameOrigin(req)) throw new ApiError(403, 'BAD_ORIGIN', '请求来源不被允许。');

  const retryAfter = consumeRateLimit(`register:${getClientIp(req)}`, 5, 60 * 60 * 1000);
  if (retryAfter) {
    throw new ApiError(429, 'RATE_LIMITED', '注册请求过于频繁，请稍后再试。', { 'Retry-After': String(retryAfter) });
  }

  const body = await readJson(req);
  const email = normalizeEmail(body.email);
  const name = normalizeName(body.name);
  const password = body.password;

  if (!validateEmail(email)) throw new ApiError(400, 'INVALID_EMAIL', '请输入有效的邮箱地址。');
  if (!validateName(name)) throw new ApiError(400, 'INVALID_NAME', '昵称需要 2–32 个字符。');
  if (!validatePassword(password)) throw new ApiError(400, 'INVALID_PASSWORD', '密码至少需要 8 位字符。');

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) throw new ApiError(409, 'EMAIL_EXISTS', '这个邮箱已经注册过了，请直接登录。');

  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();

  let result;
  try {
    result = db.prepare(`
      INSERT INTO users (email, name, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(email, name, passwordHash, now, now);
  } catch (error) {
    if (String(error.message).includes('UNIQUE')) {
      throw new ApiError(409, 'EMAIL_EXISTS', '这个邮箱已经注册过了，请直接登录。');
    }
    throw error;
  }

  const user = db.prepare('SELECT id, email, name, created_at FROM users WHERE id = ?').get(Number(result.lastInsertRowid));
  const token = createSession(Number(result.lastInsertRowid));
  sendJson(res, 201, { ok: true, user: publicUser(user) }, { 'Set-Cookie': sessionCookie(token) });
}

async function handleLogin(req, res) {
  ensureJsonContentType(req);
  if (!sameOrigin(req)) throw new ApiError(403, 'BAD_ORIGIN', '请求来源不被允许。');

  const retryAfter = consumeRateLimit(`login:${getClientIp(req)}`, 10, 15 * 60 * 1000);
  if (retryAfter) {
    throw new ApiError(429, 'RATE_LIMITED', '尝试次数过多，请稍后再试。', { 'Retry-After': String(retryAfter) });
  }

  const body = await readJson(req);
  const email = normalizeEmail(body.email);
  const password = body.password;
  if (!validateEmail(email) || typeof password !== 'string' || !password || password.length > 128) {
    throw new ApiError(400, 'INVALID_CREDENTIALS', '请输入邮箱和密码。');
  }

  const row = db.prepare('SELECT id, email, name, password_hash, created_at FROM users WHERE email = ?').get(email);
  const isValid = await verifyPassword(password, row ? row.password_hash : DUMMY_HASH);
  if (!row || !isValid) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', '邮箱或密码不正确。');
  }

  const token = createSession(Number(row.id));
  sendJson(res, 200, { ok: true, user: publicUser(row) }, { 'Set-Cookie': sessionCookie(token) });
}

function handleLogout(req, res) {
  if (!sameOrigin(req)) throw new ApiError(403, 'BAD_ORIGIN', '请求来源不被允许。');
  deleteSession(req);
  sendJson(res, 200, { ok: true }, { 'Set-Cookie': clearSessionCookie() });
}

function handleMe(req, res) {
  const user = sessionUser(req);
  if (!user) {
    const hadCookie = Boolean(cookieValue(req, SESSION_COOKIE));
    sendJson(res, 200, { ok: true, user: null }, hadCookie ? { 'Set-Cookie': clearSessionCookie() } : {});
    return;
  }
  sendJson(res, 200, { ok: true, user: publicUser(user) });
}

async function handleApi(req, res, url) {
  const pathname = url.pathname;

  if (pathname === '/api/health' && req.method === 'GET') {
    sendJson(res, 200, { ok: true, status: 'healthy', time: new Date().toISOString() });
    return;
  }

  if (pathname === '/api/auth/me') {
    if (req.method !== 'GET') throw new ApiError(405, 'METHOD_NOT_ALLOWED', '请求方法不被允许。', { Allow: 'GET' });
    handleMe(req, res);
    return;
  }

  if (pathname === '/api/auth/register') {
    if (req.method !== 'POST') throw new ApiError(405, 'METHOD_NOT_ALLOWED', '请求方法不被允许。', { Allow: 'POST' });
    await handleRegister(req, res);
    return;
  }

  if (pathname === '/api/auth/login') {
    if (req.method !== 'POST') throw new ApiError(405, 'METHOD_NOT_ALLOWED', '请求方法不被允许。', { Allow: 'POST' });
    await handleLogin(req, res);
    return;
  }

  if (pathname === '/api/auth/logout') {
    if (req.method !== 'POST') throw new ApiError(405, 'METHOD_NOT_ALLOWED', '请求方法不被允许。', { Allow: 'POST' });
    handleLogout(req, res);
    return;
  }

  throw new ApiError(404, 'NOT_FOUND', '接口不存在。');
}

function isAllowedStatic(relativePath) {
  if (STATIC_FILES.has(relativePath)) return true;
  return STATIC_DIRS.some((prefix) => relativePath.startsWith(prefix));
}

async function serveStatic(req, res, url) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8', Allow: 'GET, HEAD' });
    res.end('Method Not Allowed');
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    res.writeHead(400, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad Request');
    return;
  }

  if (pathname === '/favicon.ico') {
    res.writeHead(204, SECURITY_HEADERS);
    res.end();
    return;
  }

  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  if (relativePath.includes('\0')) {
    res.writeHead(404, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
    return;
  }

  const filePath = path.resolve(ROOT, relativePath);
  if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
    res.writeHead(403, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  const normalizedRelativePath = path.relative(ROOT, filePath).split(path.sep).join('/');
  if (!isAllowedStatic(normalizedRelativePath)) {
    res.writeHead(404, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
    return;
  }

  let stat;
  try {
    stat = await fs.promises.stat(filePath);
  } catch {
    res.writeHead(404, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
    return;
  }

  if (!stat.isFile()) {
    res.writeHead(404, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
    return;
  }

  const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
  const cacheControl = /\.(png|jpe?g|webp|svg|woff2)$/i.test(filePath)
    ? 'public, max-age=86400'
    : 'no-cache';

  res.writeHead(200, {
    ...SECURITY_HEADERS,
    'Content-Type': contentType,
    'Content-Length': stat.size,
    'Cache-Control': cacheControl
  });

  if (req.method === 'HEAD') {
    res.end();
    return;
  }

  const stream = fs.createReadStream(filePath);
  stream.on('error', () => res.destroy());
  stream.pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/api/')) {
      await handleApi(req, res, url);
    } else {
      await serveStatic(req, res, url);
    }
  } catch (error) {
    if (!res.headersSent) sendError(res, error);
    else res.destroy();
  }
});

server.on('clientError', (error, socket) => {
  if (socket.writable) socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.on('error', (error) => {
  console.error('[server] failed to start:', error.message);
  process.exitCode = 1;
});

function shutdown() {
  server.close(() => {
    try {
      db.close();
    } finally {
      process.exit(0);
    }
  });
  setTimeout(() => process.exit(0), 1500).unref();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

server.listen(PORT, HOST, () => {
  console.log(`知闻 News Compass · http://${HOST}:${PORT}`);
  console.log(`数据库: ${DB_PATH}`);
});
