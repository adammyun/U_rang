# 여운 디자인 시스템 방향 제안

작성일: 2026-10-12

이 문서는 현재 서비스의 기능과 개인정보 경계를 유지하면서, 앞으로 다른 웹사이트에도 재사용할 수 있는 개인 디자인 정체성 후보 세 가지를 비교한다. 아래 방향은 선택을 위한 제안이며 현재 애플리케이션에는 아직 적용하지 않는다.

## 현재 제품에서 읽히는 특성

### 핵심 경험

- 지도는 장소 검색 도구보다 여러 사람의 기억이 겹치는 감정적 표면에 가깝다.
- 사용자는 울산 지도를 탐색하고, 마커를 선택해 장소별 기억을 모아 본 뒤 개별 이야기를 읽는다.
- 기억 작성은 위치 선택에서 시작해 이야기, 감정, 사진, 공개 범위와 위치 정밀도를 결정한다.
- 공개 지도, 내 기억 지도, 장소 검색, 필터, 현재 위치, Panorama와 첫 사용자 안내가 연결된다.

### 디자인이 해결해야 할 문제

- 지도 control, 검색, 필터, CTA와 콘텐츠 패널이 좁은 화면에서 경쟁한다.
- 지도와 이야기 중 어느 쪽이 현재 초점인지 더 명확한 hierarchy가 필요하다.
- 긴 본문과 사진, 장소 그룹과 상세 사이의 이동을 자연스럽게 보여 줘야 한다.
- private/public, anonymous, exact/approximate처럼 중요한 개인정보 선택을 차분하면서도 분명하게 설명해야 한다.
- 감성적인 분위기를 유지하면서 버튼, 입력, 카드와 상태 표현은 여러 프로젝트에 재사용할 만큼 체계적이어야 한다.

### 공통으로 보존할 기능 구조

세 시안 모두 다음 구조를 표현한다.

- 브랜드와 지도/내 기억 navigation
- 장소 검색, 지도 조정, 확대·축소와 현재 위치
- 기억 marker와 장소 group count
- 주변 기억 목록과 감정·날짜 metadata
- `기억 남기기` 핵심 CTA와 위치 선택 상태
- 장소/기억 상세 panel
- 모바일 bottom sheet와 데스크톱 분할 layout

## 방향 A — Quiet Archive / 여백의 기록

### 1. 디자인 콘셉트

오래 보관한 편지, 식물 표본집과 독립 출판물에서 가져온 따뜻한 편집 디자인이다. 지도는 배경이 되고 기억 카드가 종이 조각처럼 차분하게 쌓인다. 현재 서비스의 정서와 가장 자연스럽게 이어지는 방향이다.

### 2. 컬러

| 역할 | 색상 |
| --- | --- |
| Main / Forest | `#2F5A4A` |
| Action / Persimmon | `#C6533F` |
| Canvas / Rice paper | `#F5F0E6` |
| Surface | `#FFFDF8` |
| Ink | `#1E2A24` |
| Muted | `#6E776F` |
| Line | `#D9D5C9` |

색의 수를 줄이고 감정 색상은 marker와 작은 상태점에만 사용한다.

### 3. 타이포그래피

- 제목: `MaruBuri` 또는 `Noto Serif KR`, 중간 굵기
- 본문/UI: `Pretendard`, 보통·중간 굵기
- 영문 eyebrow: 작은 대문자와 넓은 자간
- 긴 이야기는 1.7 안팎의 line-height와 좁은 읽기 폭을 사용한다.

두 글꼴 모두 무료·오픈소스 계열로 구성할 수 있으며 선택 후 self-hosting을 권장한다.

### 4. 버튼과 카드

- 핵심 버튼은 감색이 아닌 따뜻한 주홍색의 단단한 pill 형태다.
- 보조 버튼은 종이색 surface와 1px 경계로 조용하게 처리한다.
- 카드는 큰 radius보다 부드러운 16px 모서리와 얕은 그림자를 사용한다.
- 선택 카드는 왼쪽 색선과 배경 톤 변화로 표시한다.

### 5. 화면 레이아웃

- 데스크톱: 왼쪽 editorial story rail + 오른쪽 넓은 지도
- 모바일: 상단 지도 + 하단 종이형 bottom sheet
- 상세는 책갈피처럼 들어오는 읽기 panel로 표현한다.

