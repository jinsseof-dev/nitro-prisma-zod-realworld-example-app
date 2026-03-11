# Claude Code Skills Guide

이 프로젝트에서 사용하는 Claude Code 커스텀 스킬 가이드입니다.
스킬은 `~/.claude/skills/`에 글로벌로 설치되어 모든 프로젝트에서 사용 가능합니다.

## 스킬 목록

| 스킬           | 호출                          | 자동 감지         | 용도                                  |
| -------------- | ----------------------------- | ----------------- | ------------------------------------- |
| `/bugfix`      | `/bugfix <에러 메시지>`       | 에러/버그 보고 시 | 에러 분석 → 수정 → 테스트 검증        |
| `/write-test`  | `/write-test <파일 경로>`     | 테스트 요청 시    | 테스트 생성 → 실행 → 통과 확인        |
| `/code-review` | `/code-review <파일 또는 PR>` | 리뷰 요청 시      | RealWorld 스펙 + 품질 체크리스트 리뷰 |

---

## `/bugfix` — 버그 수정 워크플로우

에러를 체계적으로 분석하고 수정하는 워크플로우입니다.

### 사용법

```
/bugfix 401 Unauthorized 에러가 계속 발생합니다
/bugfix PrismaClientKnownRequestError: Unique constraint failed on the fields: (`email`)
/bugfix GET /api/articles에서 tagList가 빈 배열로 반환됩니다
```

### 실행 흐름

```
에러 분석 → 원인 파악 → 코드 수정 → bun test 검증 → 결과 보고
```

1. **에러 분석**: 에러 메시지/스택 트레이스에서 관련 파일과 에러 타입 식별
2. **원인 파악**: 데이터 흐름(요청 → Zod → Prisma → 매퍼 → 응답) 추적
3. **코드 수정**: 최소 변경, ESLint/Prettier 준수
4. **테스트 검증**: 관련 테스트 + 전체 테스트 실행
5. **결과 보고**: 원인, 수정 내용, 테스트 결과

### 파일 구조

```
~/.claude/skills/bugfix/
├── SKILL.md              # 워크플로우 정의
├── project-context.md    # Nitro/Prisma/인증 컨텍스트 참조
└── error-patterns.md     # HttpException, createError, P2002 에러 패턴 참조
```

---

## `/write-test` — 유닛 테스트 자동 생성

대상 파일을 분석하여 `bun:test` 기반 유닛 테스트를 생성하고 실행까지 완료합니다.

### 사용법

```
/write-test server/utils/validate.ts
/write-test server/utils/article.mapper.ts
```

### 실행 흐름

```
파일 분석 → 테스트 생성 → 실행 → 실패 시 수정 → 전체 테스트 확인 → 보고
```

1. **파일 분석**: export된 함수, 입출력 타입, 의존성 파악
2. **테스트 생성**: co-located 테스트 파일 (`foo.ts` → `foo.test.ts`)
3. **케이스 구성**: 정상 동작 + 엣지 케이스 + 에러 케이스 + 경계값
4. **실행 및 수정**: 통과할 때까지 반복
5. **전체 확인**: `bun test`로 사이드 이펙트 없음 확인

### 지원 테스트 패턴

| 패턴                   | 상황                         | 예시                                            |
| ---------------------- | ---------------------------- | ----------------------------------------------- |
| Nitro 자동 임포트 모킹 | `createError` 등 사용 모듈   | `globalThis.createError = ...` (import 전 설정) |
| 환경 변수 의존 모듈    | import 시점에 env 읽는 모듈  | `beforeAll`에서 env 설정 + 동적 `import()`      |
| Prisma 에러 테스트     | P2002 등 에러 핸들링 검증    | `new PrismaClientKnownRequestError(...)`        |
| HttpException 검증     | 상태 코드 + 에러 메시지 확인 | `expect(...).toThrow(HttpException)`            |
| 매퍼 함수 테스트       | Prisma 결과 → API 응답 변환  | 모킹 객체로 `tagList`, `favorited` 변환 검증    |

### 파일 구조

```
~/.claude/skills/write-test/
├── SKILL.md              # 워크플로우 정의
└── test-patterns.md      # 5개 테스트 패턴 + 코드 예시
```

---

## `/code-review` — 코드 리뷰

RealWorld 스펙 준수와 프로젝트 코드 품질 기준에 따른 체계적 리뷰를 수행합니다.

### 사용법

```
/code-review server/routes/api/articles/index.post.ts
/code-review 3                                          # PR #3 리뷰
/code-review                                            # 현재 변경사항 리뷰
```

### 실행 흐름

```
대상 파악 → 체크리스트 적용 → 결과 보고 (심각/경고/참고)
```

### 체크리스트 카테고리

| 카테고리              | 검사 항목                                                          |
| --------------------- | ------------------------------------------------------------------ |
| **A. RealWorld 스펙** | API 응답 형식, 상태 코드, 인증 설정, slug 패턴                     |
| **B. 데이터 흐름**    | Zod 검증, Prisma select/include, 매퍼 사용, 관계 처리              |
| **C. 에러 처리**      | HttpException, handleUniqueConstraintError, 에러 메시지 형식       |
| **D. 코드 품질**      | ESLint, Prettier, 타입, 자동 임포트, 경로 별칭, 비밀번호 노출 방지 |
| **E. 테스트**         | 유닛 테스트 존재, 정상/에러 경로 커버, bun test 통과               |

### 결과 보고 형식

```
## 코드 리뷰 결과

### 요약
- 리뷰 파일: 3개
- 이슈: 2개 (심각 0 / 경고 1 / 참고 1)

### 이슈 목록
#### [경고] server/routes/api/articles/index.post.ts:15 — validateBody 누락
#### [참고] server/utils/article.mapper.ts:8 — any 타입 개선 가능

### 체크리스트 결과
- [x] RealWorld 스펙 준수
- [x] 에러 처리
- [ ] 테스트 — 유닛 테스트 미존재
```

### 파일 구조

```
~/.claude/skills/code-review/
├── SKILL.md              # 워크플로우 + 보고 형식
└── checklist.md          # 5개 카테고리 상세 체크리스트
```

---

## 스킬 관리

### 설치 위치

```
~/.claude/skills/          # 글로벌 (모든 프로젝트)
.claude/skills/            # 프로젝트 로컬 (Git 커밋 가능)
```

현재 모든 스킬은 글로벌(`~/.claude/skills/`)에 설치되어 있습니다.

### 파일 구조 규칙

```
<skill-name>/
├── SKILL.md              # 필수 — 프론트매터 + 워크플로우 (간결하게)
├── reference.md          # 선택 — 상세 컨텍스트 (필요 시 로드)
└── examples.md           # 선택 — 코드 예시
```

- **SKILL.md**: 워크플로우만, ~50줄 이내
- **참조 파일**: 상세 패턴, 체크리스트, 코드 예시 — `[파일명](파일명)` 링크로 참조
- Claude가 필요한 참조 파일을 자동 로드합니다

### 스킬 수정

스킬 파일을 직접 편집하면 즉시 반영됩니다 (재시작 불필요):

```bash
# 예: 체크리스트에 항목 추가
vim ~/.claude/skills/code-review/checklist.md
```
