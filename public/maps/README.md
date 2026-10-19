# 유랑 — 울산 라인 지도 데이터

`ulsan-lines.geojson`은 © OpenStreetMap contributors의 데이터를 단순화한 파생 데이터베이스이며 [Open Database License 1.0 (ODbL)](https://opendatacommons.org/licenses/odbl/1-0/)로 배포합니다. [OSM 저작권 안내](https://www.openstreetmap.org/copyright).

- 취득: 2026-10-18, `https://overpass.private.coffee/api/interpreter`의 읽기 전용 조회
- 응답의 OSM 기준 시각: **2026-05-31T22:37:44Z**. 취득일과 원본 데이터 기준일은 다릅니다.
- 조회 범위: 남 35.44, 서 129.17, 북 35.66, 동 129.46. 울산 도심과 주요 시연 장소 주변의 제한된 추출물이며 울산광역시 전체 행정 경계가 아닙니다.
- 원본 617개 way에서 주요 도로(primary), 하천 중심선, 해안선, 약 50,000㎡ 이상의 이름 있는 공원 336개를 보존했습니다.
- 약 10~15m 허용 오차로 Douglas–Peucker 단순화를 적용했습니다. 길 찾기나 정밀 지형 측량을 위한 자료가 아닙니다.
- 브라우저는 이 정적 파일만 읽습니다. 사용자의 위치나 기억 데이터를 Overpass로 보내지 않습니다. 앱에서 실시간 Overpass 호출, tile prefetch, 오프라인 타일 저장, 일괄 타일 다운로드를 하지 않습니다.
- 파일의 bbox 밖으로 지도 중심이 이동하거나 이 파일을 읽지 못하면 기존 OSM standard raster 호환 경로가 표시됩니다. 지도·마커·현재 위치는 동일한 Web Mercator 투영을 사용합니다.

원본 조회:

```overpass
[out:json][timeout:25];
(
  way["highway"="primary"](35.44,129.17,35.66,129.46);
  way["waterway"="river"](35.44,129.17,35.66,129.46);
  way["natural"="coastline"](35.44,129.17,35.66,129.46);
  way["leisure"="park"]["name"](35.44,129.17,35.66,129.46);
);
out geom;
```

지도에 `© OpenStreetMap contributors`와 저작권 링크를 계속 표시합니다. 파생 데이터의 사용·재배포에는 위 ODbL 조건이 적용됩니다.

## 행정구역과 지명 보완 · 2026-10-19

최초 도로 추출물과 별도로 OSM API에서 실제 울산 구/군 관계의 외곽 way를 받아 연결했습니다. 5개 구/군 polygon과 공유 경계를 중복 제거한 48개 way를 포함합니다. 경계는 약 20m 허용 오차로 단순화했습니다.

- [동구 8127813](https://www.openstreetmap.org/relation/8127813)
- [남구 8127814](https://www.openstreetmap.org/relation/8127814)
- [울주군 8127815](https://www.openstreetmap.org/relation/8127815)
- [중구 8127816](https://www.openstreetmap.org/relation/8127816)
- [북구 8127817](https://www.openstreetmap.org/relation/8127817)
- 울산 외곽선: [울산광역시 2395867](https://www.openstreetmap.org/relation/2395867). Nominatim에서 이 도시의 OSM polygon을 한 차례 받아 정적 파일에 보존했습니다. 앱의 검색 기능이나 자동완성에 Nominatim을 연결하지 않았습니다.

파일의 `adminSources`에 개별 관계의 원본 timestamp를 보존합니다. 취득일이 경계의 최신성이나 정부 공인 정확성을 보증하지 않습니다. OSM 공동 편집 자료를 일반화한 지도 표현이며 법적·측량용 경계가 아닙니다.

OSM 명칭·위치에 근거한 도시/구군/동/주요 도로 22개 label을 추가했습니다. 축척 10부터 도시·구군, 12부터 동, 12.3부터 도로명을 표시하되 기억 마커·다른 label·초기 소개 글과 겹치면 생략하거나 인접한 여백으로 옮깁니다. 울산광역시와 남구 label의 위치는 가독성을 위한 지도상 배치이며 공식 중심점을 뜻하지 않습니다.

행정 polygon이 울산 전체를 포함해도 기존 도로 추출물의 bbox는 확장하지 않았습니다. 기존 bbox 밖의 지도 중심과 파일 읽기 실패 시에는 OSM raster fallback을 계속 사용합니다. 브라우저에서 경계 API를 호출하지 않으며, tile prefetch·offline·bulk download를 추가하지 않았습니다. 추가 행정 데이터에도 위 ODbL과 OSM attribution을 적용합니다.
