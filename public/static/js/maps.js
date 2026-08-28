/* =====================================================================
   EV MAPS — charging stations across Cambodia.
   Tile layers: Google (roadmap + labels), Google Satellite, OpenStreetMap,
   CARTO Voyager. Station data comes from the evskh project via /api/stations
   (server proxy) with a bundled offline snapshot as fallback.
   Leaflet is loaded lazily from a CDN — the map needs internet anyway.
   ===================================================================== */

const PP = { lat: 11.5564, lng: 104.9282 };

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, m =>
  ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));

/* ---------- availability color + label (mirrors evskh) ---------- */
function avail(s) {
  if (s.status === 'closed') return { c:'#9ca3af', t:'Offline' };
  const a = Number(s.available_connectors), tot = Number(s.total_connectors);
  if (Number.isFinite(a) && Number.isFinite(tot) && tot > 0) {
    const r = a / tot;
    if (r === 0)  return { c:'#ef4444', t:`${a}/${tot} free` };
    if (r < 0.5)  return { c:'#f59e0b', t:`${a}/${tot} free` };
    return { c:'#22c55e', t:`${a}/${tot} free` };
  }
  if (s.status === 'construction') return { c:'#f59e0b', t:'In construction' };
  if (s.status === 'planned')      return { c:'#93c5fd', t:'Planned' };
  return { c:'#22c55e', t:'Live' };
}

/* ---------- Leaflet lazy loader ---------- */
const CSS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const JS_URL  = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

function loadCss(url) {
  return new Promise((res, rej) => {
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = url;
    l.onload = () => res(); l.onerror = rej;
    document.head.appendChild(l);
  });
}
function loadJs(url) {
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = url; s.async = true;
    s.onload = () => res(); s.onerror = rej;
    document.head.appendChild(s);
  });
}

/* ---------- stations fetch: live proxy, snapshot fallback ---------- */
async function loadStations() {
  try {
    const r = await fetch('/api/stations');
    if (r.ok) {
      const d = await r.json();
      if (Array.isArray(d.stations) && d.stations.length) return d.stations;
    }
  } catch (e) { /* fall through */ }
  const r2 = await fetch('/static/data/stations.json');
  const d2 = await r2.json();
  return d2.stations || [];
}

/* ---------- main ---------- */
let started = false;

