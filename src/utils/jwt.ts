import jwt, { JwtPayload, SignOptions, VerifyErrors } from 'jsonwebtoken';
import { envs } from '@config/env';
import { StatusError } from '@config/error/status-error';

/**
 * Signs a payload using HS256 algorithm.
 */
export function signWithHS256(payload: object): string {
  const tokenExpiresIn = envs.jwt.accessToken.expiry;
  const options: SignOptions = tokenExpiresIn ? { expiresIn: `${tokenExpiresIn}d` } : {};
  return jwt.sign(payload, envs.jwt.accessToken.secret, {
    algorithm: 'HS256',
    ...options,
  });
}

/**
 * Verifies a JWT token using HS256 algorithm.
 */
export function verifyWithHS256<T extends object | undefined = JwtPayload>(
  token: string,
): Promise<T> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, envs.jwt.accessToken.secret, { algorithms: ['HS256'] }, (err, decoded) => {
      if (err) return reject(mapJwtError(err));
      resolve(decoded as T);
    });
  });
}

/**
 * Signs a payload using RS256 algorithm.
 */
export function signWithRS256(payload: object, expiresIn: number | null = null): string {
  const tokenExpiresIn = expiresIn ? expiresIn : envs.jwt.accessToken.expiry;
  const privateKey = envs.jwt.key.private.replace(/\\n/g, '\n');
  const options: SignOptions = tokenExpiresIn ? { expiresIn: `${tokenExpiresIn}d` } : {};
  return jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    ...options,
  });
}

/**
 * Verifies a JWT token using RS256 algorithm.
 */
export function verifyWithRS256<T extends object | undefined = JwtPayload>(
  token: string,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const publicKey = envs.jwt.key.public.replace(/\\n/g, '\n');
    jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err, decoded) => {
      if (err) return reject(mapJwtError(err));
      resolve(decoded as T);
    });
  });
}

/**
 * Maps JWT library errors to custom `ApiError`.
 */
function mapJwtError(err: VerifyErrors): Error {
  switch (err.name) {
    case 'TokenExpiredError':
      throw StatusError.unauthorized('tokenExpired');
    case 'JsonWebTokenError':
    case 'NotBeforeError':
      throw StatusError.unauthorized('invalidTokenOrWrongConfiguration');
    default:
      throw StatusError.unauthorized('unknownAuthenticationError');
  }
}
