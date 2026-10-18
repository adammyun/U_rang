import { Map as LibreMap, Marker, setWorkerUrl } from 'maplibre-gl';
import mapLibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';
import './style.css';

setWorkerUrl(mapLibreWorkerUrl);

// Visual concept only. These fictional stories are public-safe demo content;
// the actual product remains responsible for API authorization and location privacy.
const places = [
  {
    id: 'taehwa', name: '태화강 국가정원', district: '울산 중구', count: 5,
    coordinates: [129.2975, 35.5484], date: '2025년 9월 13일', shortDate: '2025. 09. 13',
    emotion: '사랑', title: '오래된 친구와 다시 만난 곳', titleLines: ['오래된 친구와', '다시 만난 곳'],
    excerpt: '오랫동안 연락하지 못했던 친구와 만나 강을 따라 천천히 걸었다.',
    lead: '“다시 만나면 어색할 줄 알았는데, 우리는 예전처럼 강을 따라 걸었다.”',
    body: [
      '오랫동안 연락하지 못했던 친구와 만나 강을 따라 천천히 걸었다. 별다른 말을 하지 않아도 서로의 속도를 기억하고 있다는 게 신기했다.',
      '바람이 불 때마다 나뭇잎이 흔들렸고, 멀리서 사람들이 웃는 소리가 들렸다. 집으로 돌아가는 길에는 오래 묻어 두었던 이야기를 조금씩 꺼냈다.',
    ],
    hasPhoto: true,
  },
  {
    id: 'ulsanpark', name: '울산대공원', district: '울산 남구', count: 2,
    coordinates: [129.2906, 35.5254], date: '2026년 3월 7일', shortDate: '2026. 03. 07',
    emotion: '평온', title: '햇살이 따뜻했던 공원 벤치', titleLines: ['햇살이 따뜻했던', '공원 벤치'],
    excerpt: '새 학기를 앞두고 벤치에 앉아 작은 계획을 적어 보았다.',
    lead: '“아무것도 하지 않는 오후가 생각보다 오래 남았다.”',
    body: ['새 학기를 앞두고 벤치에 앉아 작은 계획을 적어 보았다. 계획을 다 세우지는 못했지만 마음은 조금 가벼워졌다.', '나무 사이로 들어오는 햇빛을 한참 바라보다 천천히 집으로 돌아왔다.'],
    hasPhoto: false,
  },
  {
    id: 'seongnam', name: '성남동 골목', district: '울산 중구', count: 2,
    coordinates: [129.3206, 35.5548], date: '2024년 10월 21일', shortDate: '2024. 10. 21',
    emotion: '그리움', title: '골목의 작은 불빛', titleLines: ['골목의', '작은 불빛'],
    excerpt: '늦은 버스를 기다리며 천천히 걸었던 저녁의 기억.',
    lead: '“별일 없던 저녁인데도 그 골목의 빛은 아직 선명하다.”',
    body: ['늦은 버스를 기다리며 천천히 골목을 걸었다. 가게 문을 닫는 소리와 따뜻한 불빛이 길에 오래 남아 있었다.', '언젠가 다시 지나가면 그날의 평범한 마음도 떠오를 것 같다.'],
    hasPhoto: false,
  },
  {
    id: 'daewangam', name: '대왕암공원', district: '울산 동구', count: 2,
    coordinates: [129.4391, 35.4919], date: '2023년 7월 12일', shortDate: '2023. 07. 12',
    emotion: '자유', title: '바다를 향해 걷던 날', titleLines: ['바다를 향해', '걷던 날'],
    excerpt: '파도 소리를 따라 걷다 보니 마음이 한결 가벼워졌다.',
    lead: '“파도 소리를 들으며 걷는 동안 생각이 잠시 멈췄다.”',
    body: ['바다 쪽으로 난 길을 천천히 걸었다. 바람이 세게 불었지만 발걸음은 이상하게 가벼웠다.', '돌아올 때는 아무 답도 찾지 못했지만, 그걸로도 충분한 날이었다.'],
    hasPhoto: false,
  },
];

