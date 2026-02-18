import crypto from 'crypto';

const SCRYPT_KEYLEN = 64;
const SALT_BYTES = 16;
const SCRYPT_COST = 16384;

/**
 * Hash a plain text password using Node crypto (scrypt).
 * Stored format: salt(hex):hash(hex)
 */
export const hashPassword = async (plainPassword: string): Promise<string> => {
  const salt = crypto.randomBytes(SALT_BYTES);
  const hash = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(plainPassword, salt, SCRYPT_KEYLEN, { N: SCRYPT_COST }, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
};

/**
 * Verify a plain password against a stored hash (salt:hash format).
 */
export const verifyPassword = async (
  plainPassword: string,
  storedHash: string,
): Promise<boolean> => {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;

  const [saltHex, hashHex] = parts;
  const salt = Buffer.from(saltHex, 'hex');
  const expectedHash = Buffer.from(hashHex, 'hex');

  if (salt.length !== SALT_BYTES || expectedHash.length !== SCRYPT_KEYLEN) {
    return false;
  }

  const derivedKey = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(plainPassword, salt, SCRYPT_KEYLEN, { N: SCRYPT_COST }, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });

  return crypto.timingSafeEqual(derivedKey, expectedHash);
};
