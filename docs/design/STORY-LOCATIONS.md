# 숨은 이야기 확장과 개발 도구 위치 확인

2026-11-02 · `redesign/yeoun-2`

## 동작

- 기존 5곳을 보존하고 울산 동헌 및 내아·경상좌도병영성·선암호수공원·삼산동 일대를 추가해 총 9곳을 제공한다.
- 일반 지도 표시 기준을 확대 14.6 → 15.8로 높였다. 작은 책 표식은 처음에는 희미하고 hover/focus에서 강조된다.
- 개발 도구에 전체 이야기 목록·장소·제목·좌표·위치 확인 링크를 추가했다. 알려진 공개 카탈로그 ID만 받아 확대 16.2의 해당 위치로 이동한다.
- 위치만 확인하면 대화상자를 열거나 발견 기록을 만들지 않는다. 이야기를 실제 열었을 때만 기존 인증/보관 흐름을 따른다.
- 마이페이지에서 이미 발견한 위치를 다시 보는 표시는 낮은 확대 수준에서도 유지한다. 상세의 지도에서 보기 역시 확대 16.2를 사용한다.

개발 도구는 기존처럼 공개된 기억 문구를 빠르게 5번 탭해 연다. 새 관리자 권한이나 기억 DB 조회를 추가하지 않았다.

## 구조와 변경 파일

콘텐츠·공통 확대 기준: `src/features/stories/catalog.ts`. 출처/검증일 표기: `components/stories/place-story-dialog.tsx`. [내용 근거와 좌표 출처](../operations/PLACE-STORIES.md)

개발 도구 UI: `components/dev/dev-tools.tsx`, `app/atlas-collage.css`. 새 공개 위치 링크: `app/page.tsx`, `github-pages/main.tsx`, `components/memory-app.tsx`. 카메라 초기화와 표식: `components/memories/map.tsx`.

지도는 유효한 이야기 ID가 있는 경우에만 초기 카메라를 해당 장소로 설정한다. 초기 값을 한 번만 캡처해 재렌더·지도 모드 변경으로 인스턴스를 재생성하지 않는다. 나머지 초기 위치 정책·울산 범위 제한·크기 보정·ResizeObserver·raster 호환 레이어·단일 marker overlay·attribution은 유지했다. 임의 좌표·확대 수준을 URL로 받지 않는다.

기존 이야기 ID, 보관 저장 키, 익명·소유자 경계, API와 DB schema는 유지했다. 새 migration이나 패키지는 없다. 데이터는 정적 공공 장소 카탈로그이며 비공개 기억·사용자 위치·인기 집계에 접근하지 않는다. 기본 배포는 기존 GitHub Pages다.

## 검증

- `pnpm check`: lint·typecheck·단위 테스트 27개·Worker/Pages build 통과.
- Chromium/WebKit × 데스크톱 1440×900/모바일 390×844에서 탐색·로그인 복귀·최초/중복 보관·마이페이지 발견 목록의 지도 연결: 12개 검사 통과.
- 개발 도구 9곳 표시·신규 4곳 이동과 중심 정렬·출처가 있는 읽기 화면·위치 확인만으로 보관하지 않음·15.2에서 표식 숨김·알 수 없는 ID의 기본 카메라 복귀: 4개 검사 최종 통과.
- 잘못된 ID 복귀 검사의 초기 고정 zoom 가정은 울산 maxBounds에 따른 데스크톱 카메라 보정을 반영하지 못했다. 제품 동작을 유지하고 정상 기본 지도와 viewBox가 정확히 같은지 비교하도록 테스트를 수정했다.
- 실제 스크린샷을 확인한 뒤 카드 사이 16px 간격을 보완하고 해당 브라우저 검사를 다시 통과했다.

기존 JS chunk 크기 경고는 남아 있다. 실제 모바일 기기·현장 방문·별도 Sites 서버 재배포/운영 API는 이번 작업에서 확인하지 않았다. 서버 빌드는 통과했다.

[데스크톱 개발 도구](story-locations/dev-desktop-chromium.png) · [모바일 개발 도구](story-locations/dev-mobile-webkit.png)


## 공개 배포 확인

- 배포 소스: `48d2cc74a060d233fb20dc43cc3c636c68cf13bf`
- [GitHub Pages 배포 성공](https://github.com/adammyun/U_rang/actions/runs/41404023266)
- 실제 [개발 도구](https://adammyun.github.io/U_rang/#/dev)에서 전체 9곳·표시 기준 15.8·위치 링크 확인
- 울산 동헌 및 내아 위치 링크 → `#/?storyLocation=ulsan-dongheon` 이동, 해당 이야기 표식 표시, 자동 열린 대화상자 0개 확인
- 실제 사용자 기억·발견 기록을 추가/삭제하지 않고 검사
- [실제 공개 개발 도구 전체 화면](story-locations/live-dev.png) · [추가된 네 이야기 구간](story-locations/live-new-stories.png)

기존 GitHub Actions Node 20 action deprecation 안내는 남아 있으며 배포는 성공했다. 관련 없는 배포 설정이나 기존 사이트를 수정하지 않았다.
