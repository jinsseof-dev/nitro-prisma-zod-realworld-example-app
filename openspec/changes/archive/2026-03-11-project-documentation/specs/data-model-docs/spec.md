## ADDED Requirements

### Requirement: User 모델 문서

시스템 SHALL User 모델의 필드, 관계, 제약 조건을 문서화해야 한다.

#### Scenario: User 모델 구조 참조

- **WHEN** 개발자가 User 관련 기능을 구현하려 할 때
- **THEN** 문서에서 User 모델의 필드(`id`, `email`, `username`, `password`, `image`, `bio`), 유니크 제약(`email`, `username`), 관계(articles, favorites, followers/following 자기참조, comments)를 확인할 수 있어야 한다

#### Scenario: 팔로우 관계 이해

- **WHEN** 개발자가 팔로우/팔로잉 기능을 수정하려 할 때
- **THEN** 문서에서 User 자기참조 다대다 관계(`followedBy`/`following`)의 구조와 Prisma의 implicit 조인 테이블 사용 방식을 확인할 수 있어야 한다

### Requirement: Article 모델 문서

시스템 SHALL Article 모델의 필드, 관계, 제약 조건을 문서화해야 한다.

#### Scenario: Article 모델 구조 참조

- **WHEN** 개발자가 Article 관련 기능을 구현하려 할 때
- **THEN** 문서에서 Article 모델의 필드(`id`, `slug`, `title`, `description`, `body`, `createdAt`, `updatedAt`), 유니크 제약(`slug`), 관계(author → User, tagList → Tag[], favoritedBy → User[], comments → Comment[])를 확인할 수 있어야 한다

#### Scenario: 태그 다대다 관계 이해

- **WHEN** 개발자가 태그 기능을 수정하려 할 때
- **THEN** 문서에서 Article-Tag 다대다 관계와 `connectOrCreate` 패턴을 확인할 수 있어야 한다

### Requirement: Comment 모델 문서

시스템 SHALL Comment 모델의 필드, 관계, 캐스케이드 삭제 동작을 문서화해야 한다.

#### Scenario: Comment 모델 캐스케이드 삭제 이해

- **WHEN** 개발자가 Article 또는 User 삭제 시 댓글 동작을 이해하려 할 때
- **THEN** 문서에서 Comment의 `onDelete: Cascade` 설정(Article 삭제 시 관련 댓글 자동 삭제, User 삭제 시 관련 댓글 자동 삭제)을 확인할 수 있어야 한다

### Requirement: Tag 모델 문서

시스템 SHALL Tag 모델의 필드, 유니크 제약, Article과의 관계를 문서화해야 한다.

#### Scenario: Tag 모델 구조 참조

- **WHEN** 개발자가 태그 관련 기능을 구현하려 할 때
- **THEN** 문서에서 Tag 모델의 필드(`id`, `name`), 유니크 제약(`name`), Article과의 다대다 관계를 확인할 수 있어야 한다

### Requirement: 응답 매퍼 문서

시스템 SHALL Prisma 결과를 API 응답으로 변환하는 매퍼 함수들을 문서화해야 한다.

#### Scenario: articleMapper 동작 이해

- **WHEN** 개발자가 아티클 응답 형식을 이해하려 할 때
- **THEN** 문서에서 `articleMapper`가 `tagList`를 이름 배열로 변환, `favoritedBy`에서 `favorited` boolean 계산, `_count.favoritedBy`에서 `favoritesCount` 추출, `authorMapper`를 통한 author 매핑을 수행하는 과정을 확인할 수 있어야 한다

#### Scenario: profileMapper와 authorMapper 차이 이해

- **WHEN** 개발자가 프로필 응답과 작성자 응답의 차이를 이해하려 할 때
- **THEN** 문서에서 두 매퍼 모두 `username`, `bio`, `image`, `following`을 반환하지만 `profileMapper`는 Profile 타입을 반환하고 `authorMapper`는 Article 응답 내 중첩 객체로 사용됨을 확인할 수 있어야 한다
