/**
 * Secure PBKDF2 password hashing & verification via Web Crypto API.
 * - PBKDF2-SHA256
 * - 150,000 iterations
 * - 16-byte random salt
 * - 256-bit (32 bytes) derived key
 * - Base64 encoded
 */

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function hashPassword(
  pw: string,
  saltB64?: string
): Promise<{ hash: string; salt: string }> {
  const enc = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(pw),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  let saltBytes: Uint8Array<ArrayBuffer>;
  if (saltB64) {
    saltBytes = base64ToBytes(saltB64) as Uint8Array<ArrayBuffer>;
  } else {
    saltBytes = crypto.getRandomValues(new Uint8Array(new ArrayBuffer(16)));
  }

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes as BufferSource,
      iterations: 150000,
      hash: 'SHA-256',
    },
    passwordKey,
    256
  );

  const hashBytes = new Uint8Array(derivedBits);
  return {
    hash: bytesToBase64(hashBytes),
    salt: bytesToBase64(saltBytes),
  };
}

export async function verifyPassword(
  pw: string,
  hash: string,
  salt: string
): Promise<boolean> {
  if (!pw || !hash || !salt) return false;
  try {
    const computed = await hashPassword(pw, salt);
    return timingSafeEqual(computed.hash, hash);
  } catch (err) {
    console.error('Password verification error:', err);
    return false;
  }
}
