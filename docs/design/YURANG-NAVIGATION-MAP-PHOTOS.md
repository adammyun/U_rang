# 지도 위 가독성·탐색·사진 보완

작성일: 2026-10-22 · 작업 브랜치: `redesign/yeoun-2`

## 요청과 확인한 원인

- 헤더와 소개 문구는 밝은 건물·도로 위에 직접 놓인다. 패널을 추가하지 않고 얕은 공통 텍스트 그림자와 로고 윤곽 그림자로 읽기 쉽게 했다. 커서 원형 마스크와 모바일 숨김은 유지했다.
- 공개 탐색은 과거 CSS 때문에 하단 메뉴를 숨겼고, 내 기억은 별도 메뉴 두 개를 사용했다. `AtlasNavigation`에서 지도·탐색·내 기억과 작성 CTA를 공유하고 목록 하단을 메뉴 위로 올렸다.
- 빈 지도 클릭/길게 누르기의 위치 callback이 공개 지도와 내 기억 모두 즉시 작성에 연결돼 있었다. 일반 상태에서는 callback을 무시하고 작성 CTA로 시작한 위치 선택 중에만 핀을 옮긴다. 검색 결과의 명시적인 작성 버튼은 유지했다.
- 사진은 대표 사진·장식용 복제·본문 쪽 갤러리에 흩어져 있었다. 복제를 없애고 상세의 왼쪽 사진 영역에 실제 첨부 전부를 세로로 배치했다. 데스크톱은 본문과 함께 기존 상세 스크롤로 끝까지 읽고, 모바일은 대표 사진 → 제목·본문 → 나머지 사진 순서로 읽는다. 작성 중 미리보기는 별도의 높이 제한 세로 스크롤과 44px 삭제 버튼을 사용한다. 작은 회전·엇갈림·겹침은 사진에만 적용한다.
- 기본/다크는 지도 중심이 정적 울산 데이터 bbox 밖이면 상세 raster로 fallback하는 구조였다. 카메라 이동 제약이 없어서 축소·이동 중 이 조건에 진입할 수 있었다.

## 지도 범위와 확대

`src/features/map/constants.ts`에서 공통 범위를 선언한다.

- 서쪽/남쪽: 경도 129.17, 위도 35.44
- 동쪽/북쪽: 경도 129.46, 위도 35.66
- 최대 zoom: 17
- 최소 zoom 설정: 10. MapLibre `maxBounds`가 viewport 크기에 필요한 실제 최소 zoom을 추가로 적용하므로 화면비마다 실효 하한은 다르다.

이 사각형은 제공 중인 울산 도심 지도 데이터의 범위다. 울산시 전체 행정 경계에 대한 polygon 판정이 아니다. 기본/다크/자세히, 확대 버튼·wheel·pinch·검색·클러스터·현재 위치 이동 모두 같은 MapLibre 카메라 제약을 사용한다. 스타일 전환으로 카메라나 기억 마커를 복제하지 않는다.

Chromium에서는 완전한 소실이 재현되지 않았으나 **WebKit의 zoom 17 실제 캡처에서 도로·건물이 모두 사라지는 현상을 확인했다.** DOM에 경로가 남아 있어 존재 여부 검사만으로는 통과했다. 전 세계 zoom-0 SVG 좌표를 그대로 사용하면서 viewBox가 1보다 훨씬 작은 크기가 되는 방식이 원인이었다. `ulsan-line-map.tsx`에서 울산 중심을 원점으로 한 확대된 지역 좌표로 그리도록 변경하고 건물 셀 조회도 같은 단위를 사용한다. MapLibre 카메라와 기억 좌표는 변경하지 않는다. 기존 화면 픽셀 기준 선 두께 보정도 새 단위에 맞게 보존한다.

확대 상한 17은 과도한 확대를 막는 보조 제약이며, 소실 수정을 상한만 낮추는 것으로 처리하지 않았다. 회귀 테스트는 중심 영역의 실제 스크린샷에서 건물 레이어를 숨겼을 때 픽셀이 달라지는지, 배경 자체는 안정적인지도 비교한다. 최대 확대·반복 축소·드래그 캡처를 직접 확인한다.

