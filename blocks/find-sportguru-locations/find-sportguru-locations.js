// codegen:layout-pattern=store-locator
// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: 'Magazin SportGuru Cluj',
    address: 'Strada Ploiesti nr. 39-45',
    city: 'Cluj-Napoca',
    phone: '0374 027 028',
    hours: 'Luni-Vineri: 10:00-19:00, Sambata: 09:00-16:00',
    latitude: 46.77733,
    longitude: 23.59703,
    services: ['In-store shopping', 'Order pickup'],
    pickup_available: true,
    bike_service_available: false,
  },
  {
    name: 'Magazin SportGuru Brasov',
    address: 'Strada Zaharia Stancu nr. 1, galeria Street Coresi (in parcare)',
    city: 'Brasov',
    phone: '0374 800 300',
    hours: 'Luni-Vineri: 10:00-21:00, Sambata-Duminica: 10:00-20:00',
    latitude: 45.67167,
    longitude: 25.61628,
    services: ['In-store shopping', 'Order pickup'],
    pickup_available: true,
    bike_service_available: false,
  },
  {
    name: 'Magazin SportGuru Iasi',
    address: 'Palas Shopping Street - Strada Palat nr. 3C, Cladire E3',
    city: 'Iasi',
    phone: '0374 026 026',
    hours: 'Luni-Vineri: 10:00-22:00, Sambata: 10:00-18:00',
    latitude: 47.15532,
    longitude: 27.58617,
    services: ['In-store shopping', 'Order pickup'],
    pickup_available: true,
    bike_service_available: false,
  },
  {
    name: 'Magazin SportGuru Timisoara',
    address: 'Pta Consiliul Europei 2, Iulius Mall',
    city: 'Timisoara',
    phone: '0374 670 000',
    hours: 'Luni-Duminica: 10:00-22:00',
    latitude: 45.72114,
    longitude: 21.26165,
    services: ['In-store shopping', 'Order pickup'],
    pickup_available: true,
    bike_service_available: false,
  },
];

const ACCENT = '#8bc53f';
const MAX_STORES = 6;

// ── Map engine ─────────────────────────────────────────────────────────────
// Real tiles need these on the action's resource_meta.csp:
//   resourceDomains: https://unpkg.com, https://services.arcgisonline.com
//   connectDomains:  https://services.arcgisonline.com
// Nothing breaks without them — loadLeaflet() rejects and mountMap() renders
// the projected-pin fallback, which makes no network requests.
const MAP_LEAFLET_VERSION = '1.9.4';
const MAP_LEAFLET_CSS = 'https://unpkg.com/leaflet@' + MAP_LEAFLET_VERSION + '/dist/leaflet.css';
const MAP_LEAFLET_JS = 'https://unpkg.com/leaflet@' + MAP_LEAFLET_VERSION + '/dist/leaflet.js';

// Keyless Esri World Dark Gray Base — a generated widget has nowhere to keep a
// secret, so the tile source must be keyless (rules out CARTO/Stadia/MapTiler).
const MAP_TILE_URL = 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
const MAP_TILE_ATTRIB = 'Esri, HERE, Garmin, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const MAP_TILE_MAX_NATIVE_ZOOM = 16;
const MAP_TILE_MAX_ZOOM = 18;

let __mapLeafletPromise = null;

