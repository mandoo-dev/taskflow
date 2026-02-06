# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소에서 작업할 때 참고하는 가이드입니다.

## 프로젝트 개요

TaskFlow는 TDD 기반의 할 일 관리 애플리케이션으로, 모노레포 구조로 구성되어 있습니다.

## 아키텍처

모노레포 최상위 디렉터리 구성:

- **backend/** — Hono, Drizzle ORM, SQLite, Zod를 사용하는 REST API 서버
- **frontend/** — React, Vite, TailwindCSS를 사용하는 SPA
- **e2e/** — E2E(End-to-End) 테스트

## 개발 방식

이 프로젝트는 **TDD(테스트 주도 개발)** 를 따릅니다. 구현 코드보다 테스트를 먼저 작성합니다. 각 패키지의 루트에 `tests/` 디렉터리가 있습니다.

## 기술 스택

| 계층      | 기술                                |
|----------|-------------------------------------|
| 백엔드    | Hono, Drizzle ORM, SQLite, Zod      |
| 프론트엔드 | React, Vite, TailwindCSS            |
| 테스트    | Vitest (단위/통합), Playwright (E2E)  |

## 주요 명령어

각 패키지 디렉터리(`backend/` 또는 `frontend/`)에서 실행합니다.

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 전체 테스트 실행
npm test

# 단일 테스트 파일 실행
npx vitest run path/to/test.ts

# 워치 모드로 테스트 실행
npx vitest path/to/test.ts

# 린트
npm run lint

# 빌드
npm run build
```

### E2E 테스트 (`e2e/` 디렉터리에서 실행)

```bash
npx playwright test
npx playwright test path/to/test.spec.ts
```

## 코드 컨벤션
- Typescript strict mode
- 함수형 컴포넌트 + Hooks
- 에러는 Zod 스키마로 검증
- 한글 주석 허용