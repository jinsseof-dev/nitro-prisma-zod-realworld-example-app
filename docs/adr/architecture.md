# Architecture Documentation

이 문서는 Nitro + Prisma + Zod + Bun 기반 RealWorld API의 아키텍처를 설명합니다.

## 1. Nitro 프레임워크 구조

### 프레임워크 설정

`nitro.config.ts`에서 Nitro를 구성합니다:

```ts
export default defineNitroConfig({
  preset: 'bun', // Bun 런타임 사용
  srcDir: 'server', // 소스 디렉토리
  errorHandler: '~/error-handler', // 전역 에러 핸들러
  routeRules: {
    '/api/**': { cors: true, headers: { 'access-control-allow-methods': '*' } },
  },
});
```

- **경로 별칭**: `~/`는 `server/` 디렉토리로 해석됩니다 (예: `~/utils/validate` → `server/utils/validate.ts`)
- **TypeScript**: 생성된 `.nitro/types/tsconfig.json`을 확장. 타입을 위해 먼저 `make setup` 실행 필요

### 파일 기반 라우팅

라우트 파일은 `server/routes/api/` 하위에 배치되며, Nitro의 파일 기반 라우팅 규칙을 따릅니다:

| 패턴               | 설명                         | 예시                                                             |
| ------------------ | ---------------------------- | ---------------------------------------------------------------- |
| `index.get.ts`     | GET 요청 핸들러              | `articles/index.get.ts` → `GET /api/articles`                    |
| `index.post.ts`    | POST 요청 핸들러             | `articles/index.post.ts` → `POST /api/articles`                  |
| `index.put.ts`     | PUT 요청 핸들러              | `user/index.put.ts` → `PUT /api/user`                            |
| `index.delete.ts`  | DELETE 요청 핸들러           | `articles/[slug]/index.delete.ts` → `DELETE /api/articles/:slug` |
| `[param]`          | 동적 세그먼트                | `[slug]`, `[username]`, `[id]`                                   |
| `[...].options.ts` | 와일드카드 CORS 프리플라이트 | 모든 `/api/**` OPTIONS 요청 처리                                 |

#### 현재 라우트 구조

```
server/routes/api/
├── [...].options.ts                              # CORS 프리플라이트 (모든 /api/**)
├── articles/
│   ├── index.get.ts                              # GET    /api/articles
│   ├── index.post.ts                             # POST   /api/articles
│   ├── feed.get.ts                               # GET    /api/articles/feed
│   └── [slug]/
│       ├── index.get.ts                          # GET    /api/articles/:slug
│       ├── index.put.ts                          # PUT    /api/articles/:slug
│       ├── index.delete.ts                       # DELETE /api/articles/:slug
│       ├── comments/
│       │   ├── index.get.ts                      # GET    /api/articles/:slug/comments
│       │   ├── index.post.ts                     # POST   /api/articles/:slug/comments
│       │   └── [id].delete.ts                    # DELETE /api/articles/:slug/comments/:id
│       └── favorite/
│           ├── index.post.ts                     # POST   /api/articles/:slug/favorite
│           └── index.delete.ts                   # DELETE /api/articles/:slug/favorite
├── profiles/
│   └── [username]/
│       ├── index.get.ts                          # GET    /api/profiles/:username
│       └── follow/
│           ├── index.post.ts                     # POST   /api/profiles/:username/follow
│           └── index.delete.ts                   # DELETE /api/profiles/:username/follow
├── tags/
│   └── index.get.ts                              # GET    /api/tags
├── user/
│   ├── index.get.ts                              # GET    /api/user
│   └── index.put.ts                              # PUT    /api/user
└── users/
    ├── index.post.ts                             # POST   /api/users
    └── login.post.ts                             # POST   /api/users/login
```

### CORS 핸들러

`server/routes/api/[...].options.ts`는 모든 `/api/**` 경로의 OPTIONS 프리플라이트 요청을 처리합니다:

```ts
export default defineEventHandler(async (event) => {
  setResponseStatus(event, 200);
  return '';
});
```

`nitro.config.ts`의 `routeRules`에서 CORS 헤더가 자동 설정되므로, OPTIONS 핸들러는 단순히 200을 반환합니다.

## 2. Nitro Auto-Imports

Nitro는 여러 함수를 자동으로 임포트합니다. import 문 없이 전역으로 사용 가능합니다.

### Nitro/H3 내장 함수