function loadLeaflet() {
  const cssLink = document.querySelector('link[data-leaflet="' + MAP_LEAFLET_VERSION + '"]');
  if (window.L && cssLink && cssLink.dataset.loaded === '1') {
    return Promise.resolve(window.L);
  }
  if (__mapLeafletPromise) return __mapLeafletPromise;

  const cssReady = new Promise(function (resolve) {
    const existing = document.querySelector('link[data-leaflet="' + MAP_LEAFLET_VERSION + '"]');
    if (existing) {
      if (existing.dataset.loaded === '1') resolve();
      else existing.addEventListener('load', function () { resolve(); }, { once: true });
      setTimeout(resolve, 1500);
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = MAP_LEAFLET_CSS;
    link.dataset.leaflet = MAP_LEAFLET_VERSION;
    link.addEventListener('load', function () { link.dataset.loaded = '1'; resolve(); }, { once: true });
    link.addEventListener('error', function () { resolve(); }, { once: true });
    document.head.appendChild(link);
    setTimeout(resolve, 1500);
  });

  const jsReady = new Promise(function (resolve, reject) {
    if (window.L) { resolve(window.L); return; }
    const script = document.createElement('script');
    script.src = MAP_LEAFLET_JS;
    script.async = true;
    script.onload = function () {
      if (window.L) resolve(window.L);
      else reject(new Error('Leaflet loaded but window.L is missing'));
    };
    script.onerror = function () { reject(new Error('Failed to load Leaflet')); };
    document.head.appendChild(script);
  });

  __mapLeafletPromise = Promise.all([jsReady, cssReady]).then(function (r) { return r[0]; });
  return __mapLeafletPromise;
}

function mapCoordsOf(item) {
  if (!item) return null;
  const num = function (v) {
    if (v === null || v === undefined || v === '') return null;
    const n = typeof v === 'number' ? v : parseFloat(String(v));
    return Number.isFinite(n) ? n : null;
  };
  const lat = num(item.latitude !== undefined ? item.latitude : item.lat);
  let lngRaw = item.longitude;
  if (lngRaw === undefined) lngRaw = item.lng;
  if (lngRaw === undefined) lngRaw = item.lon;
  const lng = num(lngRaw);
  if (lat === null || lng === null) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat: lat, lng: lng };
}

function mapPointsFrom(items) {
  const out = [];
  (items || []).forEach(function (item, index) {
    const c = mapCoordsOf(item);
    if (c) out.push({ item: item, index: index, lat: c.lat, lng: c.lng });
  });
  return out;
}

function mapProject(points, box) {
  const b = box || [14, 14, 72, 72];
  const lats = points.map(function (p) { return p.lat; });
  const lngs = points.map(function (p) { return p.lng; });
  const minLat = Math.min.apply(null, lats);
  const maxLat = Math.max.apply(null, lats);
  const minLng = Math.min.apply(null, lngs);
  const maxLng = Math.max.apply(null, lngs);
  const spanLat = maxLat - minLat;
  const spanLng = maxLng - minLng;
  return points.map(function (p) {
    const fx = spanLng > 0 ? (p.lng - minLng) / spanLng : 0.5;
    const fy = spanLat > 0 ? (maxLat - p.lat) / spanLat : 0.5;
    return { x: b[0] + fx * b[2], y: b[1] + fy * b[3] };
  });
}

function mapMakePin(point, ordinal, opts, asButton) {
  const pin = document.createElement(asButton ? 'button' : 'span');
  if (asButton) pin.type = 'button';
  const label = String(point.item[opts.labelField] || point.item.name || '').trim();
  point.label = label;
  if (opts.pinStyle === 'label' && label) {
    pin.className = 'find-sportguru-locations-map-label';
    pin.textContent = label;
  } else {
    pin.className = 'find-sportguru-locations-map-pin';
    if (opts.pinColor) pin.style.background = opts.pinColor;
    const num = document.createElement('span');
    num.className = 'find-sportguru-locations-map-pin-num';
    num.textContent = String(ordinal);
    pin.appendChild(num);
  }
  if (asButton) pin.setAttribute('aria-label', label || ('Location ' + ordinal));
  return pin;
}

