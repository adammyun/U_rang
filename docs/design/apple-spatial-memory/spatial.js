const icons = {
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.8"/><path d="m16 16 4 4"/></svg>',
  tune: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  minus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>',
  locate: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="8"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  map: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 6 5-3 8 3 5-3v15l-5 3-8-3-5 3Z"/><path d="M8 3v15M16 6v15"/></svg>',
  book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22Z"/><path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22Z"/></svg>',
  user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>',
  layers: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
  camera: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h3l2-3h6l2 3h3v13H4Z"/><circle cx="12" cy="13" r="4"/></svg>',
};

const memories = [
  {
    title: '오래된 친구와 다시 만난 곳',
    place: '태화강 국가정원 산책로',
    date: '2025년 9월 13일',
    emotion: '사랑',
    tone: 'rose',
    text: '오랫동안 연락하지 못했던 친구와 다시 만나 밀린 이야기를 나눈 가상의 기억.',
  },
  {
    title: '파도 소리가 오래 남은 오후',
    place: '대왕암공원',
    date: '2021년 10월 16일',
    emotion: '의미 있는 순간',
    tone: 'ocean',
    text: '산책길 끝에서 잠시 멈춰 바다를 바라보았던 가상의 기억.',
  },
  {
    title: '햇살이 따뜻했던 공원 벤치',
    place: '울산대공원',
    date: '2026년 3월 7일',
    emotion: '행복',
    tone: 'sun',
    text: '새 학기를 앞두고 벤치에 앉아 작은 계획을 적어 보았던 가상의 기억.',
  },
  {
    title: '골목의 작은 불빛',
    place: '성남동 문화의거리',
    date: '날짜를 적지 않은 기억',
    emotion: '의미 있는 순간',
    tone: 'night',
    text: '골목을 지나며 가게 불빛이 하나씩 켜지는 모습을 바라본 가상의 기억.',
  },
];

function mapArt() {
  return `<div class="map-art" aria-hidden="true">
    <i class="river river-a"></i><i class="river river-b"></i>
    <i class="road road-a"></i><i class="road road-b"></i><i class="road road-c"></i><i class="road road-d"></i>
    <span class="district district-a">중구</span><span class="district district-b">남구</span><span class="district district-c">동구</span>
    <span class="ulsan-label">울산광역시</span>
    <small class="place-label place-a">태화강 국가정원</small><small class="place-label place-b">울산대공원</small><small class="place-label place-c">대왕암공원</small>
  </div>`;
}

function markers() {
  return memories.map((memory, index) => `<button class="memory-marker marker-${index + 1}${index === 0 ? ' is-selected' : ''}" type="button" data-memory="${index}" aria-label="${memory.place}, ${memory.title}"><span>${index === 0 ? '5' : ''}</span></button>`).join('');
}

function searchControl(compact = false) {
  return `<form class="floating-search${compact ? ' compact' : ''}" role="search" onsubmit="return false">
    ${icons.search}<input aria-label="장소 검색" placeholder="울산의 장소를 검색해보세요" /><kbd>⌘K</kbd>
  </form>`;
}

function mapControls() {
  return `<div class="zoom-stack" aria-label="지도 확대 축소"><button type="button" aria-label="지도 확대">${icons.plus}</button><button type="button" aria-label="지도 축소">${icons.minus}</button></div>
  <button class="locate-control" type="button" aria-label="현재 위치로 이동">${icons.locate}</button>`;
}

function filterPanel() {
  return `<section class="filter-popover" aria-hidden="true" aria-label="지도 조정">
    <div class="popover-head"><strong>지도 조정</strong><button type="button" class="close-filter" aria-label="지도 조정 닫기">${icons.close}</button></div>
    <label>지도 표현 <span class="segmented"><button class="active" type="button">간결</button><button type="button">상세</button></span></label>
    <p>보고 싶은 감정</p><div class="filter-chips"><button class="active" type="button">전체</button><button type="button">행복</button><button type="button">사랑</button><button type="button">그리움</button></div>
  </section>`;
}

