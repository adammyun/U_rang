const directions = {
  archive: {
    code: 'A',
    name: 'Quiet Archive',
    korean: '여백의 기록',
    eyebrow: 'A PLACE, MANY STORIES',
    headline: '같은 장소,\n서로 다른 이야기.',
    summary: '익숙한 풍경에 머문 마음을 천천히 펼쳐보세요.',
  },
  atlas: {
    code: 'B',
    name: 'Civic Atlas',
    korean: '명료한 도시 아틀라스',
    eyebrow: 'ULSAN · MEMORY INDEX',
    headline: '장소를 찾고,\n기억을 발견하세요.',
    summary: '현재 지도 안의 공개 기억을 빠르고 명료하게 탐색합니다.',
  },
  afterglow: {
    code: 'C',
    name: 'Afterglow Layers',
    korean: '잔광의 레이어',
    eyebrow: 'TRACES LEFT IN THE CITY',
    headline: '도시에 남은\n마음의 잔광.',
    summary: '서로 다른 순간이 한 장소에서 빛나는 장면을 만나보세요.',
  },
};

const theme = document.body.dataset.theme || 'archive';
const direction = directions[theme];
const app = document.querySelector('#prototype-app');

const icon = (name) => {
  const paths = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    sliders: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M6 14v6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    locate: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
    pin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    arrow: '<path d="m9 18 6-6-6-6"/>',
    back: '<path d="m15 18-6-6 6-6"/>',
    layers: '<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/>',
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;
};

const memories = [
  {
    place: '성남동 문화의거리',
    title: '골목의 작은 불빛',
    excerpt: '가게 불빛이 하나씩 켜지던 저녁, 잠시 걸음을 늦췄던 가상의 기억.',
    date: '날짜를 적지 않은 기억',
    emotion: '의미 있는 순간',
    tone: 'meaningful',
  },
  {
    place: '울산대공원',
    title: '햇살이 따뜻했던 공원 벤치',
    excerpt: '새 학기를 앞두고 작은 계획을 적어 보았던 가상의 오후.',
    date: '2026년 3월 7일',
    emotion: '행복',
    tone: 'happy',
  },
  {
    place: '태화강 국가정원 산책로',
    title: '오래된 친구와 다시 만난 곳',
    excerpt: '밀린 이야기를 나누며 강바람을 맞았던 가상의 기억.',
    date: '2025년 9월 13일',
    emotion: '사랑',
    tone: 'love',
  },
];

const memoryCards = memories.map((memory, index) => `
  <button class="memory-card ${index === 0 ? 'is-selected' : ''}" type="button" data-memory="${index}">
    <span class="card-index">0${index + 1}</span>
    <span class="card-place">${icon('pin')}${memory.place}</span>
    <span class="emotion ${memory.tone}"><i></i>${memory.emotion}</span>
    <strong>${memory.title}</strong>
    <span class="card-excerpt">${memory.excerpt}</span>
    <span class="card-meta"><span>${memory.date}</span><span>익명의 기억 ${icon('arrow')}</span></span>
  </button>
`).join('');

