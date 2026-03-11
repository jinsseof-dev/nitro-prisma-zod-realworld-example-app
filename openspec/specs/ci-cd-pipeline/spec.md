## ADDED Requirements

### Requirement: 코드 품질 CI 워크플로우

시스템 SHALL GitHub Actions에서 코드 품질을 자동 검증하는 CI 워크플로우(ci.yml)를 제공해야 한다.

#### Scenario: PR 시 코드 품질 검증

- **WHEN** main 브랜치에 PR이 생성되거나 push될 때
- **THEN** 체크아웃 → Bun 설정 → 의존성 설치 → Nitro 준비 → Prisma 클라이언트 생성 → ESLint → Prettier 확인 → 커버리지 포함 유닛 테스트가 순서대로 실행되어야 한다

#### Scenario: ESLint 실패 시 CI 실패

- **WHEN** ESLint 규칙 위반이 발견될 때
- **THEN** CI 워크플로우가 실패하고 위반 내용이 로그에 출력되어야 한다

#### Scenario: 포매팅 불일치 시 CI 실패

- **WHEN** Prettier 포매팅 규칙에 어긋나는 파일이 있을 때
- **THEN** CI 워크플로우가 실패하고 불일치 파일이 로그에 출력되어야 한다

#### Scenario: 유닛 테스트 실패 시 CI 실패

- **WHEN** 유닛 테스트가 실패할 때
- **THEN** CI 워크플로우가 실패하고 실패 테스트 정보가 로그에 출력되어야 한다

### Requirement: 기존 통합 테스트 CI 유지

시스템 SHALL 기존 Hurl 통합 테스트 CI 워크플로우(test-hurl.yml)를 유지해야 한다.

#### Scenario: 통합 테스트 실행

- **WHEN** main 브랜치에 PR이 생성되거나 push될 때
- **THEN** 기존 `test-hurl.yml` 워크플로우가 정상 실행되어 RealWorld API 스펙을 검증해야 한다

### Requirement: CI 전체 통과

시스템 SHALL 모든 CI 워크플로우가 통과하는 상태를 유지해야 한다.

#### Scenario: 전체 CI 통과 확인

- **WHEN** 모든 변경 사항이 적용된 후
- **THEN** `ci.yml`과 `test-hurl.yml` 모두 통과해야 한다
