// codegen:layout-pattern=carousel
// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  { name: 'Ceas Garmin Fenix 9 PRO AMOLED inReach - 47 mm', description: 'Premium multisport GPS smartwatch with AMOLED display and inReach satellite communication.', image_url: 'https://media.sportguru.ro/media/catalog/product/0/1/010-04336-01-112_1.jpg', price: 'De la 6.299,00 Lei', category: 'Ceasuri & GPS-uri', brand: 'Garmin', sport: 'Multisport', gender: 'Unisex', availability: 'In stock', product_url: 'https://www.sportguru.ro/ceas-garmin-fenix-9-pro-amoled-inreach-47-mm', product_id: 'ceas-garmin-fenix-9-pro-amoled-inreach-47-mm' },
  { name: 'Pantofi alergare dama Asics Gel-Kayano 32 Sunny Sizzle SS 2026', description: "Women's stability road-running shoe with maximal cushioning for long-distance comfort.", image_url: 'https://media.sportguru.ro/media/catalog/product/1/0/1012c045._8_i9.jpg', price: 'De la 714,00 Lei', original_price: '1.020,00 Lei', category: 'Pantofi alergare', brand: 'Asics', sport: 'Alergare', gender: 'Femei', available_sizes: ['37', '37 1/2', '38', '39', '39 1/2', '40', '40 1/2'], availability: 'In stock', product_url: 'https://www.sportguru.ro/sporturi/alergare/pantofi-alergare/pantofi-alergare-asfalt/pantofi-alergare-dama-asics-gel-kayano-32-sunny-sizzle-ss-2026', product_id: 'pantofi-alergare-dama-asics-gel-kayano-32-sunny-sizzle-ss-2026' },
  { name: 'Pantofi alergare dama ON Cloudmonster 3 SS 2026', description: "Women's max-cushion road-running shoe engineered for energetic, plush rides.", image_url: 'https://media.sportguru.ro/media/catalog/product/0/0/000000_on-cloudmonster-3-wmns_limelight-seedling_3wg10034859_img0-1000x1000_1.jpg', price: 'De la 765,00 Lei', original_price: '1.020,00 Lei', category: 'Pantofi alergare', brand: 'ON', sport: 'Alergare', gender: 'Femei', availability: 'In stock', product_url: 'https://www.sportguru.ro/sporturi/alergare/pantofi-alergare/pantofi-alergare-asfalt/pantofi-alergare-dama-on-cloudmonster-3-ss-2026', product_id: 'pantofi-alergare-dama-on-cloudmonster-3-ss-2026' },
  { name: 'Pantofi alergare barbati Hoka Skyward X 2', description: "Men's highly-cushioned road-running shoe with a responsive plate for long runs.", image_url: 'https://media.sportguru.ro/media/catalog/product/1/1/1171925-gtcb_1_1_2.jpg', price: 'De la 964,00 Lei', original_price: '1.205,00 Lei', category: 'Pantofi alergare', brand: 'Hoka', sport: 'Alergare', gender: 'Barbati', availability: 'In stock', product_url: 'https://www.sportguru.ro/sporturi/alergare/pantofi-alergare/pantofi-alergare-asfalt/pantofi-alergare-barbati-hoka-skyward-x-2', product_id: 'pantofi-alergare-barbati-hoka-skyward-x-2' },
  { name: 'Pantofi alergare barbati Adidas Supernova Rise 3 SS 2026', description: "Men's everyday cushioned road-running shoe for training and easy miles.", image_url: 'https://media.sportguru.ro/media/catalog/product/j/p/jp8689_b2b012_plp_1.jpg', price: 'De la 570,00 Lei', original_price: '750,00 Lei', category: 'Pantofi alergare', brand: 'Adidas', sport: 'Alergare', gender: 'Barbati', availability: 'In stock', product_url: 'https://www.sportguru.ro/sporturi/alergare/pantofi-alergare/pantofi-alergare-asfalt/pantofi-alergare-barbati-adidas-supernova-rise-3-ss-2026', product_id: 'pantofi-alergare-barbati-adidas-supernova-rise-3-ss-2026' },
  { name: 'Bicicleta pliabila Dahon K9 16"', description: 'Compact 16-inch folding bicycle for city commuting and easy storage.', image_url: 'https://media.sportguru.ro/media/catalog/product/5/_/5_141bf4e4-76cd-451c-befd-19075bba9605_1.jpg', price: 'De la 5.295,00 Lei', category: 'Biciclete', brand: 'Dahon', sport: 'Ciclism', gender: 'Unisex', availability: 'In stock', product_url: 'https://www.sportguru.ro/sporturi/ciclism/biciclete/biciclete-pentru-oras-si-imprejurimi/bicicleta-pliabila-dahon-k9-16', product_id: 'bicicleta-pliabila-dahon-k9-16' },
  { name: 'Ceas Garmin Forerunner 970 AMOLED', description: 'Premium running and triathlon GPS smartwatch with AMOLED display and training metrics.', image_url: 'https://media.sportguru.ro/media/catalog/product/i/m/imageedit_25_83188919822.jpg', price: 'De la 3.399,00 Lei', original_price: '3.781,00 Lei', category: 'Ceasuri & GPS-uri', brand: 'Garmin', sport: 'Alergare', gender: 'Unisex', availability: 'In stock', product_url: 'https://www.sportguru.ro/ceas-garmin-forerunner-970-amoled', product_id: 'ceas-garmin-forerunner-970-amoled' },
  { name: 'Ceas Garmin Instinct 3 - 45 mm, Solar, Tactical Edition', description: 'Rugged solar-charging GPS smartwatch with tactical features and long battery life.', image_url: 'https://media.sportguru.ro/media/catalog/product/0/1/010-02934-501.jpg', price: '1.949,00 Lei', original_price: '2.279,00 Lei', category: 'Ceasuri & GPS-uri', brand: 'Garmin', sport: 'Outdoor', gender: 'Unisex', availability: 'In stock', product_url: 'https://www.sportguru.ro/ceas-garmin-instinct-3-45-mm-solar-tactical-edition', product_id: 'ceas-garmin-instinct-3-45-mm-solar-tactical-edition' },
  { name: 'Pantofi alergare barbati Puma Deviate Nitro Elite 4 Showtime SS 2026', description: "Men's carbon-plated racing shoe built for fast road racing and tempo efforts.", image_url: 'https://media.sportguru.ro/media/catalog/product/d/e/deviate-nitro_-elite-4-showtime-_1_5.jpg', price: 'De la 875,00 Lei', original_price: '1.249,00 Lei', category: 'Pantofi alergare', brand: 'Puma', sport: 'Alergare', gender: 'Barbati', availability: 'In stock', product_url: 'https://www.sportguru.ro/sporturi/alergare/pantofi-alergare/pantofi-alergare-asfalt/pantofi-alergare-barbati-puma-deviate-nitro-elite-4-showtime-ss-2026', product_id: 'pantofi-alergare-barbati-puma-deviate-nitro-elite-4-showtime-ss-2026' },
];

