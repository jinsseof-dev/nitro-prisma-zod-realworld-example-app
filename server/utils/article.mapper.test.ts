import { describe, test, expect } from 'bun:test';
import articleMapper from './article.mapper';

const makeArticle = (overrides: any = {}) => ({
  slug: 'test-article',
  title: 'Test Article',
  description: 'A test article',
  body: 'Article body content',
  tagList: [{ name: 'typescript' }, { name: 'testing' }],
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-02'),
  favoritedBy: [],
  _count: { favoritedBy: 0 },
  author: {
    username: 'jake',
    bio: 'bio',
    image: 'https://example.com/avatar.png',
    followedBy: [],
  },
  ...overrides,
});

describe('articleMapper', () => {
  test('maps tagList to array of name strings', () => {
    const result = articleMapper(makeArticle());
    expect(result.tagList).toEqual(['typescript', 'testing']);
  });

  test('maps basic fields correctly', () => {
    const result = articleMapper(makeArticle());
    expect(result.slug).toBe('test-article');
    expect(result.title).toBe('Test Article');
    expect(result.description).toBe('A test article');
    expect(result.body).toBe('Article body content');
  });

  test('sets favorited true when user id is in favoritedBy', () => {
    const article = makeArticle({ favoritedBy: [{ id: 5 }] });
    const result = articleMapper(article, 5);
    expect(result.favorited).toBe(true);
  });

  test('sets favorited false when user id is not in favoritedBy', () => {
    const article = makeArticle({ favoritedBy: [{ id: 5 }] });
    const result = articleMapper(article, 99);
    expect(result.favorited).toBe(false);
  });

  test('sets favorited false when no user id provided', () => {
    const article = makeArticle({ favoritedBy: [{ id: 5 }] });
    const result = articleMapper(article);
    expect(result.favorited).toBe(false);
  });

  test('maps favoritesCount from _count.favoritedBy', () => {
    const article = makeArticle({ _count: { favoritedBy: 42 } });
    const result = articleMapper(article);
    expect(result.favoritesCount).toBe(42);
  });

  test('includes author mapping with following status', () => {
    const article = makeArticle({
      author: {
        username: 'jake',
        bio: 'bio',
        image: 'img.png',
        followedBy: [{ id: 10 }],
      },
    });
    const result = articleMapper(article, 10);
    expect(result.author.username).toBe('jake');
    expect(result.author.following).toBe(true);
  });

  test('maps empty tagList to empty array', () => {
    const article = makeArticle({ tagList: [] });
    const result = articleMapper(article);
    expect(result.tagList).toEqual([]);
  });

  test('sets favorited true when current user is among multiple users in favoritedBy', () => {
    const article = makeArticle({ favoritedBy: [{ id: 1 }, { id: 2 }, { id: 3 }] });
    const result = articleMapper(article, 2);
    expect(result.favorited).toBe(true);
  });

  test('passes createdAt and updatedAt through unchanged', () => {
    const createdAt = new Date('2024-06-15T10:00:00Z');
    const updatedAt = new Date('2025-12-31T23:59:59Z');
    const article = makeArticle({ createdAt, updatedAt });
    const result = articleMapper(article);
    expect(result.createdAt).toBe(createdAt);
    expect(result.updatedAt).toBe(updatedAt);
  });
});
