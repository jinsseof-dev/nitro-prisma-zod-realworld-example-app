import { Profile } from '~/models/profile.model';
import { AuthorWithFollowers } from './author.mapper';

const profileMapper = (user: AuthorWithFollowers, id: number | undefined): Profile => ({
  username: user.username,
  bio: user.bio,
  image: user.image,
  following: id ? user?.followedBy.some((followingUser) => followingUser.id === id) : false,
});

export default profileMapper;
