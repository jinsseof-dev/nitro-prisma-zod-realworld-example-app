# Vibe Coding Migration - Quick Reference

## What is "Vibe Coding"?

Transforming a project to be optimized for AI-assisted development with:

- Clear documentation (CLAUDE.md, architecture docs, API specs)
- Comprehensive testing (unit, integration, E2E, linting)
- Automated quality gates (ESLint, Prettier, pre-commit hooks, CI/CD)
- Custom skills for common workflows (bug fixing, test writing, code review)

---

## 3-Session Journey Timeline

### Session 1: Planning (01:59 - 03:47 UTC)

**User's Goal**: "이 프로젝트를 바이브 코딩을 위한 프로젝트로 전환하려고 해"

**Key Actions**:

- Deep interview to clarify scope (6 rounds, 17.5% ambiguity)
- Ralplan consensus planning (Planner → Architect → Critic)
- Initialize CLAUDE.md documentation
- Setup GitHub CLI + GitHub MCP

**Output**: Strategic plan, CLAUDE.md, OpenSpec structure

---

### Session 2: Setup Hiccup (02:05 - 02:08 UTC)

**User's Goal**: "openspec 설치해줘"

**Issue**: OpenSpec package unmaintained
**Resolution**: Later used as manual documentation tool

---

### Session 3: Full Implementation (03:47 - 06:44 UTC)

**User's Goal**: Transform project into fully automated AI-safe development environment

#### Phase 1: Documentation (03:47 - 04:30)

```
/opsx:apply 문서화해줘
```

**Output**:

- `docs/adr/architecture.md` (Nitro patterns, auth, error handling)
- `docs/adr/api-reference.md` (20 endpoints with schemas)
- `docs/adr/data-model.md` (4 models, ER diagram)
- `docs/adr/dev-workflow.md` (setup, commands, test patterns)
- `docs/adr/claude-skills.md` (skill usage guide)

#### Phase 2: GitHub Integration (04:30 - 05:00)

```
@docs/vibe-coding-transition-plan.md를 gh issue로 등록해줘
```

**Output**: GitHub Issue #1 with full acceptance criteria & task checklist

#### Phase 3: Custom Skills (05:00 - 05:45)

```
만들어진 문서들을 이용해서 이 프로젝트에서 필요한 클로드 스킬을 만들어줘
```

**Output**: 3 custom skills in `~/.claude/skills/`:

- `bugfix/` - Error analysis workflow
- `write-test/` - Test generation workflow
- `code-review/` - Code review with checklist

#### Phase 4: Testing (05:45 - 06:20)

```
이 프로젝트에 테스트를 추가하고 싶어. ut, it, e2e, lint까지 테스트를 구현해줘
```

**Output**:

- 8 unit test files with >=70% coverage target
- Fixed CI with `bunfig.toml` test root scoping
- Updated Husky hooks with bun PATH fix
- ESLint warnings: 42 → 23 (45% reduction)

#### Phase 5: Vibe Coding Activation (06:20 - 06:44)

```
바이브 코딩으로 체크리스트 항목 구현해보고 싶어
```

**Output**: PR #2 merged with all checklist items complete

---

## Critical User Prompts for Tutorial

### 1. Setup & Planning

```korean
이 프로젝트를 바이브 코딩을 위한 프로젝트로 전환하려고 해.
문서화 및 테스트, CI/CD까지 진행할거야.
이를 위한 심층인터뷰를 진행해줘.
```

**Pattern**: State goal → Request deep interview → Confirm via ralplan

### 2. Documentation Generation

```korean
openspec을 사용해서 이 프로젝트 문서화 해줘
```

**Pattern**: Use spec-driven workflow → Review completeness → Add missing pieces

### 3. GitHub Issue Management

```korean
@docs/vibe-coding-transition-plan.md를 gh issue로 등록해줘.
이슈에는 작업 배경, 개요, 인수조건이 들어가야 하고,
다른 작업과 의존 관계가 있을 경우 의존 관계도 기술해줘.
```

**Pattern**: Create from documentation → Include acceptance criteria → Track dependencies

### 4. Custom Skill Creation

```korean
만들어진 문서들을 이용해서 이 프로젝트에서 필요한 클로드 스킬을
공식 문서에 따라서 만들어줘.
궁금한게 있으면 askuserquestiontool을 사용해서 심층 인터뷰를 진행해
```

**Pattern**: Deep interview for requirements → Follow official docs → Split large files

### 5. Autonomous Feature Development

```korean
3번 새 기능 개발하자.
중간 중간 커밋도 하고 PR 올리면서 테스트코드도 돌리고,
실패하면 다시 테스트코드 성공할 때까지 돌리고.
자동으로 해봐
```

**Pattern**: Branch → Code → Test → Commit → PR → CI watch → Merge (automated)

### 6. Sequential Improvements

```korean
그다음 작업들 하나씩 진행해줘. 4개 순차로 해봐
```

**Pattern**: List options → User selects → Execute sequentially → Track in Issue

### 7. Code Quality Review

```korean
이 프로젝트를 리뷰하고 개선할 점을 제안해줘
```

**Pattern**: Comprehensive review → Create GitHub issues → Create management skill

---

