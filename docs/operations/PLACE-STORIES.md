# 숨은 장소 이야기

2026-11-02 업데이트 · 기존 MapLibre 지도와 기억 데이터를 유지하는 작은 탐색 기능.

## 사용 방법

1. 기본 지도에서 관심 있는 울산 장소를 찾아 확대한다. 확대 수준 **15.8**부터 현재 화면 안에 책 모양 표식이 희미하게 나타난다. 예전 14.6보다 가까이 확대해야 하며, 검색 직후의 넓은 화면에는 나타나지 않는다.
2. 흔적을 클릭하거나 탭하면 출처가 있는 장소 이야기가 열린다. 키보드로도 선택할 수 있다.
3. 로그인 상태에서 열면 **마이페이지 → 숨은 이야기**에 자동 보관된다. 게스트도 가능하다. 같은 이야기를 다시 읽어도 최초 발견 날짜는 바뀌지 않는다.
4. 로그인 전에도 읽을 수 있다. 보관 안내에서 로그인하면 원래 이야기로 돌아온다.

‘발견’은 화면에서 이야기를 읽었다는 의미다. 실제 방문이나 GPS 확인을 요구하지 않는다. 별도의 위치 추적을 추가하지 않았다.

## 최초 콘텐츠와 출처

| 장소 | 이야기 | 출처 |
|---|---|---|
| 태화루 | 예식장이 있던 자리와 복원된 누각 | [울산시 도시경관기록](https://www.ulsan.go.kr/archive/us/nUlsan/AL/LP.do), [울산시 태화루 안내](https://www.ulsan.go.kr/u/culture/contents.ulsan?mId=001003004001000000) |
| 장생포문화창고 | 어류 냉동창고에서 문화공간으로 | [울산 남구 문화관광](https://www.ulsannamgu.go.kr/tour/board/tourSights2/432261/view.do) |
| 울기등대 | 자라난 해송과 두 등대 | [대왕암공원](https://daewangam.donggu.ulsan.kr/Pgparkprevew2.do) |
| 태화강 삼호대숲 | 계절마다 달라지는 철새 | [태화강 국가정원 조류생태원](https://ulsan.go.kr/s/garden/bbs/view.ulsan?bbsId=BBS_0000000000000166&dataId=27106&mId=001002002000000000) |
| 현대자동차 울산공장 주변 | 오토바이와 함께 출퇴근하던 풍경 | [2004년 매일신문 현장 취재](https://www.imaeil.com/page/view/2004072408091032562), [현대자동차그룹](https://www.hyundaimotorgroup.com/ko/amp/CONT0000000000149088) |

본문은 출처를 바탕으로 새로 작성했다. 사진·원문을 복사하지 않았다. 현대차 이야기는 **2004년 기록**임을 명시하며 현재 교통량·퇴근 시간·출입 가능 여부를 안내하지 않는다. 장생포문화창고와 조류생태원 앵커는 공식 안내 페이지의 지도값을 사용했다. 각 좌표는 해당 장소 주변의 탐색 앵커이며 출입구·도로 경로 안내가 아니다.

최초 5곳을 유지하고 4곳을 추가해 총 9곳을 제공한다. 공개 기억 수를 자동 집계해 장소를 선정하는 기능이나 사용자 제보·편집 도구는 추가하지 않았다. 인기 순위·완성률·보상도 없다. 카탈로그 `src/features/stories/catalog.ts`에 검증한 이야기를 추가할 수 있다.

## 추가 콘텐츠와 위치 확인

| 장소 | 이야기 | 근거 |
|---|---|---|
| 울산 동헌 및 내아 | 관청과 살림집이 이웃한 일과 생활 | [울산관광](https://www.ulsan.go.kr/tour/kor/unit/attrctn/view.ulsan?mId=001002007000000000&unqId=97) |
| 울산 경상좌도병영성 | 동네에 남은 군사 거점과 생활의 흔적 | [국가유산청](https://digital.khs.go.kr/heri/heriDetail.do?ctptNo=1332603200000&ctptUid=13898859676748300933) |
| 선암호수공원 | 농업용수 연못에서 생태공원으로 | [한국관광공사 오디](https://www.odii.kr/smarttour_web/story/detail?lang=ko&sid=4828&slid=14277&tid=2870&tlid=4380) |
| 삼산동 일대 | 들판·염전이었던 시가지 | [울산광역시 웹진](https://webzine.ulsan.go.kr/contents/view.do?bbsId=BBSMSTR_000000000180&nttId=15454) |

새 글은 2026-11-02 확인한 공개 자료를 바탕으로 새로 작성했고 사진·원문을 복사하지 않았다. 기존 5곳의 확인 날짜는 그대로 둔다. 동헌과 병영성은 공식 관광 페이지의 지도 좌표, 선암호수공원과 삼산동은 Photon/OpenStreetMap의 공원·행정동 앵커를 사용한다. 삼산동은 특정 건물의 옛 용도를 단정하지 않는 지역 이야기다. 좌표는 탐색 앵커이며 개인 위치·출입구·길 안내가 아니다.

공개된 기억 문구를 빠르게 5번 탭해 개발 도구를 열면 **숨은 이야기 위치**에서 9곳의 이름·제목·좌표를 확인할 수 있다. **위치 확인** 링크는 `/?storyLocation=<catalog-id>`로 해당 장소를 확대 16.2에서 보여 준다. 임의 좌표나 줌을 URL로 받지 않고 알려진 카탈로그 ID만 사용한다. 알 수 없는 ID는 기본 울산 지도를 연다.

위치 확인은 이야기를 열거나 발견 목록에 저장하지 않는다. 표식을 눌러 실제로 이야기를 읽은 경우에만 기존 보관 동작을 따른다. 로그인·발견 목록의 낮은 확대 수준 표시·지도 스타일 전환은 기존대로 유지한다. 상세의 **지도에서 보기**도 새 표시 기준보다 가까운 확대 16.2로 이동한다.

## 저장과 접근 경계

- 공개 카탈로그는 작은 정적 데이터다. 기억 본문·작성자·비공개 기록 수를 참조하지 않는다.
- 새 D1 테이블 `story_discoveries`: `user_id`, `story_id`, `discovered_at`. 복합 기본키 `(user_id, story_id)`로 중복을 막는다.
- `GET /api/users/me/discoveries`: 본인의 보관 기록만 반환한다.
- `POST /api/users/me/discoveries`: 엄격한 `{storyId}` 입력만 받는다. 사용자 ID는 인증 세션, 시각은 서버에서 결정한다. 첫 발견 시각을 유지한다.
- 인증 전 401, 알 수 없는 이야기·추가 입력 필드 400. 다른 출처의 쓰기를 거부한다. 응답은 `private, no-store`, DTO에는 사용자 식별 정보가 없다.
- 프로덕션 최초 사용 시 테이블을 안전하게 생성한다. 로컬 `pnpm db:migrate`에도 `0006_tearful_shockwave.sql`을 포함했다.
- GitHub Pages 시연판은 기존 브라우저 인증과 localStorage를 사용한다. 서버와 자동 동기화하지 않는다. 실서비스는 본인 계정에 저장하며 게스트는 기존 7일 세션 제한을 따른다.

## 지도와 인터페이스

기존 하나의 지리 overlay에 현재 화면의 이야기만 투영한다. 별도 지도 인스턴스·타일 다운로드·추가 기억 쿼리는 없다. 낮은 확대 수준, 기억 작성/장소 선택, 내 지도/마이페이지, 기억 상세/장소 보드/탐색 패널에서는 숨긴다. 검색한 장소 주변에서는 볼 수 있다.

44px 선택 영역, hover/focus 강조, reduced-motion 대응, Radix dialog의 포커스·Escape·바깥 클릭 닫기, 긴 본문 내부 스크롤을 적용했다. graphite/coral·테이프·종이 표면 토큰을 재사용했다. 마이페이지에서는 보관함 선택 시 목록이 보이도록 내부를 스크롤한다.

## 검증 명령

```sh
pnpm check
pnpm db:migrate
pnpm dev --port 5197
# 별도 터미널
node scripts/verify-stories-service.mjs
node scripts/verify-guest-service.mjs
pnpm test:server-ui
pnpm exec playwright test tests/e2e/place-stories.spec.ts tests/e2e/personal-space.spec.ts --workers=1
```

API 스크립트는 localhost에서만 동작한다. 검사 중 만든 게스트 세션은 로그아웃으로 폐기한다. 발견 기록은 로컬 테스트 DB에 남을 수 있다. 운영 사용자 데이터는 변경하지 않는다.

스크린샷은 `test-results/screenshots/place-story-*`와 `test-results-server/screenshots/place-story-*`에 생성한다. Chromium/WebKit의 데스크톱·모바일 viewport로 검증하며 실제 iOS/Android 기기나 실제 현장 방문을 검증하는 것은 아니다.

최종 검사·화면·배포 결과는 [검증 기록](../design/place-stories/QA.md)에 정리했다.
