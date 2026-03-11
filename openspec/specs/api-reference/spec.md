# API Reference

RealWorld 스펙을 따르는 API 엔드포인트 레퍼런스입니다. 모든 엔드포인트는 `/api` 접두사를 가집니다.

## 공통 사항

### 인증

- 인증이 필요한 엔드포인트는 `Authorization` 헤더에 JWT 토큰을 포함해야 합니다.
- 형식: `Authorization: Token <jwt>` 또는 `Authorization: Bearer <jwt>`
- 선택적 인증 엔드포인트는 토큰 없이도 접근 가능하지만, 토큰이 있으면 `favorited`, `following` 등의 필드가 현재 사용자 기준으로 계산됩니다.

### 에러 응답 형식

```json
{
  "errors": {
    "fieldName": ["error message"]
  }
}
```

### 공통 상태 코드

| 코드 | 의미                 | 사용 상황                      |
| ---- | -------------------- | ------------------------------ |
| 200  | OK                   | 기본 성공 응답                 |
| 201  | Created              | 리소스 생성 성공               |
| 204  | No Content           | 삭제 성공                      |
| 401  | Unauthorized         | 토큰 누락/만료/유효하지 않음   |
| 403  | Forbidden            | 권한 없음 (본인 리소스가 아님) |
| 404  | Not Found            | 리소스를 찾을 수 없음          |
| 409  | Conflict             | 유니크 제약 위반 (중복 데이터) |
| 422  | Unprocessable Entity | 입력 검증 실패                 |

---

## 1. 사용자 인증 API

### POST /api/users — 사용자 등록

- **인증**: 불필요
- **파일**: `server/routes/api/users/index.post.ts`
- **Zod 스키마**: `registerUserSchema`

**요청 본문**:

```json
{
  "user": {
    "username": "jacob",
    "email": "jake@jake.jake",
    "password": "jakejake",
    "image": "https://example.com/photo.jpg",
    "bio": "I like trains"
  }
}
```

- `username`, `email`, `password`: 필수 (빈 문자열 불가)
- `image`, `bio`: 선택

**성공 응답** (201):

```json
{
  "user": {
    "email": "jake@jake.jake",
    "username": "jacob",
    "bio": null,
    "image": null,
    "token": "jwt.token.here"
  }
}
```

**에러 응답**:

- 422: 입력 검증 실패 (`"can't be blank"`)
- 409: email 또는 username 중복 (`"has already been taken"`)

### POST /api/users/login — 로그인

- **인증**: 불필요
- **파일**: `server/routes/api/users/login.post.ts`
- **Zod 스키마**: `loginUserSchema`

**요청 본문**:

```json
{
  "user": {
    "email": "jake@jake.jake",
    "password": "jakejake"
  }
}
```

**성공 응답** (200):

```json
{
  "user": {
    "email": "jake@jake.jake",
    "username": "jacob",
    "bio": null,
    "image": null,
    "token": "jwt.token.here"
  }
}
```

**에러 응답**:

- 401: 이메일 또는 비밀번호 불일치 (`credentials: ["invalid"]`)
- 422: 입력 검증 실패

### GET /api/user — 현재 사용자 조회

- **인증**: 필수
- **파일**: `server/routes/api/user/index.get.ts`

**성공 응답** (200):

```json
{
  "user": {
    "email": "jake@jake.jake",
    "username": "jacob",
    "bio": "I like trains",
    "image": "https://example.com/photo.jpg",
    "token": "jwt.token.here"
  }
}
```

### PUT /api/user — 현재 사용자 수정

- **인증**: 필수
- **파일**: `server/routes/api/user/index.put.ts`
- **Zod 스키마**: `updateUserSchema`

**요청 본문** (모든 필드 선택적):

```json
{
  "user": {
    "email": "jake@jake.jake",
    "username": "jacob",
    "password": "newpassword",
    "image": "https://example.com/new-photo.jpg",
    "bio": "Updated bio"
  }
}
```

- `image`, `bio`: 빈 문자열(`""`)은 `null`로 변환
- `password`: 전달 시 bcrypt로 재해싱

