## ADDED Requirements

### Requirement: Nitro 프레임워크 아키텍처 문서

시스템 SHALL Nitro 프레임워크의 핵심 아키텍처 패턴을 문서화해야 한다. 파일 기반 라우팅, auto-imports, 경로 별칭(`~/`), 프리셋 설정을 포함한다.

#### Scenario: 파일 기반 라우팅 규칙 참조

- **WHEN** 개발자가 새로운 API 엔드포인트를 추가하려 할 때
- **THEN** 문서에서 `server/routes/api/` 하위의 파일 네이밍 규칙(`.get.ts`, `.post.ts`, `.put.ts`, `.delete.ts`), 동적 세그먼트(`[param]`), CORS 핸들러(`[...].options.ts`)를 확인할 수 있어야 한다

#### Scenario: Nitro auto-imports 목록 확인

- **WHEN** 개발자가 ESLint globals 또는 테스트 모킹에서 Nitro 자동 임포트 함수가 필요할 때
- **THEN** 문서에서 `defineEventHandler`, `createError`, `readBody`, `getHeader`, `getRouterParam`, `getQuery`, `setResponseStatus`, `setResponseHeader`, `send`, `usePrisma` 등의 전체 목록과 각 함수의 역할을 확인할 수 있어야 한다

### Requirement: 인증 패턴 문서

시스템 SHALL JWT 기반 인증 패턴을 문서화해야 한다. `definePrivateEventHandler` 래퍼의 동작, 토큰 추출 방식, 인증 필수/선택 모드를 포함한다.

#### Scenario: 인증이 필요한 엔드포인트 생성

- **WHEN** 개발자가 인증이 필요한 새 라우트를 만들려 할 때
- **THEN** 문서에서 `definePrivateEventHandler` 사용법, `{requireAuth: true/false}` 옵션, `{auth: {id: number}}` 컨텍스트 접근 방법을 확인할 수 있어야 한다

#### Scenario: 선택적 인증 엔드포인트 이해

- **WHEN** 개발자가 인증 여부에 따라 다른 응답을 반환하는 엔드포인트를 이해하려 할 때
- **THEN** 문서에서 `{requireAuth: false}` 설정 시 `auth`가 `null`이 될 수 있음과 이를 처리하는 패턴을 확인할 수 있어야 한다

### Requirement: 데이터 흐름 문서

시스템 SHALL 요청에서 응답까지의 전체 데이터 흐름을 문서화해야 한다. 검증(Zod) → 데이터베이스(Prisma) → 응답 매핑(mapper) 파이프라인을 포함한다.

#### Scenario: 요청-응답 파이프라인 이해

- **WHEN** 개발자가 새로운 CRUD 엔드포인트를 구현하려 할 때
- **THEN** 문서에서 `validateBody(zodSchema, readBody(event))` → Prisma 쿼리 → `articleMapper`/`authorMapper` → JSON 응답의 전체 흐름과 각 단계의 역할을 확인할 수 있어야 한다

### Requirement: 에러 처리 패턴 문서

시스템 SHALL 에러 처리 체계를 문서화해야 한다. `HttpException`, `createError`, `handleUniqueConstraintError`의 사용 패턴과 `server/error-handler.ts`의 전역 에러 핸들러 동작을 포함한다.

#### Scenario: 커스텀 에러 응답 생성

- **WHEN** 개발자가 특정 상태 코드와 에러 메시지를 반환해야 할 때
- **THEN** 문서에서 `HttpException(statusCode, {errors: {...}})` 사용법과 `createError({status, statusMessage, data})` 사용법의 차이를 확인할 수 있어야 한다

#### Scenario: Prisma 유니크 제약 에러 처리

- **WHEN** 개발자가 중복 데이터 삽입 시 에러를 처리해야 할 때
- **THEN** 문서에서 `handleUniqueConstraintError(e, fieldErrors)` 사용 패턴과 P2002 에러 코드 매핑을 확인할 수 있어야 한다
