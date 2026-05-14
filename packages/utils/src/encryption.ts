/**
 * AES-256-GCM encryption helpers.
 *
 * Used to wrap OAuth tokens, WordPress app passwords, and any other
 * secret stored in `Connection.credentials`. Per SYSTEM_INSTRUCTIONS.md:
 *
 *   "Encrypt OAuth tokens — Connection.credentials must be AES-256
 *    before write, decrypted on read. Never log plaintext tokens."
 *
 * GCM provides authenticated encryption — tampering is detected on decrypt.
 *
 * Output format (string-safe for DB storage):
 *   base64(iv) ":" base64(authTag) ":" base64(ciphertext)
 *
 * Key requirement: env.ENCRYPTION_KEY must be exactly 32 chars (256 bits).
 * Validated at startup in env.ts.
 */
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';

const ALGORITHM = 'aes-256-gcm' as const;
const IV_LENGTH = 12; // GCM standard
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

function deriveKey(rawKey: string): Buffer {
  const buf = Buffer.from(rawKey, 'utf8');
  if (buf.length !== KEY_LENGTH) {
    throw new Error(
      `ENCRYPTION_KEY must be exactly ${KEY_LENGTH} bytes; got ${buf.length}`,
    );
  }
  return buf;
}

/**
 * Encrypt a plaintext string with AES-256-GCM.
 *
 * @param plaintext  UTF-8 string to encrypt
 * @param rawKey     32-byte (32-char) key from env.ENCRYPTION_KEY
 * @returns          `iv:authTag:ciphertext` (all base64)
 */
export function encrypt(plaintext: string, rawKey: string): string {
  const key = deriveKey(rawKey);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString('base64'),
    authTag.toString('base64'),
    ciphertext.toString('base64'),
  ].join(':');
}

/**
 * Decrypt a string produced by {@link encrypt}.
 * Throws if the ciphertext has been tampered with (auth tag mismatch).
 */
export function decrypt(encrypted: string, rawKey: string): string {
  const parts = encrypted.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted payload format (expected iv:tag:ct)');
  }
  const [ivB64, tagB64, ctB64] = parts as [string, string, string];

  const key = deriveKey(rawKey);
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(tagB64, 'base64');
  const ciphertext = Buffer.from(ctB64, 'base64');

  if (iv.length !== IV_LENGTH) {
    throw new Error(`Invalid IV length (expected ${IV_LENGTH})`);
  }
  if (authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error(`Invalid auth tag length (expected ${AUTH_TAG_LENGTH})`);
  }

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return plaintext.toString('utf8');
}

/**
 * Encrypt a JSON-serializable value as a single round-trip helper.
 * Use for `Connection.credentials = encryptJson(oauthTokens, key)`.
 */
export function encryptJson<T>(value: T, rawKey: string): string {
  return encrypt(JSON.stringify(value), rawKey);
}

/**
 * Decrypt and JSON-parse — inverse of {@link encryptJson}.
 * Caller is responsible for runtime validation (e.g. Zod) of the parsed shape.
 */
export function decryptJson<T = unknown>(encrypted: string, rawKey: string): T {
  return JSON.parse(decrypt(encrypted, rawKey)) as T;
}

/**
 * Constant-time string comparison — for comparing secrets (HMAC signatures,
 * webhook tokens) without leaking timing information.
 */
export function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
