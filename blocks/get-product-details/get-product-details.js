// Sample data for standalone EDS preview (no bridge).
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = {
  name: "Men's Textured Fleece Jacket",
  description: "Soft, quick-drying jacket in 100% recycled fabric with pebbled texture, built for warmth and everyday wear.",
  image_url: "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw52d6c1f7/images/hi-res/23310_WSTO.jpg?sw=512&sh=512&sfrm=png&q=95&bgcolor=f3f4ef",
  price: "£150",
  category: "Men's Fleece"
};

// Brand palette from BuildWidgetRequest
const PALETTE = [];

// Color fallback for missing images
const CARD_COLOR = '#378ef0';

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
  for (let i=0; i<20; i++) { const m=(lo+hi)/2; if (relLum(Math.round(r*m),Math.round(g*m),Math.round(b*m)) > 0.12) hi=m; else lo=m; }
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
      item = SAMPLE_DATA;
    } else {
      // Detail concept — structuredContent IS the item (flat). Do NOT look for a wrapper key.
      const _result = await bridge.toolResult;
      item = (_result?.structuredContent || _result) || {};
    }
  } else {
    item = SAMPLE_DATA;
  }

  block.textContent = '';
  renderProduct(block, item, bridge);

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

function renderProduct(block, item, bridge) {
  const card = document.createElement('div');
  card.className = 'product-detail-card';

  // Left: Image section
  const imageSection = document.createElement('div');
  imageSection.className = 'product-image-section';

  if (item.image_url) {
    const img = document.createElement('img');
    img.src = item.image_url;
    img.alt = item.name || 'Product image';
    img.onerror = () => {
      const colorDiv = document.createElement('div');
      colorDiv.style.cssText = `width:100%;height:100%;background-color:${CARD_COLOR};`;
      img.parentNode.replaceChild(colorDiv, img);
    };
    imageSection.appendChild(img);
  } else {
    const colorDiv = document.createElement('div');
    colorDiv.style.cssText = `width:100%;height:100%;background-color:${CARD_COLOR};`;
    imageSection.appendChild(colorDiv);
  }

  // CTA button on image
  const ctaBtn = document.createElement('button');
  ctaBtn.className = 'cta-button';
  ctaBtn.textContent = 'More Details';
  ctaBtn.setAttribute('aria-label', `View more details about ${item.name || 'this product'}`);
  if (bridge) {
    ctaBtn.addEventListener('click', () => {
      bridge.sendMessage(`Tell me more about ${item.name || 'this product'}`);
    });
  }
  imageSection.appendChild(ctaBtn);

  // Right: Content section
  const contentSection = document.createElement('div');
  contentSection.className = 'product-content-section';

  const name = document.createElement('h2');
  name.className = 'product-name';
  name.textContent = item.name || '';
  contentSection.appendChild(name);

  const description = document.createElement('p');
  description.className = 'product-description';
  description.textContent = item.description || '';
  contentSection.appendChild(description);

  const metaRow = document.createElement('div');
  metaRow.className = 'product-meta';

  if (item.price) {
    const price = document.createElement('span');
    price.className = 'product-price';
    price.textContent = item.price;
    metaRow.appendChild(price);
  }

  if (item.category) {
    const category = document.createElement('span');
    category.className = 'product-category';
    category.textContent = item.category;
    metaRow.appendChild(category);
  }

  contentSection.appendChild(metaRow);

  card.appendChild(imageSection);
  card.appendChild(contentSection);
  block.appendChild(card);
}
