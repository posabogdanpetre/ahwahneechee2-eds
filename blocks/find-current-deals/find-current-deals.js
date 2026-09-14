// codegen:layout-pattern=deals-carousel

// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  { name: 'Ceas Garmin Fenix 9 PRO AMOLED inReach - 47 mm', image_url: 'https://media.sportguru.ro/media/catalog/product/0/1/010-04336-01-112_1.jpg', price: 'De la 6.299,00 Lei', category: 'Ceasuri & GPS-uri', brand: 'Garmin', sport: 'Multisport', gender: 'Unisex', availability: 'In stock', product_url: 'https://www.sportguru.ro/ceas-garmin-fenix-9-pro-amoled-inreach-47-mm', product_id: 'ceas-garmin-fenix-9-pro-amoled-inreach-47-mm' },
  { name: 'Pantofi alergare dama Asics Gel-Kayano 32 Sunny Sizzle SS 2026', image_url: 'https://media.sportguru.ro/media/catalog/product/1/0/1012c045._8_i9.jpg', price: 'De la 714,00 Lei', original_price: '1.020,00 Lei', category: 'Pantofi alergare', brand: 'Asics', sport: 'Alergare', gender: 'Femei', size: '37,37.5,38,39,39.5,40,40.5', availability: 'In stock', product_url: 'https://www.sportguru.ro/sporturi/alergare/pantofi-alergare/pantofi-alergare-asfalt/pantofi-alergare-dama-asics-gel-kayano-32-sunny-sizzle-ss-2026', product_id: 'pantofi-alergare-dama-asics-gel-kayano-32-sunny-sizzle-ss-2026' },
  { name: 'Pantofi alergare dama ON Cloudmonster 3 SS 2026', image_url: 'https://media.sportguru.ro/media/catalog/product/0/0/000000_on-cloudmonster-3-wmns_limelight-seedling_3wg10034859_img0-1000x1000_1.jpg', price: 'De la 765,00 Lei', original_price: '1.020,00 Lei', category: 'Pantofi alergare', brand: 'ON', sport: 'Alergare', gender: 'Femei', availability: 'In stock', product_url: 'https://www.sportguru.ro/sporturi/alergare/pantofi-alergare/pantofi-alergare-asfalt/pantofi-alergare-dama-on-cloudmonster-3-ss-2026', product_id: 'pantofi-alergare-dama-on-cloudmonster-3-ss-2026' },
  { name: 'Pantofi alergare barbati Hoka Skyward X 2', image_url: 'https://media.sportguru.ro/media/catalog/product/1/1/1171925-gtcb_1_1_2.jpg', price: 'De la 964,00 Lei', original_price: '1.205,00 Lei', category: 'Pantofi alergare', brand: 'Hoka', sport: 'Alergare', gender: 'Barbati', availability: 'In stock', product_url: 'https://www.sportguru.ro/sporturi/alergare/pantofi-alergare/pantofi-alergare-asfalt/pantofi-alergare-barbati-hoka-skyward-x-2', product_id: 'pantofi-alergare-barbati-hoka-skyward-x-2' },
  { name: 'Pantofi alergare barbati Adidas Supernova Rise 3 SS 2026', image_url: 'https://media.sportguru.ro/media/catalog/product/j/p/jp8689_b2b012_plp_1.jpg', price: 'De la 570,00 Lei', original_price: '750,00 Lei', category: 'Pantofi alergare', brand: 'Adidas', sport: 'Alergare', gender: 'Barbati', availability: 'In stock', product_url: 'https://www.sportguru.ro/sporturi/alergare/pantofi-alergare/pantofi-alergare-asfalt/pantofi-alergare-barbati-adidas-supernova-rise-3-ss-2026', product_id: 'pantofi-alergare-barbati-adidas-supernova-rise-3-ss-2026' },
  { name: 'Bicicleta pliabila Dahon K9 16"', image_url: 'https://media.sportguru.ro/media/catalog/product/5/_/5_141bf4e4-76cd-451c-befd-19075bba9605_1.jpg', price: 'De la 5.295,00 Lei', category: 'Biciclete', brand: 'Dahon', sport: 'Ciclism', gender: 'Unisex', availability: 'In stock', product_url: 'https://www.sportguru.ro/sporturi/ciclism/biciclete/biciclete-pentru-oras-si-imprejurimi/bicicleta-pliabila-dahon-k9-16', product_id: 'bicicleta-pliabila-dahon-k9-16' },
  { name: 'Ceas Garmin Forerunner 970 AMOLED', image_url: 'https://media.sportguru.ro/media/catalog/product/i/m/imageedit_25_83188919822.jpg', price: 'De la 3.399,00 Lei', original_price: '3.781,00 Lei', discount_percentage: '10% OFF', category: 'Ceasuri & GPS-uri', brand: 'Garmin', sport: 'Alergare', gender: 'Unisex', availability: 'In stock', is_deal: true, product_url: 'https://www.sportguru.ro/ceas-garmin-forerunner-970-amoled', product_id: 'ceas-garmin-forerunner-970-amoled' },
  { name: 'Ceas Garmin Instinct 3 - 45 mm, Solar, Tactical Edition', image_url: 'https://media.sportguru.ro/media/catalog/product/0/1/010-02934-501.jpg', price: '1.949,00 Lei', original_price: '2.279,00 Lei', discount_percentage: '14% OFF', category: 'Ceasuri & GPS-uri', brand: 'Garmin', sport: 'Outdoor', gender: 'Unisex', availability: 'In stock', is_deal: true, product_url: 'https://www.sportguru.ro/ceas-garmin-instinct-3-45-mm-solar-tactical-edition', product_id: 'ceas-garmin-instinct-3-45-mm-solar-tactical-edition' },
  { name: 'Pantofi alergare barbati Puma Deviate Nitro Elite 4 Showtime SS 2026', image_url: 'https://media.sportguru.ro/media/catalog/product/d/e/deviate-nitro_-elite-4-showtime-_1_5.jpg', price: 'De la 875,00 Lei', original_price: '1.249,00 Lei', discount_percentage: '30% OFF', category: 'Pantofi alergare', brand: 'Puma', sport: 'Alergare', gender: 'Barbati', availability: 'In stock', is_deal: true, product_url: 'https://www.sportguru.ro/sporturi/alergare/pantofi-alergare/pantofi-alergare-asfalt/pantofi-alergare-barbati-puma-deviate-nitro-elite-4-showtime-ss-2026', product_id: 'pantofi-alergare-barbati-puma-deviate-nitro-elite-4-showtime-ss-2026' },
];

