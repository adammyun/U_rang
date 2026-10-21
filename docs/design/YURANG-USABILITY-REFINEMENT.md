# 유랑 사용성 보완

2026-10-20–22 · `yeoun_2` · `redesign/yeoun-2`

## 변경한 경험

| 요청 | 적용 |
| --- | --- |
| 기억 남기기가 눈에 띄지 않음 | 더 밝은 산호색 `--atlas-action: #ffb08d`, 어두운 글 `#111719`, 밝은 테두리·짙은 외곽선. Hover/active/focus도 같은 표현을 사용하며 글자 대비 7:1 이상 검사 |
| 장소 선택 중 기억 조각이 화면을 가림 | 공개 지도의 선택/작성 중 조각만 렌더링에서 제외. 선택 핀·지도·현재 위치·출처는 유지. 취소/닫기 후 복원 |
| 내 기억에 예전 고정 레이아웃이 남음 | 전체 지도와 공유 소개 타이포그래피로 시작. 하단 기억 목록을 눌러서만 종이 아카이브를 열고 데스크톱 두 열/모바일 한 열로 읽음 |
| 내 기억에서 돌아가기 어려움 | 상단 `지도로 돌아가기`와 하단 모두의 지도 링크. 목록 닫기와 Escape는 내 기억 지도에 남으며 목록 토글로 초점 복귀 |
| 감정 접기 애니메이션이 없음 | 닫을 때 180ms, 역순 20ms 간격으로 모임. 260ms 후 DOM 정리. 닫기 시작 즉시 inert/aria-hidden 적용, 빠른 재열기에서 타이머 취소, reduced-motion 즉시 닫기 |
| 사진 오류가 선택 버튼과 떨어짐 | 용량·형식·장수·처리 오류를 사진 선택 바로 아래 alert로 분리. 버튼과 입력에 설명 연결. 최소한의 스크롤로 경고 노출 |

사진 오류가 나도 제목·본문과 유효한 첨부 사진은 유지합니다. 유효한 사진을 다시 고르면 경고가 해제됩니다. API 저장 실패 안내는 기존 폼 오류 영역을 유지합니다. 파일 수·용량·형식 제한, 메타데이터 제거와 업로드/저장 정책은 바꾸지 않았습니다.

내 기억 목록의 공개 범위·연도·감정·세 지도 모드, 연도별 그룹, 로딩/재시도/빈 상태, 수정·삭제·거리뷰·내부 스크롤을 보존합니다. 목록이 닫혀 있어도 내 기억 조회와 지도 마커는 유지합니다. 공개 지도로 돌아가면 기존 public 조회 경계를 사용합니다.

## 변경 파일

- `app/atlas-collage.css`: CTA 토큰·상태, 감정 퇴장, 사진 경고, 내 기억 지도·아카이브·반응형 배치
- `components/memories/map.tsx`: `hideMemories` 표시 prop. 카메라나 데이터 변경 없이 조각 표시만 제어
- `components/memory-app.tsx`: 선택/작성 중 조각 숨김과 위치 선택 안내
- `components/my-memory-map.tsx`: 지도 우선 화면, 공유 메뉴, 접이식 아카이브, 명시적 복귀·초점 처리
- `components/memories/atlas-intro.tsx`: 기존 소개 효과를 내 기억에서도 재사용할 제목·설명 prop
- `components/memories/atlas-emotion-picker.tsx`: 열림과 퇴장 중 DOM 존재 상태 분리
- `components/memories/memory-form.tsx`: 사진 오류를 저장/API 오류와 분리해 선택 버튼 곁에 표시
- `tests/e2e/usability.spec.ts`: 네 브라우저/화면 조합의 요청 흐름 검사
- `tests/e2e/atlas.spec.ts`, `live-flow.spec.ts`, `browser-compat.spec.ts`: 의도적으로 변경된 내 기억의 목록 열기를 데스크톱에서도 명시. 기존 기능 assertion 유지
- `playwright.config.ts`: 기존 WebKit 프로젝트에서 사용성 시나리오도 실행
- `DESIGN-DNA.md`, `PERSONAL-UI-DESIGNER.md`, `DEMO-GUIDE.md`, `README.md`: 실제 동선·검증 안내

