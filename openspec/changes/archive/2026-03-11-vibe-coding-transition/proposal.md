## Why

AI 코딩 어시스턴트(Claude Code, Copilot 등)가 이 프로젝트에서 안전하게 코드를 수정할 수 있도록, CLAUDE.md 컨텍스트 파일 + 코드 품질 가드레일(ESLint/Prettier/테스트) + CI/CD 자동 검증 파이프라인을 구축한다. 기존 코드베이스에 코드 품질 도구와 테스트가 부족하여 AI가 생성한 코드의 안전성을 자동으로 검증할 수단이 없다.

## What Changes

- CLAUDE.md 작성 — 프로젝트 구조, 기술 스택, 컨벤션, 개발 가이드 포함
- ESLint 설정 — TypeScript + Nitro 환경에 맞는 규칙 (typescript-eslint + eslint-config-prettier)
- Prettier 설정 — 코드 포매팅 규칙 (작은따옴표, 후행 쉼표, 120자, 2칸 들여쓰기)
- 유틸리티 유닛 테스트 추가 — server/utils/ 내 핵심 함수 테스트 (generate-token, hash-password, validate, article.mapper, author.mapper, profile.utils)
- pre-commit hook 설정 — Husky + lint-staged로 커밋 전 lint + format + test 자동 실행
- CI/CD 강화 — GitHub Actions에서 lint + unit test + coverage 자동 실행 (ci.yml 추가)
- 기존 Hurl 통합 테스트 CI 유지 및 강화

## Capabilities

### New Capabilities

- `code-quality-guardrails`: ESLint + Prettier 설정, pre-commit hook, 코드 품질 자동화
- `unit-test-coverage`: server/utils/ 핵심 유틸리티 유닛 테스트 및 커버리지 >= 70% 목표
- `ci-cd-pipeline`: GitHub Actions CI 강화 — lint, format check, unit test + coverage, 기존 Hurl 테스트 유지

### Modified Capabilities

(없음 — 기존 비즈니스 로직 변경 없이 가드레일만 추가)

## Impact

- 새 파일: `eslint.config.mjs`, `.prettierrc`, `.prettierignore`, `.editorconfig`, `.husky/`, `server/utils/*.test.ts` (6개), `.github/workflows/ci.yml`
- 수정 파일: `package.json` (scripts, devDependencies), `.github/workflows/test-hurl.yml`, `CLAUDE.md`
- 기존 코드 변경: 최소 (lint 규칙 적용에 따른 자동 수정만)
- 의존성 추가: eslint, prettier, typescript-eslint, husky, lint-staged (모두 devDependencies)
- 비즈니스 로직 변경: 없음
