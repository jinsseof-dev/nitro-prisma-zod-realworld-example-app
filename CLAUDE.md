# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소의 코드를 다룰 때 참고하는 가이드입니다.

## 프로젝트 개요

RealWorld API 구현체 (Medium 클론 백엔드)로, Nitro, Prisma, Zod, Bun을 사용합니다. [RealWorld 스펙](https://github.com/realworld-apps/realworld)에 따라 CRUD, 인증, 팔로우/즐겨찾기 기능을 모두 구현합니다.

## 명령어

```bash
make setup              # 의존성 설치, Nitro 타입 준비, Prisma 클라이언트 생성, DB 스키마 푸시
make run                # 개발 서버 시작 (포트 3000), JWT_SECRET 설정 필요
make unit-test          # 유닛 테스트 실행 (bun test)
bun test <file>         # 단일 테스트 파일 실행 (예: bun test server/utils/verify-token.test.ts)
make test-with-hurl     # 서버 시작 + Hurl 통합 테스트 실행 (RealWorld 스펙 테스트 스위트)
bun run lint            # ESLint 실행
bun run lint:fix        # ESLint 자동 수정 실행
bun run format          # Prettier로 코드 포맷팅
bun run format:check    # 포맷팅 확인 (파일 수정 없이)
```

패키지 매니저는 **Bun**입니다 (npm/yarn 아님). 의존성 추가 시 `bun add`/`bun add -d`를 사용하세요.

## 코드 품질

- **ESLint** v9 플랫 설정 (`eslint.config.mjs`) — `typescript-eslint` + `eslint-config-prettier` 사용. Nitro 자동 임포트는 글로벌로 선언됨 — 새로운 자동 임포트 사용 시 `nitroGlobals` 객체를 업데이트하세요.
- **Prettier** (`.prettierrc`): 작은따옴표, 후행 쉼표, 120자 줄 너비, 2칸 들여쓰기.
- **프리커밋 훅** (Husky + lint-staged): 스테이징된 파일에 ESLint 수정 + Prettier 실행 후, 커밋 전 `bun test` 실행.
- `@typescript-eslint/no-explicit-any`는 매퍼와 라우트 핸들러의 기존 `any` 사용으로 인해 `warn`(에러 아님)으로 설정.

## 아키텍처

### 런타임 & 프레임워크

- **Bun** 런타임 + **Nitro** 프레임워크 (`nitro.config.ts`: preset `"bun"`, srcDir `"server"`)
- Nitro는 **자동 임포트** 제공 — `defineEventHandler`, `createError`, `readBody`, `getHeader`, `getRouterParam`, `getQuery`, `setResponseStatus`, `setResponseHeader`, `send`는 import 없이 전역으로 사용 가능
- `server/utils/`의 `use*` 접두사 함수도 Nitro가 자동 임포트: `usePrisma()`, `useGenerateToken()`, `useVerifyToken()`, `useHashPassword()`, `useDecrypt()`, `validateBody()`, `handleUniqueConstraintError()`
- 경로 별칭 `~/`는 `server/` 디렉토리로 해석됨 (예: `~/utils/validate` → `server/utils/validate.ts`)
- TypeScript 설정은 생성된 `.nitro/types/tsconfig.json`을 확장 (타입을 위해 먼저 `make setup` 실행 필요)

### 파일 기반 라우팅

라우트는 `server/routes/api/` 하위에 Nitro 규칙을 따라 배치:

- `[param]` — 동적 세그먼트 (예: `articles/[slug]/index.get.ts`)
- 메서드 접미사: `.get.ts`, `.post.ts`, `.put.ts`, `.delete.ts`
- `[...].options.ts` — 모든 `/api/**` 라우트의 CORS 프리플라이트 처리

### 인증 패턴

`server/auth-event-handler.ts`에서 `definePrivateEventHandler`를 내보냄 — `defineEventHandler`의 래퍼로:

- `Authorization: Token <jwt>` 또는 `Bearer <jwt>` 헤더에서 JWT 추출
- `{requireAuth: true}` (기본값): 토큰 없으면 401 에러 발생
- `{requireAuth: false}`: 비인증 접근 허용, `{auth: null}` 전달
- 핸들러의 두 번째 인자로 `{auth: {id: number}}` 전달

### 라우트 핸들러의 데이터 흐름

```
요청 → validateBody(zodSchema, readBody(event)) → Prisma 쿼리 → 매퍼 → 응답
```

1. **검증**: `server/schemas/`의 Zod 스키마를 `validateBody()`로 래핑 — 실패 시 `HttpException(422)` 발생
2. **데이터베이스**: `usePrisma()` 싱글턴 (`server/utils/prisma.ts`)을 통한 Prisma 클라이언트 — libsql 어댑터로 SQLite 사용
3. **응답 매핑**: `article.mapper.ts`, `author.mapper.ts`, `profile.utils.ts`가 Prisma 결과를 RealWorld API 형식으로 변환 (`tagList`, `favorited`, `following` 필드 처리)

### 주요 데이터 패턴

- **Slug 생성**: `slugify(title)` + `-` + `crypto.randomUUID()` — 유니크 제약 보장
- **태그 연결**: Prisma `connectOrCreate` 패턴 — 태그가 없으면 생성, 있으면 연결

### 에러 처리

`server/error-handler.ts`를 통해 두 가지 에러 타입이 처리됨:

- `HttpException(statusCode, {errors: {...}})` — `server/models/http-exception.model.ts`의 커스텀 클래스
- `createError({status, statusMessage, data})` — Nitro 내장, 인증/토큰 에러에 사용
- `handleUniqueConstraintError()` — Prisma P2002를 잡아 HttpException(409) 발생

### 데이터베이스

Prisma v7 + SQLite (libsql 어댑터). 스키마: `prisma/schema.prisma`:

- 모델: `User`, `Article`, `Comment`, `Tag` + User 자기참조 팔로우 관계
- 생성된 클라이언트 출력: `generated/prisma/client`
- 설정: `prisma.config.ts` (DATABASE_URL 기본값: `file:./dev.db`)

### 환경 변수

| 변수                 | 필수   | 기본값          | 용도                    |
| -------------------- | ------ | --------------- | ----------------------- |
| `JWT_SECRET`         | 예     | —               | JWT 서명 키             |
| `DATABASE_URL`       | 아니오 | `file:./dev.db` | 데이터베이스 연결       |
| `BCRYPT_SALT_ROUNDS` | 아니오 | `10`            | 비밀번호 해싱 라운드 수 |

## 테스트 패턴

테스트는 `bun:test` (`describe`, `test`, `expect`)를 사용합니다. 기존 테스트의 주요 규칙:

- **Nitro 자동 임포트 모킹**: 자동 임포트를 사용하는 모듈을 import하기 전에 `globalThis.createError`를 설정 (`verify-token.test.ts` 참고)
- **환경 변수**: `beforeAll`에서 원본 저장, `afterAll`에서 `process.env`로 복원
- **동적 임포트**: 모듈이 import 시점에 환경 변수를 읽는 경우 `beforeAll`에서 `await import('./module')` 사용
- **Prisma 에러**: `new PrismaClientKnownRequestError(msg, {code, clientVersion})`로 테스트
- 테스트 파일은 소스와 같은 위치에 배치: `server/utils/foo.ts` → `server/utils/foo.test.ts`
- **통합 테스트**: `realworld/` git 서브모듈에 Hurl 스펙 포함 — `make test-with-hurl`로 실행

## 상세 문서

`docs/adr/` 디렉토리에 상세 기술 문서가 있습니다:

- **`architecture.md`**: Nitro 프레임워크 구조, 파일 기반 라우팅, auto-imports 전체 목록, 인증 패턴, 데이터 흐름, 에러 처리
- **`api-reference.md`**: 20개 API 엔드포인트 레퍼런스 (요청/응답 형식, 인증 요구사항, 상태 코드)
- **`data-model.md`**: Prisma 스키마 4개 모델 (User, Article, Comment, Tag), 관계, 제약 조건, 응답 매퍼
- **`dev-workflow.md`**: 개발 환경 설정, 테스트, 코드 품질 도구, CI/CD 파이프라인
- **`claude-skills.md`**: Claude Code 커스텀 스킬 가이드 (`/bugfix`, `/write-test`, `/code-review`)

## CI

메인 브랜치에 push/PR 시 두 개의 GitHub Actions 워크플로우가 실행:

- **`test-hurl.yml`**: Hurl 통합 테스트 — 체크아웃 (서브모듈 포함) → Bun 설정 → Hurl 설치 → `make setup` → `make test-with-hurl`
- **`ci.yml`**: 코드 품질 — 체크아웃 → Bun 설정 → 설치 → Nitro 준비 → Prisma 생성 → ESLint → Prettier 확인 → 커버리지 포함 유닛 테스트