## Key Decisions Made

| Decision                  | Rationale                                                                 |
| ------------------------- | ------------------------------------------------------------------------- |
| **ESLint v9 flat config** | Modern, explicit globals management for Nitro auto-imports                |
| **Prettier integration**  | Enforces consistent formatting (120 char, single quotes, trailing commas) |
| **Husky + lint-staged**   | Catch issues before commit; uses `postinstall` to avoid Nitro conflict    |
| **Bun + bun:test**        | Native TypeScript support, fast execution, built-in test runner           |
| **GitHub Actions CI/CD**  | Lint → Format → Test → Coverage on every PR                               |
| **Custom skills**         | Reusable workflows for bugfix, testing, code review specific to project   |
| **OpenSpec workflow**     | Spec-driven documentation + formal task generation                        |
| **Deep interview**        | Clarity on requirements before execution (17.5% ambiguity achieved)       |
| **Ralplan consensus**     | Planner → Architect → Critic validation before execution                  |

---

## Files Created

### Documentation (5 files in `docs/adr/`)

- `architecture.md` - Framework, routing, auth, data flow, errors
- `api-reference.md` - 20 endpoints with request/response
- `data-model.md` - 4 Prisma models, relationships, mappers
- `dev-workflow.md` - Setup, testing, CI/CD commands
- `claude-skills.md` - Usage guide for custom skills

### Configuration (7 files)

- `CLAUDE.md` - AI assistant context (Korean + English)
- `eslint.config.mjs` - ESLint v9 flat config with Nitro globals
- `.prettierrc` - Prettier config
- `.prettierignore` - Ignored paths
- `.editorconfig` - Editor settings
- `.husky/pre-commit` - Hook with bun PATH fix
- `bunfig.toml` - Test root scoping

### Custom Skills (3 in `~/.claude/skills/`)

- `bugfix/` - Error analysis → fix → test → report
- `write-test/` - Analyze → generate → test → verify → report
- `code-review/` - Review with 5-category checklist
- `issue-management/` - Create issues from review findings

### Tests (8+ files)

- Unit tests for utils: mappers, generate-token, hash-password, validate, verify-token, etc.
- Coverage: 56 pass, 100% Functions, 99.55% Lines

### CI/CD (2 workflows)

- `ci.yml` - ESLint → Prettier → Tests with coverage
- `test-hurl.yml` - RealWorld integration tests

---

## Measurable Outcomes

| Metric                | Before | After                     |
| --------------------- | ------ | ------------------------- |
| Documentation pages   | 0      | 5                         |
| Custom skills         | 0      | 4                         |
| Test coverage         | ~50%   | 100% Funcs / 99.55% Lines |
| ESLint warnings       | 42     | 23 (45% reduction)        |
| GitHub issues tracked | 0      | 4+                        |
| CI/CD workflows       | 1      | 2                         |
| Pre-commit hooks      | 0      | 2 (lint-staged + tests)   |

---

## How to Use This for Your Project

### 1. Start with Deep Interview

```bash
# Ask Claude to conduct deep interview for your project
"이 프로젝트를 바이브 코딩 프로젝트로 만들고 싶어. 심층 인터뷰 해줄래?"
```

### 2. Follow the 7-Phase Approach

1. **Planning** - Deep interview + ralplan consensus
2. **Documentation** - Create comprehensive guides
3. **Tools** - Setup ESLint, Prettier, testing framework
4. **Skills** - Create project-specific custom skills
5. **Testing** - Implement comprehensive test suite
6. **Automation** - Activate autonomous dev workflow
7. **Quality** - Continuous improvement with code reviews

### 3. Leverage Existing Skills

Once created, use skills to maintain quality:

```bash
/bugfix        # For bug analysis and fixes
/write-test    # For test generation
/code-review   # For comprehensive reviews
```

### 4. Use GitHub Issues for Tracking

- One issue per feature/improvement
- Include acceptance criteria
- Track dependencies
- Use issue management skill to create from reviews

---

## Common Prompts Patterns

### Investigation

"이 프로젝트를 리뷰하고 개선할 점을 제안해줘"

### Documentation

"만들어진 문서들을 이용해서 이 프로젝트에서 필요한 클로드 스킬을 만들어줘"

### Feature Development

"새 기능 개발하자. 자동으로 테스트하면서 진행해"

### Parallel Execution

"다음 작업 4개를 병렬로 진행해"

### Quality Assurance

"인수조건도 만족했는지 확인해"

---

## Success Criteria for Vibe Coding

✅ All critical code paths have tests
✅ Documentation explains architecture and workflows
✅ ESLint/Prettier configured with meaningful rules
✅ Pre-commit hooks catch issues before push
✅ CI/CD validates every PR
✅ Custom skills automate common workflows
✅ GitHub issues track all work
✅ Code reviews use consistent checklist
✅ Test coverage >=70%
✅ Build/test time <5 minutes

---

## Resources

- Full analysis: `VIBE-CODING-SESSION-ANALYSIS.md`
- CLAUDE.md: Project context for AI assistants
- Docs in `docs/adr/`: Architecture and API reference
- Skills in `~/.claude/skills/`: Custom workflows
- Issue #1: Overall transition tracking