| 함수                                         | 역할                      | 사용 예시                             |
| -------------------------------------------- | ------------------------- | ------------------------------------- |
| `defineEventHandler(handler)`                | 라우트 핸들러 정의        | 모든 공개 라우트에서 사용             |
| `createError({status, statusMessage, data})` | Nitro 에러 생성           | 인증/토큰 에러에 사용                 |
| `readBody(event)`                            | 요청 본문 파싱            | POST/PUT 핸들러에서 JSON 본문 읽기    |
| `getHeader(event, name)`                     | 요청 헤더 값 조회         | `Authorization` 헤더 추출             |
| `getRouterParam(event, name)`                | 동적 라우트 파라미터 조회 | `slug`, `username`, `id` 추출         |
| `getQuery(event)`                            | 쿼리 파라미터 객체 조회   | `limit`, `offset`, `tag`, `author` 등 |
| `setResponseStatus(event, code)`             | 응답 상태 코드 설정       | `201` (생성), `204` (삭제)            |
| `setResponseHeader(event, name, value)`      | 응답 헤더 설정            | `content-type` 설정                   |
| `send(event, body)`                          | 응답 본문 전송            | 에러 핸들러에서 JSON 문자열 전송      |

### 프로젝트 커스텀 자동 임포트 (`server/utils/`)

`server/utils/` 디렉토리의 `use*` 접두사 함수와 내보내기된 함수는 Nitro가 자동 임포트합니다:

| 함수                                          | 파일                | 역할                                          |
| --------------------------------------------- | ------------------- | --------------------------------------------- |
| `usePrisma()`                                 | `prisma.ts`         | Prisma 클라이언트 싱글턴 반환 (libsql 어댑터) |
| `useGenerateToken(id)`                        | `generate-token.ts` | JWT 토큰 생성 (60일 만료)                     |
| `useVerifyToken(token)`                       | `verify-token.ts`   | JWT 토큰 검증, `{id: number}` 반환            |
| `useHashPassword(password)`                   | `hash-password.ts`  | bcrypt로 비밀번호 해싱                        |
| `useDecrypt(input, password)`                 | `hash-password.ts`  | bcrypt로 비밀번호 비교                        |
| `validateBody(schema, body)`                  | `validate.ts`       | Zod 스키마로 요청 본문 검증                   |
| `handleUniqueConstraintError(e, fieldErrors)` | `prisma-errors.ts`  | Prisma P2002 유니크 제약 에러 처리            |

> **ESLint 참고**: `eslint.config.mjs`에서 `nitroGlobals` 객체에 자동 임포트 함수를 글로벌로 선언해야 합니다. 새로운 자동 임포트를 추가할 때 이 객체를 업데이트하세요.

## 3. 인증 패턴

### `definePrivateEventHandler`

`server/auth-event-handler.ts`에서 정의된 인증 래퍼입니다. `defineEventHandler`를 감싸서 JWT 인증을 처리합니다.

```ts
export function definePrivateEventHandler<T>(
  handler: (event: H3Event, cxt: PrivateContext) => T,
  options: { requireAuth: boolean } = { requireAuth: true },
);
```

#### 인증 흐름

1. `Authorization` 헤더에서 토큰 추출 (`Token <jwt>` 또는 `Bearer <jwt>` 형식)
2. `requireAuth` 옵션에 따라 동작 분기:

| `requireAuth`   | 토큰 있음                                | 토큰 없음           |
| --------------- | ---------------------------------------- | ------------------- |
| `true` (기본값) | `useVerifyToken()` → `{auth: {id}}` 전달 | 401 에러 발생       |
| `false`         | `useVerifyToken()` → `{auth: {id}}` 전달 | `{auth: null}` 전달 |

#### 사용 패턴

**인증 필수** (기본값):

```ts
export default definePrivateEventHandler(async (event, { auth }) => {
  // auth.id는 항상 유효한 숫자
  const userId = auth.id;
});
```

**선택적 인증**:

```ts
export default definePrivateEventHandler(
  async (event, { auth }) => {
    // auth가 null일 수 있음
    const userId = auth?.id;
  },
  { requireAuth: false },
);
```

#### 인증이 필요한 엔드포인트 목록

- **필수**: POST articles, PUT/DELETE articles/:slug, POST/DELETE comments, POST/DELETE follow, POST/DELETE favorite, GET/PUT user
- **선택**: GET articles, GET articles/:slug, GET comments, GET profiles/:username, GET tags

### JWT 토큰

- **생성**: `useGenerateToken(id)` — `jsonwebtoken`으로 `{user: {id}}` 페이로드 서명, 60일 만료
- **검증**: `useVerifyToken(token)` — 토큰 디코딩 후 `{id: number}` 반환
- **시크릿**: `JWT_SECRET` 환경 변수 (필수)
- **에러**: 만료 시 `401` with `{ errors: { token: ['has expired'] } }`, 유효하지 않은 토큰 시 `401` with `{ errors: { token: ['is invalid'] } }`

