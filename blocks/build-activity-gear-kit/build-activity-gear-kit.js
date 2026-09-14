// codegen:layout-pattern=carousel
// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: 'Ceas Garmin Fenix 9 PRO AMOLED inReach - 47 mm',
    brand: 'Garmin',
    category: 'Ceasuri & GPS-uri',
    kit_role: 'optional',
    selection_reason: 'Premium multisport GPS smartwatch with AMOLED display and inReach satellite communication.',
    price: 'De la 6.299,00 Lei',
    availability: 'In stock',
    image_url: 'https://media.sportguru.ro/media/catalog/product/0/1/010-04336-01-112_1.jpg',
    product_url: 'https://www.sportguru.ro/ceas-garmin-fenix-9-pro-amoled-inreach-47-mm',
    product_id: 'ceas-garmin-fenix-9-pro-amoled-inreach-47-mm',
  },
  {
    name: 'Pantofi alergare dama Asics Gel-Kayano 32 Sunny Sizzle SS 2026',
    brand: 'Asics',
    category: 'Pantofi alergare',
    kit_role: 'essential',
    selection_reason: "Women's stability road-running shoe with maximal cushioning for long-distance comfort.",
    price: 'De la 714,00 Lei',
    availability: 'In stock',
    image_url: 'https://media.sportguru.ro/media/catalog/product/1/0/1012c045._8_i9.jpg',
    product_url: 'https://www.sportguru.ro/sporturi/alergare/pantofi-alergare/pantofi-alergare-asfalt/pantofi-alergare-dama-asics-gel-kayano-32-sunny-sizzle-ss-2026',
    product_id: 'pantofi-alergare-dama-asics-gel-kayano-32-sunny-sizzle-ss-2026',
  },
  {
    name: 'Pantofi alergare dama ON Cloudmonster 3 SS 2026',
    brand: 'ON',
    category: 'Pantofi alergare',
    kit_role: 'useful',
    selection_reason: "Women's max-cushion road-running shoe engineered for energetic, plush rides.",
    price: 'De la 765,00 Lei',
    availability: 'In stock',
    image_url: 'https://media.sportguru.ro/media/catalog/product/0/0/000000_on-cloudmonster-3-wmns_limelight-seedling_3wg10034859_img0-1000x1000_1.jpg',
    product_url: 'https://www.sportguru.ro/sporturi/alergare/pantofi-alergare/pantofi-alergare-asfalt/pantofi-alergare-dama-on-cloudmonster-3-ss-2026',
    product_id: 'pantofi-alergare-dama-on-cloudmonster-3-ss-2026',
  },
  {
    name: 'Pantofi alergare barbati Hoka Skyward X 2',
    brand: 'Hoka',
    category: 'Pantofi alergare',
    kit_role: 'essential',
    selection_reason: "Men's highly-cushioned road-running shoe with a responsive plate for long runs.",
    price: 'De la 964,00 Lei',
    availability: 'In stock',
    image_url: 'https://media.sportguru.ro/media/catalog/product/1/1/1171925-gtcb_1_1_2.jpg',
    product_url: 'https://www.sportguru.ro/sporturi/alergare/pantofi-alergare/pantofi-alergare-asfalt/pantofi-alergare-barbati-hoka-skyward-x-2',
    product_id: 'pantofi-alergare-barbati-hoka-skyward-x-2',
  },
  {
    name: 'Pantofi alergare barbati Adidas Supernova Rise 3 SS 2026',
    brand: 'Adidas',
    category: 'Pantofi alergare',
    kit_role: 'useful',
    selection_reason: "Men's everyday cushioned road-running shoe for training and easy miles.",
    price: 'De la 570,00 Lei',
    availability: 'In stock',
    image_url: 'https://media.sportguru.ro/media/catalog/product/j/p/jp8689_b2b012_plp_1.jpg',
    product_url: 'https://www.sportguru.ro/sporturi/alergare/pantofi-alergare/pantofi-alergare-asfalt/pantofi-alergare-barbati-adidas-supernova-rise-3-ss-2026',
    product_id: 'pantofi-alergare-barbati-adidas-supernova-rise-3-ss-2026',
  },
];

const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

