import crypto from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(crypto.scrypt);

export const COOKIE_NAME = "tx_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

const getHash = () => {
  const h = process.env.ADMIN_PASSWORD_HASH;
  if (!h) throw new Error("ADMIN_PASSWORD_HASH is not set");
  return h;
};

// HMAC key for session cookies — derived from the password hash so that
// rotating the password invalidates existing sessions automatically.
const sign = (payload) =>
  crypto.createHmac("sha256", getHash()).update(payload).digest("hex");

const timingSafeEqualStr = (a, b) => {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
};

export const buildSessionCookie = () => {
  const expiry = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = String(expiry);
  const value = `${payload}.${sign(payload)}`;
  return {
    name: COOKIE_NAME,
    value,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
};

export const clearSessionCookie = () => ({
  name: COOKIE_NAME,
  value: "",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 0,
});

export const verifySession = (cookieValue) => {
  if (!cookieValue) return false;
  const [payload, sig] = cookieValue.split(".");
  if (!payload || !sig) return false;
  let expected;
  try {
    expected = sign(payload);
  } catch {
    return false;
  }
  if (!timingSafeEqualStr(sig, expected)) return false;
  const expiry = parseInt(payload, 10);
  if (!Number.isFinite(expiry)) return false;
  return expiry > Math.floor(Date.now() / 1000);
};

export const verifyCredentials = async (username, password) => {
  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedHash = process.env.ADMIN_PASSWORD_HASH;
  if (!expectedUser || !expectedHash) return false;
  if (typeof username !== "string" || typeof password !== "string") return false;
  if (!timingSafeEqualStr(username, expectedUser)) return false;

  const [saltHex, keyHex] = expectedHash.split(":");
  if (!saltHex || !keyHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(keyHex, "hex");
  let computed;
  try {
    computed = await scryptAsync(password, salt, expected.length);
  } catch {
    return false;
  }
  if (computed.length !== expected.length) return false;
  return crypto.timingSafeEqual(computed, expected);
};

export const isAuthed = (request) => {
  const cookie = request.cookies.get(COOKIE_NAME);
  return verifySession(cookie?.value);
};
