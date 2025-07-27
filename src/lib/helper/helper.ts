export function generateSecureRandomString(): string {
  const alphabet = "abcdefghijklmnpqrstuvwxyz23456789";

  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);

  let id = "";
  for (let i = 0; i < bytes.length; i++) {
    id += alphabet[bytes[i] >> 3];
  }
  return id;
}

export const sessionLifetime = 1000 * 60 * 60 * 24 * 30; // 30 days
//export const sessionLifetime = 1000 * 60; // 60 seconds for testing
