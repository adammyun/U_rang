# 유랑 — 접이식 감정 태그와 새 아이콘

2026-10-19 · `adammyun/yeoun_2` · `redesign/yeoun-2`

## 바뀐 사용 방식

항상 보이던 4개 빠른 감정 태그를 작은 “감정” 버튼으로 모았습니다. 데스크톱은 클릭, 모바일은 탭으로 오른쪽에 한 줄로 펼칩니다. 모바일의 좁은 영역은 가로로 밀어 확인합니다. 240ms 진입과 35ms 순차 지연을 적용하고 움직임 줄이기에서는 끕니다. 펼침 전후에도 버튼의 세로 위치는 고정됩니다.

지도 wheel, 마우스 드래그, 터치 이동 때 다시 접힙니다. 실제 지도에서 시작한 6px 이상 이동을 passive capture로 관찰하며 preventDefault/stopPropagation 하지 않습니다. 태그 목록 가로 스크롤은 지도 제스처로 취급하지 않습니다. 선택한 감정은 접기·지도 이동·다시 펼치기 후에도 유지되고 버튼의 숫자와 접근성 이름에 선택 개수를 표시합니다.

기존 그리움/평온/사랑/행복 빠른 선택과 조정 패널의 전체 감정·연도 기능을 유지합니다. 닫힌 태그는 Tab에 잡히지 않고, Escape는 접은 후 버튼으로 focus를 돌려줍니다. 각 버튼은 최소 44px이며 지도 확대·축소·현재 위치와 겹치지 않게 가로 폭을 제한합니다.

새 사이트 아이콘은 접힌 지도 조각 위에 기억의 경로와 코랄색 점을 놓았습니다. 기존 녹색 점선 원 파비콘을 교체하고 메인·내 기억·Worker/Pages 인증 화면의 아이콘도 공통 SVG 컴포넌트로 통일했습니다. 텍스트 유랑과 기존 링크·새로고침 동작은 유지합니다. 두 entry의 favicon URL에 버전을 붙여 이전 캐시와 구분합니다.

## 변경 파일

- `components/memories/atlas-emotion-picker.tsx`: 펼침 상태·접근성·지도 제스처 관찰만 담당하는 작은 표현 컴포넌트.
- `components/memory-app.tsx`: 기존 필터 state/changeFilters에 새 태그 컴포넌트 연결, 브랜드 마크 교체.
- `components/ui/yurang-mark.tsx`: 공유 지도 조각 아이콘.
- `components/my-memory-map.tsx`, `app/login/page.tsx`, `github-pages/main.tsx`: 같은 마크 사용.
- `public/favicon.svg`, `app/layout.tsx`, `github-pages/index.html`: 새 파비콘과 entry별 URL.
- `app/atlas-collage.css`: 한 줄 펼침·모바일 가로 스크롤·선택/hover/focus·motion·아이콘 크기.
- `app/memory-atlas.css`: 제거된 상시 태그 레이아웃의 사용하지 않는 스타일 정리.
- `tests/e2e/atlas.spec.ts`: 의도적으로 접힌 초기 상태에 맞춰 기존 필터 왕복 테스트 수정, 새 상호작용 검증 추가.
- README·Design DNA·이 문서·실제 캡처.

API·DB·인증·미디어 저장·public/private/unlisted·익명/approximate 경계는 변경하지 않았습니다. `map.tsx`·지도 데이터·컨테이너 크기 보정·ResizeObserver·raster compatibility/fallback·단일 marker overlay·출처·울산/현재 위치 정책도 그대로입니다. 원본 저장소와 main은 보존합니다. 추가 패키지는 없습니다.

## 검증

- `pnpm check`: lint, typecheck, 단위 테스트 10개, Worker build, Pages build 통과.
- `pnpm test:ui --workers=1`: Chromium 데스크톱 1440×900 / 모바일 390×844, 전체 42개 테스트 통과. 기존 낮은 화면·사진·장문·CRUD·비공개 미노출·검색·장소 그룹·뒤로가기·현재 위치 mock·튜토리얼·키보드·지도 fallback 검증 포함.
- 최종 위치 보완 후 `pnpm test:ui --workers=1 -g '감정 태그는'`로 관련 데스크톱/모바일 2개를 다시 검증했습니다. 펼침 전후 버튼 좌표 일치와 데스크톱 실제 마우스 드래그의 접힘·카메라 이동·필터 유지를 추가 확인했습니다.
- 신규 시나리오: 기본 접힘 → 클릭/탭 펼침 → 평온 선택 및 URL 확인 → 가로 한 줄·zoom control 비겹침 확인 → 지도 wheel/실제 CDP touch로 접힘과 카메라 이동 → 선택 유지 → 재펼침 → Escape/focus 복귀 → reduced-motion 확인.
- 모바일 태그 가로 touch 스크롤 시 목록만 이동하고 지도·펼침 상태가 유지되는지 확인.
- 파비콘 실제 응답 성공과 새 코랄 도형, 화면의 공통 마크, 16/32/64px 렌더링을 확인.
- 실제 캡처를 열어 글자 잘림·페이지 가로 넘침·지도 control 겹침을 확인했습니다.

기존 bundle 크기 경고와 vinext 라우트 분류 안내는 남아 있으며 build 실패는 아닙니다. 실기기 iOS/Android·WebKit/Firefox·저사양 FPS·실제 NAVER panorama 조회는 이번 범위에서 확인하지 않았습니다. 모바일은 Chromium 터치 에뮬레이션입니다.

## 실제 캡처

- [데스크톱 접힘](emotion-dock/emotion-collapsed-desktop-chromium.png)
- [데스크톱 펼침·선택](emotion-dock/emotion-expanded-desktop-chromium.png)
- [모바일 접힘](emotion-dock/emotion-collapsed-mobile-chromium.png)
- [모바일 펼침·가로 목록](emotion-dock/emotion-expanded-mobile-chromium.png)
- [아이콘 16/32/64px](emotion-dock/yurang-icon-sizes.png)
