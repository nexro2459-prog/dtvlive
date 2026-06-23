// Server-only crypto helpers for the admin auth flow.
// SHA-256 + random token generation via Web Crypto (works on Cloudflare workerd).

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return toHex(new Uint8Array(buf));
}

export function randomHex(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return toHex(bytes);
}

/** Human-friendly random password (URL-safe alphabet). */
export function randomPassword(length = 32): string {
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < length; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

export async function hashPassword(
  password: string,
  salt: string,
): Promise<string> {
  // 10k stretched SHA-256 — adequate against offline brute force given
  // a 32-char random password and salt.
  let v = `${salt}:${password}`;
  for (let i = 0; i < 10_000; i++) v = await sha256Hex(v);
  return v;
}

/** Constant-time string comparison. */
export function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
