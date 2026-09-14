// codegen:layout-pattern=comparison
// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: 'Ceas Garmin Fenix 9 PRO AMOLED inReach - 47 mm',
    description: 'Premium multisport GPS smartwatch with AMOLED display and inReach satellite communication.',
    image_url: 'https://media.sportguru.ro/media/catalog/product/0/1/010-04336-01-112_1.jpg',
    price: 'De la 6.299,00 Lei',
    category: 'Ceasuri & GPS-uri',
    brand: 'Garmin',
    sport: 'Multisport',
    gender: 'Unisex',
    availability: 'In stock',
    product_url: 'https://www.sportguru.ro/ceas-garmin-fenix-9-pro-amoled-inreach-47-mm',
    product_id: 'ceas-garmin-fenix-9-pro-amoled-inreach-47-mm',
  },
  {
    name: 'Pantofi alergare dama Asics Gel-Kayano 32 Sunny Sizzle SS 2026',
    description: "Women's stability road-running shoe with maximal cushioning for long-distance comfort.",
    image_url: 'https://media.sportguru.ro/media/catalog/product/1/0/1012c045._8_i9.jpg',
    price: 'De la 714,00 Lei',
    original_price: '1.020,00 Lei',
    category: 'Pantofi alergare',
    brand: 'Asics',
    sport: 'Alergare',
    gender: 'Femei',
    available_sizes: ['37', '37 1/2', '38', '39', '39 1/2', '40', '40 1/2'],
    availability: 'In stock',
    product_url: 'https://www.sportguru.ro/sporturi/alergare/pantofi-alergare/pantofi-alergare-asfalt/pantofi-alergare-dama-asics-gel-kayano-32-sunny-sizzle-ss-2026',
    product_id: 'pantofi-alergare-dama-asics-gel-kayano-32-sunny-sizzle-ss-2026',
  },
  {
    name: 'Pantofi alergare dama ON Cloudmonster 3 SS 2026',
    description: "Women's max-cushion road-running shoe engineered for energetic, plush rides.",
    image_url: 'https://media.sportguru.ro/media/catalog/product/0/0/000000_on-cloudmonster-3-wmns_limelight-seedling_3wg10034859_img0-1000x1000_1.jpg',
    price: 'De la 765,00 Lei',
    original_price: '1.020,00 Lei',
    category: 'Pantofi alergare',
    brand: 'ON',
    sport: 'Alergare',
    gender: 'Femei',
    availability: 'In stock',
    product_url: 'https://www.sportguru.ro/sporturi/alergare/pantofi-alergare/pantofi-alergare-asfalt/pantofi-alergare-dama-on-cloudmonster-3-ss-2026',
    product_id: 'pantofi-alergare-dama-on-cloudmonster-3-ss-2026',
  },
];