const icons = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',
  pin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  user: '<circle cx="12" cy="7.5" r="3.5"/><path d="M5 21c.5-4 3-6 7-6s6.5 2 7 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  locate: '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3M22 12h-3M12 22v-3M2 12h3"/>',
  map: '<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5ZM9 3v16M15 5v16"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>',
  book: '<path d="M4 4.5c3-1 5-1 8 1 3-2 5-2 8-1v15c-3-1-5-1-8 1-3-2-5-2-8-1v-15ZM12 5.5v15"/>',
  close: '<path d="M5 5 19 19M19 5 5 19"/>',
  'arrow-right': '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  'arrow-left': '<path d="M20 12H4m6-6-6 6 6 6"/>',
};

document.querySelectorAll('[data-icon]').forEach((node) => {
  const shape = icons[node.dataset.icon];
  if (shape) node.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${shape}</svg>`;
});

const $ = (id) => document.getElementById(id);
const experience = $('experience');
const context = $('contextPanel');
const detail = $('editorialPanel');
const explore = $('explorePanel');
const suggestions = $('searchSuggestions');
const search = $('placeSearch');
const markerHintKey = 'yeoun-immersive-marker-hint-v1';
let showMarkerHint = true;
try { showMarkerHint = localStorage.getItem(markerHintKey) !== 'seen'; } catch { /* Preview still works without storage. */ }
let selectedPlace = null;
let map = null;
let mapMarkers = [];
let fallbackMarkers = [];
let toastTimer = null;

function setOverlayState() {
  experience.classList.toggle('has-overlay', !context.hidden || !detail.hidden || !explore.hidden);
  experience.classList.toggle('has-context', !context.hidden);
  experience.classList.toggle('is-detail', !detail.hidden);
  experience.classList.toggle('is-explore', !explore.hidden);
  $('navMap').classList.toggle('is-active', context.hidden && detail.hidden && explore.hidden);
  $('navExplore').classList.toggle('is-active', !explore.hidden);
  $('navMap').toggleAttribute('aria-current', context.hidden && detail.hidden && explore.hidden);
}

function updateMarkerSelection() {
  for (const marker of [...mapMarkers, ...fallbackMarkers]) {
    const selected = marker.id === selectedPlace?.id;
    marker.element.classList.toggle('is-selected', selected);
    marker.element.setAttribute('aria-pressed', String(selected));
  }
}

function dismissMarkerHint() {
  showMarkerHint = false;
  document.querySelectorAll('.memory-marker.is-hint').forEach((marker) => marker.classList.remove('is-hint'));
  try { localStorage.setItem(markerHintKey, 'seen'); } catch { /* No persistence in restricted preview contexts. */ }
}

function setSuggestionsOpen(open) {
  suggestions.hidden = !open;
  search.setAttribute('aria-expanded', String(open));
}

function updateSearchResults() {
  const query = search.value.trim().toLowerCase();
  let count = 0;
  suggestions.querySelectorAll('[data-search-place]').forEach((button) => {
    button.hidden = !button.textContent.toLowerCase().includes(query);
    if (!button.hidden) count += 1;
  });
  $('searchResultLabel').textContent = query ? `검색 결과 · ${count}곳` : `장소 제안 · ${count}곳`;
  $('searchEmpty').hidden = count > 0;
}

function showToast(message) {
  const toast = $('toast');
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 3300);
}

function closeAll() {
  context.hidden = true;
  detail.hidden = true;
  explore.hidden = true;
  setSuggestionsOpen(false);
  search.blur();
  selectedPlace = null;
  updateMarkerSelection();
  setOverlayState();
}

function selectPlace(place, fly = false) {
  dismissMarkerHint();
  selectedPlace = place;
  $('contextPlace').textContent = place.name;
  $('contextCount').textContent = `기억 ${place.count}개`;
  $('contextDate').textContent = `${place.date} · ${place.emotion}`;
  $('contextTitle').textContent = place.title;
  $('contextExcerpt').textContent = place.excerpt;
  $('contextPhoto').hidden = !place.hasPhoto;
  $('openStory').classList.toggle('without-photo', !place.hasPhoto);
  $('detailEmotion').textContent = place.emotion;
  $('detailPlace').textContent = `${place.name} · ${place.district}`;
  $('detailDate').textContent = place.shortDate;
  $('detailLead').textContent = place.lead;
  $('detailBodyFirst').textContent = place.body[0];
  $('detailBodySecond').textContent = place.body[1];
  const title = $('detailTitle');
  const emphasis = document.createElement('em');
  emphasis.textContent = place.titleLines[1];
  title.replaceChildren(document.createTextNode(place.titleLines[0]), document.createElement('br'), emphasis);
  $('editorialHero').classList.toggle('without-photo', !place.hasPhoto);
  $('detailPhoto').hidden = !place.hasPhoto;
  $('photoCaption').hidden = !place.hasPhoto;
  $('heroNoPhoto').hidden = place.hasPhoto;
  context.hidden = false;
  detail.hidden = true;
  explore.hidden = true;
  setSuggestionsOpen(false);
  search.blur();
  updateMarkerSelection();
  setOverlayState();
  if (fly && map) map.flyTo({ center: place.coordinates, zoom: place.id === 'daewangam' ? 12.6 : 13.1, offset: window.innerWidth < 700 ? [0, -82] : [110, 0], duration: 750 });
}

function openDetail() {
  if (!selectedPlace) selectPlace(places[0]);
  context.hidden = true;
  detail.hidden = false;
  explore.hidden = true;
  setOverlayState();
  $('closeDetail').focus({ preventScroll: true });
}

function closeDetail() {
  detail.hidden = true;
  context.hidden = false;
  setOverlayState();
  $('openStory').focus({ preventScroll: true });
}

function createMarker(place, fallback = false) {
  const element = document.createElement('button');
  element.className = 'memory-marker';
  element.type = 'button';
  element.dataset.kind = place.count >= 4 ? 'place' : 'memory';
  element.dataset.place = place.id;
  element.setAttribute('aria-label', `${place.name}, 공개된 기억 ${place.count}개`);
  element.setAttribute('aria-pressed', 'false');
  if (showMarkerHint && place.id === 'taehwa') element.classList.add('is-hint');
  element.innerHTML = `<span>${place.count >= 4 ? place.count : ''}</span>`;
  element.addEventListener('click', (event) => { event.stopPropagation(); selectPlace(place, true); });
  if (fallback) {
    const positions = { taehwa: [52, 48], ulsanpark: [45, 65], seongnam: [62, 38], daewangam: [82, 76] };
    const [x, y] = positions[place.id];
    element.style.left = `${x}%`;
    element.style.top = `${y}%`;
    $('fallbackMarkers').append(element);
    fallbackMarkers.push({ id: place.id, element });
  } else {
    const marker = new Marker({ element, anchor: 'center' }).setLngLat(place.coordinates).addTo(map);
    mapMarkers.push({ id: place.id, element, marker });
  }
}

function showExplore() {
  dismissMarkerHint();
  detail.hidden = true;
  context.hidden = true;
  explore.hidden = false;
  setSuggestionsOpen(false);
  setOverlayState();
  $('closeExplore').focus({ preventScroll: true });
}

const fallbackLayer = document.createElement('div');
fallbackLayer.id = 'fallbackMarkers';
fallbackLayer.className = 'fallback-markers';
experience.insertBefore(fallbackLayer, $('mapMeta'));
places.forEach((place) => createMarker(place, true));

const list = $('exploreList');
for (const place of places) {
  const item = document.createElement('button');
  item.type = 'button';
  item.innerHTML = `<small>${place.name} · ${place.date}</small><strong>${place.title}</strong><span>${place.excerpt}</span>`;
  item.addEventListener('click', () => selectPlace(place, true));
  list.append(item);
}

try {
  map = new LibreMap({
    container: 'map',
    style: 'https://tiles.openfreemap.org/styles/positron',
    center: [129.3164, 35.5392],
    zoom: 11.65,
    minZoom: 8,
    maxZoom: 18,
    renderWorldCopies: false,
    attributionControl: false,
  });
  map.on('load', () => {
    $('mapFallback').hidden = true;
    fallbackLayer.hidden = true;
  });
  map.on('error', (event) => {
    // The fallback sketch stays visible if the live map cannot initialize.
    if (!map.loaded()) console.warn('Preview map unavailable; showing fallback.', event.error?.message ?? event);
  });
  places.forEach((place) => createMarker(place));
  const observer = new ResizeObserver(() => map?.resize());
  observer.observe($('map'));
} catch (error) {
  console.warn('Preview map unavailable; showing fallback.', error);
  map = null;
}

$('homeButton').addEventListener('click', () => { closeAll(); map?.flyTo({ center: [129.3164, 35.5392], zoom: 11.65, duration: 700 }); });
$('navMap').addEventListener('click', closeAll);
$('closeContext').addEventListener('click', closeAll);
$('openStory').addEventListener('click', openDetail);
$('closeDetail').addEventListener('click', closeDetail);
$('openPlaceStories').addEventListener('click', showExplore);
$('navExplore').addEventListener('click', showExplore);
$('closeExplore').addEventListener('click', closeAll);
$('navMine').addEventListener('click', () => showToast('이 페이지는 디자인 시안입니다. 내 기억은 실제 서비스에서 이용할 수 있어요.'));
$('profileButton').addEventListener('click', () => showToast('이 페이지는 디자인 시안입니다. 내 기억은 실제 서비스에서 이용할 수 있어요.'));
$('navCreate').addEventListener('click', () => showToast('이 페이지는 디자인 시안입니다. 기억 작성은 실제 서비스에서 이용할 수 있어요.'));
$('nextStory').addEventListener('click', () => showToast('다른 기억으로 이어지는 흐름은 실제 서비스 연결 단계에서 적용합니다.'));
$('zoomIn').addEventListener('click', () => map?.zoomTo(map.getZoom() + 1));
$('zoomOut').addEventListener('click', () => map?.zoomTo(map.getZoom() - 1));
$('locate').addEventListener('click', () => {
  if (!navigator.geolocation) { showToast('이 브라우저에서는 위치를 확인할 수 없습니다.'); return; }
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => map?.flyTo({ center: [coords.longitude, coords.latitude], zoom: 13, duration: 750 }),
    () => showToast('위치를 확인할 수 없어 울산 지도를 유지합니다.'),
    { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 },
  );
});

search.addEventListener('focus', () => { updateSearchResults(); setSuggestionsOpen(true); });
search.addEventListener('input', () => {
  updateSearchResults();
  setSuggestionsOpen(true);
});
suggestions.querySelectorAll('[data-search-place]').forEach((button) => {
  button.addEventListener('click', () => {
    const place = places.find((candidate) => candidate.id === button.dataset.searchPlace);
    if (place) { search.value = place.name; selectPlace(place, true); }
  });
});
search.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    const first = suggestions.querySelector('[data-search-place]:not([hidden])');
    first?.click();
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') { if (!suggestions.hidden && context.hidden && detail.hidden && explore.hidden) { setSuggestionsOpen(false); search.blur(); } else if (!detail.hidden) closeDetail(); else closeAll(); }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); search.focus(); }
});
document.addEventListener('pointerdown', (event) => {
  if (!event.target.closest('.search-wrap')) setSuggestionsOpen(false);
});

const initial = new URLSearchParams(location.search).get('state');
if (initial === 'place') selectPlace(places[0]);
if (initial === 'detail') { selectPlace(places[0]); openDetail(); }
if (initial === 'explore') showExplore();