// Brand colors read from DESIGN_TOKENS' color tier.
const PALETTE = ['#8bc53f', '#111111', '#ffffff'];
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
  for (let i = 0; i < 20; i += 1) {
    const m = (lo + hi) / 2;
    if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m;
  }
  const dr = Math.round(r * lo); const dg = Math.round(g * lo); const db = Math.round(b * lo);
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
      // structuredContent.products — bare array outputSchema; key derived from actionName "build_activity_gear_kit"
      items = structuredContent?.products || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  block.textContent = '';
  renderItems(block, items, bridge);

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

function renderItems(block, items, bridge) {
  const list = (items || []).slice(0, 5);

  const wrapper = document.createElement('div');
  wrapper.className = 'kit-wrapper';

  const track = document.createElement('div');
  track.className = 'kit-track';

  list.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'kit-card';

    // Image
    const imageBox = document.createElement('div');
    imageBox.className = 'kit-image';
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
      imageBox.appendChild(img);
    } else {
      imageBox.appendChild(colorDiv());
    }

    if (item.kit_role) {
      const roleBadge = document.createElement('span');
      roleBadge.className = `kit-role kit-role-${String(item.kit_role).toLowerCase()}`;
      roleBadge.textContent = item.kit_role;
      imageBox.appendChild(roleBadge);
    }
    card.appendChild(imageBox);

    // Content strip
    const info = document.createElement('div');
    info.className = 'kit-info';
    info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

    if (item.brand) {
      const brand = document.createElement('div');
      brand.className = 'kit-brand';
      brand.textContent = item.brand;
      info.appendChild(brand);
    }

    const name = document.createElement('h3');
    name.className = 'kit-name';
    name.textContent = item.name || '';
    info.appendChild(name);

    if (item.selection_reason) {
      const reason = document.createElement('p');
      reason.className = 'kit-reason';
      reason.textContent = item.selection_reason;
      info.appendChild(reason);
    }

    const meta = document.createElement('div');
    meta.className = 'kit-meta';
    const price = document.createElement('span');
    price.className = 'kit-price';
    price.textContent = item.price != null ? String(item.price) : '';
    meta.appendChild(price);
    if (item.availability) {
      const avail = document.createElement('span');
      avail.className = 'kit-avail';
      avail.textContent = item.availability;
      meta.appendChild(avail);
    }
    info.appendChild(meta);

    const cta = document.createElement('button');
    cta.className = 'kit-cta';
    cta.type = 'button';
    cta.textContent = 'Buy on SportGuru';
    if (bridge) {
      cta.addEventListener('click', () => {
        if (item.product_url) bridge.openLink(item.product_url);
        else bridge.sendMessage(`Tell me more about ${item.name}`);
      });
    }
    info.appendChild(cta);

    card.appendChild(info);
    track.appendChild(card);
  });

  wrapper.appendChild(track);

  const fade = document.createElement('div');
  fade.className = 'kit-fade';
  fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);pointer-events:none;border-radius:0 10px 10px 0;`;
  wrapper.appendChild(fade);

  // Navigation arrows
  const mkArrow = (dir) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `kit-arrow kit-arrow-${dir}`;
    btn.setAttribute('aria-label', dir === 'left' ? 'Scroll left' : 'Scroll right');
    btn.textContent = dir === 'left' ? '◀' : '▶';
    const scrollBy = () => {
      const card = track.querySelector('.kit-card');
      const delta = (card ? card.offsetWidth : 220) + 16;
      track.scrollBy({ left: dir === 'left' ? -delta : delta, behavior: 'smooth' });
    };
    btn.addEventListener('click', scrollBy);
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollBy(); }
    });
    return btn;
  };
  const leftArrow = mkArrow('left');
  const rightArrow = mkArrow('right');
  wrapper.appendChild(leftArrow);
  wrapper.appendChild(rightArrow);

  const updateArrows = () => {
    const maxScroll = track.scrollWidth - track.clientWidth - 1;
    leftArrow.style.display = track.scrollLeft <= 1 ? 'none' : 'flex';
    rightArrow.style.display = track.scrollLeft >= maxScroll ? 'none' : 'flex';
    fade.style.display = track.scrollLeft >= maxScroll ? 'none' : 'block';
  };
  track.addEventListener('scroll', updateArrows);
  requestAnimationFrame(updateArrows);

  block.appendChild(wrapper);
}
