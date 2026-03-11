# Data Model Documentation

Prisma v7 + SQLite (libsql 어댑터) 기반 데이터 모델 문서입니다.
스키마 파일: `prisma/schema.prisma`
생성된 클라이언트: `generated/prisma/client`

## ER 다이어그램 (텍스트)

```
User 1──N Article       (UserArticles: author)
User N──N Article       (UserFavorites: favoritedBy)
User 1──N Comment       (authorId, onDelete: Cascade)
User N──N User          (UserFollows: followedBy/following)
Article 1──N Comment    (articleId, onDelete: Cascade)
Article N──N Tag        (implicit join table)
```

---

## 1. User 모델

```prisma
model User {
  id         Int       @id @default(autoincrement())
  email      String    @unique
  username   String    @unique
  password   String
  image      String?
  bio        String?
  articles   Article[] @relation("UserArticles")
  favorites  Article[] @relation("UserFavorites")
  followedBy User[]    @relation("UserFollows")
  following  User[]    @relation("UserFollows")
  comments   Comment[]
}
```

### 필드

| 필드       | 타입    | 제약               | 설명                   |
| ---------- | ------- | ------------------ | ---------------------- |
| `id`       | Int     | PK, auto-increment | 고유 식별자            |
| `email`    | String  | unique             | 이메일 주소            |
| `username` | String  | unique             | 사용자 이름            |
| `password` | String  | —                  | bcrypt 해시된 비밀번호 |
| `image`    | String? | nullable           | 프로필 이미지 URL      |
| `bio`      | String? | nullable           | 자기소개               |

### 관계

| 관계         | 타입      | 관계명          | 설명                               |
| ------------ | --------- | --------------- | ---------------------------------- |
| `articles`   | Article[] | `UserArticles`  | 작성한 아티클 목록                 |
| `favorites`  | Article[] | `UserFavorites` | 즐겨찾기한 아티클 목록             |
| `followedBy` | User[]    | `UserFollows`   | 이 사용자를 팔로우하는 사용자 목록 |
| `following`  | User[]    | `UserFollows`   | 이 사용자가 팔로우하는 사용자 목록 |
| `comments`   | Comment[] | —               | 작성한 댓글 목록                   |

### 자기참조 팔로우 관계

`followedBy`/`following`은 `UserFollows` 관계명을 공유하는 자기참조 다대다(Many-to-Many) 관계입니다:

- Prisma가 implicit 조인 테이블 `_UserFollows`를 자동 생성
- `user.followedBy` = 이 사용자를 팔로우하는 사용자 목록
- `user.following` = 이 사용자가 팔로우하는 사용자 목록

**팔로우/언팔로우 쿼리 패턴**:

```ts
// 팔로우: followedBy에 현재 사용자를 connect
await prisma.user.update({
  where: { username },
  data: { followedBy: { connect: { id: currentUserId } } },
});

// 언팔로우: followedBy에서 현재 사용자를 disconnect
await prisma.user.update({
  where: { username },
  data: { followedBy: { disconnect: { id: currentUserId } } },
});
```

**following 여부 확인** (매퍼에서):

```ts
following: user.followedBy.some((f) => f.id === currentUserId);
```

---

## 2. Article 모델

```prisma
model Article {
  id          Int       @id @default(autoincrement())
  slug        String    @unique
  title       String
  description String
  body        String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @default(now())
  tagList     Tag[]
  author      User      @relation("UserArticles", fields: [authorId], onDelete: Cascade, references: [id])
  authorId    Int
  favoritedBy User[]    @relation("UserFavorites")
  comments    Comment[]
}
```

### 필드

| 필드          | 타입     | 제약               | 설명                                |
| ------------- | -------- | ------------------ | ----------------------------------- |
| `id`          | Int      | PK, auto-increment | 고유 식별자                         |
| `slug`        | String   | unique             | URL 슬러그 (`slugify(title)-uuid8`) |
| `title`       | String   | —                  | 아티클 제목                         |
| `description` | String   | —                  | 아티클 요약                         |
| `body`        | String   | —                  | 아티클 본문                         |
| `createdAt`   | DateTime | default: now()     | 생성 시각                           |
| `updatedAt`   | DateTime | default: now()     | 수정 시각 (수정 시 수동 갱신)       |
| `authorId`    | Int      | FK → User.id       | 작성자 ID                           |

### 관계

| 관계          | 타입      | 설명                                                                    |
| ------------- | --------- | ----------------------------------------------------------------------- |
| `author`      | User      | 작성자 (UserArticles, `onDelete: Cascade` — User 삭제 시 아티클도 삭제) |
| `tagList`     | Tag[]     | 연결된 태그 목록 (implicit 다대다)                                      |
| `favoritedBy` | User[]    | 즐겨찾기한 사용자 목록 (UserFavorites, implicit 다대다)                 |
| `comments`    | Comment[] | 댓글 목록                                                               |

### Slug 유니크 제약

- 생성 시: `slugify(title)` + `-` + `crypto.randomUUID().slice(0, 8)`
- 수정 시 (title 변경): 새 slug 생성
- UUID 8자리 접미사로 유니크 보장, 충돌 시 `handleUniqueConstraintError`가 409 반환

### 태그 다대다 관계 (connectOrCreate 패턴)

Article과 Tag는 implicit 다대다 관계입니다. Prisma가 `_ArticleToTag` 조인 테이블을 자동 관리합니다.

**생성 시**:

```ts
tagList: {
  connectOrCreate: tagList.map((tag) => ({
    create: { name: tag },
    where: { name: tag },
  })),
}
```

**수정 시** (트랜잭션):

