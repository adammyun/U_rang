# Safari 지도·3가지 지도 톤·위치 핀·기억 작성 화면 보완

대상: `yeoun_2`, `redesign/yeoun-2` · 2026-10-20

## 확인한 원인과 수정

### Safari에서 밝게 덮이는 간결 지도

실제 macOS Safari에서 사용자 첨부 화면과 같은 밝은 지도를 재현했습니다. 같은 빌드의 Playwright Chromium 및 WebKit에서는 이 문제가 재현되지 않았으므로 WebKit 자동화 결과만으로 해결을 판단하지 않았습니다.

로컬 진단 화면에서 질감 제거·불투명 배경 추가는 해결하지 못했고, SVG 선을 숨기면 밝은 덮임이 사라졌습니다. 지리 도형은 zoom 0 좌표를 캐시한 작은 viewBox를 사용합니다. 이 상태의 `vector-effect: non-scaling-stroke`를 제거하고 선 두께를 역확대 비율로 계산하자 실제 Safari에서 원래의 어두운 도로·건물 지도가 복구됐습니다.

`--ulsan-stroke-unit = 1 / 2^zoom`을 선 두께, 경계 점선 간격, 지명 외곽선에 적용했습니다. 하천 두께도 같은 비율로 변환합니다. 지도 색·도형·정적 데이터·캐시·투영은 유지하고 선이 화면에서 차지하는 두께만 안정화했습니다. 실제 Safari에서 수정된 앱의 어두운 지도와 도로를 다시 확인했습니다.

### 왼쪽으로 누운 작성 위치 핀

이전 CSS 핀은 외부 요소에 45도 회전을 사용했습니다. 지도 좌표를 소유한 요소는 이동만 담당하도록 두고 아래를 향하는 SVG 핀을 넣었습니다. 핀 끝은 기존 선택 좌표에 고정되며 선택·확정 흐름은 같습니다.

### 기본 / 다크 / 자세히

사용자가 현재 공개 화면의 부드러운 회청색을 기본으로 유지하도록 요청해, Safari 렌더링 문제를 고친 뒤 해당 색감을 명시적 팔레트로 분리했습니다. 브라우저 오류를 다시 켜서 밝게 보이게 하지 않습니다.

- **기본:** 회청색 바탕 `#607678`, 부드러운 블록·건물·도로와 산호색 UI. 최초 선택입니다.
- **다크:** 작업 중이던 차콜 `#1b2326`과 기존 어두운 건물·도로 팔레트.
- **자세히:** 기존 OSM standard raster 지도.

기본과 다크는 같은 SVG 도형을 사용합니다. 모드 전환은 카메라 재생성·지도 이동·새 기억 레이어 생성 없이 CSS 팔레트와 배경 지도 표현만 전환합니다. 단일 기억·현재 위치·작성 위치 overlay를 세 모드가 공유합니다. 공개 지도와 내 기억의 조정/필터는 공통 `MapAppearanceOptions`로 세 선택지를 제공합니다. 라인 범위 밖·데이터 실패의 raster fallback은 유지합니다. 실제 macOS Safari에서 기본과 다크를 전환해 색과 도형을 확인했습니다.

### 작성 화면 정렬

- 선택 안내를 라벨과 같은 행에 묶어 날짜 입력이 감정 입력보다 내려가지 않게 했습니다.
- 날짜·감정 입력을 50px 높이로 맞추고 모바일에서는 한 열로 배치했습니다. 날짜는 네이티브 date input을 유지합니다.
- 감정 선택의 닫힌 상태도 기존 emotion 모델의 한글 이름을 표시합니다. 저장 enum은 그대로입니다.
- 공개 범위 카드의 글·아이콘 간격과 개인정보 설정 안쪽 여백을 맞췄습니다. 좁은 모바일에서는 공개 범위를 한 열로 표시합니다.
- 스위치는 44px 폭과 44px 높이의 터치 영역을 확보하고 설명과 겹치지 않게 분리했습니다.
- 실제 Safari에서 날짜·한글 감정·사진 선택·공개 범위·스위치 배치를 확인했습니다.

## 변경 범위

| 파일 | 역할 |
| --- | --- |
| `components/memories/ulsan-line-map.tsx` | 확대 비율 기반 SVG 선 두께 |
| `components/memories/ulsan-urban-layers.tsx` | 건물·도로의 non-scaling-stroke 제거 |
| `app/memory-atlas.css` | 화면상 두께를 유지하는 선·점선 규칙 |
| `components/memories/map.tsx` | 작성 위치 핀 SVG만 수정 |
| `components/memories/memory-form.tsx` | 라벨 묶음·date ID·한글 감정 표시 |
| `app/atlas-collage.css` | 작성 폼 정렬·여백·모바일·핀 스타일 |
| `playwright.config.ts` | 전용 호환성 테스트를 위한 WebKit 두 viewport |
| `tests/e2e/browser-compat.spec.ts` | 선 두께·핀 앵커·입력 정렬·사진·설정·저장 검증 |
| `tests/e2e/live-flow.spec.ts` | 순서가 바뀌는 첫 마커 대신 미리보기 대상 장소를 명시 |
| `src/features/map/appearance.ts` | 세 지도 모드의 타입과 표기 |
| `components/memories/map-appearance-options.tsx` | 공통 지도 모드 선택 UI |
| `components/memories/memory-filter-sheet.tsx` | 조정의 세 모드 전환 |
| `components/memory-app.tsx`, `components/my-memory-map.tsx` | 공개·내 기억 지도의 세 모드 상태 |
| `tests/e2e/atlas.spec.ts`, `tests/e2e/home.spec.ts` | 요청된 모드 이름과 기본 팔레트 검증 |

