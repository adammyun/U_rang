# GitHub Pages 기본 운영과 시연용 로그인

기준일: 2026-11-02

## 이용 주소

기본 사이트는 https://adammyun.github.io/U_rang/ 이다. 저장소 About과 README도 이 주소를 사용한다. 별도 서버로 이동하는 ‘공유·저장 실서비스’ 버튼과 배포 환경변수는 제거했다. ChatGPT 로그인은 이 사이트에 포함하지 않는다.

## 로그인과 저장

상단 로그인 → 게스트로 시작을 누르면 같은 GitHub 도메인에서 바로 이용한다. 마이페이지나 기억 작성에서 시작한 로그인은 기존 복귀 경로를 유지한다. 이메일·비밀번호·외부 계정·새 API 키는 필요하지 않다.

이는 실제 사용자 인증이 아닌 **시연용 브라우저 세션**이다. 한 브라우저의 같은 시연 사용자로 기억·사진·북마크·좋아요·댓글·발견 목록을 다룬다. 다른 방문자나 기기와 동기화하지 않으며 공용 브라우저에서 서로 다른 사람의 계정을 구분하지 않는다. 시연용 데이터로 사용한다.

- 로그인 여부: 기존 `yeoun_2.pages.auth.v1` localStorage 키, 만료 기간 없음
- 기억·사진·반응·댓글: 기존 IndexedDB `yeoun_2`, schema version 5 유지
- 로그아웃: 로그인 상태만 종료, 기록 삭제 없음
- 같은 브라우저에서 재시작: 같은 시연 사용자의 기록을 이어서 이용
- 사이트 데이터 삭제·다른 브라우저: 기존 기록 복구/공유 불가
- 사용자 업로드나 비공개 기록을 저장소 정적 자산에 업로드하지 않음

이전 저장 키와 사용자 ID, migration을 바꾸지 않아 기존 기록을 보존한다. 공개 지도/소유자 조회/익명·근사 위치 DTO의 기존 필터는 유지한다. 다만 브라우저 저장소 자체는 서버의 계정별 보안 경계가 아니다.

GitHub Pages는 HTML/CSS/JavaScript 정적 호스팅이다. 이 작업에서 서버 DB를 Pages에 설치하거나 가짜 로그인으로 서버 보안을 대신하지 않았다. [GitHub 공식 설명](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)

기존 Worker의 DB·인증 코드는 별도 개발 모드로 보존한다. 기존 Sites 배포를 삭제하거나 수정하지 않았고 현재 사이트에서 그 주소로 이동시키지 않는다. `LIVE-SERVICE.md`는 과거 서버 운영 기록이다.

## 변경 범위

- `github-pages/main.tsx`: 시연 로그인과 저장 범위를 쉬운 문구로 안내, 기존 게스트 동작 재사용
- `components/memory-app.tsx`: 별도 서비스 링크와 prop 제거
- `app/atlas-collage.css`: 제거된 링크 전용 스타일 정리
- `.github/workflows/pages.yml`, `.env.example`: 별도 서비스 URL 설정 제거
- README·시연 가이드·운영 문서: GitHub 주소를 기본 이용 경로로 통일
- `tests/e2e/demo-release.spec.ts`: 제거된 링크 테스트를 로그인·복귀·재접속·로그아웃 후 기록 보존 검사로 교체

MapLibre lifecycle, 크기 보정, raster compatibility layer, 울산 범위·위치 정책·지도 모드·사진·댓글·마이페이지 API와 저장 구조는 변경하지 않았다. 의존성 추가 없음.

## 로컬 실행과 배포

```bash
pnpm install --frozen-lockfile
pnpm build:pages
pnpm exec vite preview --config vite.pages.config.ts --host 127.0.0.1 --port 4173
```

http://127.0.0.1:4173/U_rang/ 을 연다. 거리뷰에는 기존 공개 NAVER Client ID 설정이 필요하다. 실제 공개 배포는 `redesign/yeoun-2`의 `Deploy GitHub Pages` workflow를 수동 실행한다. 기준 `main`과 원본 저장소는 보존한다.

## 검증

- `pnpm check`: lint·typecheck·단위 테스트 27개·Worker build·Pages build 통과.
- 기존 데이터/사진 migration, 사진 5장 작성·상세 스크롤, 마이페이지 좋아요·북마크·추천·지도 필터: Chromium/WebKit × 데스크톱 1440×900/모바일 390×844의 12개 검사 통과.
- 신규 게스트 로그인·마이페이지 복귀·새로고침·로그아웃·재로그인 검사: 네 브라우저/화면 조합 4개 최종 통과. 외부 OAuth/ChatGPT/서버 인증 요청이 없고 같은 origin에 머무는지도 확인했다.
- 초기 신규 테스트에서 수정 버튼과 기록 카드를 동시에 찾던 selector 및 모바일에서 숨겨진 상단 메뉴를 찾던 selector를 발견했다. 기록 카드 선택을 명확히 하고, 로그아웃 후 실제 하단 내 기억을 눌러 로그인 안내가 보이는지 검사하도록 수정했다. 제품의 로그아웃 동작은 바꾸지 않았다.
- 로그인 안내를 캡처해 확인한 뒤 버튼과 설명 사이 여백을 보완했다.

실제 계정 로그인·서버 공유는 이번 구현 범위가 아니다. 실물 모바일 기기의 검증은 수행하지 않았다. 기존 JS chunk 크기 경고는 남아 있다.

[데스크톱 로그인](../design/pages-main/login-desktop-chromium.png) · [모바일 로그인](../design/pages-main/login-mobile-webkit.png) · [데스크톱 지도](../design/pages-main/map-desktop-chromium.png) · [모바일 지도](../design/pages-main/map-mobile-webkit.png)

## 공개 배포 확인

- 배포 소스: `1359358605cfa25befa556093b66b88b39329e67`, `redesign/yeoun-2`
- [GitHub Pages 배포 실행](https://github.com/adammyun/U_rang/actions/runs/41375018917): 성공
- 실제 공개 주소의 새 로그인 제목과 시연 안내 확인
- 게스트로 시작 클릭 후 `https://adammyun.github.io/U_rang/#/` 복귀, 게스트 표시·울산 라인 지도·기억 마커 렌더링 확인
- 별도 서비스 링크 0개 확인
- 기존 사용자 기록의 삭제·서버 업로드 없이 확인
- [실제 공개 사이트 로그인 화면](../design/pages-main/live-login.png)

배포 workflow의 기존 Node 20 action deprecation 안내는 남아 있으며 배포는 성공했다. 이번 작업에서 관련 없는 action 버전이나 서버 인프라를 변경하지 않았다.
