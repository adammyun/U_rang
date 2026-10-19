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