export async function initMaps() {
  if (started) return;
  started = true;

  const host = document.getElementById('mapHost');
  const strip = document.getElementById('mapStrip');
  const layerBar = document.getElementById('mapLayers');
  if (!host || !strip) return;

  try {
    await Promise.all([loadCss(CSS_URL), loadJs(JS_URL)]);
  } catch (e) {
    console.error('Leaflet CDN failed:', e);
    strip.innerHTML = '<p class="hint center" style="padding:14px">⚠ Map engine failed to load — check your internet connection.</p>';
    started = false;
    return;
  }
  if (typeof window.L === 'undefined') { started = false; return; }
  const L = window.L;

  /* ---------- tile layers ---------- */
  const LAYERS = {
    google:    L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', { subdomains:'0123', maxZoom:20, attribution:'Google' }),
    satellite: L.tileLayer('https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', { subdomains:'0123', maxZoom:20, attribution:'Google' }),
    osm:       L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',   { maxZoom:19, attribution:'© OpenStreetMap' }),
    carto:     L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { subdomains:'abcd', maxZoom:20, attribution:'© CARTO' })
  };

  const map = L.map(host, {
    center: PP,
    zoom: 7,
    zoomControl: false,
    attributionControl: true
  });
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  LAYERS.google.addTo(map);

  /* ---------- layer switcher ---------- */
  layerBar.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-map-layer]');
    if (!btn) return;
    const key = btn.dataset.mapLayer;
    if (!LAYERS[key]) return;
    for (const [k, tl] of Object.entries(LAYERS)) { if (map.hasLayer(tl)) map.removeLayer(tl); }
    LAYERS[key].addTo(map);
    layerBar.querySelectorAll('[data-map-layer]').forEach(b => b.classList.toggle('sel', b.dataset.mapLayer === key));
  });

  /* ---------- geolocate ---------- */
  let meMarker = null;
  const geoBtn = L.control({ position: 'topright' });
  geoBtn.onAdd = () => {
    const d = document.createElement('button');
    d.className = 'map-geo';
    d.innerHTML = '⛳';
    d.title = 'My location';
    d.onclick = () => {
      if (!navigator.geolocation) return;
      strip.innerHTML = '<p class="hint center" style="padding:14px">Locating you…</p>';
      navigator.geolocation.getCurrentPosition((pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        map.setView(p, 13);
        if (meMarker) map.removeLayer(meMarker);
        meMarker = L.marker(p, { icon: L.divIcon({ className:'me-dot', html:'<div></div>', iconSize:[18,18], iconAnchor:[9,9] }) }).addTo(map);
        strip.innerHTML = '<p class="hint center" style="padding:14px">📍 Showing stations near you</p>';
        renderList();
      }, () => { strip.innerHTML = '<p class="hint center" style="padding:14px">Could not get your location.</p>'; });
    };
    return d;
  };
  geoBtn.addTo(map);

  /* ---------- stations ---------- */
  let stations = [];
  const markers = L.layerGroup().addTo(map);

  try {
    stations = await loadStations();
  } catch (e) {
    console.error('Stations failed:', e);
    strip.innerHTML = '<p class="hint center" style="padding:14px">⚠ Could not load charging stations.</p>';
    return;
  }
  strip.innerHTML = `<p class="hint center" style="padding:14px">⚡ ${stations.length} charging stations in Cambodia</p>`;

  stations.forEach((s) => {
    const lat = Number(s.lat), lng = Number(s.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    const av = avail(s);
    const m = L.marker([lat, lng], {
      icon: L.divIcon({
        className: 'mpin-wrap',
        html: `<div class="mpin" style="background:${av.c}"><span>⚡</span></div>`,
        iconSize: [34, 34], iconAnchor: [17, 34], popupAnchor: [0, -34]
      })
    }).addTo(markers);
    m.bindPopup(popupHtml(s, lat, lng));
    m.on('click', () => setTimeout(() => m.openPopup(), 80));
  });

  /* ---------- popup content ---------- */
  function popupHtml(s, lat, lng) {
    const av = avail(s);
    const kw = s.max_kw ? ` · ${s.max_kw}kW` : '';
    const addr = s.address ? `<div class="mp-sub">${esc(s.address)}</div>` : '';
    return `
      <div class="mpop-in">
        <b>${esc(s.name)}</b>
        <div class="mp-sub">${esc(s.province || 'Cambodia')}${kw}</div>
        ${addr}
        <div class="mp-avail" style="color:${av.c}">● ${av.t}</div>
        <div class="mp-btns">
          <a target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}">🧭 Navigate</a>
          <a target="_blank" rel="noopener" href="https://evskh.vercel.app/station/${encodeURIComponent(s.id)}">ℹ Details</a>
        </div>
      </div>`;
  }

  /* ---------- nearest-stations list ---------- */
  function renderList() {
    if (!stations.length) return;
    const c = map.getCenter();
    const sorted = [...stations]
      .filter(s => Number.isFinite(Number(s.lat)) && Number.isFinite(Number(s.lng)))
      .map(s => ({ s, d: Math.hypot(Number(s.lat) - c.lat, Number(s.lng) - c.lng) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 10);
    strip.innerHTML = `
      <div class="map-strip-h">⚡ ${stations.length} stations · ${sorted.length} nearest</div>
      ${sorted.map(({ s }) => {
        const av = avail(s);
        const kw = s.max_kw ? ` · ${s.max_kw}kW` : '';
        return `<button class="mst" data-mid="${esc(s.id)}">
          <span class="mst-dot" style="background:${av.c}"></span>
          <span class="mst-b"><b>${esc(s.name)}</b><em>${esc(s.province || 'Cambodia')}${kw} · ${av.t}</em></span>
          <span class="mst-go">›</span>
        </button>`;
      }).join('')}`;
    strip.querySelectorAll('.mst').forEach((el) => {
      el.addEventListener('click', () => {
        const s = stations.find(x => x.id === el.dataset.mid);
        if (!s) return;
        const lat = Number(s.lat), lng = Number(s.lng);
        map.setView([lat, lng], Math.max(map.getZoom(), 13));
        setTimeout(() => markers.eachLayer((m) => {
          if (Math.abs(m.getLatLng().lat - lat) < 1e-6 && Math.abs(m.getLatLng().lng - lng) < 1e-6) m.openPopup();
        }), 120);
      });
    });
  }
  map.on('moveend', renderList);
  renderList();
}
