## 1. 아키텍처 문서 작성

- [x] 1.1 Nitro 프레임워크 구조 문서 작성 — 파일 기반 라우팅 규칙, 메서드 서픽스, 동적 세그먼트, CORS 핸들러
- [x] 1.2 Nitro auto-imports 전체 목록 문서화 — 각 함수의 역할과 사용 예시
- [x] 1.3 인증 패턴 문서 작성 — `definePrivateEventHandler` 동작, `requireAuth` 옵션, auth 컨텍스트
- [x] 1.4 요청-응답 데이터 흐름 문서 작성 — Zod 검증 → Prisma 쿼리 → 매퍼 → 응답 파이프라인
- [x] 1.5 에러 처리 패턴 문서 작성 — HttpException, createError, handleUniqueConstraintError 사용법

## 2. API 레퍼런스 문서 작성

- [x] 2.1 사용자 인증 API 문서 — POST /api/users, POST /api/users/login, GET/PUT /api/user
- [x] 2.2 아티클 CRUD API 문서 — GET/POST /api/articles, GET/PUT/DELETE /api/articles/[slug], GET /api/articles/feed
- [x] 2.3 댓글 API 문서 — GET/POST /api/articles/[slug]/comments, DELETE /api/articles/[slug]/comments/[id]
- [x] 2.4 프로필 및 팔로우 API 문서 — GET /api/profiles/[username], POST/DELETE /api/profiles/[username]/follow
- [x] 2.5 즐겨찾기 및 태그 API 문서 — POST/DELETE /api/articles/[slug]/favorite, GET /api/tags

## 3. 데이터 모델 문서 작성

- [x] 3.1 User 모델 문서 — 필드, 유니크 제약, 자기참조 팔로우 관계
- [x] 3.2 Article 모델 문서 — 필드, slug 유니크 제약, author/tagList/favoritedBy/comments 관계
- [x] 3.3 Comment 모델 문서 — 필드, onDelete Cascade 동작
- [x] 3.4 Tag 모델 문서 — 필드, 유니크 제약, Article 다대다 관계
- [x] 3.5 응답 매퍼 문서 — articleMapper, authorMapper, profileMapper 동작과 차이점

## 4. 문서 통합 및 검증

- [x] 4.1 openspec/specs/ 디렉토리에 최종 스펙 파일 아카이브
- [x] 4.2 CLAUDE.md에 openspec 문서 위치 참조 추가
- [x] 4.3 전체 문서 내용이 실제 코드베이스와 일치하는지 검증