function memoryCard(memory, index, featured = false) {
  return `<button class="memory-card${featured ? ' featured' : ''}${index === 0 ? ' is-selected' : ''}" type="button" data-memory="${index}">
    ${featured ? `<span class="memory-photo photo-${memory.tone}" aria-hidden="true"><i></i><em>울산 · 가상의 시연 사진</em></span>` : ''}
    <span class="card-overline">${memory.place}<i>${memory.emotion}</i></span>
    <strong>${memory.title}</strong><span class="card-copy">${memory.text}</span>
    <span class="card-bottom">${memory.date}<i>기억 읽기 ${icons.chevron}</i></span>
  </button>`;
}

function detailPanel() {
  return `<section class="memory-detail" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="detail-title">
    <button class="close-detail" type="button" aria-label="기억 상세 닫기">${icons.close}</button>
    <span class="detail-photo photo-rose" aria-hidden="true"><i></i><em>태화강 국가정원 산책로</em></span>
    <div class="detail-content"><span class="detail-place">${icons.pin}<span>태화강 국가정원 산책로</span></span><span class="detail-emotion">사랑</span>
    <h2 id="detail-title">오래된 친구와 다시 만난 곳</h2><p class="detail-date">2025년 9월 13일 · 익명의 기억</p>
    <p class="detail-copy">오랫동안 연락하지 못했던 친구와 다시 만나 밀린 이야기를 나눈 가상의 기억. 같은 길을 걷는 동안 시간이 천천히 되돌아오는 것 같았다.</p>
    <button type="button" class="detail-map-action">${icons.map} 지도에서 이 장소 보기</button></div>
  </section>`;
}

function pickerPanel() {
  return `<section class="location-picker" aria-hidden="true"><span class="picker-symbol">${icons.pin}</span><div><strong>기억이 머문 장소를 골라주세요</strong><p>지도 지점을 누르면 선택 마커가 이동해요.</p></div><button class="cancel-picker" type="button">취소</button><button class="confirm-picker" type="button">이 위치 선택</button></section>`;
}

function renderMaps() {
  return `<main class="prototype concept-maps">
    <section class="immersive-map" aria-label="울산 기억 지도">${mapArt()}${markers()}</section>
    <header class="maps-brand glass"><span class="brand-glyph">◌</span><strong>여운</strong><small>울산의 기억 지도</small></header>
    <nav class="maps-nav glass" aria-label="주요 메뉴"><button class="active" type="button">${icons.map}<span>지도</span></button><button type="button">${icons.book}<span>내 기억</span></button><button type="button">${icons.user}<span>로그인</span></button></nav>
    ${searchControl()}
    <button class="filter-trigger glass" type="button" aria-expanded="false">${icons.tune}<span>조정</span></button>${filterPanel()}
    ${mapControls()}
    <aside class="floating-sidebar glass" aria-label="주변 공개 기억"><div class="sidebar-handle"></div><div class="sidebar-head"><div><span class="micro-label">NEARBY MEMORIES</span><h1>울산에 머문 이야기</h1></div><span class="memory-count">11</span></div><p class="sidebar-intro">지도 위 한 장소에 포개진 서로 다른 순간을 발견해보세요.</p><div class="card-scroll">${memories.map((memory, index) => memoryCard(memory, index)).join('')}</div></aside>
    <div class="maps-actions"><button class="create-action" type="button">${icons.plus}<span>기억 남기기</span></button></div>
    <span class="map-caption glass"><i></i> 울산광역시 · 공개 기억 11</span>
    ${pickerPanel()}${detailPanel()}<span class="prototype-note">Concept A · Apple Maps Inspired</span>
  </main>`;
}

