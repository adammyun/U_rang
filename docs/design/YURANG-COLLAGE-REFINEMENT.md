# 유랑 팝업·모달 콜라주 통일

2026-10-19 · `adammyun/yeoun_2` · `redesign/yeoun-2`

## 문제와 디자인 결정

지도 스탬프와 포스트잇 미리보기는 서비스의 정체성을 드러내지만, 타임라인 장소 목록·일반 모달의 테두리·원형 감정 장식·각기 다른 닫기 버튼은 다른 제품처럼 보였습니다. 사용자 첨부 레퍼런스의 자유로운 사진 배치와 검은 제목/본문 조각을 현재 graphite 테마에 맞춰 재해석했습니다. 레퍼런스의 이미지·코드·서체는 복제하지 않았습니다.

- 기억 마커와 포스트잇 미리보기를 유지합니다. 제목의 검은 띠와 닫기 타일만 공통화합니다.
- 상세는 사진, 검은 제목 띠, 별도의 본문 종이로 구성합니다. 사진 없는 기록의 원형 감정 장식은 테이프로 붙인 메모로 바꿨습니다.
- 장소 목록은 타임라인 대신 자유로운 종이 조각을 두 열로 배치합니다. 모바일은 한 열이며 내용 내부 스크롤과 닫기를 유지합니다. 공개 탐색도 외부 대형 박스 대신 개별 메모를 드러냅니다.
- 조정·작성은 조작의 안정성을 위해 한 장의 종이를 사용하되 공통 제목·44px 닫기 타일·모서리·그림자로 연결합니다.
- 인증·튜토리얼·거리뷰도 같은 제목 띠를 사용합니다.
- 무거운 배경 blur 대신 지도와 기억 조각이 남는 dim을 사용합니다. 읽는 글과 입력 필드는 회전하지 않고 종이 backing과 사진만 기울입니다. reduced-motion 대응을 유지합니다.
- 내 기억 카드의 이전 녹색 제목을 밝은 공통 텍스트로 수정했습니다.

## 수정 파일

- `app/atlas-collage.css`: cutout/paper/tape/shadow 토큰, 팝업·상세·목록·폼·조정·튜토리얼·인증·거리뷰의 공통 표현.
- `components/ui/atlas-heading-label.tsx`: 기존 semantic heading 안에서 재사용하는 제목 띠. 기존 role·focus ref·접근성 이름은 유지합니다.
- `components/memories/spatial-panels.tsx`: 상세의 제목과 본문 종이 표현 분리.
- `components/memories/memory-filter-sheet.tsx`, `memory-form.tsx`, `place-memory-sheet.tsx`, `panorama-viewer.tsx`: 공통 제목/종이 class 연결.
- `components/memory-app.tsx`, `components/my-memory-map.tsx`, `components/onboarding/tutorial.tsx`: 탐색·내 기억·튜토리얼 제목 연결.
- `app/layout.tsx`, `app/login/page.tsx`, `github-pages/main.tsx`: 두 entry에서 공유 스타일을 마지막에 import하고 인증 제목에 적용.
- `tests/e2e/atlas.spec.ts`: 장소 목록 끝까지 스크롤 후 닫기, 상세→거리뷰→상세 복귀, 조정→인증→작성 흐름과 캡처 추가.
- `eslint.config.mjs`: Playwright가 생성한 report/trace 번들만 검사에서 제외. 앱 소스의 규칙은 변경하지 않았습니다.
- README·Design DNA·프로필: 현재 표현과 실행/검증 기록 연결.

## 보존한 기능

MapLibre lifecycle·크기 보정·ResizeObserver·raster compatibility/fallback·단일 marker overlay·건물/도로 지도 데이터·울산/현재 위치 정책은 변경하지 않았습니다. API·DB·사진 저장·인증·공개/비공개·익명·approximate 정책을 변경하지 않았습니다. 작성·수정·삭제·검색·장소 그룹·같은 장소 이전/다음·긴 내용 스크롤·사진·뒤로가기·튜토리얼의 동작과 selector를 유지합니다. 새 패키지나 API key는 추가하지 않았습니다. 원본 저장소와 main은 보존합니다.

## 실제 검증

- `pnpm check`: lint·typecheck·단위 테스트 **10/10**·Worker build·Pages build 성공.
- 최종 `pnpm test:ui --workers=1`: **38/38 성공**, 약 1.9분. Chromium 1440×900 / 390×844 및 기존 낮은 화면 검증을 포함합니다.
- 사진 5장·긴 본문·CRUD·public/private·검색·장소 그룹·지도 모드 좌표 일치·raster/건물 데이터 실패 fallback·현재 위치 mock·튜토리얼 10단계·키보드·reduced-motion 시나리오를 유지했습니다.
- 신규 흐름은 장소 목록의 마지막 카드까지 스크롤하고 닫기에 접근한 뒤 상세→거리뷰→상세→조정→로컬 로그인→작성으로 실제 이동합니다. 사진·장소·조정·폼·인증·거리뷰의 desktop/mobile 캡처를 확인했습니다.
- 거리뷰 검증은 provider script 요청을 차단한 상태에서 modal shell·안내/오류 상태·닫기·상세 복귀를 확인한 것입니다. 실제 NAVER panorama 제공 여부는 검증하지 않았습니다.

초기 병렬 실행에서는 브라우저 setup/teardown timeout과 일부 상호작용 대기 실패가 있었습니다. 두 워커 전체 실행은 37/38이었으며 모바일 내 기억 선택 후 수정 버튼 대기가 한 차례 실패했습니다. 같은 CRUD 단독 실행은 통과했고, 최종 단일 워커 전체 38개가 통과했습니다. 이 간헐 실패의 원인은 확정하지 않았습니다. 기존 assertion·timeout을 완화하지 않았고, 기본 Playwright 설정도 변경하지 않았습니다.

추적 검증 후 생성된 `playwright-report/trace`의 번들까지 lint가 검사하는 별도 문제를 확인했습니다. 생성 report/test-results/blob-report만 global ignore로 제외해 해결했습니다. 기존 chunk 크기 경고·vinext 라우트 분류 안내는 남아 있으나 빌드 실패는 아닙니다. 실기기 iOS/Android·WebKit/Firefox·저사양 FPS는 미검증입니다.

## 실제 화면

- [이전 사진 상세](graphite/atlas-photo-detail-mobile-chromium.png)
- [이전 감정 상세](graphite/graphite-meaningful-desktop-chromium.png)
- [새 사진 상세 — 데스크톱](collage/atlas-photo-detail-desktop-chromium.png)
- [새 사진 상세 — 모바일](collage/atlas-photo-detail-mobile-chromium.png)
- [새 메모 상세](collage/graphite-meaningful-desktop-chromium.png)
- [장소 목록 — 데스크톱](collage/collage-place-desktop-chromium.png)
- [장소 목록 — 모바일](collage/collage-place-mobile-chromium.png)
- [조정](collage/collage-adjust-mobile-chromium.png)
- [작성](collage/collage-form-mobile-chromium.png)
- [인증](collage/collage-auth-mobile-chromium.png)
- [거리뷰 안내](collage/collage-panorama-mobile-chromium.png)