## 보존한 경계

MapLibre lifecycle, container size 보정, ResizeObserver, raster fallback, 울산/현재 위치 정책, 단일 좌표 overlay와 출처를 유지합니다. 기본/다크/자세히 팔레트와 투영을 바꾸지 않습니다. API·DTO·인증·DB/IndexedDB·익명 공개·대략적 좌표 정책도 변경하지 않습니다. 원본 저장소와 `main`은 수정하지 않습니다.

## 검증

```bash
pnpm check
pnpm test:ui --workers=1
```

새 사용성 시나리오는 데스크톱 1440×900·모바일 390×844의 Chromium/WebKit에서 다음을 확인합니다.

1. CTA 글자 대비, 선택 핀·지도·출처 유지, 기억 조각 숨김/취소/폼 닫기 후 복원
2. 실제 닫힘 애니메이션, 퇴장 중 inert, 필터 유지, 빠른 재열기와 reduced-motion
3. 5MB 초과·비허용 형식·장수 초과의 근접 경고, 경고의 접근성 연결과 유효 사진 재선택
4. 내 기억 기본 지도·목록 토글·필터·상세·복귀·초점, 비공개 기록의 공개 목록 미노출

최초 새 테스트 실행은 15/16 통과였습니다. 캡처에서 발견한 내 기억 zoom 영역의 늘어남과 모바일 출처 표기 겹침을 수정하고 크기/위치 검증을 추가했습니다. 이어 전체 66개 중 62개가 통과했고, 내 기억의 필터 결과 교체/초점 복귀 3건과 모바일 WebKit 작성 시나리오 timeout 1건을 확인했습니다.

내 기억은 재조회 중 기존 카드를 유지하고 로딩 안내와 일시적 비활성 상태를 표시하도록 보완했습니다. 필터 변경마다 같은 카드를 spinner로 교체해 스크롤·포인터 대상이 사라지던 현상을 줄이며, 최신 조회 결과가 도착하면 기존과 동일한 필터 결과로 갱신합니다. 목록 닫기 초점은 화면 반영 후 복귀하도록 하고, 테스트에서도 상세 닫힘과 조회 완료를 확인한 뒤 다음 조작을 수행합니다. 해당 내 기억·작성 시나리오를 네 조합에서 재실행해 **8/8 통과**했습니다. 테스트 기준을 낮추거나 원래 기능 assertion을 제거하지 않았습니다.

캡처는 `test-results/screenshots/usability-*`에 생성합니다. 선정된 최종 캡처는 `usability/`에 보관합니다. 실제 iPhone/Android 기기, Worker 런타임의 브라우저 CRUD와 실제 NAVER 거리뷰는 이번 검증 범위가 아니며 Worker는 빌드를 검사합니다.

## 최종 결과 · 2026-10-22

- `pnpm check`: lint·typecheck·단위 테스트 10개·Worker/Pages 빌드 모두 통과.
- `pnpm test:ui --workers=1`: **66/66 통과**. Chromium 데스크톱/모바일 각 27개, WebKit 데스크톱/모바일 각 6개. 새 사용성 16개와 기존 사진·CRUD·비공개 경계·지도 모드·튜토리얼 등의 회귀 검증을 포함합니다.
- 새 패키지·API 키·DB migration 없음. 원본과 기준 `main` 유지.
- [장소 선택 중 조각 숨김과 CTA](usability/selection-desktop.png)
- [내 기억 기본 지도](usability/my-map-desktop.png)
- [모바일 내 기억 아카이브](usability/my-archive-mobile.png)
- [모바일 사진 용량 경고](usability/photo-warning-mobile.png)