function renderJournal() {
  return `<main class="prototype concept-journal">
    <nav class="journal-rail" aria-label="주요 메뉴"><a class="journal-brand" href="index.html" aria-label="시안 비교로 이동"><span class="brand-glyph">◌</span><strong>여운</strong></a><div><button class="active" type="button">${icons.book}<span>발견</span></button><button type="button">${icons.map}<span>지도</span></button><button type="button">${icons.user}<span>내 기억</span></button></div><button class="journal-create create-action" type="button" aria-label="기억 남기기">${icons.plus}</button></nav>
    <section class="journal-feed" aria-label="울산 기억 저널"><header class="journal-heading"><span class="micro-label">ULSAN MEMORY JOURNAL · 2026</span><h1>오늘, 이 도시가<br />기억하는 장면들.</h1><p>장소를 먼저 찾기보다 한 사람의 장면에서 도시를 발견하는 편집형 탐색입니다.</p></header>
      <article class="hero-story">${memoryCard(memories[0], 0, true)}</article>
      <div class="journal-divider"><span>다음 이야기</span><i></i><b>02 — 04</b></div>
      <div class="journal-grid">${memoryCard(memories[1], 1, true)}${memoryCard(memories[2], 2, true)}</div>
    </section>
    <aside class="journal-map" aria-label="이야기의 위치">${mapArt()}${markers()}${searchControl(true)}<button class="filter-trigger glass" type="button" aria-expanded="false">${icons.tune}<span>필터</span></button>${filterPanel()}${mapControls()}<div class="map-story-caption glass"><span class="micro-label">CURRENT STORY</span><strong>태화강 국가정원 산책로</strong><small>5개의 기억이 가까이 머물러 있어요</small></div></aside>
    <button class="mobile-journal-create create-action" type="button">${icons.plus}<span>기억 남기기</span></button>
    ${pickerPanel()}${detailPanel()}<span class="prototype-note">Concept B · Editorial Memory Journal</span>
  </main>`;
}

function renderSpatial() {
  return `<main class="prototype concept-spatial">
    <section class="immersive-map spatial-map" aria-label="울산 공간 기억 지도">${mapArt()}${markers()}<div class="ambient-field one"></div><div class="ambient-field two"></div></section>
    <header class="spatial-brand glass"><span class="brand-glyph">◌</span><strong>여운</strong></header>
    <nav class="spatial-nav glass" aria-label="주요 메뉴"><button class="active" type="button" aria-label="지도">${icons.map}</button><button type="button" aria-label="내 기억">${icons.book}</button><button type="button" aria-label="로그인">${icons.user}</button></nav>
    <button class="spatial-search glass" type="button">${icons.search}<span>울산의 장소와 기억을 찾아보세요</span><kbd>⌘ K</kbd></button>
    <button class="filter-trigger spatial-filter glass" type="button" aria-expanded="false">${icons.tune}<span>조정</span></button>${filterPanel()}
    <div class="spatial-zoom">${mapControls()}</div>
    <div class="context-cluster glass"><span class="cluster-orbit"><i></i><i></i><i></i></span><div><span class="micro-label">TAEHWA RIVER · 5 MEMORIES</span><strong>한 장소가 다섯 개의 장면이 되는 순간</strong></div><button type="button" class="cluster-next">${icons.chevron}</button></div>
    <section class="spatial-dock glass" aria-label="선택한 기억"><span class="dock-photo photo-rose" aria-hidden="true"><i></i></span><div><span class="dock-meta">태화강 국가정원 산책로 · 사랑</span><strong>오래된 친구와 다시 만난 곳</strong><p>오랫동안 연락하지 못했던 친구와 다시 만나 밀린 이야기를 나눈 가상의 기억.</p></div><button class="read-selected" type="button">기억 열기 ${icons.chevron}</button></section>
    <div class="spatial-actions"><button class="create-action" type="button">${icons.plus}<span>기억 남기기</span></button><button class="locate-control glass" type="button" aria-label="현재 위치로 이동">${icons.locate}</button></div>
    ${pickerPanel()}${detailPanel()}<span class="prototype-note">Concept C · Spatial Memory Experience</span>
  </main>`;
}