// Brand colors from DESIGN_TOKENS' color tier — lime accent over white/near-black.
const PALETTE = ['#8bc53f', '#111111', '#ffffff'];

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  const relLum = (rr, gg, bb) => 0.2126 * lum(rr) + 0.7152 * lum(gg) + 0.0722 * lum(bb);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 20; i += 1) {
    const m = (lo + hi) / 2;
    if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m;
  }
  const dr = Math.round(r * lo);
  const dg = Math.round(g * lo);
  const db = Math.round(b * lo);
  return {
    bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`,
    fg: '#ffffff',
  };
}

const theme = getThemedCardBg(PALETTE);
const CARD_COLORS = ['#8bc53f', '#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790'];

function colorDiv(i) {
  const d = document.createElement('div');
  d.style.cssText = `width:100%;height:100%;background-color:${CARD_COLORS[i % CARD_COLORS.length]};`;
  return d;
}

function buildImage(container, item, i) {
  if (item.image_url) {
    const img = document.createElement('img');
    img.src = item.image_url;
    img.alt = item.name || '';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    img.onerror = () => img.parentNode.replaceChild(colorDiv(i), img);
    container.appendChild(img);
  } else {
    container.appendChild(colorDiv(i));
  }
}

function fmtValue(v) {
  if (Array.isArray(v)) return v.join(', ');
  return v == null ? '—' : String(v);
}

// Comparable fields shown as attribute-table rows (label → key).
const ATTR_ROWS = [
  { label: 'Price', key: 'price', lead: true },
  { label: 'Availability', key: 'availability' },
  { label: 'Intended use', key: 'intended_use' },
  { label: 'Key features', key: 'key_features' },
  { label: 'Sizes', key: 'available_sizes' },
];

function renderComparison(block, items, bridge) {
  const pair = items.slice(0, 2);
  const container = document.createElement('div');
  container.className = 'compare-sports-products-card';
  container.style.setProperty('--panel-bg', theme?.bg ?? '#1a1a1a');
  container.style.setProperty('--panel-fg', theme?.fg ?? '#ffffff');

  // Header panels row
  const panels = document.createElement('div');
  panels.className = 'csp-panels';

  pair.forEach((item, i) => {
    const panel = document.createElement('div');
    panel.className = 'csp-panel';

    const imgWrap = document.createElement('div');
    imgWrap.className = 'csp-panel-img';
    buildImage(imgWrap, item, i);
    panel.appendChild(imgWrap);

    const content = document.createElement('div');
    content.className = 'csp-panel-content';

    if (item.brand) {
      const chip = document.createElement('span');
      chip.className = 'csp-brand-chip';
      chip.textContent = item.brand;
      content.appendChild(chip);
    }

    const name = document.createElement('h3');
    name.className = 'csp-name';
    name.textContent = item.name || '';
    content.appendChild(name);

    if (item.description) {
      const desc = document.createElement('p');
      desc.className = 'csp-desc';
      desc.textContent = item.description;
      content.appendChild(desc);
    }

    panel.appendChild(content);
    panels.appendChild(panel);
  });

  container.appendChild(panels);

  // Attribute table
  const table = document.createElement('div');
  table.className = 'csp-table';

  const rows = ATTR_ROWS.filter((r) => pair.some((it) => it[r.key] != null && it[r.key] !== ''));

  rows.forEach((rowDef, idx) => {
    const row = document.createElement('div');
    row.className = `csp-row${idx % 2 ? ' csp-row-alt' : ''}${rowDef.lead ? ' csp-row-lead' : ''}`;

    const label = document.createElement('div');
    label.className = 'csp-label';
    label.textContent = rowDef.label;
    row.appendChild(label);

    const raw = pair.map((it) => it[rowDef.key]);
    const rendered = raw.map((v) => fmtValue(v));
    const differs = rendered[0] !== rendered[1] && rendered.every((v) => v && v !== '—');

    pair.forEach((it, i) => {
      const cell = document.createElement('div');
      cell.className = `csp-cell${differs ? ' csp-cell-diff' : ''}`;
      cell.textContent = fmtValue(it[rowDef.key]);
      row.appendChild(cell);
    });

    table.appendChild(row);
  });

  // CTA row — one button per item
  const ctaRow = document.createElement('div');
  ctaRow.className = 'csp-cta-row';
  const ctaLabelSpacer = document.createElement('div');
  ctaLabelSpacer.className = 'csp-label';
  ctaRow.appendChild(ctaLabelSpacer);

  pair.forEach((item) => {
    const cell = document.createElement('div');
    cell.className = 'csp-cta-cell';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'csp-cta';
    btn.textContent = 'View Full Details';
    if (bridge) {
      btn.addEventListener('click', () => {
        if (item.product_url) bridge.openLink(item.product_url);
        else bridge.sendMessage(`Tell me more about ${item.name}`);
      });
    }
    cell.appendChild(btn);
    ctaRow.appendChild(cell);
  });

  table.appendChild(ctaRow);
  container.appendChild(table);
  block.appendChild(container);
}

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
      // structuredContent.products — bare array outputSchema; key derived from actionName "compare_sports_products"
      items = structuredContent?.products || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  block.textContent = '';
  renderComparison(block, items, bridge);

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
