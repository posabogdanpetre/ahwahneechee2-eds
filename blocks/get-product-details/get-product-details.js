// codegen:layout-pattern=detail-split
// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = {
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
};

// Brand colors from DESIGN_TOKENS' color tier — lime-green accent over white surface.
const PALETTE = ['#8bc53f', '#111111', '#ffffff'];
const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

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

function renderDetail(block, item, bridge) {
  const card = document.createElement('div');
  card.className = 'get-product-details-card';

  // Image panel (LEFT)
  const imagePanel = document.createElement('div');
  imagePanel.className = 'get-product-details-image';
  const colorDiv = () => {
    const d = document.createElement('div');
    d.style.cssText = `width:100%;height:100%;background-color:${CARD_COLORS[0]};`;
    return d;
  };
  if (item.image_url) {
    const img = document.createElement('img');
    img.src = item.image_url;
    img.alt = item.name || '';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    img.onerror = () => img.parentNode.replaceChild(colorDiv(), img);
    imagePanel.appendChild(img);
  } else {
    imagePanel.appendChild(colorDiv());
  }
  card.appendChild(imagePanel);

  // Content panel (RIGHT)
  const content = document.createElement('div');
  content.className = 'get-product-details-content';
  content.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

  if (item.brand) {
    const brand = document.createElement('span');
    brand.className = 'get-product-details-brand';
    brand.textContent = item.brand;
    content.appendChild(brand);
  }

  const title = document.createElement('h3');
  title.className = 'get-product-details-name';
  title.textContent = item.name || '';
  content.appendChild(title);

  const desc = document.createElement('p');
  desc.className = 'get-product-details-desc';
  desc.textContent = item.description || '';
  content.appendChild(desc);

  // Price row
  const priceRow = document.createElement('div');
  priceRow.className = 'get-product-details-price-row';
  if (item.price) {
    const price = document.createElement('span');
    price.className = 'get-product-details-price';
    price.textContent = item.price;
    priceRow.appendChild(price);
  }
  if (item.original_price) {
    const orig = document.createElement('span');
    orig.className = 'get-product-details-orig';
    orig.textContent = item.original_price;
    priceRow.appendChild(orig);
  }
  content.appendChild(priceRow);

  // Meta row: category + availability
  const metaRow = document.createElement('div');
  metaRow.className = 'get-product-details-meta';
  if (item.category) {
    const cat = document.createElement('span');
    cat.className = 'get-product-details-chip';
    cat.textContent = item.category;
    metaRow.appendChild(cat);
  }
  if (item.availability) {
    const avail = document.createElement('span');
    avail.className = 'get-product-details-avail';
    avail.textContent = item.availability;
    metaRow.appendChild(avail);
  }
  content.appendChild(metaRow);

  // CTA row (max 2 actions)
  const ctaRow = document.createElement('div');
  ctaRow.className = 'get-product-details-cta-row';

  const chooseBtn = document.createElement('button');
  chooseBtn.className = 'get-product-details-cta get-product-details-cta-secondary';
  chooseBtn.type = 'button';
  chooseBtn.textContent = 'Choose Size';
  if (bridge) {
    chooseBtn.addEventListener('click', () => {
      bridge.sendMessage(`Help me choose a size for ${item.name}`);
    });
  }
  ctaRow.appendChild(chooseBtn);

  const buyBtn = document.createElement('button');
  buyBtn.className = 'get-product-details-cta get-product-details-cta-primary';
  buyBtn.type = 'button';
  buyBtn.textContent = 'Buy on SportGuru';
  if (bridge && item.product_url) {
    buyBtn.addEventListener('click', () => {
      bridge.openLink(item.product_url);
    });
  }
  ctaRow.appendChild(buyBtn);

  content.appendChild(ctaRow);
  card.appendChild(content);
  block.appendChild(card);
}

export default async function decorate(block, bridge) {
  let item;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      item = SAMPLE_DATA;
    } else {
      // Detail concept — structuredContent IS the item (flat). No wrapper key.
      const _result = await bridge.toolResult;
      item = _result?.structuredContent || {};
    }
  } else {
    item = SAMPLE_DATA;
  }

  block.textContent = '';
  if (!item?.name) {
    const empty = document.createElement('p');
    empty.className = 'get-product-details-empty';
    empty.textContent = 'No matching product was found.';
    block.appendChild(empty);
  } else {
    renderDetail(block, item, bridge);
  }

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