app.innerHTML = `
  <a class="skip-link" href="#stories">기억 목록으로 건너뛰기</a>
  <header class="prototype-header">
    <a class="prototype-brand" href="#" aria-label="여운 홈">
      <span class="brand-orbit"><i></i></span>
      <strong>여운</strong>
      <small>기억이 머무는 지도</small>
    </a>
    <span class="direction-sign"><b>${direction.code}</b>${direction.name}</span>
    <nav aria-label="주요 메뉴">
      <a class="active" href="#map">지도</a>
      <a href="#stories">내 기억</a>
      <button type="button">로그인</button>
    </nav>
  </header>

  <main class="prototype-shell">
    <aside class="story-rail" id="stories" aria-label="주변의 공개 기억">
      <div class="rail-intro">
        <span class="eyebrow">${direction.eyebrow}</span>
        <h1>${direction.headline.replace('\n', '<br>')}</h1>
        <p>${direction.summary}</p>
      </div>
      <div class="rail-heading">
        <span>이 근처에 남겨진 기억</span>
        <b>11</b>
        <button type="button" class="sort-button">최신순⌄</button>
      </div>
      <div class="memory-stack">${memoryCards}</div>
    </aside>

    <section class="map-stage" id="map" aria-label="울산 기억 지도 디자인 시안">
      <div class="map-art" aria-hidden="true">
        <span class="river river-one"></span>
        <span class="river river-two"></span>
        <span class="road road-one"></span>
        <span class="road road-two"></span>
        <span class="road road-three"></span>
        <span class="district d1">중구</span>
        <span class="district d2">남구</span>
        <span class="district d3">동구</span>
        <span class="district d4">울산광역시</span>
        <span class="place-label p1">태화강 국가정원</span>
        <span class="place-label p2">울산대공원</span>
        <span class="place-label p3">대왕암공원</span>
      </div>

      <form class="search-control" role="search" onsubmit="return false">
        ${icon('search')}
        <input aria-label="장소 검색" placeholder="울산의 장소를 검색해보세요" />
        <kbd>⌘ K</kbd>
      </form>

      <button class="adjust-control" type="button" aria-expanded="false">
        ${icon('sliders')}<span>지도 조정</span>
      </button>

      <section class="adjust-panel" aria-label="지도 조정" aria-hidden="true">
        <div><strong>지도 조정</strong><button type="button" class="adjust-close" aria-label="지도 조정 닫기">${icon('close')}</button></div>
        <p>표현 방식</p>
        <div class="segmented"><button class="active" type="button">간결</button><button type="button">상세</button></div>
        <p>감정</p>
        <div class="filter-pills"><button class="active" type="button">전체</button><button type="button">행복</button><button type="button">그리움</button></div>
      </section>

      <div class="location-chip"><i></i><span>울산광역시</span><small>공개 기억 11</small></div>

      <div class="zoom-controls" aria-label="지도 확대 축소">
        <button type="button" aria-label="지도 확대">${icon('plus')}</button>
        <output>11.4</output>
        <button type="button" aria-label="지도 축소">${icon('minus')}</button>
      </div>

      <button class="marker marker-one" type="button" data-memory="0" aria-label="성남동 문화의거리의 기억 5개"><span>5</span></button>
      <button class="marker marker-two" type="button" data-memory="1" aria-label="울산대공원의 기억 2개"><span>2</span></button>
      <button class="marker marker-three" type="button" data-memory="2" aria-label="태화강 국가정원의 기억"><span></span></button>
      <button class="marker marker-four" type="button" data-memory="2" aria-label="대왕암공원의 기억"><span></span></button>
      <span class="current-location" aria-label="현재 위치"></span>

      <div class="map-status"><i></i><span>지도를 누르거나 길게 눌러 위치를 선택하세요</span></div>

      <div class="map-actions">
        <button class="create-button" type="button">${icon('plus')}<span>기억 남기기</span></button>
        <button class="locate-button" type="button" aria-label="현재 위치로 이동">${icon('locate')}</button>
      </div>

      <div class="location-picker" aria-hidden="true">
        <span>${icon('pin')}<b>기억이 머문 장소를 골라주세요</b></span>
        <small>지도를 눌러 선택 마커를 옮길 수 있어요.</small>
        <div><button type="button" class="cancel-pick">취소</button><button type="button" class="confirm-pick">이 위치 선택</button></div>
      </div>

      <span class="map-attribution">Map visual prototype · © OpenStreetMap contributors</span>
    </section>
  </main>

  <section class="detail-panel" role="dialog" aria-modal="true" aria-labelledby="detail-title" aria-hidden="true">
    <div class="detail-handle"></div>
    <div class="detail-topline">
      <button class="detail-back" type="button">${icon('back')}<span>장소의 기억</span></button>
      <button class="detail-close" type="button" aria-label="기억 상세 닫기">${icon('close')}</button>
    </div>
    <span class="detail-place">${icon('pin')}<span>성남동 문화의거리</span></span>
    <span class="detail-emotion"><i></i>의미 있는 순간</span>
    <h2 id="detail-title">골목의 작은 불빛</h2>
    <p class="detail-date">날짜를 적지 않은 기억 · 익명</p>
    <div class="detail-image"><span>빛이 켜지는 골목의 저녁</span></div>
    <p class="detail-copy">성남동 골목을 걷다 작은 가게들의 불빛이 하나둘 켜지는 모습을 바라보았다. 평범한 길이었지만 그날은 이상하게 오래 머물고 싶었다. 이 시안은 긴 기억도 편안하게 읽히는 본문 폭과 행간을 보여 준다.</p>
    <button class="detail-map-button" type="button">${icon('layers')}지도에서 이 장소 보기</button>
  </section>
`;

