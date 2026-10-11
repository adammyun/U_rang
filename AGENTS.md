# 여운 프로젝트 작업 규칙

## 적용 범위와 목표

이 파일은 저장소 루트와 모든 하위 디렉터리에 적용한다. 더 하위 경로에 별도의 `AGENTS.md`가 있다면 해당 경로에서는 그 지침도 함께 따른다.

현재 작업의 목표는 지도 기반 기억 기록 서비스의 기존 기능과 비즈니스 로직을 유지하면서 UI/UX를 전면 개선하는 것이다. 제품 기능을 임의로 확대하거나 데이터 계약을 디자인 편의를 위해 변경하지 않는다.

작업 전에는 다음 문서를 기준선으로 확인한다.

- `docs/design/PROJECT-AUDIT.md`
- `docs/design/FUNCTIONAL-BASELINE.md`
- `docs/design/REDESIGN-ROADMAP.md`
- `docs/design/PERSONAL-UI-DESIGNER.md`

## 기능과 데이터 보호

1. 기존 기능과 비즈니스 로직을 최대한 유지한다. UI 작업은 표현 계층에 집중하고 `src/features`, `src/server`, API 계약, 데이터 저장 방식과 개인정보 정책을 불필요하게 변경하지 않는다.
2. 공개 지도에는 공개 기억만 노출하고, private/unlisted 기억의 접근 경계와 approximate 위치의 좌표 보호를 유지한다.
3. Worker/App Router와 GitHub Pages 정적 SPA에서 공통 UI가 모두 동작해야 한다. 라우팅이나 Next 전용 API를 변경할 때는 Pages shim과 hash route 영향도 함께 확인한다.
4. `components/memories/map.tsx`의 MapLibre lifecycle, container size 보정, ResizeObserver, raster fallback, attribution, 단일 marker overlay는 동등한 검증 없이 제거하거나 단순화하지 않는다.
5. 지도 선택, 기억 작성, 장소 그룹, 상세 보기, 긴 콘텐츠 스크롤, 사진, 뒤로가기, 현재 위치, 필터와 인증 흐름을 보존한다.

## 디자인 시스템과 컴포넌트

1. 디자인 작업에는 공통 디자인 시스템을 사용한다. 색상, 타이포그래피, 간격, radius, elevation, motion은 의미가 있는 공통 token으로 관리하고 화면마다 임의 값을 반복하지 않는다.
2. 기존 `components/ui` primitive와 공통 컴포넌트를 먼저 검토한다. 적합한 컴포넌트가 있으면 재사용하고, 새 컴포넌트는 여러 화면에서 조합할 수 있는 작은 단위로 설계한다.
3. 공통 동작을 복사해 화면별로 따로 구현하지 않는다. 변형은 명확한 prop이나 variant로 표현하되 과도한 추상화는 피한다.
4. 접근 가능한 이름, keyboard focus, focus-visible, dialog/sheet 의미 구조와 `prefers-reduced-motion` 대응을 유지한다.
5. 튜토리얼이 참조하는 `data-tour`와 접근성 selector를 변경할 때는 관련 단계와 테스트도 함께 확인한다.

## 반응형 UI

1. 모바일 우선으로 설계하되 데스크톱을 단순 확대 화면으로 만들지 않는다.
2. 최소 검증 viewport는 모바일 `390×844`, 데스크톱 `1440×900`으로 한다.
3. 두 viewport에서 지도 control, 핵심 CTA, filter, marker, sheet와 콘텐츠가 겹치거나 잘리지 않는지 확인한다.
4. 긴 본문과 최대 사진 수가 들어간 상태에서도 sheet 내부가 스크롤되고 모든 action에 도달할 수 있어야 한다.

## 검증 절차

1. 디자인 변경 후 반드시 Playwright로 실제 화면을 확인한다.
2. 기본 UI 검증은 `pnpm test:ui`로 실행한다. 필요하면 `pnpm test:ui:headed`로 브라우저를 보면서 확인하고 `pnpm test:ui:report`로 결과를 연다.
3. 캡처 결과는 `test-results/screenshots/`에서 데스크톱과 모바일 화면을 모두 확인한다.
4. 레이아웃, 기능 또는 상호작용 문제를 발견하면 원인을 수정한 뒤 같은 Playwright 테스트를 다시 실행한다. 실패한 상태나 확인하지 않은 상태로 완료했다고 보고하지 않는다.
5. 소스 변경이 끝나면 `pnpm check`로 lint, typecheck, 기존 단위 테스트, Worker build와 GitHub Pages build를 확인한다.
6. 테스트 실패를 숨기기 위해 assertion이나 기준선을 약화하지 않는다. 의도적인 동작 변경이라면 이유와 영향을 먼저 기록한다.

## 도구와 의존성

1. 무료 및 오픈소스 도구를 우선적으로 사용한다.
2. 새 패키지는 기존 도구로 해결할 수 없는 경우에만 최소 범위로 추가한다.
3. 유료 서비스, 특정 사업자 전용 기능, 새로운 API key 또는 secret이 필요한 도구는 명시적인 요청 없이 도입하지 않는다.
4. 외부 지도, 이미지, 글꼴 등의 라이선스와 attribution 요구사항을 유지한다.

## 작업 보고

변경 사항과 테스트 결과는 한국어로 설명한다. 완료 보고에는 다음 내용을 포함한다.

- 변경한 화면과 파일
- 기존 기능을 보존하기 위해 취한 조치
- Playwright에서 확인한 데스크톱·모바일 결과
- `pnpm check` 결과
- 남아 있는 문제와 현재 환경에서 확인하지 못한 항목
