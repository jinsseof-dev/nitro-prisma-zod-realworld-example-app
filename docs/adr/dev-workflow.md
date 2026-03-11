# Development Workflow Guide

개발 환경 설정, 테스트, 코드 품질 도구, CI/CD 파이프라인 가이드입니다.

## 1. Prerequisites

- **Bun** 런타임 (v1.0+): [bun.sh](https://bun.sh)에서 설치
- **Git**: 서브모듈 포함 클론 필요 (통합 테스트용)

```bash
git clone --recurse-submodules <repo-url>
```

## 2. 환경 변수

| 변수                 | 필수   | 기본값          | 용도                      |
| -------------------- | ------ | --------------- | ------------------------- |
| `JWT_SECRET`         | 예     | —               | JWT 서명 키 (임의 문자열) |
| `DATABASE_URL`       | 아니오 | `file:./dev.db` | SQLite 데이터베이스 경로  |
| `BCRYPT_SALT_ROUNDS` | 아니오 | `10`            | 비밀번호 해싱 라운드 수   |

```bash
export JWT_SECRET="your-secret-key-here"
```

## 3. 초기 설정

```bash
make setup
```

이 명령은 다음을 순서대로 실행합니다:

1. `bun install` — 의존성 설치
2. `bun run prepare` — Nitro 타입 준비 (`.nitro/types/` 생성)
3. `bunx @prisma/client generate` — Prisma 클라이언트 생성 (`generated/prisma/client`)
4. `bunx prisma db push` — DB 스키마를 SQLite에 적용

> **패키지 매니저**: 반드시 **Bun**을 사용하세요. `npm install`이나 `yarn install`을 사용하지 마세요.

## 4. 개발 서버

```bash
make run
```

- 포트 **3000**에서 개발 서버 시작
- `JWT_SECRET` 환경 변수가 설정되어 있어야 합니다
- 핫 리로드 지원 (Nitro dev mode)

## 5. 테스트

### 유닛 테스트

```bash
make unit-test          # 전체 유닛 테스트
bun test <file>         # 단일 파일 테스트
```

**예시**:

```bash
bun test server/utils/verify-token.test.ts
```

### 통합 테스트 (Hurl)

```bash
make test-with-hurl
```

이 명령은 서버를 시작한 후 `realworld/` 서브모듈의 Hurl 스펙으로 RealWorld API 전체를 테스트합니다. 서브모듈이 없으면 먼저 초기화하세요:

```bash
git submodule update --init --recursive
```

### 테스트 파일 규칙

- 소스와 같은 위치에 배치: `server/utils/foo.ts` → `server/utils/foo.test.ts`
- `bun:test` 사용 (`describe`, `test`, `expect`)

### 테스트 작성 패턴

#### Nitro 자동 임포트 모킹

자동 임포트를 사용하는 모듈을 테스트할 때, import 전에 `globalThis`에 함수를 설정합니다:

```ts
// createError를 사용하는 모듈 테스트 시
globalThis.createError = (opts) => {
  const err = new Error(opts.statusMessage);
  (err as any).statusCode = opts.status;
  (err as any).data = opts.data;
  return err;
};

// 이후에 모듈 import
const { useVerifyToken } = await import('./verify-token');
```

#### 환경 변수 의존 모듈

모듈이 import 시점에 환경 변수를 읽는 경우 동적 임포트를 사용합니다:

```ts
let myModule: typeof import('./my-module');

beforeAll(async () => {
  process.env.MY_VAR = 'test-value';
  myModule = await import('./my-module');
});

afterAll(() => {
  // 원본 환경 변수 복원
});
```

#### Prisma 에러 테스트

```ts
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

const error = new PrismaClientKnownRequestError('Unique constraint failed', {
  code: 'P2002',
  clientVersion: '5.0.0',
});
```

## 6. 코드 품질

### ESLint

```bash
bun run lint            # 검사만
bun run lint:fix        # 자동 수정
```

- ESLint v9 플랫 설정 (`eslint.config.mjs`)
- `typescript-eslint` + `eslint-config-prettier` 사용
- `@typescript-eslint/no-explicit-any`는 `warn` 수준 (기존 `any` 사용으로 인해)
- Nitro 자동 임포트는 `nitroGlobals` 객체에 글로벌로 선언됨 — 새 자동 임포트 추가 시 업데이트 필요

### Prettier

```bash
bun run format          # 포맷팅 적용
bun run format:check    # 검사만 (파일 수정 없음)
```

설정 (`.prettierrc`):

| 옵션      | 값                               |
| --------- | -------------------------------- |
| 따옴표    | 작은따옴표 (`singleQuote: true`) |
| 후행 쉼표 | `all`                            |
| 줄 너비   | 120자                            |
| 들여쓰기  | 2칸 스페이스                     |

### 프리커밋 훅 (Husky + lint-staged)

커밋 시 자동으로 실행됩니다:

1. 스테이징된 파일에 **ESLint 자동 수정** 실행
2. 스테이징된 파일에 **Prettier** 실행
3. `bun test` 실행 — 테스트 실패 시 커밋 차단

> 프리커밋 훅은 `.husky/` 디렉토리에 설정되어 있습니다.

## 7. CI/CD 파이프라인

메인 브랜치에 push 또는 PR 시 두 개의 GitHub Actions 워크플로우가 실행됩니다.

### `ci.yml` — 코드 품질

```
체크아웃 → Bun 설정 → 의존성 설치 → Nitro 준비 → Prisma 클라이언트 생성
  → ESLint 검사 → Prettier 검사 → 커버리지 포함 유닛 테스트
```

검사 항목:

- ESLint 규칙 위반 없음
- Prettier 포맷팅 일치
- 유닛 테스트 통과 + 커버리지 리포트

### `test-hurl.yml` — 통합 테스트

```
체크아웃 (서브모듈 포함) → Bun 설정 → Hurl 설치 → make setup → make test-with-hurl
```

검사 항목:

- RealWorld 스펙의 Hurl 테스트 스위트 전체 통과
- 서버 기동 → API 엔드포인트 호출 → 응답 검증

## 8. 의존성 관리

```bash
bun add <package>       # 프로덕션 의존성 추가
bun add -d <package>    # 개발 의존성 추가
```

- 락 파일: `bun.lock` (커밋 대상)
- `package-lock.json`은 호환성을 위해 존재하지만 Bun이 우선

## 9. 디렉토리 구조 요약

```
├── server/                    # 소스 디렉토리 (Nitro srcDir)
│   ├── routes/api/            # 파일 기반 라우팅
│   ├── schemas/               # Zod 검증 스키마
│   ├── models/                # 타입 정의 + HttpException
│   ├── utils/                 # 유틸리티 (Nitro 자동 임포트 대상)
│   ├── auth-event-handler.ts  # JWT 인증 래퍼
│   └── error-handler.ts       # 전역 에러 핸들러
├── prisma/
│   └── schema.prisma          # DB 스키마 정의
├── generated/prisma/          # Prisma 생성 클라이언트
├── realworld/                 # Hurl 통합 테스트 (git 서브모듈)
├── docs/adr/                  # 프로젝트 문서
├── nitro.config.ts            # Nitro 설정
├── prisma.config.ts           # Prisma 설정
└── eslint.config.mjs          # ESLint 플랫 설정
```