// Brand colors from DESIGN_TOKENS (SportGuru "Alpine Velocity"): lime-green accent.
const PALETTE = ['#8bc53f', '#111111', '#ffffff'];
const ACCENT = '#8bc53f';
const CARD_COLORS = ['#1a2a3a', '#1a3a2a', '#2a1a3a', '#3a2a1a', '#1a1a3a', '#3a1a1a'];

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  const [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const relLum = (rr, gg, bb) => 0.2126 * lum(rr) + 0.7152 * lum(gg) + 0.0722 * lum(bb);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0; let hi = 1;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    if (relLum(Math.round(r * mid), Math.round(g * mid), Math.round(b * mid)) > 0.12) hi = mid; else lo = mid;
  }
  const dr = Math.round(r * lo); const dg = Math.round(g * lo); const db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}

const theme = getThemedCardBg(PALETTE);

function fmtPrice(val) {
  if (val === null || val === undefined || val === '') return '';
  if (typeof val === 'number') return `${val.toLocaleString('ro-RO')} Lei`;
  return String(val);
}

function discountLabel(item) {
  if (item.discount_percent !== null && item.discount_percent !== undefined && item.discount_percent !== '') {
    const n = Math.round(Number(item.discount_percent));
    if (!isNaN(n) && n > 0) return `-${n}%`;
  }
  if (item.discount_percentage) {
    const m = String(item.discount_percentage).match(/(\d+)/);
    if (m) return `-${m[1]}%`;
  }
  return '';
}