// Brand colors from DESIGN_TOKENS' color tier — lime-green accent over white/near-black.
const PALETTE = ['#8bc53f', '#111111', '#ffffff'];
const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  let [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const relLum = (rr, gg, bb) => 0.2126 * lum(rr) + 0.7152 * lum(gg) + 0.0722 * lum(bb);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0, hi = 1;
  for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m; }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);

export default async function decorate(block, bridge) {
  let items;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      items = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || {};
      // structuredContent.products — bare array outputSchema; key derived from actionName "search_sports_products"
      items = structuredContent?.products || [];
    }
    block.textContent = '';
    renderItems(block, items, bridge);
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  } else {
    items = SAMPLE_DATA;
    block.textContent = '';
    renderItems(block, items, bridge);
  }
}

function renderItems(block, items, bridge) {
  const root = document.createElement('div');
  root.className = 'search-sports-products';

  const list = Array.isArray(items) ? items : [];

  // Filter bar: result count + active filter chips
  const bar = document.createElement('div');
  bar.className = 'ssp-bar';

  const count = document.createElement('span');
  count.className = 'ssp-count';
  count.textContent = `${list.length} results`;
  bar.appendChild(count);

  const filters = document.createElement('div');
  filters.className = 'ssp-filters';
  const activeFilters = deriveFilters(list);
  activeFilters.forEach((f) => {
    const chip = document.createElement('span');
    chip.className = 'ssp-chip';
    chip.textContent = f;
    filters.appendChild(chip);
  });
  bar.appendChild(filters);
  root.appendChild(bar);

  // Carousel wrapper + track
  const wrapper = document.createElement('div');
  wrapper.className = 'ssp-carousel-wrap';

  const track = document.createElement('div');
  track.className = 'ssp-track';

  list.forEach((item, i) => {
    track.appendChild(buildCard(item, i, bridge));
  });
  wrapper.appendChild(track);

  // Right fade gradient hinting at more content
  const fade = document.createElement('div');
  fade.className = 'ssp-fade';
  fade.style.background = `linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc)`;
  wrapper.appendChild(fade);

  // Nav arrows
  const leftBtn = document.createElement('button');
  leftBtn.className = 'ssp-nav ssp-nav-left';
  leftBtn.setAttribute('aria-label', 'Scroll left');
  leftBtn.textContent = '◀';
  const rightBtn = document.createElement('button');
  rightBtn.className = 'ssp-nav ssp-nav-right';
  rightBtn.setAttribute('aria-label', 'Scroll right');
  rightBtn.textContent = '▶';

  const scrollByCard = (dir) => {
    const card = track.querySelector('.ssp-card');
    const step = card ? card.offsetWidth + 16 : 236;
    track.scrollBy({ left: dir * step, behavior: 'smooth' });
  };
  leftBtn.addEventListener('click', () => scrollByCard(-1));
  rightBtn.addEventListener('click', () => scrollByCard(1));
  [leftBtn, rightBtn].forEach((btn, idx) => {
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollByCard(idx === 0 ? -1 : 1); }
    });
  });

  const updateArrows = () => {
    const atStart = track.scrollLeft <= 2;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    leftBtn.style.display = atStart ? 'none' : 'flex';
    rightBtn.style.display = atEnd ? 'none' : 'flex';
    fade.style.display = atEnd ? 'none' : 'block';
  };
  track.addEventListener('scroll', updateArrows);

  wrapper.appendChild(leftBtn);
  wrapper.appendChild(rightBtn);
  root.appendChild(wrapper);

  // Refine Results button below the list
  const refine = document.createElement('button');
  refine.className = 'ssp-refine';
  refine.textContent = 'Refine Results';
  if (bridge) {
    refine.addEventListener('click', () => bridge.sendMessage('Refine these results'));
  }
  root.appendChild(refine);

  block.appendChild(root);
  requestAnimationFrame(updateArrows);
}

