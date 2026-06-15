// Sample data for standalone EDS preview (no bridge).
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    "name": "Men's Torrentshell 3L Rain Jacket",
    "description": "Waterproof/breathable 3-layer rain jacket providing excellent performance, comfort and durability.",
    "image_url": "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw3f39aea6/images/hi-res/85241_LMST.jpg?sw=1400&sh=1400&sfrm=png&q=90&bgcolor=f3f4ef",
    "price": "£180",
    "category": "Men's Jackets"
  },
  {
    "name": "Women's Nano Puff Packable Insulated Jacket",
    "description": "Warm, windproof, water-resistant jacket with lightweight compressible insulation for packability.",
    "image_url": "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dwbdabaa49/images/hi-res/84218_SMDB.jpg?sw=1400&sh=1400&sfrm=png&q=90&bgcolor=f3f4ef",
    "price": "£170",
    "category": "Women's Jackets"
  },
  {
    "name": "Men's Better Sweater Fleece Jacket",
    "description": "Warm, low-bulk full-zip jacket made of sweater-knit 100% recycled polyester fleece.",
    "image_url": "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dwf4894a9f/images/hi-res/25528_BLK.jpg?sw=1400&sh=1400&sfrm=png&q=90&bgcolor=f3f4ef",
    "price": "£130",
    "category": "Men's Fleece"
  }
];

// Brand palette from BuildWidgetRequest — empty, so fallback colors will be used.
const PALETTE = [];

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  if (hex.length !== 6) return null;
  let [r, g, b] = [parseInt(hex.slice(0,2),16), parseInt(hex.slice(2,4),16), parseInt(hex.slice(4,6),16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s=c/255; return s<=0.03928?s/12.92:Math.pow((s+0.055)/1.055,2.4); };
  const relLum = (r,g,b) => 0.2126*lum(r)+0.7152*lum(g)+0.0722*lum(b);
  if (relLum(r,g,b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo=0, hi=1;
  for (let i=0; i<20; i++) {
    const m=(lo+hi)/2;
    if (relLum(Math.round(r*m),Math.round(g*m),Math.round(b*m)) > 0.12) hi=m; else lo=m;
  }
  const dr=Math.round(r*lo), dg=Math.round(g*lo), db=Math.round(b*lo);
  return { bg:`#${dr.toString(16).padStart(2,'0')}${dg.toString(16).padStart(2,'0')}${db.toString(16).padStart(2,'0')}`, fg:'#ffffff' };
}

const theme = getThemedCardBg(PALETTE);

export default async function decorate(block, bridge) {
  let item;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      item = SAMPLE_DATA[0];
    } else {
      // Detail concept — structuredContent IS the item (flat). Do NOT look for a wrapper key.
      const _result = await bridge.toolResult;
      item = (_result?.structuredContent || _result) || {};
    }
  } else {
    item = SAMPLE_DATA[0];
  }

  block.textContent = '';
  renderProductDetail(block, item, bridge, theme);

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

function renderProductDetail(block, item, bridge, theme) {
  const card = document.createElement('div');
  card.className = 'product-detail-card';

  // Left side: Image with CTA button
  const imageSection = document.createElement('div');
  imageSection.className = 'product-image-section';

  if (item.image_url) {
    const img = document.createElement('img');
    img.src = item.image_url;
    img.alt = item.name || 'Product image';
    img.className = 'product-image';

    const colorDiv = document.createElement('div');
    colorDiv.className = 'product-image-fallback';
    colorDiv.style.cssText = 'background-color:#378ef0;';

    img.onerror = () => {
      imageSection.replaceChild(colorDiv, img);
    };
    imageSection.appendChild(img);
  } else {
    const colorDiv = document.createElement('div');
    colorDiv.className = 'product-image-fallback';
    colorDiv.style.cssText = 'background-color:#378ef0;';
    imageSection.appendChild(colorDiv);
  }

  const ctaBtn = document.createElement('button');
  ctaBtn.className = 'cta-button';
  ctaBtn.textContent = 'Shop Now';
  if (bridge) {
    ctaBtn.addEventListener('click', () => {
      bridge.sendMessage(`I'd like to buy the ${item.name}`);
    });
  }
  imageSection.appendChild(ctaBtn);

  card.appendChild(imageSection);

  // Right side: Content
  const contentSection = document.createElement('div');
  contentSection.className = 'product-content-section';

  const name = document.createElement('h2');
  name.className = 'product-name';
  name.textContent = item.name || '';
  contentSection.appendChild(name);

  if (item.category) {
    const categoryChip = document.createElement('span');
    categoryChip.className = 'category-chip';
    categoryChip.textContent = item.category;
    contentSection.appendChild(categoryChip);
  }

  if (item.description) {
    const description = document.createElement('p');
    description.className = 'product-description';
    description.textContent = item.description;
    contentSection.appendChild(description);
  }

  if (item.price) {
    const price = document.createElement('div');
    price.className = 'product-price';
    price.textContent = item.price;
    contentSection.appendChild(price);
  }

  card.appendChild(contentSection);
  block.appendChild(card);
}
