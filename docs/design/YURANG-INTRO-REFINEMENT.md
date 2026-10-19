# 유랑 소개 문구·지도 노출·감정 그래픽 보완

2026-10-19 · `adammyun/yeoun_2` · `redesign/yeoun-2`

## 변경

메인 제목을 “기억을 거닐다 / 유랑”의 두 줄로 바꾸고 유랑을 별도 줄·간격·산호색으로 강조했습니다. 본문은 화면에 소개가 나타날 때 아래 8개 문장 중 하나를 선택합니다. 지도 이동이나 데이터 갱신 중에는 바뀌지 않고, 타이머로 자동 순환하지 않습니다.

1. 오늘은 무슨 일이 있었나요?
2. 그 때의 순간을 들여다보세요
3. 어떤 장면을 오래 기억하고 싶나요?
4. 익숙한 길에서 새로운 기억을 만나보세요
5. 잠시 멈춰 그날의 마음을 떠올려보세요
6. 같은 장소에 다른 이야기가 기다리고 있어요
7. 당신의 하루는 어디에 머물렀나요?
8. 천천히 걸으며 누군가의 기억을 만나보세요

사진 없는 상세의 감정 그래픽은 직사각형 메모에서 이전의 겹친 유기적 원형 윤곽으로 되돌렸습니다. 현재 고딕체·한 줄 감정명과 검은 제목/본문 종이는 유지합니다. 사진이 있는 상세와 지도 위 포스트잇 마커는 변경하지 않았습니다.

## 문구가 지도를 가리지 않는 방식

- 데스크톱 fine pointer: 소개 영역의 마우스 위치를 중심으로 82px 원형 CSS mask를 적용합니다. 안쪽 62px는 투명하고 바깥쪽 20px는 경계를 부드럽게 연결합니다. 소개의 글자만 지우며 지도나 마커를 복제하지 않습니다.
- 영역 이탈·키보드 입력 시 mask를 제거합니다. 소개는 pointer-events가 없어 아래 지도/마커의 클릭과 드래그를 막지 않습니다.
- 모바일: 지도에서 6px 이상 움직이는 touch gesture 또는 coarse pointer의 지도 wheel 입력 때 제목·본문을 잠시 투명하게 합니다. 마지막 움직임 후 750ms에 복귀합니다. 탭과 폼/패널 스크롤에는 적용하지 않습니다.
- DOM 텍스트와 heading 의미 구조는 유지합니다. reduced-motion에서는 opacity 전환을 끕니다. 이벤트를 preventDefault/stopPropagation 하지 않습니다.

## 파일과 기능 경계

- `components/memories/atlas-intro.tsx`: 8개 문구, 초기 렌더와 일치하는 기본값, mount 후 임의 선택, mask/touch 표시 전용 이벤트와 cleanup.
- `components/memory-app.tsx`: 기존 조건부 소개 영역을 `AtlasIntro`로 교체.
- `app/atlas-collage.css`: 제목 위계·간격, 원형 mask·일시 숨김, 감정 원형 복원.
- `tests/e2e/atlas.spec.ts`: 명시적으로 바뀐 제목 기대값 수정, 감정 원형 검증 추가, 실제 브라우저 포인터/터치 제스처 검사 추가.
- README·Design DNA·이 문서와 실제 캡처.

API·인증·DB·저장소·공개/비공개·익명·approximate 정책을 변경하지 않았습니다. `map.tsx`와 지도 데이터·MapLibre lifecycle·container 크기 보정·ResizeObserver·raster compatibility/fallback·단일 marker overlay도 그대로입니다. 원본 저장소와 main은 보존합니다.

## 검증

최종 `pnpm check`: lint·typecheck·단위 테스트 **10/10**·Worker/Pages build 성공.

`pnpm test:ui --workers=1`: **40/40 성공**, 약 2.1분. Chromium 데스크톱 1440×900 / 모바일 390×844와 기존 낮은 화면 시나리오를 포함합니다.

신규 테스트는 실제 마우스로 제목을 hover하고 CSS mask 및 영역 이탈 복귀를 확인한 뒤, 제목이 있던 위치에서 지도를 드래그해 카메라가 움직이는지 검사합니다. 모바일은 CDP touchStart/touchMove/touchEnd로 지도 위 터치를 보내 opacity 0→1 복귀와 카메라 이동을 확인합니다. 이동 전후 본문이 동일한지, CTA가 유지되는지도 확인합니다. 감정 원형의 두 윤곽과 투명 배경, 긴 감정명의 한 줄 가독성도 검사합니다.

기존 사진·긴 본문·CRUD·필터·장소 그룹·뒤로가기·현재 위치 mock·키보드·튜토리얼·reduced-motion·지도 모드 일치·데이터 실패 fallback 시나리오도 통과했습니다. 실제 캡처를 직접 확인했습니다. 기존 chunk 크기 경고·vinext 라우트 분류 안내는 남아 있으나 build 실패는 아닙니다.

실기기 iOS/Android·WebKit/Firefox·저사양 FPS·실제 NAVER panorama 제공 여부는 미검증입니다. CSS mask가 지원되지 않아도 소개는 지도 이벤트를 가로채지 않습니다.

## 실제 캡처

- [데스크톱 기본](intro/intro-main-desktop-chromium.png)
- [데스크톱 원형 창](intro/intro-peek-desktop-chromium.png)
- [모바일 기본](intro/intro-main-mobile-chromium.png)
- [모바일 지도 이동 중](intro/intro-gesture-mobile-chromium.png)
- [원형 감정 상세 — 데스크톱](intro/graphite-meaningful-desktop-chromium.png)
- [원형 감정 상세 — 모바일](intro/graphite-meaningful-mobile-chromium.png)
