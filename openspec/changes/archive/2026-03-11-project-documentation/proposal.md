## Why

이 프로젝트에는 체계적인 기술 문서가 부재하여 새로운 개발자(사람 또는 AI)가 프로젝트 구조와 컨벤션을 이해하는 데 시간이 걸린다. RealWorld 스펙을 따르는 완성된 백엔드 API이므로, 아키텍처 결정 사항과 개발 워크플로우를 문서화하면 기여 장벽을 크게 낮출 수 있다.

## What Changes

- 프로젝트 아키텍처 문서 추가 (Nitro 파일 기반 라우팅, 인증 패턴, 데이터 흐름)
- API 엔드포인트 레퍼런스 문서 추가 (RealWorld 스펙 기반 20개 엔드포인트)
- 데이터 모델 문서 추가 (Prisma 스키마 기반 4개 모델 + 관계)
- 개발 환경 설정 및 워크플로우 가이드 추가 (setup, test, lint, CI/CD)
- 에러 처리 패턴 문서 추가 (HttpException, createError, Prisma 에러 핸들링)

## Capabilities

### New Capabilities

- `architecture-docs`: 프로젝트 아키텍처 문서 — Nitro 프레임워크 구조, 파일 기반 라우팅, 인증 패턴, 데이터 흐름, 에러 처리
- `api-reference`: API 엔드포인트 레퍼런스 — 각 엔드포인트의 메서드, 경로, 인증 요구사항, 요청/응답 형식
- `data-model-docs`: 데이터 모델 문서 — Prisma 스키마 기반 엔티티, 관계, 제약 조건

### Modified Capabilities

(없음 — 기존 기능 변경 없이 문서만 추가)

## Impact

- 새 파일: `openspec/specs/` 하위에 스펙 문서 생성
- 기존 코드 변경: 없음
- 의존성 변경: 없음
- CI/CD 영향: 없음
