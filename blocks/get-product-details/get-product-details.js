// Sample data for standalone EDS preview (no bridge).
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = {
  "name": "Men's Down Sweater Jacket",
  "description": "Lightweight, windproof jacket with 800-fill-power recycled down insulation and a recycled nylon ripstop shell.",
  "image_url": "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw3c83e113/images/hi-res/84675_CLOR.jpg?sw=800&sh=800&sfrm=png&q=95&bgcolor=f3f4ef",
  "price": "£230",
  "category": "Insulated Jackets"
};

// Brand palette from BuildWidgetRequest — used to derive card info-strip background.
const PALETTE = ['#1a1a1a', '#2d5f8a'];

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
      product = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // Single object output — no array wrapper
      product = structuredContent || SAMPLE_DATA;
    }
  } else {
    product = SAMPLE_DATA;
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
  const card = document.createElement('div');
  card.className = 'product-detail-card';
  card.style.cssText = `background: ${theme?.bg ?? '#1a1a1a'}; color: ${theme?.fg ?? '#fff'};`;

  // Image container (left side)
  const imageContainer = document.createElement('div');
  imageContainer.className = 'product-image-container';

  const CARD_COLOR = '#378ef0';
  const colorDiv = () => {
    const d = document.createElement('div');
    d.className = 'color-fallback';
    d.style.cssText = `background-color: ${CARD_COLOR};`;
    return d;
  };

  if (product.image_url) {
    const img = document.createElement('img');
    img.src = product.image_url;
    img.alt = product.name || 'Product image';
    img.onerror = () => {
      if (img.parentNode) {
        img.parentNode.replaceChild(colorDiv(), img);
      }
    };
    imageContainer.appendChild(img);
  } else {
    imageContainer.appendChild(colorDiv());
  }

  // CTA button on image
  const ctaBtn = document.createElement('button');
  ctaBtn.className = 'cta-overlay';
  ctaBtn.textContent = 'Shop Now';
  ctaBtn.setAttribute('aria-label', `Shop ${product.name || 'product'}`);
  if (bridge) {
    ctaBtn.addEventListener('click', () => {
      bridge.sendMessage(`I want to buy ${product.name || 'this product'}`);
    });
  }
  imageContainer.appendChild(ctaBtn);

  card.appendChild(imageContainer);

  // Product info (right side)
  const info = document.createElement('div');
  info.className = 'product-info';

  const name = document.createElement('h3');
  name.className = 'product-name';
  name.textContent = product.name || 'Product Name';
  info.appendChild(name);

  if (product.description) {
    const desc = document.createElement('p');
    desc.className = 'product-description';
    desc.textContent = product.description;
    info.appendChild(desc);
  }

  if (product.price) {
    const price = document.createElement('div');
    price.className = 'product-price';
    price.textContent = product.price;
    info.appendChild(price);
  }

  if (product.category) {
    const category = document.createElement('span');
    category.className = 'product-category';
    category.textContent = product.category;
    info.appendChild(category);
  }

  card.appendChild(info);
  block.appendChild(card);
}