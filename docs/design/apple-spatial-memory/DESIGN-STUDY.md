# Apple Spatial Memory 레이아웃 연구

작성일: 2026-10-12  
상태: 선택 전 독립 시안  
실행: `pnpm preview:spatial`

## 1. 현재 메인 화면 분석

현재 공개 지도 화면은 상단 헤더, 왼쪽 고정 이야기 rail, 오른쪽 지도, 지도 위 floating control, 모바일 하단 sheet로 구성된다. 기능은 잘 드러나지만 지도와 콘텐츠가 처음부터 동일한 비중으로 노출되어 사용자가 무엇부터 봐야 할지 스스로 결정해야 한다. 데스크톱과 모바일 모두 같은 정보 구조를 축소·재배치하는 방식이라 기기마다 다른 탐색 리듬을 만들지는 못한다.

### 존재하는 주요 기능

- 공개 기억이 표시되는 울산 지도와 marker grouping
- 장소 검색
- 간결/상세 지도 전환, 연도·감정 filter
- 확대·축소, 현재 위치와 울산 fallback
- 지도 또는 marker를 통한 위치 선택
- `기억 남기기` CTA
- 주변 공개 기억 목록
- 장소별 여러 기억과 개별 기억 상세
- 사진, 날짜, 감정, 익명 여부와 장소 정보
- 지도/내 기억/로그인 navigation

## 2. 기존 UI 구조의 한계

- 고정 header와 고정 sidebar가 지도 몰입 면적을 항상 줄인다.
- 사용자의 현재 맥락과 관계없이 검색, filter, 목록과 안내가 동시에 노출된다.
- 카드가 목록 단위로 반복돼 사진이나 한 편의 이야기가 화면의 주인공이 되기 어렵다.
- 모바일은 데스크톱의 sidebar를 bottom sheet로 옮긴 구조라 탐색 방식의 변화가 작다.
- 지도 → 장소 → 기억이라는 점진적 disclosure보다 모든 기능을 한 화면에서 설명하는 데 가깝다.

## 3. A안 — Apple Maps Inspired

### 실제 화면 구조

지도가 화면 전체를 차지하고 오른쪽에 독립적인 glass sidebar가 떠 있다. 브랜드, 검색, navigation, 지도 조정과 확대·축소도 각각 지도 위 floating island로 배치한다.

- **내비게이션:** 우측 상단 segmented glass island
- **지도 영역:** 전체 화면, sidebar 아래까지 이어지는 몰입형 surface
- **검색과 filter:** 상단 중앙 검색 island, sidebar 왼쪽의 조정 button
- **기억 카드:** 우측 glass sidebar 안의 세로 scroll list
- **작성 버튼:** 좌측 하단 검은 pill CTA
- **모바일:** 지도 전체 화면 + 300px floating bottom shelf와 가로 card snap

**장점:** 기존 기능을 가장 쉽게 찾을 수 있고 지도 몰입도와 안정성이 균형 잡힌다. 실제 제품으로 옮길 때 회귀 위험이 세 안 중 가장 낮다.

**단점:** floating panel이 많아지면 지도 위 시각적 밀도가 다시 높아질 수 있다. 사진을 주인공으로 만드는 힘은 B안보다 약하다.

## 4. B안 — Editorial Memory Journal

### 실제 화면 구조

왼쪽에 좁은 vertical navigation, 중앙에 사진과 긴 제목 중심의 editorial feed, 오른쪽에 현재 이야기의 위치를 보여주는 지도를 둔다. 사용자는 지도보다 이야기에서 탐색을 시작한다.

- **내비게이션:** 좌측 vertical rail
- **지도 영역:** 오른쪽 고정 context map
- **검색과 filter:** 지도 상단에 배치
- **기억 카드:** 큰 사진과 serif 제목을 가진 feature article, 아래 2열 journal
- **작성 버튼:** navigation rail 하단, 모바일에서는 우측 하단
- **모바일:** 상단 context map 후 세로 editorial feed

**장점:** 기억과 사진의 감정적 힘이 가장 크고 다른 지도 서비스와 확연히 구분된다. 장소가 아닌 이야기에서 도시를 발견하게 한다.

**단점:** 지도를 직접 이동하며 탐색하려는 사용자에게는 경로가 한 단계 길다. 사진이 없는 기억을 위한 대체 visual system이 반드시 필요하다.

## 5. C안 — Spatial Memory Experience

### 실제 화면 구조

지도 전체 화면 위에서 선택 맥락에 따라 interface가 나타난다. 평소에는 브랜드, search command와 최소 navigation만 보이고, marker를 선택하면 하단 spatial dock이 해당 기억으로 바뀐다.

- **내비게이션:** 우측 상단 icon island
- **지도 영역:** 화면 전체
- **검색과 filter:** 중앙 command pill, 우측 contextual control
- **기억 카드:** 고정 목록 대신 선택한 기억 하나를 하단 dock에 표시
- **작성 버튼:** 좌측 하단 action cluster
- **모바일:** 전체 지도 + 선택 기억 dock, 목록 대신 marker와 cluster가 navigation 역할

**장점:** 지도 몰입과 contextual navigation이 가장 강하다. 기존 화면과 가장 다른 미래 지향적 경험이며 interface가 사용자의 행동에 반응한다.

**단점:** 전체 기억 목록이 감춰져 발견 가능성이 낮아질 수 있다. 첫 사용자 tutorial과 빈 상태, keyboard navigation을 가장 세심하게 설계해야 한다.

## 6. 비교

| 기준 | A Apple Maps | B Editorial Journal | C Spatial Experience |
| --- | --- | --- | --- |
| 지도 몰입 | 매우 높음 | 중간 | 가장 높음 |
| 이야기·사진 강조 | 높음 | 가장 높음 | 선택한 기억에 집중 |
| 기능 발견성 | 가장 높음 | 중간 | 낮음~중간 |
| 기존 앱과의 차이 | 높음 | 매우 높음 | 가장 높음 |
| 모바일 자연스러움 | 높음 | 높음 | 매우 높음 |
| 구현 위험 | 낮음~중간 | 중간 | 높음 |
| 추천 상황 | 균형 잡힌 실제 개편 | 브랜드와 콘텐츠 강화 | 실험적·몰입형 제품 |

## 7. 선택 가이드

- 현재 기능을 잃지 않으면서 확실한 새 제품처럼 보이게 하려면 **A안**이 가장 안전하다.
- 여운을 지도 서비스보다 감성 기록 브랜드로 차별화하려면 **B안**이 가장 강하다.
- 지도 자체를 기억을 만나는 공간으로 만들고 단계적인 UX 재설계까지 감수한다면 **C안**이 적합하다.

시안은 실제 seed의 공개 기억 문구를 사용하지만 정적 UI 탐색물이다. API, 인증, DB, MapLibre runtime과 연결하지 않았으며 기존 서비스 파일을 대체하지 않는다.

## 8. 미리보기와 캡처

- 비교 화면: `index.html`
- A안: `concept-a.html`
- B안: `concept-b.html`
- C안: `concept-c.html`
- 데스크톱 캡처: `screenshots/concept-*-desktop.png`
- 모바일 캡처: `screenshots/concept-*-mobile.png`
- 전체 비교 캡처: `screenshots/comparison-desktop.png`, `screenshots/comparison-mobile.png`

Playwright Chromium에서 1440×900과 390×844로 렌더링하고, 각 시안의 filter 열기·닫기, 위치 선택 panel, marker 선택과 기억 상세 열기를 확인했다.
