// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    "name": "Women's Better Sweater Fleece Jacket",
    "description": "Full-zip jacket made of warm, 100% recycled polyester fleece.",
    "image_url": "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw0e491b7c/images/hi-res/25543_STH.jpg",
    "price": "",
    "category": "Women's Fleece"
  },
  {
    "name": "Men's Houdini Windbreaker Jacket",
    "description": "Packable, featherweight windproof shell made from 100% recycled nylon.",
    "image_url": "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw4c81478a/images/hi-res/24142_BLK.jpg",
    "price": "",
    "category": "Men's Jackets"
  },
  {
    "name": "Women's Retro Pile Fleece Jacket",
    "description": "Heritage-inspired jacket made with 100% recycled polyester deep-pile fleece.",
    "image_url": "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw5e1dce1a/images/hi-res/22795_NAT.jpg",
    "price": "",
    "category": "Women's Fleece"
  },
  {
    "name": "Women's Better Sweater 1/4-Zip Fleece Pullover",
    "description": "Quarter-zip pullover with sweater-knit aesthetic in 100% recycled polyester.",
    "image_url": "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dwb3c2fcac/images/hi-res/25618_BCW.jpg",
    "price": "",
    "category": "Women's Fleece"
  },
  {
    "name": "Men's Windsweep Lightweight Windbreaker Jacket",
    "description": "Lightweight, packable windbreaker for everyday adventures.",
    "image_url": "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw9a7b312e/images/hi-res/20320_INK.jpg",
    "price": "",
    "category": "Men's Jackets"
  }
];

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
  const theme = getThemedCardBg(PALETTE);
  renderDetailCard(block, item, theme, bridge);

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

function renderDetailCard(block, item, theme, bridge) {
  const card = document.createElement('div');
  card.className = 'detail-card';

  const imageContainer = document.createElement('div');
  imageContainer.className = 'image-container';

  const CARD_COLORS = ['#378ef0','#9256d9','#0fb5ae','#e68619','#d83790','#2dca72','#4046ca','#72b340'];
  const fallbackColor = CARD_COLORS[0];

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
    img.onerror = () => {
      if (img.parentNode) img.parentNode.replaceChild(colorDiv(), img);
    };
    imageContainer.appendChild(img);

    const ctaBtn = document.createElement('button');
    ctaBtn.className = 'cta-btn';
    ctaBtn.textContent = 'Shop Now';
    ctaBtn.setAttribute('aria-label', `Shop ${item.name || 'product'}`);
    if (bridge) {
      ctaBtn.addEventListener('click', () => {
        bridge.sendMessage(`I want to shop for ${item.name || 'this product'}`);
      });
    }
    imageContainer.appendChild(ctaBtn);
  } else {
    imageContainer.appendChild(colorDiv());
  }

  card.appendChild(imageContainer);

  const content = document.createElement('div');
  content.className = 'content';
  content.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  const name = document.createElement('h2');
  name.className = 'product-name';
  name.textContent = item.name || 'Product';
  content.appendChild(name);

  if (item.category) {
    const categoryChip = document.createElement('span');
    categoryChip.className = 'category-chip';
    categoryChip.textContent = item.category;
    content.appendChild(categoryChip);
  }

  if (item.description) {
    const desc = document.createElement('p');
    desc.className = 'description';
    desc.textContent = item.description;
    content.appendChild(desc);
  }

  if (item.price) {
    const priceEl = document.createElement('div');
    priceEl.className = 'price';
    priceEl.textContent = typeof item.price === 'number' ? `£${item.price.toFixed(2)}` : item.price;
    content.appendChild(priceEl);
  }

  if (item.material) {
    const materialEl = document.createElement('div');
    materialEl.className = 'material';
    const label = document.createElement('strong');
    label.textContent = 'Material: ';
    materialEl.appendChild(label);
    const value = document.createTextNode(item.material);
    materialEl.appendChild(value);
    content.appendChild(materialEl);
  }

  if (item.features && Array.isArray(item.features) && item.features.length > 0) {
    const featuresEl = document.createElement('div');
    featuresEl.className = 'features';
    const label = document.createElement('strong');
    label.textContent = 'Features:';
    featuresEl.appendChild(label);
    const list = document.createElement('ul');
    item.features.forEach(feature => {
      const li = document.createElement('li');
      li.textContent = feature;
      list.appendChild(li);
    });
    featuresEl.appendChild(list);
    content.appendChild(featuresEl);
  }

  if (item.certifications) {
    const certEl = document.createElement('div');
    certEl.className = 'certifications';
    const label = document.createElement('strong');
    label.textContent = 'Certifications: ';
    certEl.appendChild(label);
    const value = document.createTextNode(item.certifications);
    certEl.appendChild(value);
    content.appendChild(certEl);
  }

  card.appendChild(content);
  block.appendChild(card);
}