## 4. 요청-응답 데이터 흐름

모든 라우트 핸들러는 다음 파이프라인을 따릅니다:

```
요청 → [인증] → 검증 → Prisma 쿼리 → 매퍼 → 응답
```

### 단계별 설명

#### 1단계: 인증 (선택적)

`definePrivateEventHandler`가 JWT 토큰을 검증하고 `{auth: {id}}` 컨텍스트를 전달합니다.

#### 2단계: 검증 (Zod)

`validateBody(zodSchema, body)`로 요청 본문을 검증합니다:

```ts
const { article } = validateBody(createArticleSchema, await readBody(event));
```

- 스키마는 `server/schemas/` 디렉토리에 정의
- 검증 실패 시 `HttpException(422)` 발생, 필드별 에러 메시지 포함

| 스키마                | 파일                | 용도             |
| --------------------- | ------------------- | ---------------- |
| `registerUserSchema`  | `user.schema.ts`    | 사용자 등록      |
| `loginUserSchema`     | `user.schema.ts`    | 로그인           |
| `updateUserSchema`    | `user.schema.ts`    | 사용자 정보 수정 |
| `createArticleSchema` | `article.schema.ts` | 아티클 생성      |
| `updateArticleSchema` | `article.schema.ts` | 아티클 수정      |
| `createCommentSchema` | `comment.schema.ts` | 댓글 생성        |

#### 3단계: 데이터베이스 (Prisma)

`usePrisma()` 싱글턴으로 Prisma 쿼리 실행:

- **싱글턴**: `PrismaClient`를 한 번만 생성, 이후 재사용
- **어댑터**: `PrismaLibSql` — SQLite 데이터베이스 사용
- **DATABASE_URL**: 기본값 `file:./dev.db`

#### 4단계: 응답 매핑

Prisma 결과를 RealWorld API 형식으로 변환하는 매퍼 함수 사용:

- `articleMapper(article, userId?)` — 아티클 응답 변환
- `authorMapper(author, userId?)` — 작성자 정보 변환
- `profileMapper(user, userId?)` — 프로필 정보 변환

## 5. 에러 처리 패턴

`server/error-handler.ts`에서 전역 에러 핸들러가 두 가지 타입의 에러를 처리합니다.

### HttpException

`server/models/http-exception.model.ts`에 정의된 커스텀 에러 클래스:

```ts
class HttpException extends Error {
  errorCode: number;
  constructor(
    errorCode: number,
    public readonly message: string | any,
  ) {
    super(message);
    this.errorCode = errorCode;
  }
}
```

**사용 패턴**:

```ts
// 404 Not Found
throw new HttpException(404, { errors: { article: ['not found'] } });

// 403 Forbidden
throw new HttpException(403, { errors: { article: ['forbidden'] } });

// 401 Unauthorized
throw new HttpException(401, { errors: { credentials: ['invalid'] } });

// 422 Validation Error (validateBody 내부에서 자동 생성)
throw new HttpException(422, { errors: { title: ["can't be blank"] } });
```

### createError (Nitro 내장)

인증/토큰 관련 에러에 사용됩니다:

```ts
throw createError({
  status: 401,
  statusMessage: 'Unauthorized',
  data: { errors: { token: ['is missing'] } },
});
```

### handleUniqueConstraintError

Prisma P2002 (유니크 제약 위반) 에러를 처리하는 유틸리티:

```ts
try {
  await usePrisma().user.create({ data: { email, username, ... } });
} catch (e) {
  handleUniqueConstraintError(e, {
    email: ['has already been taken'],
    username: ['has already been taken'],
  });
  throw e;
}
```

- P2002 에러가 아닌 경우 아무 동작 없이 반환 (원래 에러가 `throw e`로 전파)
- P2002인 경우 위반된 필드에 해당하는 에러 메시지로 `HttpException(409)` 발생
- 위반 필드가 `fieldErrors`에 없으면 모든 에러 메시지 반환

### 에러 핸들러 동작 흐름

```
에러 발생
  ├── HttpException → statusCode = errorCode, body = message
  ├── Nitro Error (statusCode + data) → statusCode = error.statusCode, body = error.data
  └── 기타 → 처리하지 않음 (Nitro 기본 에러 핸들러로 전달)
```

응답 형식은 항상 JSON이며, `content-type: application/json` 헤더가 설정됩니다.
