# 바이브 코딩 마이그레이션 가이드

기존 프로젝트를 AI 코딩 어시스턴트(Claude Code)가 안전하게 코드를 수정할 수 있는 환경으로 전환하는 실전 가이드입니다. 실제 프로젝트에서 사용된 프롬프트와 그 결과를 기반으로 작성되었습니다.

## 개요

### 바이브 코딩이란?

바이브 코딩(Vibe Coding)은 AI 코딩 어시스턴트에게 자연어로 지시하여 코드를 작성하는 개발 방식입니다. 효과적인 바이브 코딩을 위해서는 AI가 프로젝트를 이해할 수 있는 **컨텍스트 파일**, 코드 품질을 자동으로 검증하는 **가드레일**, 그리고 변경사항을 자동으로 검증하는 **CI/CD 파이프라인**이 필요합니다.

### 이 가이드의 대상

- 기존 프로젝트에 AI 코딩 환경을 구축하려는 개발자
- Claude Code를 프로젝트에 도입하려는 팀
- 바이브 코딩의 전체 워크플로우를 이해하고 싶은 사람

### 전제 조건

- [Claude Code](https://claude.ai/code) CLI 설치 완료
- 프로젝트가 Git으로 관리되고 있음
- GitHub 저장소 연결 및 `gh` CLI 설치 (선택)

### 적용 프로젝트

이 가이드는 **Nitro + Prisma + Zod + Bun 기반 RealWorld API** 프로젝트에서 실제로 수행한 작업을 기반으로 합니다. 전환 전 상태:

| 항목        | 전환 전              | 전환 후                   |
| ----------- | -------------------- | ------------------------- |
| AI 컨텍스트 | 없음                 | CLAUDE.md + 슬래시 커맨드 |
| 린터/포매터 | 없음                 | ESLint v9 + Prettier      |
| 유닛 테스트 | 2개                  | 95개 (커버리지 99%+)      |
| CI          | Hurl 통합 테스트 1개 | + 코드 품질 CI 추가       |
| Pre-commit  | 없음                 | Husky + lint-staged       |
| 이슈 관리   | 수동                 | 슬래시 커맨드 자동화      |

---

## Phase 1: 심층 인터뷰 — 요구사항 명확화

바이브 코딩의 첫 단계는 AI와 대화하며 무엇을 할지 명확히 하는 것입니다.

### 실제 사용 프롬프트

> 이 프로젝트를 바이브 코딩을 위한 프로젝트로 전환하려고 해. 문서화 및 테스트, CI/CD까지 진행할거야. 이를 위한 심층인터뷰를 진행해줘.

### 결과

Claude Code의 deep-interview 기능이 6라운드의 소크라테스식 질의를 진행했습니다:

| 라운드 | 질문                              | 응답 핵심                         | 모호도    |
| ------ | --------------------------------- | --------------------------------- | --------- |
| 1      | "바이브 코딩 전환"의 구체적 의미? | AI 컨텍스트 파일 + 가드레일 구축  | 71.5%     |
| 2      | 문서화, 테스트, CI/CD 범위?       | 핵심만 추가                       | 56.5%     |
| 3      | 성공 판단 기준?                   | 테스트+린트가 자동 검증하는 상태  | 39.5%     |
| 4      | (반론) 유닛 테스트가 정말 필요?   | 유틸리티 내부 로직 단위 검증 필수 | 30.8%     |
| 5      | 구체적 가드레일?                  | ESLint + Prettier + 테스트 확충   | 25.8%     |
| 6      | 완료 시 충족 항목?                | 전체 체크리스트 확정              | **17.5%** |

모호도가 20% 이하로 떨어지면 실행 단계로 넘어갑니다.

### 일반화 팁

```
[프로젝트 설명]을 바이브 코딩을 위한 프로젝트로 전환하려고 해.
[구체적 범위]까지 진행할거야. 이를 위한 심층인터뷰를 진행해줘.
```

심층 인터뷰가 없는 환경에서는 아래처럼 직접 요구사항을 정리해도 됩니다:

```
이 프로젝트에 다음을 추가하고 싶어:
1. CLAUDE.md 컨텍스트 파일
2. ESLint + Prettier
3. 유닛 테스트 (커버리지 70% 이상)
4. Pre-commit hook
5. CI/CD 파이프라인
기존 코드 수정은 최소화하고, 비즈니스 로직은 변경하지 마.
```

### 검증

- 인수 조건(Acceptance Criteria)이 명확하게 정의되었는지 확인
- 범위(scope)가 구체적인지 확인 — "핵심만" vs "전면적"

---

## Phase 2: AI 컨텍스트 설정 — CLAUDE.md

AI가 프로젝트를 이해하려면 구조화된 컨텍스트 파일이 필요합니다.

### 실제 사용 프롬프트

> Please analyze this codebase and create a CLAUDE.md file, which will be given to future instances of Claude Code to operate in this repository.

이 프롬프트는 Claude Code 내장 `/init` 명령어와 동일합니다.

### 결과

`CLAUDE.md` 파일이 생성되었으며, 이후 한국어로 번역 요청:

> @CLAUDE.md 이 파일 한글로 번역좀 해줄 수 있니?

최종 CLAUDE.md에 포함된 섹션:

- **프로젝트 개요**: 기술 스택, 목적
- **명령어**: `make setup`, `make run`, `bun test` 등
- **코드 품질**: ESLint/Prettier 설정, 프리커밋 훅
- **아키텍처**: 런타임, 파일 기반 라우팅, 인증 패턴, 데이터 흐름
- **주요 데이터 패턴**: Slug 생성, 태그 연결
- **에러 처리**: HttpException, createError
- **데이터베이스**: Prisma 모델, 환경 변수
- **테스트 패턴**: 모킹 방법, 파일 배치 규칙, CI 정보

### 일반화 팁

```bash
# Claude Code 내장 명령어로 자동 생성
claude /init

# 또는 수동으로 상세 지시
claude "이 코드베이스를 분석해서 CLAUDE.md를 만들어줘.
포함할 내용: 프로젝트 구조, 빌드 명령어, 아키텍처 패턴,
테스트 방법, 환경 변수, 주요 컨벤션"
```

**CLAUDE.md에 반드시 포함해야 할 것:**

1. 빌드/실행/테스트 명령어
2. 프레임워크 고유 패턴 (자동 임포트, 파일 기반 라우팅 등)
3. 인증/에러 처리 패턴
4. 환경 변수 목록
5. 테스트 작성 규칙 (모킹 패턴 포함)

### 검증

```bash
# CLAUDE.md가 존재하고 내용이 충분한지 확인
wc -l CLAUDE.md  # 최소 50줄 이상 권장
```

---

## Phase 3: 코드 품질 가드레일

### 3-1. ESLint + Prettier 설정

#### 실제 사용 프롬프트

이 단계는 OpenSpec의 `opsx:apply` 워크플로우로 자동 실행되었습니다. 직접 실행하려면:

```
ESLint v9 플랫 설정과 Prettier를 설치하고 설정해줘.
- typescript-eslint + eslint-config-prettier
- Nitro 자동 임포트 함수를 글로벌로 선언
- 작은따옴표, 후행 쉼표, 120자, 2칸 들여쓰기
- @typescript-eslint/no-explicit-any는 warn으로
- package.json에 lint, lint:fix, format, format:check 스크립트 추가
- .editorconfig도 생성
```

#### 결과

생성된 파일:

- `eslint.config.mjs` — ESLint v9 플랫 설정
- `.prettierrc` — Prettier 규칙
- `.prettierignore` — 포매팅 제외 경로
- `.editorconfig` — 에디터 설정 통일

수정된 파일:

- `package.json` — scripts, devDependencies 추가

#### 일반화 팁

```
이 프로젝트에 ESLint와 Prettier를 설치하고 설정해줘.
프레임워크: [프레임워크명]
스타일 규칙: [원하는 규칙]
기존 코드에 자동 수정도 적용해줘.
```

### 3-2. Pre-commit Hook

#### 실제 사용 프롬프트

```
Husky + lint-staged로 pre-commit hook을 설정해줘.
스테이징된 파일에 ESLint 수정 + Prettier 실행 후, 커밋 전 bun test 실행.
```

#### 결과

생성된 파일:

- `.husky/pre-commit` — lint-staged + bun test 실행
- `package.json`에 `lint-staged` 설정 추가

#### 일반화 팁

Pre-commit hook은 AI가 생성한 코드가 커밋되기 전 자동으로 검증하는 **마지막 방어선**입니다.

```
Husky + lint-staged로 pre-commit hook을 설정해줘.
- 스테이징된 파일에만 린터/포매터 실행
- 전체 테스트 스위트 실행
```

### 검증

```bash
bun run lint          # ESLint 통과 확인
bun run format:check  # Prettier 통과 확인
```

---

## Phase 4: 테스트 안전망

### 실제 사용 프롬프트 (초기)

> 이 프로젝트에 테스트를 추가하고 싶어. ut, it, e2e, lint까지 테스트를 구현해줘.

이후 구체적인 작업은 OpenSpec 태스크로 분해되어 순차 실행되었습니다.

### 실제 사용 프롬프트 (추가 작업)

> 그다음 작업들 하나씩 진행해줘. 4개 순차로 해봐

이 프롬프트로 아래 4개 작업이 순차 실행되었습니다:

1. `any` 타입 제거 — `HttpException` 모델 타입 안전성 강화
2. 에러 응답 표준화 — `createError` → `HttpException` 통일
3. API 입력 검증 강화 — Zod 스키마에 email/password 규칙 추가
4. verify-token 커버리지 100%

### 결과

생성된 테스트 파일 (6개 신규 + 2개 기존 보강):

- `server/utils/generate-token.test.ts`
- `server/utils/hash-password.test.ts`
- `server/utils/validate.test.ts`
- `server/utils/article.mapper.test.ts`
- `server/utils/author.mapper.test.ts`
- `server/utils/profile.utils.test.ts`
- `server/schemas/user.schema.test.ts`
- `server/schemas/article.schema.test.ts`

최종 결과: **95개 테스트, 0 실패, 커버리지 99%+**

### 트러블슈팅: Hurl 통합 테스트 호환성

Zod 스키마 강화 후 Hurl 통합 테스트가 3라운드에 걸쳐 실패했습니다:

| 라운드 | 문제                              | 원인                          | 해결                                        |
| ------ | --------------------------------- | ----------------------------- | ------------------------------------------- |
| 1      | 빈 비밀번호에 "is too short" 반환 | `min(8)`만 있고 `min(1)` 없음 | `min(1, "can't be blank")` 추가 후 `min(8)` |
| 1      | 사용자명 등록 실패                | username regex가 너무 엄격    | regex 제거 (RealWorld 테스트 특수문자 포함) |
| 2      | 여전히 4개 실패                   | `max(20)`이 Hurl UID보다 짧음 | `max(20)` 제거                              |
| 3      | 전체 통과                         | —                             | —                                           |

**교훈**: 검증 규칙을 추가할 때는 반드시 기존 통합 테스트와의 호환성을 확인해야 합니다. 실제 Hurl 테스트 파일을 읽어보고 어떤 데이터로 테스트하는지 파악한 후 규칙을 정해야 합니다.

### 일반화 팁

```
server/utils/ 디렉토리의 핵심 유틸리티 함수에 대한 유닛 테스트를 작성해줘.
- 테스트 프레임워크: [bun:test / jest / vitest]
- 테스트 파일은 소스 파일 옆에 배치 (foo.ts → foo.test.ts)
- 기존 테스트 패턴을 따라서 작성
- 커버리지 목표: 70% 이상
```

### 검증

```bash
bun test                # 전체 테스트 실행
bun test --coverage     # 커버리지 포함 실행
```

---

## Phase 5: CI/CD 파이프라인

### 실제 사용 프롬프트

CI는 OpenSpec 태스크의 일부로 자동 생성되었습니다. 직접 요청하려면:

```
GitHub Actions CI 워크플로우를 추가해줘.
- 체크아웃 → 런타임 설정 → 의존성 설치 → 빌드 준비 → ESLint → Prettier 확인 → 커버리지 포함 유닛 테스트
- 기존 통합 테스트 워크플로우는 유지
- main 브랜치 push와 PR에서 실행
```

### 결과

- `.github/workflows/ci.yml` 생성 — lint + format + unit test + coverage
- `.github/workflows/test-hurl.yml` 유지 — Hurl 통합 테스트

### PR + CI 워크플로우

실제 사용된 커밋 및 PR 프롬프트:

> 커밋하고 PR 올리는 것 까지 해볼까?

Claude Code가 다음을 자동으로 수행합니다:

1. `git checkout -b feat/branch-name`
2. `git add` + `git commit` (pre-commit hook 자동 실행)
3. `git push -u origin feat/branch-name`
4. `gh pr create` — 제목, 요약, 테스트 계획 자동 작성
5. CI 통과 대기 (`gh pr checks --watch`)
6. Squash merge (`gh pr merge --squash --delete-branch`)
7. 로컬 main fast-forward

### 검증

```bash
gh pr checks <PR번호>  # CI 상태 확인
```

---

## Phase 6: 리뷰 & 개선 사이클

바이브 코딩의 진정한 가치는 AI에게 리뷰와 개선을 반복적으로 요청할 수 있다는 점입니다.

### 6-1. 프로젝트 리뷰

#### 실제 사용 프롬프트

> 이 프로젝트를 리뷰하고 개선할 점을 제안해줘

#### 결과

13개 개선점이 발견되었으며, 심각도별로 분류되었습니다:

| 심각도   | 개수 | 예시                                       |
| -------- | ---- | ------------------------------------------ |
| Critical | 2    | JWT 알고리즘 미제한, 데이터 과다 조회      |
| High     | 2    | PrivateContext 타입 안전성, null 체크 누락 |
| Medium   | 6    | Rate limiting, CORS, 에러 로깅 등          |
| Low      | 3    | Prisma includes 통합, JWT 만료 외부화 등   |

### 6-2. 이슈 등록

#### 실제 사용 프롬프트

> 발견된 이슈들을 깃헙 이슈에 등록해줘

처음에 3개의 그룹 이슈로 등록되어 피드백:

> 왜 3개만 등록했지? 13개가 나왔는데

이후 13개 개별 이슈(#11~#23)로 재등록되었습니다.

**교훈**: AI에게 이슈 등록을 요청할 때는 "각각 개별 이슈로 등록해줘"라고 명시하세요.

### 6-3. 크리티컬 이슈 해결

#### 실제 사용 프롬프트

> 크리티컬 이슈들에 대해서 작업 계획을 세우고 병렬로 작업을 진행해.

#### 결과

2개의 executor 에이전트가 병렬로 4개 크리티컬/하이 이슈를 해결:

- **#11**: `followedBy/favoritedBy: true` → `{ select: { id: true } }` (10개 라우트)
- **#12**: JWT `sign()`/`verify()`에 HS256 알고리즘 명시
- **#13**: `PrivateContext.auth` 타입을 `{ id: number } | null`로 수정
- **#15**: `GET /api/user`에 null 가드 추가

### 6-4. 인수 조건 검증

#### 실제 사용 프롬프트

> 인수조건도 만족했는지 확인해.

verifier 에이전트가 각 이슈의 인수 조건을 코드 증거 기반으로 검증하고, 이슈 코멘트로 결과를 작성한 후 이슈를 닫았습니다.

### 일반화 팁

```
# 리뷰 요청
이 프로젝트를 리뷰하고 개선할 점을 제안해줘

# 이슈 등록
발견된 이슈들을 각각 개별 깃헙 이슈로 등록해줘.
심각도 라벨도 붙여줘.

# 크리티컬 이슈 해결
크리티컬 이슈들에 대해 작업 계획을 세우고 병렬로 작업을 진행해.

# 검증 후 이슈 닫기
인수조건이 만족되었는지 코드 증거와 함께 확인하고,
충족된 이슈는 닫아줘.
```

---

## Phase 7: 워크플로우 자동화

### 7-1. CLAUDE.md 작업 규칙 추가

#### 실제 사용 프롬프트

> 규칙에 병렬로 가능한 작업은 병렬로 수행하도록 적어줘

#### 결과

CLAUDE.md에 작업 규칙 섹션 추가:

- 독립적인 작업은 병렬 에이전트로 실행
- 빌드/테스트는 백그라운드 실행
- 전문 에이전트 위임 규칙

### 7-2. Claude Hook — README 자동 동기화

#### 실제 사용 프롬프트

> claude hook을 사용해서 prompt 실행후에 리드미를 최신 상태로 유지하도록 설정해줘

#### 결과

`.claude/settings.local.json`에 `UserPromptSubmit` hook 추가:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "command": ".claude/hooks/check-readme-sync.sh",
        "timeout": 5000
      }
    ]
  }
}
```

`.claude/hooks/check-readme-sync.sh`가 소스 파일과 README의 수정 시각을 비교하여 업데이트가 필요하면 알려줍니다.

### 7-3. 슬래시 커맨드 — 이슈 관리

#### 실제 사용 프롬프트

> 앞서서 이슈 등록에 사용한 프롬프트로 기헙 이슈 관리 스킬을 만들어줘

#### 결과

`.claude/commands/create-issue.md` 생성 — `/create-issue` 슬래시 커맨드로 이슈 생성/업데이트/검증/닫기를 자동화

이후 인수 조건 검증 워크플로우도 추가:

> 작업 완료후 이슈 업데이트 시에는 인수조건을 확인하도록 스킬을 업데이트해

### 일반화 팁

```
# Hook 설정
claude hook을 사용해서 [트리거]에 [동작]을 실행하도록 설정해줘

