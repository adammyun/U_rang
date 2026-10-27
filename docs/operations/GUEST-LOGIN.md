# 게스트 로그인

2026-10-27 · `redesign/yeoun-2`

## 시연 방법

실서비스 `/login`에서 ‘게스트로 시작’을 누른다. ChatGPT 계정 없이 기억·사진 작성, 내 기록 수정/삭제, 댓글, 좋아요/북마크, 감정 메뉴 설정과 마이페이지를 사용할 수 있다. 헤더와 마이페이지에서 게스트 상태를 안내하고 모바일에서는 마이페이지의 ‘게스트 로그아웃’을 사용할 수 있다. 기존 ‘ChatGPT로 계속’도 유지한다.

게스트 로그인은 같은 브라우저에서 7일간 유지된다. 로그아웃·세션 만료·쿠키 삭제 후에는 이전 게스트의 기록을 다시 관리할 수 없다. 기록이 자동으로 계정에 이전되거나 이메일로 복구되는 기능은 없다. 세션 만료가 공개 기억의 자동 삭제를 뜻하지 않는다. 로그인 화면에서 이 제한을 안내한다.

GitHub Pages는 기존 IndexedDB 시연 세션의 버튼을 같은 ‘게스트로 시작’으로 표시한다. 해당 데이터는 브라우저 안에만 저장되고 실서비스 DB와 동기화하지 않는다. 기존 브라우저 저장 key와 기록은 보존한다.

## 인증과 개인정보

- 실제 계정의 호스팅 인증 헤더가 있으면 그것을 우선한다. 게스트가 계정의 기억을 상속하거나 다른 계정으로 위장하지 않는다. 기존 `getChatGPTUser()` 호출은 호환 경계로 유지하되 서버에서 검증한 guest provider도 반환한다.
- 게스트마다 새로운 무작위 사용자 ID와 256bit 무작위 세션 토큰을 만든다. 클라이언트가 보낸 user_id는 사용하지 않는다. 비밀번호·외부 API key·공유 개발 계정을 만들지 않는다.
- D1 `guest_sessions`에는 token_hash(SHA-256), user_id, expires_at, created_at만 저장한다. 원본 토큰은 HttpOnly·SameSite=Lax·Path=/ 쿠키로 전달하고 HTTPS에서는 Secure를 설정한다. 다른 브라우저나 다른 게스트는 별도 ID다.
- 생성·로그아웃은 POST만 사용하며 동일 Origin을 요구한다. 시작 요청은 strict Zod 검증, 복귀 주소는 앱 내부 상대 경로로 제한한다. 유효한 기존 게스트 세션으로 다시 시작하면 같은 ID를 유지한다. 로그아웃은 DB 세션을 폐기하고 쿠키를 만료시킨다. 재사용한 예전 토큰은 인증되지 않는다.
- 기존 기록·사진·댓글·개인 설정의 서버 소유자 검사를 그대로 사용한다. private/unlisted와 익명·근사 위치 정책은 유지한다. 소유자에 따라 달라지는 지도/근처/상세 GET 응답도 private/no-store로 처리한다.
- migration `0005_smiling_roughhouse.sql`은 기존 데이터에 영향을 주지 않는 추가 테이블/만료 index다. `pnpm db:migrate`에 포함되어 있다. 기존 실서비스에서도 같은 idempotent schema를 첫 게스트 요청 때 초기화한다.

## 실행 및 검사

새 환경은 README의 `pnpm db:setup`을 먼저 실행한다. 서버 브라우저 검사는 `pnpm test:server-ui`로 실행하며 localhost:5197 개발 서버를 사용한다. 기존 Pages 검사는 `pnpm test:ui`를 그대로 사용한다.

개발 서버 실행 후 `node scripts/verify-guest-service.mjs http://localhost:5197`는 localhost에서만 임시 게스트/기록/사진을 만든다. 서로 다른 게스트 격리, 원본 토큰 미저장과 만료, 위조·교차 사이트 요청·외부 복귀 주소 차단, 실제 계정 우선, 비공개 사진, 공개 근사 좌표, 댓글 소유자 삭제, 북마크, 개인 설정, 로그아웃 폐기를 검사한다. 생성한 기억·사진과 세션은 검사 후 정리한다.

브라우저 검사는 실제 Worker/D1 경로에서 게스트 로그인 → 설정 저장 → 사진 있는 비공개 기억 작성/열람/삭제 → 새로고침 후 세션 유지 → 로그아웃을 검증한다. Chromium/WebKit, desktop 1440×900/mobile 390×844를 사용한다. 실물 모바일 기기 검증과 구분한다.

검사 중 발견한 모바일 로그아웃 진입 부재를 마이페이지 버튼으로 보완했다. 서버 로그아웃의 전체 이동과 이전 URL refresh가 경합해 비로그인 마이페이지 안내가 다시 열리는 문제도 수정했다. 개발 서버가 Playwright의 HTML trace/report를 소스 변경으로 읽어 재로딩하던 문제는 해당 결과 디렉터리만 watch에서 제외해 해결했다. polling·기존 지도 설정은 유지한다.

## 주요 파일

- `app/login/page.tsx`, `github-pages/main.tsx`: 실제/시연판 로그인 선택.
- `app/chatgpt-auth.ts`, `src/server/guest-sessions.ts`: 계정 우선 및 게스트 세션 검증.
- `app/api/auth/guest/route.ts`, `logout/route.ts`: 시작·폐기.
- `src/features/auth/return-path.ts`, `api.ts`: 내부 복귀 경로와 로그아웃 연결.
- `components/memory-app.tsx`, `personal-space.tsx`, `app/atlas-collage.css`: 상태 표시·모바일 로그아웃.
- `db/schema.ts`, `drizzle/0005_*`: 추가 schema.
- `playwright.server.config.ts`, `tests/server-e2e/guest-login.spec.ts`, `scripts/verify-guest-service.mjs`: 서버 검증.

실행 결과와 공개 사이트 확인은 최종 검증 뒤 아래에 기록한다.
