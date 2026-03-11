import { definePrivateEventHandler } from '~/auth-event-handler';
import HttpException from '~/models/http-exception.model';

export default definePrivateEventHandler(async (event, { auth }) => {
  const user = await usePrisma().user.findUnique({
    where: {
      id: auth!.id,
    },
    select: {
      id: true,
      email: true,
      username: true,
      bio: true,
      image: true,
    },
  });

  if (!user) {
    throw new HttpException(404, { errors: { user: ['not found'] } });
  }

  return {
    user: {
      ...user,
      token: useGenerateToken(user.id),
    },
  };
});
