// 端到端加密工具：AES-GCM 256，密钥由用户口令经 PBKDF2 派生
// 密文格式: [salt(16)] [iv(12)] [ciphertext]
// 设计要点：服务端（WebDAV）只存密文，无法获知明文；忘记口令 = 无法解密（无后门）

const SALT_LEN = 16;
const IV_LEN = 12;
const ITERATIONS = 150_000;

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/** 明文 -> 加密 ArrayBuffer（可直接 PUT 到 WebDAV） */
export async function encryptData(plaintext: string, password: string): Promise<ArrayBuffer> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LEN));
  const key = await deriveKey(password, salt);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plaintext));
  const ctBytes = new Uint8Array(ct);
  const out = new Uint8Array(SALT_LEN + IV_LEN + ctBytes.length);
  out.set(salt, 0);
  out.set(iv, SALT_LEN);
  out.set(ctBytes, SALT_LEN + IV_LEN);
  return out.buffer;
}

/** 解密 ArrayBuffer -> 明文；口令错误会抛异常（AES-GCM 认证失败） */
export async function decryptData(data: ArrayBuffer, password: string): Promise<string> {
  const buf = new Uint8Array(data);
  const salt = buf.slice(0, SALT_LEN);
  const iv = buf.slice(SALT_LEN, SALT_LEN + IV_LEN);
  const ct = buf.slice(SALT_LEN + IV_LEN);
  const key = await deriveKey(password, salt);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  return new TextDecoder().decode(pt);
}
