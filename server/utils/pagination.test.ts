import { describe, test, expect } from 'bun:test';
import { parsePagination } from './pagination';

describe('parsePagination', () => {
  test('returns defaults when no params provided', () => {
    const result = parsePagination({});
    expect(result).toEqual({ skip: 0, take: 10 });
  });

  test('parses valid offset and limit', () => {
    const result = parsePagination({ offset: '20', limit: '5' });
    expect(result).toEqual({ skip: 20, take: 5 });
  });

  test('returns skip 0 for negative offset', () => {
    const result = parsePagination({ offset: '-5', limit: '10' });
    expect(result).toEqual({ skip: 0, take: 10 });
  });

  test('returns skip 0 for non-numeric offset', () => {
    const result = parsePagination({ offset: 'abc', limit: '10' });
    expect(result).toEqual({ skip: 0, take: 10 });
  });

  test('returns default limit for negative limit', () => {
    const result = parsePagination({ offset: '0', limit: '-1' });
    expect(result).toEqual({ skip: 0, take: 10 });
  });

  test('returns default limit for zero limit', () => {
    const result = parsePagination({ offset: '0', limit: '0' });
    expect(result).toEqual({ skip: 0, take: 10 });
  });

  test('returns default limit for non-numeric limit', () => {
    const result = parsePagination({ offset: '0', limit: 'abc' });
    expect(result).toEqual({ skip: 0, take: 10 });
  });

  test('caps limit at MAX_LIMIT (100)', () => {
    const result = parsePagination({ offset: '0', limit: '500' });
    expect(result).toEqual({ skip: 0, take: 100 });
  });

  test('floors decimal offset and limit', () => {
    const result = parsePagination({ offset: '2.7', limit: '3.9' });
    expect(result).toEqual({ skip: 2, take: 3 });
  });

  test('handles undefined values', () => {
    const result = parsePagination({ offset: undefined, limit: undefined });
    expect(result).toEqual({ skip: 0, take: 10 });
  });

  test('returns skip 0 for Infinity offset', () => {
    const result = parsePagination({ offset: 'Infinity' });
    expect(result).toEqual({ skip: 0, take: 10 });
  });

  test('returns default limit for NaN limit', () => {
    const result = parsePagination({ limit: 'NaN' });
    expect(result).toEqual({ skip: 0, take: 10 });
  });
});
