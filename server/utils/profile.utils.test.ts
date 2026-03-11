import { describe, test, expect } from 'bun:test';
import profileMapper from './profile.utils';

const makeUser = (overrides: any = {}) => ({
  username: 'jake',
  bio: 'I work at statefarm',
  image: 'https://example.com/avatar.png',
  followedBy: [],
  ...overrides,
});

describe('profileMapper', () => {
  test('maps username, bio, image from user object', () => {
    const result = profileMapper(makeUser(), undefined);
    expect(result.username).toBe('jake');
    expect(result.bio).toBe('I work at statefarm');
    expect(result.image).toBe('https://example.com/avatar.png');
  });

  test('following is true when user id is in followedBy', () => {
    const user = makeUser({ followedBy: [{ id: 5 }] });
    const result = profileMapper(user, 5);
    expect(result.following).toBe(true);
  });

  test('following is false when user id is not in followedBy', () => {
    const user = makeUser({ followedBy: [{ id: 5 }] });
    const result = profileMapper(user, 99);
    expect(result.following).toBe(false);
  });

  test('following is false when no user id provided', () => {
    const user = makeUser({ followedBy: [{ id: 5 }] });
    const result = profileMapper(user, undefined);
    expect(result.following).toBe(false);
  });

  test('passes through null bio and null image', () => {
    const user = makeUser({ bio: null, image: null });
    const result = profileMapper(user, undefined);
    expect(result.bio).toBeNull();
    expect(result.image).toBeNull();
  });

  test('following is true when current user is among multiple users in followedBy', () => {
    const user = makeUser({ followedBy: [{ id: 1 }, { id: 2 }, { id: 3 }] });
    const result = profileMapper(user, 2);
    expect(result.following).toBe(true);
  });
});