const detail = document.querySelector('.detail-panel');
const detailClose = document.querySelector('.detail-close');
const adjustButton = document.querySelector('.adjust-control');
const adjustPanel = document.querySelector('.adjust-panel');
const picker = document.querySelector('.location-picker');
const createButton = document.querySelector('.create-button');
const currentLocation = document.querySelector('.current-location');

function openDetail(index = 0) {
  const memory = memories[index] || memories[0];
  document.querySelector('.detail-place span').textContent = memory.place;
  document.querySelector('#detail-title').textContent = memory.title;
  document.querySelector('.detail-date').textContent = `${memory.date} · 익명`;
  document.querySelector('.detail-emotion').lastChild.textContent = memory.emotion;
  document.querySelectorAll('[data-memory]').forEach((element) => {
    element.classList.toggle('is-selected', Number(element.dataset.memory) === index);
  });
  detail.classList.add('is-open');
  detail.setAttribute('aria-hidden', 'false');
  document.body.classList.add('detail-open');
  detailClose.focus();
}

function closeDetail() {
  detail.classList.remove('is-open');
  detail.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('detail-open');
}

document.querySelectorAll('[data-memory]').forEach((element) => {
  element.addEventListener('click', () => openDetail(Number(element.dataset.memory)));
});

detailClose.addEventListener('click', closeDetail);
document.querySelector('.detail-back').addEventListener('click', closeDetail);

adjustButton.addEventListener('click', () => {
  const open = adjustPanel.classList.toggle('is-open');
  adjustButton.setAttribute('aria-expanded', String(open));
  adjustPanel.setAttribute('aria-hidden', String(!open));
});
document.querySelector('.adjust-close').addEventListener('click', () => adjustButton.click());

document.querySelectorAll('.segmented button, .filter-pills button').forEach((button) => {
  button.addEventListener('click', () => {
    button.parentElement.querySelectorAll('button').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
  });
});

createButton.addEventListener('click', () => {
  picker.classList.add('is-open');
  picker.setAttribute('aria-hidden', 'false');
  document.body.classList.add('is-picking');
  createButton.querySelector('span').textContent = '장소 선택 중';
});

function closePicker() {
  picker.classList.remove('is-open');
  picker.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('is-picking');
  createButton.querySelector('span').textContent = '기억 남기기';
}

document.querySelector('.cancel-pick').addEventListener('click', closePicker);
document.querySelector('.confirm-pick').addEventListener('click', closePicker);

document.querySelector('.locate-button').addEventListener('click', () => {
  currentLocation.classList.toggle('is-visible');
});

document.querySelectorAll('.zoom-controls button').forEach((button, index) => {
  button.addEventListener('click', () => {
    const output = document.querySelector('.zoom-controls output');
    const value = Number(output.textContent) + (index === 0 ? 0.5 : -0.5);
    output.textContent = Math.max(9, Math.min(16, value)).toFixed(1);
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (detail.classList.contains('is-open')) closeDetail();
    else if (adjustPanel.classList.contains('is-open')) adjustButton.click();
    else closePicker();
  }
});
