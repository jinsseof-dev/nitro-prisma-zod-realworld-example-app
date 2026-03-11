import { describe, test, expect } from 'bun:test';
import { createArticleSchema, updateArticleSchema } from './article.schema';

describe('createArticleSchema', () => {
  const valid = { article: { title: 'Test', description: 'Desc', body: 'Body content' } };

  test('accepts valid input', () => {
    expect(createArticleSchema.parse(valid)).toBeDefined();
  });

  test('defaults tagList to empty array', () => {
    const result = createArticleSchema.parse(valid);
    expect(result.article.tagList).toEqual([]);
  });

  test('accepts valid tagList', () => {
    const result = createArticleSchema.parse({ article: { ...valid.article, tagList: ['tag1', 'tag2'] } });
    expect(result.article.tagList).toEqual(['tag1', 'tag2']);
  });

  test('rejects empty string tags in tagList', () => {
    const result = createArticleSchema.safeParse({ article: { ...valid.article, tagList: ['valid', ''] } });
    expect(result.success).toBe(false);
  });

  test('rejects empty title', () => {
    const result = createArticleSchema.safeParse({ article: { ...valid.article, title: '' } });
    expect(result.success).toBe(false);
  });

  test('rejects empty description', () => {
    const result = createArticleSchema.safeParse({ article: { ...valid.article, description: '' } });
    expect(result.success).toBe(false);
  });

  test('rejects empty body', () => {
    const result = createArticleSchema.safeParse({ article: { ...valid.article, body: '' } });
    expect(result.success).toBe(false);
  });
});

describe('updateArticleSchema', () => {
  test('accepts empty update (all optional)', () => {
    const result = updateArticleSchema.safeParse({ article: {} });
    expect(result.success).toBe(true);
  });

  test('rejects empty string tags when tagList provided', () => {
    const result = updateArticleSchema.safeParse({ article: { tagList: ['good', '  '] } });
    expect(result.success).toBe(false);
  });

  test('accepts partial update', () => {
    const result = updateArticleSchema.safeParse({ article: { title: 'New title' } });
    expect(result.success).toBe(true);
  });
});