# 슬래시 커맨드 생성
[반복 작업 설명]을 슬래시 커맨드로 만들어줘.
.claude/commands/ 에 저장해줘.
```

---

## 부록 A: 전체 프롬프트 요약 (시간순)

| #   | 프롬프트                                                             | Phase | 결과                                            |
| --- | -------------------------------------------------------------------- | ----- | ----------------------------------------------- |
| 1   | "바이브 코딩을 위한 프로젝트로 전환하려고 해. 심층인터뷰를 진행해줘" | 1     | 요구사항 명확화, 인수조건 도출                  |
| 2   | "CLAUDE.md 파일을 만들어줘" (`/init`)                                | 2     | AI 컨텍스트 파일 생성                           |
| 3   | "@CLAUDE.md 한글로 번역해줘"                                         | 2     | 한국어 CLAUDE.md                                |
| 4   | (OpenSpec `opsx:apply`)                                              | 3-5   | ESLint, Prettier, 테스트, CI 일괄 구축          |
| 5   | "커밋하고 PR 올리는 것까지 해볼까?"                                  | 5     | 자동 커밋 + PR + CI + merge                     |
| 6   | "다음 작업 진행해줘볼래?"                                            | 4     | 추가 기능 개발 (커밋+PR+테스트 자동)            |
| 7   | "그다음 작업들 하나씩 진행해줘. 4개 순차로 해봐"                     | 4     | any 제거, 에러 표준화, 검증 강화, 커버리지 100% |
| 8   | "규칙에 병렬로 가능한 작업은 병렬로 수행하도록 적어줘"               | 7     | CLAUDE.md 작업 규칙 추가                        |
| 9   | "claude hook으로 리드미 최신 상태 유지하도록 설정해줘"               | 7     | README 동기화 hook                              |
| 10  | "이 프로젝트를 리뷰하고 개선할 점을 제안해줘"                        | 6     | 13개 개선점 발견                                |
| 11  | "발견된 이슈들을 깃헙 이슈에 등록해줘"                               | 6     | 13개 GitHub 이슈 등록                           |
| 12  | "크리티컬 이슈들에 대해서 작업 계획을 세우고 병렬로 작업을 진행해"   | 6     | 4개 크리티컬/하이 이슈 해결                     |
| 13  | "인수조건도 만족했는지 확인해"                                       | 6     | 코드 증거 기반 검증 + 이슈 닫기                 |
| 14  | "이슈 관리 스킬을 만들어줘"                                          | 7     | `/create-issue` 슬래시 커맨드                   |
| 15  | "인수조건을 확인하도록 스킬을 업데이트해"                            | 7     | 이슈 업데이트 시 검증 워크플로우 추가           |

## 부록 B: 트러블슈팅

### 1. Hurl 통합 테스트와 Zod 검증 충돌

**증상**: Zod 스키마에 email/password 규칙을 추가했더니 Hurl 통합 테스트 실패

**원인**: RealWorld 스펙의 테스트 데이터가 새 규칙을 위반 (빈 비밀번호에 "can't be blank" 기대하는데 "is too short" 반환)

**해결**:

```typescript
// 잘못된 순서
const passwordField = z.string().min(8, 'is too short');