MapLibre lifecycle, ResizeObserver, container size 보정, raster compatibility layer, attribution과 울산 fallback은 변경하지 않았습니다. API·DTO·저장 방식·로그인·private/unlisted/anonymous/approximate 정책도 변경하지 않았습니다.

## 검증 방법과 한계

```bash
pnpm exec playwright install chromium webkit
pnpm check
pnpm test:ui --workers=1
```

Playwright는 데스크톱 1440×900, 모바일 390×844에서 Chromium과 WebKit을 실제 실행합니다. 기존 낮은 화면·사진 5장·긴 본문·비공개 경계·지도 모드 전환 등의 Chromium 시나리오도 유지합니다. 새 호환성 테스트에서는 확대 전후 유효 선 두께, 핀의 무회전/좌표 앵커, 날짜·감정 정렬, 사진 첨부와 설정 변경 후 저장을 검사합니다.

추가된 지도 모드 검증은 네 브라우저/viewport 조합에서 기본→다크→자세히→기본을 전환하며 선택 상태·실제 배경색·같은 SVG 도로 도형·화면상 선 두께·동일 기억 마커의 1px 이내 좌표를 확인합니다. 저장 후 내 기억에서도 세 모드 선택 상태를 검사합니다.

첫 전체 실행은 49개 통과, 모바일 기존 탐색 1개 실패였습니다. 해당 테스트는 지도 이동 후 DOM의 첫 마커가 언제나 장소 미리보기를 연다고 가정했습니다. 실제 구현은 100m 이상 떨어진 장소의 시각적 묶음을 선택하면 먼저 확대합니다. 실패 화면도 미리보기 없이 확대된 지도였습니다. 미리보기 검증 대상은 기존 seed의 태화강 국가정원 장소 그룹으로 명시했습니다.

3가지 지도 모드 추가 후 재실행에서는 확대 완료 전에 축소를 연달아 누르는 테스트가 실행마다 다른 배율을 만들어 태화강 그룹이 다른 장소와 합쳐졌습니다(실패 snapshot에 울산대공원 7개 묶음). 테스트에서 SVG viewport 너비 비율로 확대 2배·원래 배율 복귀를 확인한 뒤 지도를 이동하도록 보완했습니다. 미리보기·상세·검색·탐색에 대한 assertion은 모두 유지했습니다. 제품의 마커 동작이나 지도 애니메이션은 변경하지 않았습니다.

실제 Safari 검증은 macOS의 앱을 직접 조작했습니다. WebKit 모바일은 에뮬레이션이며 실제 iPhone/iPad, Android 실기기는 검증하지 않았습니다. Worker 모드는 빌드를 확인하며 이번 브라우저 CRUD 검증은 Pages의 IndexedDB 로컬 시연 모드입니다. 기존 빌드의 큰 번들 경고는 남아 있으며 이 수정의 실패 원인은 아닙니다.

## 캡처

수정 후 Playwright 캡처는 `browser-compat/`에 보관합니다. 실제 Safari 창에는 사용자의 다른 탭 정보가 포함되므로 해당 전체 창 캡처는 저장소에 넣지 않습니다.

- [데스크톱 WebKit 지도](browser-compat/desktop-webkit-map.png)
- [데스크톱 WebKit 다크 지도](browser-compat/desktop-webkit-dark.png)
- [데스크톱 WebKit 위치 핀](browser-compat/desktop-webkit-pin.png)
- [데스크톱 WebKit 작성 입력](browser-compat/desktop-webkit-fields.png)
- [모바일 WebKit 공개 설정](browser-compat/mobile-webkit-privacy.png)
- [모바일 지도 모드 선택](browser-compat/mobile-adjust.png)

## 최종 검증 결과

- `pnpm check`: lint·typecheck·단위 테스트 10개·Worker build·Pages build 통과.
- 지도 모드 추가 전 수정 단계: Playwright 전체 50개 통과.
- 지도 모드 추가 후 전용 호환성: Chromium/WebKit × 데스크톱/모바일 8개 통과. 공개·내 기억의 세 모드 선택, 팔레트·도형·기억 앵커, 핀·폼·사진·저장을 포함합니다.
- 지도 모드 추가 후 전체 실행: 49개 통과, 기존 모바일 탐색 1개가 위에 설명한 카메라 대기 조건으로 실패했습니다.
- 해당 테스트 대기 조건을 보완한 최종 재실행: 데스크톱 3회 + 모바일 3회 **6/6 통과**. 나머지 테스트의 assertion이나 제품 로직은 변경하지 않았습니다.
- 테스트 보완 후 lint·typecheck 재확인.
- 실제 macOS Safari: 밝기 현상 재현·원인 분리, 수정된 지도·핀·작성 정렬 확인 및 명시적 기본/다크 모드 전환 확인.

현재 공개 주소는 [유랑](https://adammyun.github.io/yeoun_2/)이며 게시 대상은 기존 `redesign/yeoun-2` 브랜치입니다. 원본 저장소와 기준 `main`은 수정하지 않습니다.
