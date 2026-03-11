import { describe, test, expect } from 'bun:test';
import { z } from 'zod';
import { validateBody } from './validate';
import HttpException from '~/models/http-exception.model';

const testSchema = z.object({
  user: z.object({
    name: z.string().min(1, "can't be blank"),
    email: z.string().email('is invalid'),
  }),
});

describe('validateBody', () => {
  test('returns parsed value for valid input', () => {
    const input = { user: { name: 'John', email: 'john@example.com' } };
    const result = validateBody(testSchema, input);
    expect(result).toEqual(input);
  });

  test('throws HttpException with 422 for invalid input', () => {
    try {
      validateBody(testSchema, { user: { name: '', email: 'bad' } });
      throw new Error('should have thrown');
    } catch (e: any) {
      expect(e).toBeInstanceOf(HttpException);
      expect(e.errorCode).toBe(422);
    }
  });

  test('error contains field-level error messages', () => {
    try {
      validateBody(testSchema, { user: { name: '', email: 'bad' } });
      throw new Error('should have thrown');
    } catch (e: any) {
      expect(e.body.errors).toBeDefined();
      expect(e.body.errors.name).toBeInstanceOf(Array);
      expect(e.body.errors.email).toBeInstanceOf(Array);
    }
  });

  test('handles missing nested fields', () => {
    try {
      validateBody(testSchema, {});
      throw new Error('should have thrown');
    } catch (e: any) {
      expect(e).toBeInstanceOf(HttpException);
      expect(e.errorCode).toBe(422);
    }
  });

  test('passes through non-Zod errors unchanged', () => {
    const badSchema = {
      parse: () => {
        throw new TypeError('not a zod error');
      },
    } as any;
    expect(() => validateBody(badSchema, {})).toThrow(TypeError);
  });

  test('throws HttpException 422 for null body input', () => {
    try {
      validateBody(testSchema, null);
      throw new Error('should have thrown');
    } catch (e: any) {
      expect(e).toBeInstanceOf(HttpException);
      expect(e.errorCode).toBe(422);
    }
  });

  test('throws HttpException 422 for undefined body input', () => {
    try {
      validateBody(testSchema, undefined);
      throw new Error('should have thrown');
    } catch (e: any) {
      expect(e).toBeInstanceOf(HttpException);
      expect(e.errorCode).toBe(422);
    }
  });

  test('falls back to body field key when Zod issue path is empty', () => {
    const flatSchema = z.string().min(1, "can't be blank");
    try {
      validateBody(flatSchema, '');
      throw new Error('should have thrown');
    } catch (e: any) {
      expect(e).toBeInstanceOf(HttpException);
      expect(e.errorCode).toBe(422);
      expect(e.body.errors.body).toBeInstanceOf(Array);
    }
  });
});
