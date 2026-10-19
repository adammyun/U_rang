# 유랑 건물·도시 블록 지도 보완

2026-10-19 · `adammyun/yeoun_2` · `redesign/yeoun-2`

## 요청과 결과

기존 간결 지도는 주요 도로·하천·행정 경계만 있어 장소의 도시 형태를 읽기 어려웠습니다. 첨부 레퍼런스의 도로와 건물 구역이 구분되는 figure-ground 표현을 재해석했습니다. 레퍼런스 이미지나 도형을 복제하지 않고 실제 울산 OSM 데이터를 사용했습니다.

- 어두운 graphite 배경과 기존 UI를 유지합니다.
- 도로로 둘러싸인 블록은 짙은 회청색, 실제 등록 건물은 더 밝은 회청색으로 표시합니다. 도로가 블록 사이의 간격을 만듭니다.
- 초기에는 시가지 전체의 형태를, zoom 13부터는 해당 화면의 작은 건물까지 보여 줍니다.
- 도로 블록 6,270개, 등록 건물 21,901개, 생활·보조 도로 13,994개를 사용합니다. 개요에는 300㎡ 이상 건물 6,597개가 포함됩니다.
- 기존 행정 구역명·동·도로명, 기억 마커, 작성 위치, 현재 위치와 같은 Web Mercator 카메라를 공유합니다.

## 변경 파일

- `components/memories/ulsan-urban-layers.tsx`: 개요와 viewport별 건물 데이터 로딩, 중복 footprint 제거, 좌표 투영과 SVG path. HTTP 실패·abort·메모리 캐시를 처리합니다.
- `components/memories/ulsan-line-map.tsx`: 기존 SVG 지도에 도시 조직 레이어를 합성합니다.
- `app/memory-atlas.css`: 블록·건물·도로의 semantic 색상과 선 위계를 정의합니다.
- `public/maps/ulsan-urban/`: 개요와 112개 정적 건물 셀, 출처·기준일 metadata.
- `scripts/maps/build-ulsan-urban.py`, `scripts/maps/ulsan-urban.overpass`: 캐시한 OSM 응답의 로컬 변환과 원본 조회 재현.
- `tests/e2e/atlas.spec.ts`: 건물의 기본/확대 표시와 데이터 실패 시 지도·기억 탐색 보존 검사.
- `README.md`, `public/maps/README.md`, `DESIGN-DNA.md`: 사용 방식, 출처·라이선스·한계.

## 성능·기능 경계

외부 건물 API를 앱에 연결하지 않았습니다. 개요 한 파일을 먼저 읽고, 확대 시에는 실제 화면과 교차하는 정적 셀만 읽습니다. 요청은 잠시 지연·최대 4개 단위로 처리하고 불필요한 요청을 abort합니다. 전체 셀·인접 영역 prefetch, offline tile 저장, runtime Overpass 호출은 없습니다. path는 데이터를 읽을 때 계산해 카메라 이동마다 전체 좌표를 재투영하지 않습니다.

기존 `map.tsx`의 lifecycle·container size 보정·ResizeObserver·raster compatibility/fallback·단일 marker overlay를 변경하지 않았습니다. API·DB·저장소·인증·공개/비공개·익명·approximate 정책도 변경하지 않았습니다. 새 패키지·API key를 추가하지 않았습니다. 원본 저장소·main 브랜치는 그대로 보존합니다.

## 검증

최종 변경 후 `pnpm check`와 `pnpm test:ui`를 실행했습니다.

- lint, TypeScript 검사: 성공.
- 기존 단위 테스트: **10/10 성공**.
- Worker·Pages production build: 성공.
- Chromium 데스크톱 1440×900 / 모바일 390×844: **36/36 성공**. 기존 낮은 높이 검증 시나리오도 유지합니다.
- 건물 개요·확대 footprint 전환, dark 배경, 검색 후 해당 위치 작성과 마커 선택을 확인했습니다.
- 건물 개요 503 시 기존 지도·상세 열람이 유지되는지, 상세 건물 셀 503 시 개요 건물이 유지되는지 검사했습니다.
- 기존 사진 5장·긴 본문 스크롤·CRUD·public/private·현재 위치 mock·장소 그룹·튜토리얼·키보드·reduced-motion·지도 모드 앵커 일치와 raster fallback도 통과했습니다.
- 캡처에서 기본/확대 지도와 모바일 조작·텍스트의 가독성을 직접 확인했습니다.

기존 큰 chunk 경고·vinext 라우트 정적 분류 안내가 남아 있습니다. 개발 HMR의 기존 createRoot 중복 경고는 이 작업에서 변경하지 않았으며 production build/preview로 검증했습니다. 실기기 성능/FPS·WebKit/Firefox·실제 NAVER 거리뷰는 이번 확인 범위 밖입니다.

## 데이터 한계와 출처

[OSM 출처·원본 기준일·ODbL·변환 방법](../../public/maps/README.md)을 확인하세요. 건물 외곽선은 등록된 OSM way에 한정되어 누락될 수 있으며 relation과 중정은 포함하지 않습니다. 도로 블록은 건물·필지 자체를 의미하지 않습니다. 정부 공인·실시간 건축 도면이 아닙니다. 도로·건물 추출 범위는 기존 울산 도심 bbox이며 범위 밖 raster fallback 정책을 유지합니다.

## 캡처

- [데스크톱 기본](building-map/buildings-main-desktop-chromium.png)
- [데스크톱 확대](building-map/buildings-close-desktop-chromium.png)
- [모바일 기본](building-map/buildings-main-mobile-chromium.png)
- [모바일 확대](building-map/buildings-close-mobile-chromium.png)
