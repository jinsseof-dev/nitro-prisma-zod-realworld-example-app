import articleMapper from '~/utils/article.mapper';
import { definePrivateEventHandler } from '~/auth-event-handler';

export default definePrivateEventHandler(
  async (event, { auth }) => {
    const query = getQuery(event);

    const andQueries = buildFindAllQuery(query, auth);
    const { skip, take } = parsePagination(query as { offset?: string; limit?: string });
    const articlesCount = await usePrisma().article.count({
      where: {
        AND: andQueries,
      },
    });

    const articles = await usePrisma().article.findMany({
      omit: {
        body: true,
      },
      where: { AND: andQueries },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
      include: {
        tagList: {
          orderBy: {
            name: 'asc',
          },
          select: {
            name: true,
          },
        },
        author: {
          select: {
            username: true,
            image: true,
            followedBy: { select: { id: true } },
          },
        },
        favoritedBy: { select: { id: true } },
        _count: {
          select: {
            favoritedBy: true,
          },
        },
      },
    });

    return {
      articles: articles.map((article) => articleMapper(article, auth?.id)),
      articlesCount,
    };
  },
  { requireAuth: false },
);

const buildFindAllQuery = (query: Record<string, string>, auth: { id: number } | undefined) => {
  const queries: object[] = [];

  if ('author' in query) {
    queries.push({
      author: {
        username: {
          equals: query.author,
        },
      },
    });
  }

  if ('tag' in query) {
    queries.push({
      tagList: {
        some: {
          name: query.tag,
        },
      },
    });
  }

  if ('favorited' in query) {
    queries.push({
      favoritedBy: {
        some: {
          username: {
            equals: query.favorited,
          },
        },
      },
    });
  }

  return queries;
};
