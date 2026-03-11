## 1. CLAUDE.md 컨텍스트 파일

- [x] 1.1 CLAUDE.md 작성 — 프로젝트 구조, 기술 스택, 명령어, 아키텍처, 컨벤션, 테스트 패턴, CI 설명 포함

## 2. 코드 품질 도구 설정

- [x]2.1 ESLint v9 플랫 설정 — `eslint.config.mjs` 생성, typescript-eslint + eslint-config-prettier, Nitro 자동 임포트 글로벌 선언
- [x]2.2 Prettier 설정 — `.prettierrc`, `.prettierignore` 생성 (작은따옴표, 후행 쉼표, 120자, 2칸)
- [x]2.3 `.editorconfig` 생성 — 에디터 기본 설정 통일
- [x]2.4 package.json에 lint/format 스크립트 추가 — `lint`, `lint:fix`, `format`, `format:check`
- [x]2.5 기존 코드에 lint:fix + format 적용 — 자동 수정 후 통합 테스트로 검증

## 3. Pre-commit Hook

- [x]3.1 Husky + lint-staged 설치 및 설정 — `bun add -d husky lint-staged`
- [x]3.2 `.husky/pre-commit` 훅 생성 — lint-staged 실행
- [x]3.3 lint-staged 설정 — 스테이징된 파일에 ESLint 수정 + Prettier
- [x]3.4 pre-commit에 `bun test` 추가 — lint-staged 이후 유닛 테스트 실행

## 4. 유닛 테스트 작성

- [x]4.1 generate-token.test.ts — JWT 토큰 생성/디코딩 검증
- [x]4.2 hash-password.test.ts — bcrypt 해싱/비교 검증
- [x]4.3 validate.test.ts — Zod 검증 성공/실패, HttpException(422) 검증
- [x]4.4 article.mapper.test.ts — tagList 변환, favorited/favoritesCount 계산, author 매핑
- [x]4.5 author.mapper.test.ts — following 계산, 미인증 시 false 반환
- [x]4.6 profile.utils.test.ts — profileMapper following 계산, undefined id 처리
- [x]4.7 기존 테스트 보강 — prisma-errors.test.ts, verify-token.test.ts 누락 케이스 추가

## 5. CI/CD 파이프라인

- [x]5.1 ci.yml 워크플로우 생성 — 체크아웃 → Bun → 설치 → Nitro 준비 → Prisma 생성 → ESLint → Prettier 확인 → 커버리지 포함 유닛 테스트
- [x]5.2 test-hurl.yml 워크플로우 유지/강화 — 기존 통합 테스트 정상 동작 확인
- [x]5.3 커버리지 >= 70% 확인 — server/utils/ 기준 커버리지 목표 달성 검증

## 6. 최종 검증

- [x]6.1 `bun run lint` 통과 확인
- [x]6.2 `bun run format:check` 통과 확인
- [x]6.3 `bun test --coverage` 통과 및 커버리지 >= 70% 확인
- [x]6.4 CI 전체 통과 확인 — ci.yml + test-hurl.yml 모두 green
