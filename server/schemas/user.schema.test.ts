import { describe, test, expect } from 'bun:test';
import { registerUserSchema, loginUserSchema, updateUserSchema } from './user.schema';

describe('registerUserSchema', () => {
  const valid = { user: { email: 'test@example.com', username: 'testuser', password: 'password123' } };

  test('accepts valid input', () => {
    expect(registerUserSchema.parse(valid)).toBeDefined();
  });

  test('rejects invalid email format', () => {
    const result = registerUserSchema.safeParse({ user: { ...valid.user, email: 'not-an-email' } });
    expect(result.success).toBe(false);
  });

  test('rejects short password (< 8 chars)', () => {
    const result = registerUserSchema.safeParse({ user: { ...valid.user, password: 'short' } });
    expect(result.success).toBe(false);
  });

  test('accepts password with exactly 8 characters', () => {
    const result = registerUserSchema.safeParse({ user: { ...valid.user, password: '12345678' } });
    expect(result.success).toBe(true);
  });

  test('accepts image string', () => {
    const result = registerUserSchema.safeParse({ user: { ...valid.user, image: 'https://example.com/img.png' } });
    expect(result.success).toBe(true);
  });

  test('rejects empty email', () => {
    const result = registerUserSchema.safeParse({ user: { ...valid.user, email: '' } });
    expect(result.success).toBe(false);
  });

  test('rejects empty username', () => {
    const result = registerUserSchema.safeParse({ user: { ...valid.user, username: '' } });
    expect(result.success).toBe(false);
  });
});

describe('loginUserSchema', () => {
  test('accepts valid login input', () => {
    const result = loginUserSchema.safeParse({ user: { email: 'test@example.com', password: 'pw' } });
    expect(result.success).toBe(true);
  });

  test('rejects empty email', () => {
    const result = loginUserSchema.safeParse({ user: { email: '', password: 'pw' } });
    expect(result.success).toBe(false);
  });

  test('rejects empty password', () => {
    const result = loginUserSchema.safeParse({ user: { email: 'test@example.com', password: '' } });
    expect(result.success).toBe(false);
  });
});

describe('updateUserSchema', () => {
  test('accepts empty update (all optional)', () => {
    const result = updateUserSchema.safeParse({ user: {} });
    expect(result.success).toBe(true);
  });

  test('rejects invalid email when provided', () => {
    const result = updateUserSchema.safeParse({ user: { email: 'bad' } });
    expect(result.success).toBe(false);
  });

  test('rejects short password when provided', () => {
    const result = updateUserSchema.safeParse({ user: { password: 'short' } });
    expect(result.success).toBe(false);
  });

  test('transforms empty image string to null', () => {
    const result = updateUserSchema.parse({ user: { image: '' } });
    expect(result.user.image).toBeNull();
  });

  test('transforms empty bio string to null', () => {
    const result = updateUserSchema.parse({ user: { bio: '' } });
    expect(result.user.bio).toBeNull();
  });

  test('accepts null image', () => {
    const result = updateUserSchema.parse({ user: { image: null } });
    expect(result.user.image).toBeNull();
  });
});
