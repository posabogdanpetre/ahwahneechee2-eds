// Sample data for standalone EDS preview (no bridge).
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    "name": "Men's Nano Puff Insulated Jacket",
    "description": "Weather-resistant, lightweight and packable synthetic insulation layer that stays warm when wet.",
    "image_url": "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw8079c0d9/images/hi-res/84213_BLSG.jpg",
    "price": "£170",
    "category": "Jackets"
  },
  {
    "name": "Men's Torrentshell 3L Rain Jacket",
    "description": "Waterproof and breathable 3-layer rain jacket providing excellent performance and durability.",
    "image_url": "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw3f39aea6/images/hi-res/85241_LMST.jpg",
    "price": "£180",
    "category": "Jackets"
  },
  {
    "name": "Women's Better Sweater Fleece Jacket",
    "description": "Full-zip jacket made of warm, 100% recycled polyester fleece.",
    "image_url": "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dwb74b05e1/images/hi-res/25543_NENA.jpg",
    "price": "£130",
    "category": "Fleece"
  }
];

// Brand palette from BuildWidgetRequest.
const PALETTE = ['#1a1a1a', '#2d6ae0'];

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
  return {
    bg:`#${dr.toString(16).padStart(2,'0')}${dg.toString(16).padStart(2,'0')}${db.toString(16).padStart(2,'0')}`,
    fg:'#ffffff'
  };
}

const theme = getThemedCardBg(PALETTE);

export default async function decorate(block, bridge) {
  let product;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      product = SAMPLE_DATA[0];
    } else {
      const result = await bridge.toolResult;
      const structuredContent = result?.structuredContent || result;
      product = structuredContent;
    }
  } else {
    product = SAMPLE_DATA[0];
  }

  block.textContent = '';
  renderProduct(block, product, bridge);

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

function renderProduct(block, product, bridge) {
  if (!product) {
    block.textContent = 'No product data available.';
    return;
  }

  const card = document.createElement('div');
  card.className = 'product-detail-card';

  // Left side: Image with CTA button overlay
  const imageSection = document.createElement('div');
  imageSection.className = 'product-image-section';

  if (product.image_url) {
    const img = document.createElement('img');
    img.src = product.image_url;
    img.alt = product.name || 'Product image';
    img.className = 'product-image';

    const fallbackColor = '#2d6ae0';
    img.onerror = () => {
      const colorDiv = document.createElement('div');
      colorDiv.className = 'product-image-fallback';
      colorDiv.style.cssText = `background-color:${fallbackColor};`;
      img.parentNode.replaceChild(colorDiv, img);
    };

    imageSection.appendChild(img);
  } else {
    const colorDiv = document.createElement('div');
    colorDiv.className = 'product-image-fallback';
    colorDiv.style.cssText = 'background-color:#2d6ae0;';
    imageSection.appendChild(colorDiv);
  }

  // CTA button on image
  const ctaBtn = document.createElement('button');
  ctaBtn.className = 'product-cta';
  ctaBtn.textContent = 'Shop Now';
  ctaBtn.setAttribute('aria-label', `Shop ${product.name || 'product'}`);

  if (bridge && product.url) {
    ctaBtn.addEventListener('click', () => {
      bridge.openLink(product.url);
    });
  } else if (product.url) {
    ctaBtn.addEventListener('click', () => {
      window.open(product.url, '_blank');
    });
  } else if (bridge) {
    ctaBtn.addEventListener('click', () => {
      bridge.sendMessage(`Tell me more about ${product.name}`);
    });
  }

  imageSection.appendChild(ctaBtn);
  card.appendChild(imageSection);

  // Right side: Product info with darkened palette background
  const infoSection = document.createElement('div');
  infoSection.className = 'product-info-section';
  infoSection.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

  // Category badge
  if (product.category) {
    const badge = document.createElement('span');
    badge.className = 'product-category';
    badge.textContent = product.category;
    infoSection.appendChild(badge);
  }

  // Product name
  const name = document.createElement('h2');
  name.className = 'product-name';
  name.textContent = product.name || 'Product';
  infoSection.appendChild(name);

  // Description
  const desc = document.createElement('p');
  desc.className = 'product-description';
  desc.textContent = product.description || '';
  infoSection.appendChild(desc);

  // Price
  if (product.price) {
    const price = document.createElement('div');
    price.className = 'product-price';
    price.textContent = product.price;
    infoSection.appendChild(price);
  }

  card.appendChild(infoSection);
  block.appendChild(card);
}