**성공 응답** (200): 사용자 등록 응답과 동일한 형식
**에러 응답**: 409 (email/username 중복)

---

## 2. 아티클 CRUD API

### GET /api/articles — 아티클 목록 조회

- **인증**: 선택적
- **파일**: `server/routes/api/articles/index.get.ts`

**쿼리 파라미터**:

| 파라미터    | 타입   | 설명                                | 기본값 |
| ----------- | ------ | ----------------------------------- | ------ |
| `tag`       | string | 태그로 필터                         | —      |
| `author`    | string | 작성자 username으로 필터            | —      |
| `favorited` | string | 즐겨찾기한 사용자 username으로 필터 | —      |
| `limit`     | number | 반환 개수 제한                      | 10     |
| `offset`    | number | 건너뛸 개수                         | 0      |

**성공 응답** (200):

```json
{
  "articles": [
    {
      "slug": "how-to-train-your-dragon-a1b2c3d4",
      "title": "How to train your dragon",
      "description": "Ever wonder how?",
      "body": "...",
      "tagList": ["dragons", "training"],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "favorited": false,
      "favoritesCount": 0,
      "author": {
        "username": "jacob",
        "bio": null,
        "image": null,
        "following": false
      }
    }
  ],
  "articlesCount": 1
}
```

- 목록 조회 시 `body` 필드는 제외됨 (`omit: { body: true }`)
- `tagList`는 이름 오름차순 정렬
- 결과는 `createdAt` 내림차순 정렬

### GET /api/articles/feed — 팔로우 피드

- **인증**: 필수
- **파일**: `server/routes/api/articles/feed.get.ts`

**쿼리 파라미터**: `limit` (기본 10), `offset` (기본 0)

현재 사용자가 팔로우하는 작성자의 아티클만 반환합니다. 응답 형식은 목록 조회와 동일합니다.

### POST /api/articles — 아티클 생성

- **인증**: 필수
- **파일**: `server/routes/api/articles/index.post.ts`
- **Zod 스키마**: `createArticleSchema`

**요청 본문**:

```json
{
  "article": {
    "title": "How to train your dragon",
    "description": "Ever wonder how?",
    "body": "You have to believe",
    "tagList": ["reactjs", "angularjs", "dragons"]
  }
}
```

- `title`, `description`, `body`: 필수
- `tagList`: 선택 (기본값 `[]`)

**Slug 생성**: `slugify(title)` + `-` + `crypto.randomUUID().slice(0, 8)`
**태그 처리**: Prisma `connectOrCreate` — 태그가 없으면 생성, 있으면 연결

**성공 응답** (201): 단일 아티클 객체 (목록의 아티클과 동일한 형식)
**에러 응답**: 422 (검증 실패), 409 (slug 충돌)

### GET /api/articles/:slug — 아티클 단건 조회

- **인증**: 선택적
- **파일**: `server/routes/api/articles/[slug]/index.get.ts`

**성공 응답** (200): 단일 아티클 객체
**에러 응답**: 404 (아티클 없음)

### PUT /api/articles/:slug — 아티클 수정

- **인증**: 필수 (본인 아티클만)
- **파일**: `server/routes/api/articles/[slug]/index.put.ts`
- **Zod 스키마**: `updateArticleSchema`

**요청 본문** (모든 필드 선택적):

```json
{
  "article": {
    "title": "Updated title",
    "description": "Updated description",
    "body": "Updated body",
    "tagList": ["new-tag"]
  }
}
```

- `title` 변경 시 새로운 slug 생성
- `tagList` 전달 시 기존 태그를 모두 해제(`set: []`) 후 새 태그를 `connectOrCreate`로 연결 (트랜잭션 내)
- `updatedAt`이 현재 시간으로 갱신

**에러 응답**: 403 (작성자가 아님), 404 (아티클 없음), 409 (slug 충돌)

### DELETE /api/articles/:slug — 아티클 삭제

- **인증**: 필수 (본인 아티클만)
- **파일**: `server/routes/api/articles/[slug]/index.delete.ts`