### 6. 인터랙션과 애니메이션

- 180~280ms의 부드러운 이동과 opacity 변화
- 카드 선택 시 2~4px 정도의 작은 상승
- 상세 panel은 페이지를 넘기듯 수평 또는 아래에서 진입
- reduced motion에서는 opacity 변화만 남긴다.

### 7. 분위기

따뜻함, 신뢰, 사적인 기록, 오래 남는 여운을 전달한다. 사용자가 자신의 이야기를 서두르지 않고 적게 만든다.

### 8. 재사용하기 좋은 요소

- editorial heading와 serif/sans 조합
- 종이형 surface token
- story card, quote card, metadata row
- 따뜻한 primary action과 조용한 secondary button
- 포트폴리오, 문화 콘텐츠, 저널, 독서·여행 기록 서비스에 적합

## 방향 B — Civic Atlas / 명료한 도시 아틀라스

### 1. 디자인 콘셉트

교통 지도, 도시 안내 시스템과 현대적인 데이터 제품에서 가져온 구조적 디자인이다. 감성은 내용에 맡기고 UI는 빠르게 읽히는 정보 체계를 제공한다. 다른 도구형 웹사이트까지 확장하기 가장 쉬운 방향이다.

### 2. 컬러

| 역할 | 색상 |
| --- | --- |
| Main / Atlas blue | `#2458E6` |
| Secondary / Deep navy | `#14243A` |
| Accent / Signal amber | `#F2A33A` |
| Canvas | `#F3F6FA` |
| Surface | `#FFFFFF` |
| Muted | `#66758A` |
| Line | `#D8E0EA` |

지도 위 control은 흰 surface와 navy text를 사용하며 primary blue는 선택과 action에 집중한다.

### 3. 타이포그래피

- 제목/UI: `SUIT` 또는 `IBM Plex Sans KR`
- 숫자와 위치 metadata: tabular numeral을 지원하는 동일 sans 계열
- 단계가 명확한 12/14/16/24/36 type scale
- 자간을 좁히고 행 높이를 안정적으로 맞춘다.

### 4. 버튼과 카드

- 핵심 버튼은 12px radius의 blue rectangle로 즉시 식별한다.
- icon button은 동일한 44px 정사각 규격을 사용한다.
- 카드는 경계와 grid 정렬을 중심으로 하고 그림자를 최소화한다.
- 선택 상태는 blue outline, 왼쪽 index와 상태 chip으로 표현한다.

### 5. 화면 레이아웃

- 데스크톱: 얇은 navigation rail + 전체 지도 + 오른쪽 정보 panel
- 모바일: 지도 중심, 하단에 compact list와 고정 action dock
- 정보 밀도가 높아져도 column과 grid가 무너지지 않는다.

### 6. 인터랙션과 애니메이션

- 120~180ms의 빠른 상태 전환
- marker와 list selection이 즉시 동기화
- panel은 slide보다 크기·색·outline 전환을 중심으로 한다.
- loading에는 skeleton과 progress line을 사용한다.

### 7. 분위기

명료함, 도시적 신뢰, 효율, 접근성을 전달한다. 처음 온 사용자가 가장 빨리 기능을 이해할 수 있다.

### 8. 재사용하기 좋은 요소

- grid, command bar, filter chip, data card
- 일관된 44px control과 상태 token
- 지도, dashboard, 예약, 캠퍼스, 공공 정보와 생산성 도구에 적합
- 세 방향 중 가장 범용적인 application UI 기반

## 방향 C — Afterglow Layers / 잔광의 레이어

### 1. 디자인 콘셉트

밤의 도시와 사진의 잔광을 연상시키는 깊은 배경 위에 기억을 반투명 층으로 올린다. 지도 marker는 좌표가 아니라 감정의 빛처럼 보인다. 브랜드 인상을 가장 강하게 만들 수 있는 방향이다.

### 2. 컬러

| 역할 | 색상 |
| --- | --- |
| Main / Twilight | `#7467F0` |
| Secondary / Night | `#121827` |
| Accent / Coral glow | `#FF7A68` |
| Accent 2 / Mint glow | `#73D7C7` |
| Surface | `#1B2435` |
| Text | `#F5F1E9` |
| Muted | `#AAB4C5` |

