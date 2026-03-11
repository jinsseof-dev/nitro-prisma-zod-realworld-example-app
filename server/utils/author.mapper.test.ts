import { describe, test, expect } from 'bun:test';
import authorMapper from './author.mapper';

const makeAuthor = (overrides: any = {}) => ({
  username: 'jake',
  bio: 'I work at statefarm',
  image: 'https://example.com/avatar.png',
  followedBy: [],
  ...overrides,
});

describe('authorMapper', () => {
  test('maps username, bio, image from author object', () => {
    const result = authorMapper(makeAuthor());
    expect(result.username).toBe('jake');
    expect(result.bio).toBe('I work at statefarm');
    expect(result.image).toBe('https://example.com/avatar.png');
  });

  test('following is true when user id is in followedBy', () => {
    const author = makeAuthor({ followedBy: [{ id: 5 }] });
    const result = authorMapper(author, 5);
    expect(result.following).toBe(true);
  });

  test('following is false when user id is not in followedBy', () => {
    const author = makeAuthor({ followedBy: [{ id: 5 }] });
    const result = authorMapper(author, 99);
    expect(result.following).toBe(false);
  });

  test('following is false when no user id provided', () => {
    const author = makeAuthor({ followedBy: [{ id: 5 }] });
    const result = authorMapper(author);
    expect(result.following).toBe(false);
  });

  test('passes through null bio and null image', () => {
    const author = makeAuthor({ bio: null, image: null });
    const result = authorMapper(author);
    expect(result.bio).toBeNull();
    expect(result.image).toBeNull();
  });

  test('following is true when current user is among multiple users in followedBy', () => {
    const author = makeAuthor({ followedBy: [{ id: 1 }, { id: 2 }, { id: 3 }] });
    const result = authorMapper(author, 2);
    expect(result.following).toBe(true);
  });
});
