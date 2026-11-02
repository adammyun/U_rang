# 마이페이지 메뉴 정리

2026-11-02 · `redesign/yeoun-2`

## 변경

- 하단 개인 공간 메뉴를 **내 기억 → 마이페이지**로 변경한다. 공개 지도·탐색·개인 공간에서 같은 이름을 사용한다.
- 마이페이지의 **지도 표현** 펼침 항목과 사용하지 않는 mode prop·스타일을 제거한다. 남은 연도·감정·공개 범위 항목은 한 열을 사용한다.
- 지도 모드는 기존 **조정 → 지도 표현 → 기본/다크/자세히**에서 계속 선택한다.
- 튜토리얼과 개발 도구의 개인 공간 안내를 마이페이지로 통일한다.
- 소유 기억을 뜻하는 체크박스 **내 기억**, 내 기록·북마크·좋아요 목록, 추천·숨은 이야기·지도 필터는 유지한다.

## 수정 위치와 보존 범위

주요 UI: `components/memories/atlas-navigation.tsx`, `components/memories/personal-space.tsx`, `components/memory-app.tsx`, `app/atlas-collage.css`. 안내: `components/onboarding/tutorial.tsx`, `components/dev/dev-tools.tsx`, README, 시연 가이드, 프로젝트 디자인 프로필. 관련 Pages/서버 E2E의 메뉴 selector도 새 이름으로 갱신했다.

`/my-map` 경로, tutorial target `data-tour="my-memories"`, 지도 인스턴스·크기 보정·raster fallback·단일 marker overlay, API·DB·인증·저장 키는 변경하지 않았다. 의존성 추가 없음.

## 검증

`pnpm check`의 lint·typecheck·단위 테스트 27개·Worker/Pages build를 통과했다. 기존 JS chunk 크기 경고는 남아 있다.

Playwright는 Chromium/WebKit, 데스크톱 1440×900·모바일 390×844에서 메뉴 위치·기억 작성·사진·공개 설정·개인 공간·지도 모드 전환을 확인한다. 실제 모바일 기기와 운영 서버 API는 이번 UI 작업에서 추가 검사하지 않는다.

모바일의 카메라 보존 검사에서 flyTo가 거의 끝난 상태를 완료로 판단하던 테스트 타이밍을 발견했다. 제품 지도 로직은 유지하고, 테스트 helper가 최종 zoom 및 연속 프레임의 같은 viewBox를 확인하도록 보완했다. 기존 카메라 값의 정확한 일치 assertion은 유지한다. 스크린샷은 개인 목록 로딩 완료 후 캡처한다.


최종 결과: 공통 내비게이션/작성·사진·공개 설정/조정의 지도 모드 8건과 개인 공간 4건, 총 12개 브라우저·화면 조합 검사 통과. 테스트 보완 후 lint·typecheck도 다시 통과했다.

[데스크톱](mypage-navigation/desktop-chromium.png) · [모바일](mypage-navigation/mobile-webkit.png)


공개 배포: 소스 `9f970a40c31bac609d058fff8cb6daa26d9a806a`, [Pages 배포 성공](https://github.com/adammyun/U_rang/actions/runs/41375836291). 실제 https://adammyun.github.io/U_rang/#/?personal=1 에서 새로고침 후 하단 마이페이지 버튼 표시 및 개인 패널의 지도 표현 요소 0개를 확인했다. 첫 접속은 이전 캐시 화면을 보였으나 일반 새로고침으로 최신 버전이 표시되었다. 저장소를 비우거나 사용자 기록을 변경하지 않았다.