gradient는 배경과 선택된 marker에 제한하고 본문 surface에서는 충분한 contrast를 유지한다.

### 3. 타이포그래피

- 제목: `Gowun Batang` 또는 `Noto Serif KR`
- UI/본문: `Noto Sans KR` 또는 `Pretendard`
- 큰 제목과 짧은 문장으로 감정적 pause를 만든다.
- metadata는 밝기를 낮추되 최소 contrast를 지킨다.

### 4. 버튼과 카드

- 핵심 버튼은 coral-to-violet의 절제된 gradient와 얕은 glow를 사용한다.
- 보조 control은 어두운 translucent surface와 명확한 focus ring을 쓴다.
- 카드가 겹치는 layer처럼 보이지만 본문 영역은 불투명에 가깝게 유지한다.
- 선택된 카드는 위쪽에 얇은 빛의 띠가 나타난다.

### 5. 화면 레이아웃

- 데스크톱: 전체 지도 위 왼쪽 검색/브랜드, 오른쪽 floating story deck
- 모바일: immersive map + 반투명 bottom dock, 상세는 거의 전체 화면
- 시선이 지도 marker → 선택된 이야기로 흐르게 한다.

### 6. 인터랙션과 애니메이션

- marker pulse, layer depth와 220~360ms의 느린 easing
- 선택 시 주변 marker의 밝기가 낮아지고 현재 이야기가 떠오른다.
- 사진은 cross-fade, sheet는 blur를 동반한 이동을 사용한다.
- reduced motion에서는 glow 변화와 즉시 상태 전환으로 대체한다.

### 7. 분위기

몰입, 밤의 산책, 감정의 잔상, 개인적인 발견을 전달한다. 세 방향 중 가장 기억에 남지만 어두운 UI와 효과의 관리 비용이 높다.

### 8. 재사용하기 좋은 요소

- immersive hero/map surface
- translucent dock, media card, glow status
- 음악, 사진, 전시, 영화, 이벤트와 감정 기록 서비스에 적합
- 마케팅 화면과 콘텐츠 탐색 화면에서 강한 브랜드 요소로 재사용 가능

## 비교와 선택 기준

| 항목 | Quiet Archive | Civic Atlas | Afterglow Layers |
| --- | --- | --- | --- |
| 현재 여운과의 연속성 | 매우 높음 | 중간 | 높음 |
| 기능 이해 속도 | 높음 | 매우 높음 | 중간 |
| 브랜드 개성 | 높음 | 중간 | 매우 높음 |
| 다양한 웹서비스 재사용 | 높음 | 매우 높음 | 중간 |
| 구현·유지 난이도 | 낮음~중간 | 중간 | 높음 |
| 사진·감정 콘텐츠 적합성 | 매우 높음 | 중간 | 매우 높음 |
| 접근성 관리 난이도 | 낮음 | 낮음 | 중간~높음 |

개인 디자인 정체성의 중심으로는 **Quiet Archive의 따뜻한 콘텐츠 감도**와 **Civic Atlas의 구조적 UI 규칙**을 결합하는 선택이 가장 오래 재사용하기 쉽다. 하나의 방향만 골라야 한다면 현재 서비스에는 Quiet Archive, 여러 종류의 향후 프로젝트까지 고려하면 Civic Atlas가 안정적인 출발점이다. Afterglow Layers는 브랜드의 강한 시그니처가 필요할 때 선택하기 좋다.

## 시안 파일

- `prototypes/index.html`: 세 방향 비교 화면
- `prototypes/quiet-archive.html`: 방향 A 전체 화면
- `prototypes/civic-atlas.html`: 방향 B 전체 화면
- `prototypes/afterglow-layers.html`: 방향 C 전체 화면
- `prototypes/screenshots/design-directions-comparison.png`: 세 방향 비교 캡처
- `prototypes/screenshots/*-desktop.png`, `*-mobile.png`: 방향별 반응형 캡처

시안은 독립된 정적 HTML이며 현재 애플리케이션의 source, route, data와 연결하지 않는다.

저장소 루트에서 `pnpm preview:design`을 실행하면 `http://127.0.0.1:4310/`에서 세 시안을 직접 비교할 수 있다.