const concept = document.body.dataset.concept;
const root = document.querySelector('#spatial-prototype');
if (concept === 'maps') root.innerHTML = renderMaps();
if (concept === 'journal') root.innerHTML = renderJournal();
if (concept === 'spatial') root.innerHTML = renderSpatial();

const detail = document.querySelector('.memory-detail');
function selectMemory(index) {
  const memory = memories[index] || memories[0];
  document.querySelectorAll('[data-memory], .memory-marker').forEach((element) => element.classList.toggle('is-selected', Number(element.dataset.memory) === index));
  document.querySelectorAll('.detail-place span').forEach((element) => { element.textContent = memory.place; });
  const title = document.querySelector('#detail-title'); if (title) title.textContent = memory.title;
  const date = document.querySelector('.detail-date'); if (date) date.textContent = `${memory.date} · 익명의 기억`;
  const copy = document.querySelector('.detail-copy'); if (copy) copy.textContent = memory.text;
  const emotion = document.querySelector('.detail-emotion'); if (emotion) emotion.textContent = memory.emotion;
  if (concept === 'spatial') {
    document.querySelector('.spatial-dock .dock-meta').textContent = `${memory.place} · ${memory.emotion}`;
    document.querySelector('.spatial-dock strong').textContent = memory.title;
    document.querySelector('.spatial-dock p').textContent = memory.text;
  } else {
    detail.classList.add('is-open'); detail.setAttribute('aria-hidden', 'false');
  }
}

document.querySelectorAll('[data-memory]').forEach((element) => element.addEventListener('click', () => selectMemory(Number(element.dataset.memory))));
document.querySelector('.read-selected')?.addEventListener('click', () => { detail.classList.add('is-open'); detail.setAttribute('aria-hidden', 'false'); });
document.querySelector('.cluster-next')?.addEventListener('click', () => selectMemory(1));
document.querySelector('.close-detail')?.addEventListener('click', () => { detail.classList.remove('is-open'); detail.setAttribute('aria-hidden', 'true'); });

const filterTrigger = document.querySelector('.filter-trigger');
const filterPopover = document.querySelector('.filter-popover');
filterTrigger?.addEventListener('click', () => {
  const open = filterPopover.classList.toggle('is-open');
  filterTrigger.setAttribute('aria-expanded', String(open)); filterPopover.setAttribute('aria-hidden', String(!open));
});
document.querySelector('.close-filter')?.addEventListener('click', () => filterTrigger.click());
document.querySelectorAll('.segmented button, .filter-chips button').forEach((button) => button.addEventListener('click', () => {
  button.parentElement.querySelectorAll('button').forEach((item) => item.classList.remove('active')); button.classList.add('active');
}));

const picker = document.querySelector('.location-picker');
document.querySelectorAll('.create-action').forEach((button) => button.addEventListener('click', () => { picker.classList.add('is-open'); picker.setAttribute('aria-hidden', 'false'); }));
document.querySelector('.cancel-picker')?.addEventListener('click', () => { picker.classList.remove('is-open'); picker.setAttribute('aria-hidden', 'true'); });
document.querySelector('.confirm-picker')?.addEventListener('click', () => { picker.classList.remove('is-open'); picker.setAttribute('aria-hidden', 'true'); });

document.querySelectorAll('.zoom-stack button').forEach((button) => button.addEventListener('click', () => button.animate([{ transform: 'scale(.88)' }, { transform: 'scale(1)' }], { duration: 180 })));
document.querySelectorAll('.locate-control').forEach((button) => button.addEventListener('click', () => button.classList.toggle('is-locating')));
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  detail?.classList.remove('is-open'); picker?.classList.remove('is-open'); filterPopover?.classList.remove('is-open');
});
