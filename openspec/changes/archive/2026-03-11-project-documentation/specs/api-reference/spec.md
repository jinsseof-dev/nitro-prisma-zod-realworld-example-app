## ADDED Requirements

### Requirement: 사용자 인증 API 문서

시스템 SHALL 사용자 등록, 로그인, 현재 사용자 조회/수정 엔드포인트를 문서화해야 한다.

#### Scenario: 사용자 등록 엔드포인트 참조

- **WHEN** 개발자가 사용자 등록 API를 이해하려 할 때
- **THEN** 문서에서 `POST /api/users` 엔드포인트의 요청 본문(`{user: {username, email, password}}`), Zod 스키마(`registerUserSchema`), 응답 형식(`{user: {email, token, username, bio, image}}`), 상태 코드(201)를 확인할 수 있어야 한다

#### Scenario: 로그인 엔드포인트 참조

- **WHEN** 개발자가 로그인 API를 이해하려 할 때
- **THEN** 문서에서 `POST /api/users/login` 엔드포인트의 요청 본문(`{user: {email, password}}`), 인증 흐름(bcrypt 비교 → JWT 생성), 에러 응답(401, 422)을 확인할 수 있어야 한다

### Requirement: 아티클 CRUD API 문서

시스템 SHALL 아티클 생성, 조회, 수정, 삭제, 목록, 피드 엔드포인트를 문서화해야 한다.

#### Scenario: 아티클 목록 조회 필터 참조

- **WHEN** 개발자가 아티클 목록 필터링을 이해하려 할 때
- **THEN** 문서에서 `GET /api/articles` 의 쿼리 파라미터(`tag`, `author`, `favorited`, `limit`, `offset`), 인증 선택적(`requireAuth: false`), 응답 형식(`{articles: [...], articlesCount}`)을 확인할 수 있어야 한다

#### Scenario: 아티클 생성 엔드포인트 참조

- **WHEN** 개발자가 아티클 생성 API를 이해하려 할 때
- **THEN** 문서에서 `POST /api/articles`의 인증 필수, 요청 본문(`{article: {title, description, body, tagList?}}`), slug 생성 로직(slugify + UUID), 태그 connectOrCreate 패턴, 응답 매핑(articleMapper)을 확인할 수 있어야 한다

### Requirement: 댓글 API 문서

시스템 SHALL 댓글 생성, 조회, 삭제 엔드포인트를 문서화해야 한다.

#### Scenario: 댓글 API 참조

- **WHEN** 개발자가 댓글 관련 API를 이해하려 할 때
- **THEN** 문서에서 `GET/POST /api/articles/[slug]/comments`, `DELETE /api/articles/[slug]/comments/[id]`의 경로 파라미터, 인증 요구사항, 요청/응답 형식을 확인할 수 있어야 한다

### Requirement: 프로필 및 팔로우 API 문서

시스템 SHALL 프로필 조회, 팔로우/언팔로우 엔드포인트를 문서화해야 한다.

#### Scenario: 팔로우 API 참조

- **WHEN** 개발자가 팔로우 기능을 이해하려 할 때
- **THEN** 문서에서 `POST/DELETE /api/profiles/[username]/follow`의 인증 필수, 자기 자신 팔로우 방지 로직, 응답의 `following` 필드를 확인할 수 있어야 한다

### Requirement: 즐겨찾기 및 태그 API 문서

시스템 SHALL 즐겨찾기 토글과 태그 목록 엔드포인트를 문서화해야 한다.

#### Scenario: 즐겨찾기 API 참조

- **WHEN** 개발자가 즐겨찾기 기능을 이해하려 할 때
- **THEN** 문서에서 `POST/DELETE /api/articles/[slug]/favorite`의 인증 필수, Prisma의 connect/disconnect 패턴, `favorited`/`favoritesCount` 응답 필드를 확인할 수 있어야 한다
