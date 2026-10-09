import { PBKDF2_HASH, PBKDF2_ITERATIONS, PBKDF2_SALT_BYTES } from './config';

// App lock hashing (spec 4.9): only a salted PBKDF2 hash is stored, never the PIN.
export function generateSalt(): string {
  const bytes = new Uint8Array(PBKDF2_SALT_BYTES);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

export async function hashPin(pin: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(pin), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: PBKDF2_HASH, salt: hexToBytes(salt), iterations: PBKDF2_ITERATIONS },
    keyMaterial,
    256,
  );
  return bytesToHex(new Uint8Array(bits));
}

export async function verifyPin(pin: string, salt: string, expectedHash: string): Promise<boolean> {
  const hash = await hashPin(pin, salt);
  if (hash.length !== expectedHash.length) return false;
  let difference = 0;
  for (let i = 0; i < hash.length; i++) difference |= hash.charCodeAt(i) ^ expectedHash.charCodeAt(i);
  return difference === 0;
}

export function isValidPin(pin: string, minLength: number, maxLength: number): boolean {
  return new RegExp(`^\\d{${minLength},${maxLength}}$`).test(pin);
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex: string) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}
