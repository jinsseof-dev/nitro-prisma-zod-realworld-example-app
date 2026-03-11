## ADDED Requirements

### Requirement: 핵심 유틸리티 유닛 테스트

시스템 SHALL server/utils/ 내 핵심 유틸리티 함수에 대한 유닛 테스트를 제공해야 한다.

#### Scenario: JWT 토큰 생성 테스트

- **WHEN** `useGenerateToken(userId)`를 호출할 때
- **THEN** 유효한 JWT 토큰이 생성되고, 디코딩 시 `{user: {id: userId}}` 페이로드를 포함해야 한다

#### Scenario: 비밀번호 해싱 테스트

- **WHEN** `useHashPassword(password)`로 해싱 후 `useDecrypt(password, hash)`로 비교할 때
- **THEN** 동일한 비밀번호는 `true`, 다른 비밀번호는 `false`를 반환해야 한다

#### Scenario: Zod 검증 성공 테스트

- **WHEN** `validateBody(schema, validBody)`를 호출할 때
- **THEN** 파싱된 데이터를 반환해야 한다

#### Scenario: Zod 검증 실패 테스트

- **WHEN** `validateBody(schema, invalidBody)`를 호출할 때
- **THEN** `HttpException(422)`를 발생시키고 필드별 에러 메시지를 포함해야 한다

#### Scenario: 아티클 매퍼 테스트

- **WHEN** `articleMapper(prismaArticle, userId)`를 호출할 때
- **THEN** `tagList`가 이름 배열로, `favorited`가 boolean으로, `favoritesCount`가 숫자로 변환되어야 한다

#### Scenario: 프로필 매퍼 테스트

- **WHEN** `profileMapper(user, currentUserId)`를 호출할 때
- **THEN** `following` 필드가 `followedBy` 배열에 `currentUserId` 포함 여부로 계산되어야 한다

### Requirement: 테스트 커버리지 목표

시스템 SHALL server/utils/ 기준 테스트 커버리지 >= 70%를 달성해야 한다.

#### Scenario: 커버리지 리포트 생성

- **WHEN** `bun test --coverage`를 실행할 때
- **THEN** server/utils/ 디렉토리의 커버리지가 70% 이상이어야 한다

### Requirement: 테스트 패턴 표준화

시스템 SHALL Nitro 환경에서의 테스트 작성 패턴을 표준화해야 한다.

#### Scenario: Nitro 자동 임포트 모킹

- **WHEN** `createError` 등 자동 임포트를 사용하는 모듈을 테스트할 때
- **THEN** import 전에 `globalThis`에 해당 함수를 설정하는 패턴을 따라야 한다

#### Scenario: 환경 변수 의존 모듈 테스트

- **WHEN** import 시점에 환경 변수를 읽는 모듈을 테스트할 때
- **THEN** `beforeAll`에서 환경 변수 설정 후 동적 `import()`를 사용해야 한다
