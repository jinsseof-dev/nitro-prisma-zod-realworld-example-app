import { describe, test, expect } from 'bun:test';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { handleUniqueConstraintError } from './prisma-errors';
import HttpException from '~/models/http-exception.model';

const makeP2002 = (target: string[]) => {
  const e = new PrismaClientKnownRequestError('Unique constraint failed', { code: 'P2002', clientVersion: '7.0.0' });
  e.meta = { target };
  return e;
};

describe('handleUniqueConstraintError', () => {
  test('does nothing for non-Prisma errors', () => {
    handleUniqueConstraintError(new Error('random'), { email: ['taken'] });
  });

  test('does nothing for non-P2002 Prisma errors', () => {
    const e = new PrismaClientKnownRequestError('Foreign key failed', { code: 'P2003', clientVersion: '7.0.0' });
    handleUniqueConstraintError(e, { email: ['taken'] });
  });

  test('throws 409 with matched field when target matches', () => {
    const e = makeP2002(['email']);
    expect(() =>
      handleUniqueConstraintError(e, {
        email: ['has already been taken'],
        username: ['has already been taken'],
      }),
    ).toThrow(
      expect.objectContaining({
        errorCode: 409,
        body: { errors: { email: ['has already been taken'] } },
      }),
    );
  });

  test('throws 409 with all fields when target does not match any key', () => {
    const e = makeP2002(['slug']);
    expect(() =>
      handleUniqueConstraintError(e, {
        title: ['has already been taken'],
      }),
    ).toThrow(
      expect.objectContaining({
        errorCode: 409,
        body: { errors: { title: ['has already been taken'] } },
      }),
    );
  });

  test('throws 409 with all fields when target is undefined', () => {
    const e = new PrismaClientKnownRequestError('Unique constraint failed', { code: 'P2002', clientVersion: '7.0.0' });
    expect(() =>
      handleUniqueConstraintError(e, {
        email: ['taken'],
        username: ['taken'],
      }),
    ).toThrow(
      expect.objectContaining({
        errorCode: 409,
        body: { errors: { email: ['taken'], username: ['taken'] } },
      }),
    );
  });

  test('throws 409 with only matching field when target has multiple entries and only some match fieldErrors', () => {
    const e = makeP2002(['email', 'phone']);
    expect(() =>
      handleUniqueConstraintError(e, {
        email: ['has already been taken'],
      }),
    ).toThrow(
      expect.objectContaining({
        errorCode: 409,
        body: { errors: { email: ['has already been taken'] } },
      }),
    );
  });

  test('does not throw for non-P2002 errors and returns void', () => {
    const e = new PrismaClientKnownRequestError('Record not found', { code: 'P2025', clientVersion: '7.0.0' });
    const result = handleUniqueConstraintError(e, { email: ['taken'] });
    expect(result).toBeUndefined();
  });
});
