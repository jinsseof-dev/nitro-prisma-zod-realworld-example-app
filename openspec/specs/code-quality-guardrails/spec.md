## ADDED Requirements

### Requirement: ESLint 설정

시스템 SHALL ESLint v9 플랫 설정으로 TypeScript + Nitro 환경에 맞는 린팅 규칙을 적용해야 한다.

#### Scenario: ESLint 규칙 위반 감지

- **WHEN** `bun run lint`를 실행할 때
- **THEN** TypeScript 코드의 규칙 위반을 감지하고 보고해야 한다

#### Scenario: Nitro 자동 임포트 허용

- **WHEN** 라우트 핸들러에서 `defineEventHandler`, `createError` 등 Nitro 자동 임포트 함수를 사용할 때
- **THEN** ESLint가 미정의 변수 에러를 보고하지 않아야 한다 (`nitroGlobals` 글로벌 선언)

#### Scenario: ESLint 자동 수정

- **WHEN** `bun run lint:fix`를 실행할 때
- **THEN** 자동 수정 가능한 규칙 위반이 수정되어야 한다

### Requirement: Prettier 설정

시스템 SHALL Prettier로 일관된 코드 포매팅을 강제해야 한다.

#### Scenario: 코드 포매팅 적용

- **WHEN** `bun run format`을 실행할 때
- **THEN** 프로젝트의 모든 TypeScript/JavaScript 파일이 설정된 규칙(작은따옴표, 후행 쉼표, 120자, 2칸 들여쓰기)으로 포매팅되어야 한다

#### Scenario: 포매팅 검사

- **WHEN** `bun run format:check`를 실행할 때
- **THEN** 포매팅 규칙에 어긋나는 파일을 보고하되 수정하지 않아야 한다

### Requirement: Pre-commit Hook

시스템 SHALL 커밋 전에 코드 품질을 자동 검증하는 pre-commit hook을 제공해야 한다.

#### Scenario: 커밋 시 자동 검증

- **WHEN** 개발자가 `git commit`을 실행할 때
- **THEN** 스테이징된 파일에 ESLint 수정 + Prettier가 실행되고, 이후 `bun test`로 유닛 테스트가 실행되어야 한다

#### Scenario: 검증 실패 시 커밋 차단

- **WHEN** lint 또는 테스트가 실패할 때
- **THEN** 커밋이 차단되고 실패 원인이 출력되어야 한다