범위 밖 현재 위치도 실제 좌표를 보존한다. 가짜 위치를 울산에 표시하지 않는다. 지도의 카메라만 울산 안에 머물고 범위 밖이라는 안내를 표시한다. 권한 거부/실패의 울산 fallback은 유지한다. 라인 데이터 요청 실패 시 raster 호환 배경과 OSM attribution도 유지한다.

## 변경 파일

- `components/memories/atlas-navigation.tsx`, `atlas-location-picker.tsx`: 두 지도에서 공유하는 하단 메뉴와 장소 선택 안내.
- `components/memory-app.tsx`, `components/my-memory-map.tsx`: 메뉴와 작성 진입 상태 연결.
- `app/page.tsx`, `github-pages/main.tsx`: 내 기억의 탐색 링크가 공개 탐색 패널을 열도록 `explore=1` UI 진입값 전달. API 계약 변경 없음.
- `components/memories/map.tsx`, `src/features/map/constants.ts`: 공통 카메라 범위·zoom 제약과 지도 접근성 안내. `ulsan-line-map.tsx`, `ulsan-urban-layers.tsx`: WebKit 확대 소실을 막는 지역 좌표계.
- `components/memories/memory-form.tsx`, `spatial-panels.tsx`, `app/atlas-collage.css`: 사진 스크롤·콜라주, 가독성 그림자, 메뉴 위 목록 배치.
- `components/onboarding/tutorial.tsx`: 자동 작성 제거에 맞춘 안내.
- `tests/e2e/navigation-map-photos.spec.ts`, 기존 관련 테스트와 `playwright.config.ts`: Chromium/WebKit 데스크톱·모바일 검증.
- 디자인 프로필·Design DNA·기능 기준선·시연 가이드: 사용자 지정 동작 변경 기록.

인증·기억 저장·사진 검증/저장·private/unlisted/anonymous/approximate 정책과 서버/API/저장소는 수정하지 않았다. MapLibre lifecycle·크기 보정·ResizeObserver·Safari 선 두께 보정·raster compatibility·출처·단일 marker overlay를 보존했다.

## 검증

- 전체 Playwright: **78/78 통과**, 6.0분. Chromium/WebKit × 데스크톱·모바일. 작성·공개/비공개·사진·검색·필터·테마 전환·장소 그룹·내 기억 수정/삭제·뒤로가기·키보드·튜토리얼 회귀를 확인했다.
- 마지막 모바일 탐색 패널의 zoom 버튼 가림 보완 후 영향 구간 **12/12 재통과**, 2.0분. 탐색 중 부분적으로 가려지는 zoom controls는 모바일에서만 잠시 숨기며 지도 탭으로 돌아오면 다시 사용할 수 있다. 조정 버튼과 세 하단 메뉴는 유지된다.
- `pnpm check`: lint·typecheck·단위 테스트 10개·Worker build·Pages build 통과. 기존 bundle 크기 및 framework route 분류 안내는 남아 있으며 빌드 실패는 없다.
- 확대의 WebKit 픽셀 비교, 도로/경계의 화면 선 두께, 스타일 전환 후 marker 일치와 viewport 이동을 검증했다.
- 첫 전체 실행의 감정 접힘 검사는 짧은 애니메이션 이후 DOM을 읽어 실패했다. MutationObserver로 전환 순간의 애니메이션·inert·aria-hidden을 함께 기록하도록 수정했다. 기준을 완화하지 않고 전체 재실행으로 통과했다.
- 실제 앱 미리보기 브라우저에서도 확대된 건물·도로와 헤더/탐색 패널/하단 메뉴를 직접 확인했다.
- 실물 iPhone/iPad Safari, 외부 Worker의 실제 로그인 및 서버 DB 연결은 이번 환경에서 별도 시연하지 않았다. 브라우저 UI는 Pages production build에서 검증했고 Worker는 빌드 검사했다.

캡처는 가상 시연 데이터만 사용했다. `navigation-map-photos/`의 데스크톱 메인, 모바일 메인, 사진 선택·상세·스크롤, WebKit 최대 확대를 확인할 수 있다. 실제 사용자 브라우저의 기록은 수정하거나 이 폴더에 저장하지 않았다.
