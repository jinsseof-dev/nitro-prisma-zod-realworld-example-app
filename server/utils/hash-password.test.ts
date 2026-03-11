import { describe, test, expect } from 'bun:test';
import { useHashPassword, useDecrypt } from './hash-password';

describe('useHashPassword', () => {
  test('returns a bcrypt hash string', async () => {
    const hash = await useHashPassword('password123');
    expect(typeof hash).toBe('string');
    expect(hash.startsWith('$2')).toBe(true);
  });

  test('produces different hashes for the same input (salt)', async () => {
    const hash1 = await useHashPassword('password123');
    const hash2 = await useHashPassword('password123');
    expect(hash1).not.toBe(hash2);
  });

  test('hashes empty string and returns a valid bcrypt hash', async () => {
    const hash = await useHashPassword('');
    expect(typeof hash).toBe('string');
    expect(hash.startsWith('$2')).toBe(true);
  });

  test('hashes a 256-character password and returns a valid bcrypt hash', async () => {
    const longPassword = 'a'.repeat(256);
    const hash = await useHashPassword(longPassword);
    expect(typeof hash).toBe('string');
    expect(hash.startsWith('$2')).toBe(true);
  });
});

describe('useDecrypt', () => {
  test('returns true for matching password', async () => {
    const hash = await useHashPassword('mypassword');
    const result = await useDecrypt('mypassword', hash);
    expect(result).toBe(true);
  });

  test('returns false for wrong password', async () => {
    const hash = await useHashPassword('mypassword');
    const result = await useDecrypt('wrongpassword', hash);
    expect(result).toBe(false);
  });

  test('returns false for empty string input against non-empty hash', async () => {
    const hash = await useHashPassword('mypassword');
    const result = await useDecrypt('', hash);
    expect(result).toBe(false);
  });
});