function deriveFilters(list) {
  const out = [];
  const sports = [...new Set(list.map((i) => i.sport).filter(Boolean))];
  const genders = [...new Set(list.map((i) => i.gender).filter(Boolean))];
  const cats = [...new Set(list.map((i) => i.category).filter(Boolean))];
  if (sports.length === 1) out.push(sports[0]);
  if (genders.length === 1) out.push(genders[0]);
  if (cats.length === 1) out.push(cats[0]);
  return out;
}

function buildCard(item, i, bridge) {
  const card = document.createElement('div');
  card.className = 'ssp-card';

  const isDiscounted = !!item.original_price;

  // Image area
  const imgWrap = document.createElement('div');
  imgWrap.className = 'ssp-img';
  const fallbackColor = CARD_COLORS[i % CARD_COLORS.length];
  const colorDiv = () => {
    const d = document.createElement('div');
    d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
    return d;
  };
  if (item.image_url) {
    const img = document.createElement('img');
    img.src = item.image_url;
    img.alt = item.name || '';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    img.onerror = () => img.parentNode && img.parentNode.replaceChild(colorDiv(), img);
    imgWrap.appendChild(img);
  } else {
    imgWrap.appendChild(colorDiv());
  }
  if (isDiscounted) {
    const badge = document.createElement('span');
    badge.className = 'ssp-deal-badge';
    badge.textContent = 'SALE';
    imgWrap.appendChild(badge);
  }
  card.appendChild(imgWrap);

  // Content strip
  const content = document.createElement('div');
  content.className = 'ssp-content';
  content.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  const brand = document.createElement('span');
  brand.className = 'ssp-brand';
  brand.textContent = item.brand || '';
  content.appendChild(brand);

  const name = document.createElement('h3');
  name.className = 'ssp-name';
  name.textContent = item.name || '';
  content.appendChild(name);

  // fit / use-case labels: sport + gender
  const labels = document.createElement('div');
  labels.className = 'ssp-labels';
  [item.sport, item.gender].filter(Boolean).forEach((l) => {
    const chip = document.createElement('span');
    chip.className = 'ssp-label';
    chip.textContent = l;
    labels.appendChild(chip);
  });
  if (labels.childNodes.length) content.appendChild(labels);

  // key features
  if (Array.isArray(item.key_features) && item.key_features.length) {
    const feat = document.createElement('p');
    feat.className = 'ssp-feat';
    feat.textContent = item.key_features.slice(0, 2).join(' · ');
    content.appendChild(feat);
  }

  // available sizes
  if (Array.isArray(item.available_sizes) && item.available_sizes.length) {
    const sizes = document.createElement('p');
    sizes.className = 'ssp-sizes';
    sizes.textContent = `Sizes: ${item.available_sizes.join(', ')}`;
    content.appendChild(sizes);
  }

  // price row
  const priceRow = document.createElement('div');
  priceRow.className = 'ssp-price-row';
  if (isDiscounted) {
    const orig = document.createElement('span');
    orig.className = 'ssp-orig';
    orig.textContent = item.original_price;
    priceRow.appendChild(orig);
  }
  const price = document.createElement('span');
  price.className = 'ssp-price';
  price.textContent = item.price || '';
  priceRow.appendChild(price);
  content.appendChild(priceRow);

  // availability
  if (item.availability) {
    const avail = document.createElement('span');
    avail.className = 'ssp-avail';
    avail.textContent = item.availability;
    content.appendChild(avail);
  }

  // CTA row
  const ctaRow = document.createElement('div');
  ctaRow.className = 'ssp-cta-row';

  const details = document.createElement('button');
  details.className = 'ssp-cta ssp-cta-primary';
  details.textContent = 'View Details';
  if (bridge && item.product_url) {
    details.addEventListener('click', () => bridge.openLink(item.product_url));
  } else if (bridge) {
    details.addEventListener('click', () => bridge.sendMessage(`Tell me more about ${item.name}`));
  }
  ctaRow.appendChild(details);

  const compare = document.createElement('button');
  compare.className = 'ssp-cta ssp-cta-secondary';
  compare.textContent = 'Compare';
  if (bridge) {
    compare.addEventListener('click', () => bridge.sendMessage(`Compare ${item.name}`));
  }
  ctaRow.appendChild(compare);

  content.appendChild(ctaRow);
  card.appendChild(content);
  return card;
}
