## Context

이 프로젝트는 Nitro + Prisma + Zod 기반 RealWorld API 구현체로, 20개의 API 엔드포인트와 4개의 데이터 모델을 가지고 있다. CLAUDE.md가 이미 존재하여 AI 어시스턴트를 위한 기본 컨텍스트를 제공하지만, 체계적인 아키텍처 문서, API 레퍼런스, 데이터 모델 문서가 부재하다.

현재 상태:

- `CLAUDE.md`: AI 어시스턴트용 빠른 참조 가이드 (존재)
- `README.md`: 프로젝트 소개 및 설정 안내 (존재)
- 아키텍처 문서: 없음
- API 레퍼런스: 없음 (RealWorld 스펙 외부 참조만 존재)
- 데이터 모델 문서: Prisma 스키마에만 존재

## Goals / Non-Goals

**Goals:**

- openspec 스펙 파일로 프로젝트의 아키텍처, API, 데이터 모델을 체계적으로 문서화
- 코드 변경 없이 문서만 추가하여 프로젝트 이해도를 높임
- 실제 코드베이스에서 추출한 정확한 정보를 기반으로 문서 작성

**Non-Goals:**

- 기존 코드 변경 또는 리팩토링
- Swagger/OpenAPI 자동 생성
- 외부 문서 사이트 구축
- 배포 가이드 또는 운영 문서

## Decisions

### 1. 문서 구조: openspec specs 형식 사용

openspec의 `specs/<capability>/spec.md` 형식으로 문서를 구성한다. 각 capability는 독립적인 관심사를 다룬다.

**대안:** 단일 ARCHITECTURE.md 파일 → 길어질수록 유지보수 어려움
**선택 이유:** openspec 형식이 이미 프로젝트에 설정되어 있고, 구조화된 요구사항/시나리오 형식이 검증 가능한 문서를 만든다.

### 2. 3개 capability로 분리

- `architecture-docs`: 시스템 아키텍처 (프레임워크, 패턴, 흐름)
- `api-reference`: API 엔드포인트 레퍼런스
- `data-model-docs`: 데이터 모델 및 관계

**대안:** 단일 capability로 통합 → 문서가 너무 커지고 관심사가 혼재
**선택 이유:** 각 문서가 독립적으로 참조/업데이트 가능

### 3. 코드에서 직접 정보 추출

Prisma 스키마, 라우트 파일, 유틸리티 코드에서 직접 정보를 추출하여 문서화한다.

**대안:** 개발자 인터뷰 기반 → 프로젝트 규모에 비해 과도
**선택 이유:** 코드가 single source of truth이며, 자동화된 정보 추출이 정확도를 보장

## Risks / Trade-offs

- **문서-코드 동기화 위험** → openspec의 change 워크플로우로 코드 변경 시 문서 업데이트를 추적. CLAUDE.md에 문서 위치 참조 추가.
- **과도한 문서화** → 코드에서 쉽게 발견할 수 있는 정보는 제외. 파일 간 관계와 비명시적 패턴만 문서화.
- **RealWorld 스펙 중복** → API 레퍼런스는 이 프로젝트의 구현 세부사항(인증 방식, 에러 형식)에 초점. 범용 RealWorld 스펙은 외부 링크로 참조.