```ts
await tx.article.update({
  where: { slug },
  data: { tagList: { set: [] } },  // 1. 기존 태그 모두 해제
});
return tx.article.update({
  where: { slug },
  data: {
    tagList: {
      connectOrCreate: newTags.map(...),  // 2. 새 태그 연결
    },
  },
});
```

---

## 3. Comment 모델

```prisma
model Comment {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  updatedAt DateTime @default(now())
  body      String
  article   Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)
  articleId Int
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  authorId  Int
}
```

### 필드

| 필드        | 타입     | 제약               | 설명           |
| ----------- | -------- | ------------------ | -------------- |
| `id`        | Int      | PK, auto-increment | 고유 식별자    |
| `createdAt` | DateTime | default: now()     | 생성 시각      |
| `updatedAt` | DateTime | default: now()     | 수정 시각      |
| `body`      | String   | —                  | 댓글 본문      |
| `articleId` | Int      | FK → Article.id    | 소속 아티클 ID |
| `authorId`  | Int      | FK → User.id       | 작성자 ID      |

### Cascade 삭제 동작

Comment 모델에는 두 개의 `onDelete: Cascade` 설정이 있습니다:

| 부모 삭제    | 동작                   | 설명                                                |
| ------------ | ---------------------- | --------------------------------------------------- |
| Article 삭제 | 관련 Comment 자동 삭제 | `article Article @relation(..., onDelete: Cascade)` |
| User 삭제    | 관련 Comment 자동 삭제 | `author User @relation(..., onDelete: Cascade)`     |

즉, 아티클이 삭제되면 해당 아티클의 모든 댓글이 자동으로 삭제됩니다. 마찬가지로 사용자가 삭제되면 해당 사용자가 작성한 모든 댓글이 자동으로 삭제됩니다.

---

## 4. Tag 모델

```prisma
model Tag {
  id       Int       @id @default(autoincrement())
  name     String    @unique
  articles Article[]
}
```

### 필드

| 필드   | 타입   | 제약               | 설명        |
| ------ | ------ | ------------------ | ----------- |
| `id`   | Int    | PK, auto-increment | 고유 식별자 |
| `name` | String | unique             | 태그 이름   |

### 관계

| 관계       | 타입      | 설명                                           |
| ---------- | --------- | ---------------------------------------------- |
| `articles` | Article[] | 이 태그가 연결된 아티클 목록 (implicit 다대다) |

### 태그 생성 패턴

태그는 독립적으로 생성되지 않습니다. 아티클 생성/수정 시 `connectOrCreate` 패턴으로 필요에 따라 자동 생성됩니다. `name`의 유니크 제약이 중복 태그 생성을 방지합니다.

### 태그 조회 (GET /api/tags)

하나 이상의 아티클에 연결된 태그만 반환합니다:

```ts
await prisma.tag.findMany({
  where: { articles: { some: {} } }, // 아티클이 있는 태그만
  orderBy: { articles: { _count: 'desc' } }, // 아티클 수 내림차순
  take: 10, // 최대 10개
});
```

---

## 5. 응답 매퍼

Prisma 쿼리 결과를 RealWorld API 응답 형식으로 변환하는 매퍼 함수들입니다.

### articleMapper

**파일**: `server/utils/article.mapper.ts`

```ts
const articleMapper = (article: any, id?: number) => ({
  slug: article.slug,
  title: article.title,
  description: article.description,
  body: article.body,
  tagList: article.tagList.map((tag: any) => tag.name),
  createdAt: article.createdAt,
  updatedAt: article.updatedAt,
  favorited: article.favoritedBy.some((item: any) => item.id === id),
  favoritesCount: article._count.favoritedBy,
  author: authorMapper(article.author, id),
});
```

**변환 내용**:

| 원본 (Prisma)            | 변환 후 (API)            | 설명                               |
| ------------------------ | ------------------------ | ---------------------------------- |
| `tagList: [{name: "x"}]` | `tagList: ["x"]`         | Tag 객체 배열 → 이름 문자열 배열   |
| `favoritedBy: [...]`     | `favorited: boolean`     | 현재 사용자가 포함되어 있는지 여부 |
| `_count.favoritedBy`     | `favoritesCount: number` | 즐겨찾기 수                        |
| `author: {...}`          | `author: {...}`          | `authorMapper`로 변환              |

### authorMapper

**파일**: `server/utils/author.mapper.ts`

```ts
const authorMapper = (author: any, id?: number) => ({
  username: author.username,
  bio: author.bio,
  image: author.image,
  following: id ? author?.followedBy.some((f) => f.id === id) : false,
});
```

Article 응답 내 중첩된 `author` 객체를 생성합니다. `articleMapper` 내부에서 호출됩니다.

### profileMapper

**파일**: `server/utils/profile.utils.ts`

```ts
const profileMapper = (user: any, id: number | undefined): Profile => ({
  username: user.username,
  bio: user.bio,
  image: user.image,
  following: id ? user?.followedBy.some((f) => f.id === id) : false,
});
```

프로필 조회 및 팔로우/언팔로우 응답에 사용됩니다.

### authorMapper vs profileMapper

두 매퍼는 동일한 필드(`username`, `bio`, `image`, `following`)를 반환하지만 용도가 다릅니다:

| 구분              | authorMapper                                       | profileMapper                                                           |
| ----------------- | -------------------------------------------------- | ----------------------------------------------------------------------- |
| **반환 타입**     | 일반 객체                                          | `Profile` 타입                                                          |
| **사용 위치**     | `articleMapper` 내부 (아티클 응답의 `author` 필드) | 프로필 엔드포인트 (`GET /api/profiles/:username`, `POST/DELETE follow`) |
| **`id` 파라미터** | `id?: number` (선택적)                             | `id: number \| undefined`                                               |
| **호출 주체**     | `articleMapper`가 자동 호출                        | 라우트 핸들러에서 직접 호출                                             |