**성공 응답**: 204 (No Content)
**에러 응답**: 403 (작성자가 아님), 404 (아티클 없음)

---

## 3. 댓글 API

### GET /api/articles/:slug/comments — 댓글 목록 조회

- **인증**: 선택적
- **파일**: `server/routes/api/articles/[slug]/comments/index.get.ts`

**성공 응답** (200):

```json
{
  "comments": [
    {
      "id": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "body": "It takes a Jacobian",
      "author": {
        "username": "jacob",
        "bio": null,
        "image": null,
        "following": false
      }
    }
  ]
}
```

**에러 응답**: 404 (아티클 없음)

### POST /api/articles/:slug/comments — 댓글 작성

- **인증**: 필수
- **파일**: `server/routes/api/articles/[slug]/comments/index.post.ts`
- **Zod 스키마**: `createCommentSchema`

**요청 본문**:

```json
{
  "comment": {
    "body": "His name was my name too."
  }
}
```

**성공 응답** (201): 단일 댓글 객체
**에러 응답**: 404 (아티클 없음), 422 (검증 실패)

### DELETE /api/articles/:slug/comments/:id — 댓글 삭제

- **인증**: 필수 (본인 댓글만)
- **파일**: `server/routes/api/articles/[slug]/comments/[id].delete.ts`

**성공 응답**: 204 (No Content)
**에러 응답**: 403 (작성자가 아님), 404 (아티클 또는 댓글 없음)

---

## 4. 프로필 및 팔로우 API

### GET /api/profiles/:username — 프로필 조회

- **인증**: 선택적
- **파일**: `server/routes/api/profiles/[username]/index.get.ts`

**성공 응답** (200):

```json
{
  "profile": {
    "username": "jacob",
    "bio": "I like trains",
    "image": "https://example.com/photo.jpg",
    "following": false
  }
}
```

- `following`: 현재 사용자가 이 프로필을 팔로우하는지 여부 (비인증 시 `false`)

**에러 응답**: 404 (사용자 없음)

### POST /api/profiles/:username/follow — 팔로우

- **인증**: 필수
- **파일**: `server/routes/api/profiles/[username]/follow/index.post.ts`

Prisma `connect`를 사용하여 `followedBy` 관계에 현재 사용자를 추가합니다.

**성공 응답** (200): 프로필 객체 (`following: true`)
**에러 응답**: 404 (사용자 없음)

### DELETE /api/profiles/:username/follow — 언팔로우

- **인증**: 필수
- **파일**: `server/routes/api/profiles/[username]/follow/index.delete.ts`

Prisma `disconnect`를 사용하여 `followedBy` 관계에서 현재 사용자를 제거합니다.

**성공 응답** (200): 프로필 객체 (`following: false`)
**에러 응답**: 404 (사용자 없음)

---

## 5. 즐겨찾기 및 태그 API

### POST /api/articles/:slug/favorite — 즐겨찾기 추가

- **인증**: 필수
- **파일**: `server/routes/api/articles/[slug]/favorite/index.post.ts`

Prisma `connect`를 사용하여 `favoritedBy` 관계에 현재 사용자를 추가합니다.

**성공 응답** (200): 아티클 객체 (`favorited: true`, `favoritesCount` 증가)
**에러 응답**: 404 (아티클 없음)

### DELETE /api/articles/:slug/favorite — 즐겨찾기 해제

- **인증**: 필수
- **파일**: `server/routes/api/articles/[slug]/favorite/index.delete.ts`

Prisma `disconnect`를 사용하여 `favoritedBy` 관계에서 현재 사용자를 제거합니다.

**성공 응답** (200): 아티클 객체 (`favorited: false`, `favoritesCount` 감소)
**에러 응답**: 404 (아티클 없음)

### GET /api/tags — 태그 목록 조회

- **인증**: 선택적
- **파일**: `server/routes/api/tags/index.get.ts`

하나 이상의 아티클에 연결된 태그만 반환합니다. 아티클 수 기준 내림차순 정렬, 최대 10개.

**성공 응답** (200):

```json
{
  "tags": ["reactjs", "angularjs", "dragons"]
}
```
