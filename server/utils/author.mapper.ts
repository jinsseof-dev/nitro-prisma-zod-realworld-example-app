export interface AuthorWithFollowers {
  username: string;
  bio: string | null;
  image: string | null;
  followedBy: { id: number }[];
}

const authorMapper = (author: AuthorWithFollowers, id?: number) => ({
  username: author.username,
  bio: author.bio,
  image: author.image,
  following: id ? author?.followedBy.some((followingUser) => followingUser.id === id) : false,
});

export default authorMapper;
