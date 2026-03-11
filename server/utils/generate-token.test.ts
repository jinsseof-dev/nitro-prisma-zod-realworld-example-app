import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import jwt from 'jsonwebtoken';

const TEST_SECRET = 'test-secret-for-generate-token';

describe('useGenerateToken', () => {
  let useGenerateToken: typeof import('./generate-token').useGenerateToken;
  let originalSecret: string | undefined;

  beforeAll(async () => {
    originalSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = TEST_SECRET;
    ({ useGenerateToken } = await import('./generate-token'));
  });

  afterAll(() => {
    if (originalSecret !== undefined) {
      process.env.JWT_SECRET = originalSecret;
    } else {
      delete process.env.JWT_SECRET;
    }
  });

  test('returns a string', () => {
    const token = useGenerateToken(1);
    expect(typeof token).toBe('string');
  });

  test('token contains user id in payload', () => {
    const token = useGenerateToken(42);
    const decoded = jwt.verify(token, TEST_SECRET) as { user: { id: number } };
    expect(decoded.user.id).toBe(42);
  });

  test('token has 60d expiry', () => {
    const token = useGenerateToken(1);
    const decoded = jwt.decode(token) as { exp: number; iat: number };
    const sixtyDaysInSeconds = 60 * 24 * 60 * 60;
    expect(decoded.exp - decoded.iat).toBe(sixtyDaysInSeconds);
  });

  test('token is signed with JWT_SECRET', () => {
    const token = useGenerateToken(1);
    expect(() => jwt.verify(token, 'wrong-secret')).toThrow();
    expect(() => jwt.verify(token, TEST_SECRET)).not.toThrow();
  });
});