// 올바른 순서 — 빈 값에 대한 에러 메시지를 먼저
const passwordField = z.string().min(1, "can't be blank").min(8, 'is too short (minimum is 8 characters)');
```

### 2. AI가 이슈를 그룹화하는 문제

**증상**: 13개 개선점을 발견했는데 3개의 그룹 이슈로 묶어서 등록

**해결**: "각각 개별 이슈로 등록해줘"라고 명시

### 3. 환경 변수와 모듈 로딩 순서

**증상**: 테스트에서 `JWT_SECRET` 등 환경 변수가 로드 시점에 결정되어 테스트 설정이 안 됨

**해결**: 동적 `import()`를 `beforeAll`에서 사용

```typescript
let useGenerateToken: typeof import('./generate-token').useGenerateToken;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret';
  const mod = await import('./generate-token');
  useGenerateToken = mod.useGenerateToken;
});
```

### 4. Nitro 자동 임포트 모킹

**증상**: `createError` 등 자동 임포트 함수가 테스트에서 `undefined`

**해결**: import 전에 `globalThis`에 설정

```typescript
globalThis.createError = (opts) => {
  const err = new Error(opts.statusMessage);
  (err as any).status = opts.status;
  return err;
};
```

## 부록 C: 바이브 코딩 준비 체크리스트

- [ ] **CLAUDE.md** — 프로젝트 구조, 명령어, 아키텍처, 컨벤션, 테스트 패턴 문서화
- [ ] **ESLint** — 프레임워크에 맞는 규칙 설정, 자동 임포트 글로벌 선언
- [ ] **Prettier** — 코드 포매팅 규칙 통일
- [ ] **Pre-commit Hook** — lint + format + test 자동 실행
- [ ] **유닛 테스트** — 핵심 유틸리티 커버리지 70% 이상
- [ ] **CI/CD** — lint + format check + test + coverage 자동 실행
- [ ] **통합 테스트** — 기존 테스트 유지 및 CI 연동
- [ ] **슬래시 커맨드** — 반복 작업 자동화 (이슈 관리, 리뷰 등)
- [ ] **Hook** — README 동기화 등 자동 알림
- [ ] **작업 규칙** — CLAUDE.md에 병렬 실행, 에이전트 위임 규칙 명시
