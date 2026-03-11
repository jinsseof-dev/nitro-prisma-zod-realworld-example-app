## Context

이 프로젝트는 Nitro + Prisma + Zod + Bun 기반 RealWorld API 구현체로, 20개의 API 엔드포인트와 4개의 데이터 모델을 갖추고 있다. 기존 상태에서는 코드 품질 도구(린터, 포매터)가 없고, 유닛 테스트가 2개(prisma-errors, verify-token)뿐이며, CI는 Hurl 통합 테스트 1개만 실행한다. AI 코딩 어시스턴트가 코드를 수정할 때 자동 검증 수단이 부족하여 품질 저하 위험이 있다.

현재 상태:

- 코드 품질 도구: 없음
- 유닛 테스트: 2개 (server/utils/prisma-errors.test.ts, server/utils/verify-token.test.ts)
- CI: GitHub Actions 1개 (test-hurl.yml — Hurl 통합 테스트만)
- AI 컨텍스트 파일: 없음

## Goals / Non-Goals

**Goals:**

- AI 어시스턴트가 프로젝트를 이해할 수 있는 CLAUDE.md 컨텍스트 파일 작성
- ESLint + Prettier로 일관된 코드 스타일 강제
- server/utils/ 핵심 유틸리티의 유닛 테스트 커버리지 >= 70% 달성
- pre-commit hook으로 커밋 전 자동 검증 (lint + format + test)
- CI에서 lint, format check, unit test + coverage 자동 실행

**Non-Goals:**

- 비즈니스 로직 변경 또는 새 API 엔드포인트 추가
- 데이터베이스 마이그레이션 또는 스키마 변경
- E2E 테스트 프레임워크 도입 (기존 Hurl 통합 테스트로 충분)
- Swagger/OpenAPI 문서 자동화
- 종합적 리팩토링

## Decisions

### 1. ESLint v9 플랫 설정 + typescript-eslint

ESLint v9의 새로운 플랫 설정(`eslint.config.mjs`)을 사용한다.

**대안:** ESLint v8 레거시 설정 → v9가 현재 표준이며 플랫 설정이 더 간결
**대안:** Biome → 사용자가 ESLint + Prettier를 명시적으로 선택

Nitro의 자동 임포트 함수(`defineEventHandler`, `createError` 등)를 `globals`로 선언하여 ESLint가 미정의 변수로 오인하지 않도록 한다. `@typescript-eslint/no-explicit-any`는 기존 코드의 `any` 사용 때문에 `warn`으로 설정한다.

### 2. Prettier와 ESLint 통합

`eslint-config-prettier`로 ESLint와 Prettier의 규칙 충돌을 방지한다. Prettier는 포매팅만, ESLint는 로직 규칙만 담당한다.

**설정:** 작은따옴표, 후행 쉼표 all, 120자 줄 너비, 2칸 들여쓰기

### 3. Husky + lint-staged로 pre-commit hook

커밋 시 스테이징된 파일에만 lint + format을 실행하여 속도를 유지한다. 이후 `bun test`로 전체 유닛 테스트를 실행한다.

**대안:** lefthook → Husky가 Node.js 생태계에서 더 널리 사용됨
**대안:** 전체 파일 검사 → 대규모 프로젝트에서 느려질 수 있음. lint-staged가 효율적

### 4. 유닛 테스트 대상: server/utils/ 핵심 함수

통합 테스트(Hurl)는 API 레벨만 검증하므로, 유틸리티 내부 로직(토큰 생성/검증, 해싱, 매퍼, 검증)은 유닛 테스트로 별도 검증한다.

대상 (총 9개 파일, 기존 2개 + 신규 6개):

- generate-token.ts, hash-password.ts, validate.ts
- article.mapper.ts, author.mapper.ts, profile.utils.ts
- (기존) prisma-errors.ts, verify-token.ts

### 5. CI 워크플로우 분리

기존 `test-hurl.yml` (통합 테스트)은 유지하고, 새 `ci.yml` (코드 품질)을 추가한다.

`ci.yml` 파이프라인: 체크아웃 → Bun 설정 → 의존성 설치 → Nitro 준비 → Prisma 생성 → ESLint → Prettier 확인 → 커버리지 포함 유닛 테스트

두 워크플로우가 독립적으로 실행되어 실패 원인을 빠르게 파악할 수 있다.

## Risks / Trade-offs

- **lint 규칙 적용 시 대량 자동 수정** → lint:fix와 format을 한 번에 적용 후 커밋. 비즈니스 로직 변경은 없으므로 통합 테스트로 검증.
- **Nitro 자동 임포트와 ESLint 충돌** → `nitroGlobals` 객체로 글로벌 선언. 새 자동 임포트 추가 시 업데이트 필요.
- **테스트 모킹 복잡성** → Nitro 자동 임포트는 `globalThis`에 설정, 환경 변수 의존 모듈은 동적 임포트 패턴 사용.
- **커버리지 70% 미달 가능성** → server/utils/ 범위로 한정하여 달성 가능성 높임. prisma.ts는 싱글턴이라 테스트 제외.