function mapWhenWidthStable(el) {
  return new Promise(function (resolve) {
    let last = -1;
    let stable = 0;
    const started = Date.now();
    const tick = function () {
      const w = el.offsetWidth;
      if (w > 0 && w === last) stable += 1; else stable = 0;
      last = w;
      if ((w > 0 && stable >= 2) || Date.now() - started > 2000) { resolve(w); return; }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

function mapRenderFallback(container, points, onSelect, opts) {
  container.classList.add('is-fallback');
  const grid = document.createElement('div');
  grid.className = 'find-sportguru-locations-map-grid';
  container.appendChild(grid);

  const projected = mapProject(points, opts.fallbackBox);
  const pins = points.map(function (p, i) {
    const anchor = document.createElement('div');
    anchor.className = 'find-sportguru-locations-map-anchor';
    anchor.style.left = projected[i].x + '%';
    anchor.style.top = projected[i].y + '%';
    const pin = mapMakePin(p, i + 1, opts, true);
    anchor.appendChild(pin);
    pin.addEventListener('click', function () { onSelect(p.index); });
    container.appendChild(anchor);
    return pin;
  });

  return {
    setActive: function (index) {
      points.forEach(function (p, i) { pins[i].classList.toggle('is-active', p.index === index); });
    },
  };
}

function mapDynamicMaxZoom(bounds) {
  const lats = bounds.map(function (b) { return b[0]; });
  const lngs = bounds.map(function (b) { return b[1]; });
  const span = Math.max(
    Math.max.apply(null, lats) - Math.min.apply(null, lats),
    Math.max.apply(null, lngs) - Math.min.apply(null, lngs)
  );
  if (span > 8) return 6;
  if (span > 2) return 8;
  if (span > 0.3) return 10;
  return 11;
}

function mapRenderLeaflet(L, container, points, onSelect, opts) {
  const map = L.map(container, {
    scrollWheelZoom: false,
    zoomControl: opts.zoomControl !== false,
    attributionControl: true,
  });
  if (map.attributionControl) map.attributionControl.setPrefix('');

  const tiles = L.tileLayer(MAP_TILE_URL, {
    attribution: MAP_TILE_ATTRIB,
    detectRetina: false,
    maxNativeZoom: MAP_TILE_MAX_NATIVE_ZOOM,
    maxZoom: MAP_TILE_MAX_ZOOM,
    keepBuffer: 4,
    updateWhenIdle: false,
    updateWhenZooming: true,
  }).addTo(map);

  const bounds = points.map(function (p) { return [p.lat, p.lng]; });
  if (bounds.length === 1) {
    map.setView(bounds[0], opts.singleZoom || 11);
  } else {
    map.fitBounds(bounds, {
      paddingTopLeft: opts.fitPaddingTopLeft || [30, 30],
      paddingBottomRight: opts.fitPaddingBottomRight || [30, 30],
      maxZoom: opts.maxZoom || mapDynamicMaxZoom(bounds),
    });
  }

  points.forEach(function (p, i) {
    const marker = L.marker([p.lat, p.lng], {
      icon: L.divIcon({ className: 'find-sportguru-locations-map-marker', html: '', iconSize: null, iconAnchor: [0, 0] }),
      keyboard: true,
      riseOnHover: true,
      title: String(p.item[opts.labelField] || p.item.name || ''),
      alt: String(p.item[opts.labelField] || p.item.name || 'Location'),
    }).addTo(map);

    const pin = mapMakePin(p, i + 1, opts, false);
    p.marker = marker;
    p.pin = pin;

    const attach = function () {
      const host = marker.getElement();
      if (host) host.appendChild(pin);
    };
    marker.on('add', attach);
    attach();

    // Click only — hover must not select (panning under the pointer moves the
    // card the user was reaching for). riseOnHover only lifts z-index.
    marker.on('click', function () { onSelect(p.index); });
  });

  const refresh = function () {
    map.invalidateSize(false);
    tiles.redraw();
  };
  requestAnimationFrame(refresh);
  [80, 200, 400, 800, 1400].forEach(function (ms) { setTimeout(refresh, ms); });

  if (typeof ResizeObserver !== 'undefined') {
    let lastW = container.offsetWidth;
    let lastH = container.offsetHeight;
    const ro = new ResizeObserver(function () {
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      if (w === lastW && h === lastH) return;
      lastW = w;
      lastH = h;
      refresh();
    });
    ro.observe(container);
  }

  return {
    setActive: function (index, pan) {
      points.forEach(function (p) {
        const on = p.index === index;
        if (p.pin) p.pin.classList.toggle('is-active', on);
        if (p.marker && p.marker.setZIndexOffset) p.marker.setZIndexOffset(on ? 1000 : 0);
        if (on && pan) map.panTo([p.lat, p.lng], { animate: true });
      });
    },
    invalidate: refresh,
  };
}

function mountMap(container, points, onSelect, options) {
  if (!points || !points.length) return Promise.resolve(null);
  const opts = Object.assign({ pinStyle: 'number', labelField: 'name' }, options || {});

  const loading = document.createElement('div');
  loading.className = 'find-sportguru-locations-map-loading';
  loading.textContent = 'Loading map…';
  container.appendChild(loading);

  return Promise.all([loadLeaflet(), mapWhenWidthStable(container)])
    .then(function (r) {
      loading.remove();
      return mapRenderLeaflet(r[0], container, points, onSelect, opts);
    })
    .catch(function () {
      container.textContent = '';
      container.classList.remove('leaflet-container');
      return mapRenderFallback(container, points, onSelect, opts);
    });
}

// Format opening hours: schema allows either a flat string (`hours`) or a
// per-day object (`opening_hours`). Collapse the object to a readable line.
function formatHours(store) {
  if (store.hours) return String(store.hours);
  const oh = store.opening_hours;
  if (oh && typeof oh === 'object') {
    return Object.keys(oh).map(function (day) { return day + ': ' + oh[day]; }).join(', ');
  }
  return '';
}

async function decorate(block, bridge) {
  let allStores = null;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext && bridge.hostContext.preview === true;
    if (isPreview) {
      allStores = SAMPLE_DATA;
    } else {
      try {
        const _result = await bridge.toolResult;
        // structuredContent.locations — derived from action name "find_sportguru_locations" (bare array outputSchema rule)
        const sc = (_result && _result.structuredContent) || {};
        allStores = sc.locations || (Array.isArray(sc) ? sc : null);
      } catch (e) { allStores = null; }
    }
  } else {
    allStores = SAMPLE_DATA;
  }

  function renderNoResults() {
    const empty = document.createElement('div');
    empty.className = 'find-sportguru-locations-empty';

    const formCard = document.createElement('div');
    formCard.className = 'find-sportguru-locations-form-card';

    const pin = document.createElement('span');
    pin.className = 'find-sportguru-locations-pin';
    pin.textContent = '◎';
    formCard.appendChild(pin);

    const heading = document.createElement('h3');
    heading.className = 'find-sportguru-locations-heading';
    heading.textContent = 'No stores found';
    formCard.appendChild(heading);

    const hint = document.createElement('p');
    hint.className = 'find-sportguru-locations-hint';
    hint.textContent = 'Try another location.';
    formCard.appendChild(hint);

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'find-sportguru-locations-input';
    input.placeholder = 'Enter ZIP code…';
    input.setAttribute('aria-label', 'ZIP code or city');
    formCard.appendChild(input);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'find-sportguru-locations-search-btn';
    btn.textContent = 'Find Nearby';
    formCard.appendChild(btn);

    const submit = function () {
      const value = input.value.trim();
      if (!value) { input.focus(); return; }
      if (bridge && bridge.sendMessage) bridge.sendMessage('Find SportGuru stores near ' + value);
    };
    btn.addEventListener('click', submit);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') submit();
    });

    empty.appendChild(formCard);
    block.appendChild(empty);
  }

  function renderResults(stores) {
    if (!stores || !stores.length) { renderNoResults(); return; }
    const shown = stores.slice(0, MAX_STORES);
    const points = mapPointsFrom(shown);

    const layout = document.createElement('div');
    layout.className = 'find-sportguru-locations-layout';

    const mapEl = document.createElement('div');
    mapEl.className = 'find-sportguru-locations-map';
    mapEl.setAttribute('role', 'application');
    mapEl.setAttribute('aria-label', 'Map of ' + points.length + ' location' + (points.length === 1 ? '' : 's'));

    const side = document.createElement('div');
    side.className = 'find-sportguru-locations-side';

    const rowWrap = document.createElement('div');
    rowWrap.className = 'find-sportguru-locations-row-wrap';

    const row = document.createElement('div');
    row.className = 'find-sportguru-locations-row';

    const cards = shown.map(function (store, i) {
      const card = document.createElement('div');
      card.className = 'find-sportguru-locations-store-card';
      card.tabIndex = 0;

      const head = document.createElement('div');
      head.className = 'find-sportguru-locations-store-head';

      const pinDiv = document.createElement('div');
      pinDiv.className = 'find-sportguru-locations-store-pin';
      const pinOrdinal = points.findIndex(function (p) { return p.index === i; });
      pinDiv.textContent = pinOrdinal >= 0 ? String(pinOrdinal + 1) : '◎';
      head.appendChild(pinDiv);

      const name = document.createElement('div');
      name.className = 'find-sportguru-locations-store-name';
      name.textContent = store.name || '';
      head.appendChild(name);
      card.appendChild(head);

      if (store.address) {
        const addr = document.createElement('div');
        addr.className = 'find-sportguru-locations-store-addr';
        addr.textContent = store.city ? (store.address + ', ' + store.city) : store.address;
        card.appendChild(addr);
      }

      if (store.distance_km !== undefined && store.distance_km !== null) {
        const dist = document.createElement('div');
        dist.className = 'find-sportguru-locations-store-dist';
        dist.textContent = store.distance_km + ' km away';
        card.appendChild(dist);
      }

      // Badges for pickup and bike service.
      const badges = document.createElement('div');
      badges.className = 'find-sportguru-locations-badges';
      if (store.pickup_available) {
        const b = document.createElement('span');
        b.className = 'find-sportguru-locations-badge';
        b.textContent = 'Store pickup';
        badges.appendChild(b);
      }
      const bikeBadge = document.createElement('span');
      if (store.bike_service_available) {
        bikeBadge.className = 'find-sportguru-locations-badge';
        bikeBadge.textContent = 'Bike service';
      } else {
        bikeBadge.className = 'find-sportguru-locations-badge is-muted';
        bikeBadge.textContent = 'No bike service';
      }
      badges.appendChild(bikeBadge);
      card.appendChild(badges);

      if (store.phone) {
        const phone = document.createElement('div');
        phone.className = 'find-sportguru-locations-store-phone';
        phone.textContent = store.phone;
        card.appendChild(phone);
      }

      const hoursText = formatHours(store);
      if (hoursText) {
        const hours = document.createElement('div');
        hours.className = 'find-sportguru-locations-store-hours';
        hours.textContent = hoursText;
        card.appendChild(hours);
      }

      const ctaRow = document.createElement('div');
      ctaRow.className = 'find-sportguru-locations-cta-row';

      const directions = document.createElement('button');
      directions.type = 'button';
      directions.className = 'find-sportguru-locations-cta';
      directions.textContent = 'Get Directions';
      directions.addEventListener('click', function (e) {
        e.stopPropagation();
        if (!bridge) return;
        if (store.directions_url) {
          bridge.openLink(store.directions_url);
        } else {
          bridge.sendMessage('Get directions to ' + store.name);
        }
      });
      ctaRow.appendChild(directions);

      if (store.phone) {
        const call = document.createElement('button');
        call.type = 'button';
        call.className = 'find-sportguru-locations-cta is-secondary';
        call.textContent = 'Call Store';
        call.addEventListener('click', function (e) {
          e.stopPropagation();
          if (bridge) bridge.sendMessage('Call ' + store.name + ' at ' + store.phone);
        });
        ctaRow.appendChild(call);
      }

      if (store.bike_service_available) {
        const bike = document.createElement('button');
        bike.type = 'button';
        bike.className = 'find-sportguru-locations-cta is-secondary';
        bike.textContent = 'Contact About Bike Service';
        bike.addEventListener('click', function (e) {
          e.stopPropagation();
          if (bridge) bridge.sendMessage('Ask about bike servicing at ' + store.name);
        });
        ctaRow.appendChild(bike);
      }

      card.appendChild(ctaRow);

      card.addEventListener('click', function () { select(i); });
      card.addEventListener('focusin', function () { select(i); });
      row.appendChild(card);
      return card;
    });

    rowWrap.appendChild(row);

    const fade = document.createElement('div');
    fade.className = 'find-sportguru-locations-fade';
    fade.style.background = 'linear-gradient(to right, transparent, #ffffffcc)';
    rowWrap.appendChild(fade);
    side.appendChild(rowWrap);

    if (points.length) layout.appendChild(mapEl);
    layout.appendChild(side);
    block.appendChild(layout);

    let mapApi = null;
    let activeIdx = -1;

    function select(index) {
      if (index === activeIdx) return;
      activeIdx = index;
      cards.forEach(function (c, i) { c.classList.toggle('is-selected', i === index); });
      if (mapApi) mapApi.setActive(index, true);
      const card = cards[index];
      if (card) row.scrollLeft = Math.max(0, card.offsetLeft - row.offsetLeft - 4);
    }

    if (points.length) {
      mountMap(mapEl, points, select, {
        pinStyle: 'number',
        pinColor: ACCENT,
        labelField: 'name',
        maxZoom: 13,
        singleZoom: 13,
      }).then(function (api) {
        mapApi = api;
        if (api && activeIdx >= 0) api.setActive(activeIdx, false);
      });
    }

    if (cards.length) select(0);
  }

  renderResults(allStores);

  if (bridge) {
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    let resizeTimer;
    const ro = new ResizeObserver(function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { bridge.reportSize(block.offsetWidth, block.offsetHeight); }, 150);
    });
    ro.observe(block);
  }
}

export default decorate;