export default async function decorate(block, bridge) {
  let items;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext && bridge.hostContext.preview === true;
    if (isPreview) {
      items = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || {};
      // structuredContent.deals — bare array outputSchema; key derived from actionName "find_current_deals"
      items = structuredContent?.deals || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  // AMCP-360 is_deal partition (keyed on concept): a deals-list widget shows ONLY deal items.
  // Only partition when the payload actually carries is_deal markers, so a real find_current_deals
  // response (whose items are all deals and omit the flag) still renders.
  if (items.some((it) => it && Object.prototype.hasOwnProperty.call(it, 'is_deal'))) {
    items = items.filter((it) => it.is_deal === true);
  }

  block.textContent = '';
  renderDeals(block, items, bridge);

  if (bridge) {
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  }
}

function renderDeals(block, items, bridge) {
  const wrapper = document.createElement('div');
  wrapper.className = 'find-current-deals-wrapper';

  const btnLeft = document.createElement('button');
  btnLeft.className = 'find-current-deals-arrow find-current-deals-arrow-left';
  btnLeft.setAttribute('aria-label', 'Scroll left');
  btnLeft.textContent = '◄';

  const trackWrap = document.createElement('div');
  trackWrap.className = 'find-current-deals-track-wrap';

  const track = document.createElement('div');
  track.className = 'find-current-deals-track';

  const btnRight = document.createElement('button');
  btnRight.className = 'find-current-deals-arrow find-current-deals-arrow-right';
  btnRight.setAttribute('aria-label', 'Scroll right');
  btnRight.textContent = '►';

  const fade = document.createElement('div');
  fade.className = 'find-current-deals-fade';
  fade.style.background = `linear-gradient(to right, transparent, ${theme?.bg ?? '#1a1a1a'}cc)`;

  items.slice(0, 6).forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'find-current-deals-card';

    const imgWrap = document.createElement('div');
    imgWrap.className = 'find-current-deals-img';

    const colorDiv = () => {
      const d = document.createElement('div');
      d.style.cssText = `width:100%;height:100%;background-color:${CARD_COLORS[i % CARD_COLORS.length]};`;
      return d;
    };
    if (item.image_url) {
      const img = document.createElement('img');
      img.src = item.image_url;
      img.alt = item.name || '';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      img.onerror = () => img.parentNode.replaceChild(colorDiv(), img);
      imgWrap.appendChild(img);
    } else {
      imgWrap.appendChild(colorDiv());
    }

    const disc = discountLabel(item);
    if (disc) {
      const badge = document.createElement('div');
      badge.className = 'find-current-deals-discount';
      badge.textContent = disc;
      imgWrap.appendChild(badge);
    }
    card.appendChild(imgWrap);

    const info = document.createElement('div');
    info.className = 'find-current-deals-info';
    info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

    const name = document.createElement('div');
    name.className = 'find-current-deals-name';
    name.textContent = item.name || '';
    info.appendChild(name);

    if (item.brand) {
      const brand = document.createElement('div');
      brand.className = 'find-current-deals-brand';
      brand.textContent = item.brand;
      info.appendChild(brand);
    }

    const priceRow = document.createElement('div');
    priceRow.className = 'find-current-deals-price-row';
    const orig = fmtPrice(item.original_price);
    if (orig) {
      const origEl = document.createElement('span');
      origEl.className = 'find-current-deals-orig';
      origEl.textContent = orig;
      priceRow.appendChild(origEl);
    }
    const current = fmtPrice(item.current_price !== undefined ? item.current_price : item.price);
    if (current) {
      const priceEl = document.createElement('span');
      priceEl.className = 'find-current-deals-price';
      priceEl.textContent = current;
      priceRow.appendChild(priceEl);
    }
    if (priceRow.childNodes.length) info.appendChild(priceRow);

    const metaParts = [];
    if (item.availability) metaParts.push(item.availability);
    if (item.offer_end) metaParts.push(`ends ${item.offer_end}`);
    if (metaParts.length) {
      const meta = document.createElement('div');
      meta.className = 'find-current-deals-meta';
      meta.textContent = metaParts.join(' · ');
      info.appendChild(meta);
    }

    const cta = document.createElement('button');
    cta.className = 'find-current-deals-cta';
    cta.textContent = 'View Deal';
    if (bridge) {
      cta.addEventListener('click', () => {
        if (item.product_url) bridge.openLink(item.product_url);
        else bridge.sendMessage(`Tell me more about ${item.name || 'this deal'}`);
      });
    }
    info.appendChild(cta);

    card.appendChild(info);
    track.appendChild(card);
  });

  trackWrap.appendChild(track);
  trackWrap.appendChild(fade);
  wrapper.appendChild(btnLeft);
  wrapper.appendChild(trackWrap);
  wrapper.appendChild(btnRight);
  block.appendChild(wrapper);

  const cardWidth = 220 + 16;
  btnLeft.addEventListener('click', () => track.scrollBy({ left: -cardWidth, behavior: 'smooth' }));
  btnRight.addEventListener('click', () => track.scrollBy({ left: cardWidth, behavior: 'smooth' }));
  const updateArrows = () => {
    btnLeft.style.display = track.scrollLeft <= 0 ? 'none' : 'flex';
    btnRight.style.display = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4 ? 'none' : 'flex';
  };
  track.addEventListener('scroll', updateArrows);
  updateArrows();
}
