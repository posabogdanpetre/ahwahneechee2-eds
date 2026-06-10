// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: 'Better Sweater™ Fleece Jacket',
    description: 'Warm 100% recycled polyester full-zip jacket with sweater-knit aesthetic and Fair Trade Certified construction.',
    price: '£130',
    category: 'Fleece',
    image_url: 'https://www.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw8e8e8e8e/images/hi-res/25528_BLK.jpg'
  },
  {
    name: 'Black Hole® Duffel 55L',
    description: 'Legendary 55-liter duffel with weather-resistant 100% recycled fabric and removable backpack straps.',
    price: '£160',
    category: 'Packs & Gear',
    image_url: 'https://www.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw1234567/images/hi-res/49340_BLK.jpg'
  },
  {
    name: 'Nano Puff® Jacket',
    description: 'Lightweight, windproof insulated jacket with 60g PrimaLoft Gold Eco insulation and recycled shell.',
    price: '£230',
    category: 'Jackets & Vests',
    image_url: 'https://www.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw9876543/images/hi-res/84212_SMDB.jpg'
  },
  {
    name: 'Baggies™ Shorts 5"',
    description: 'Quick-drying multifunctional shorts with a DWR finish, perfect for water and land.',
    price: '£55',
    category: 'Shorts',
    image_url: 'https://www.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw5555555/images/hi-res/57021_NUVG.jpg'
  },
  {
    name: 'Capilene® Cool Daily Shirt',
    description: 'Lightweight moisture-wicking tee with HeiQ Fresh odor control and Fair Trade Certified.',
    price: '£40',
    category: 'T-Shirts',
    image_url: 'https://www.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw7777777/images/hi-res/45235_WHI.jpg'
  }
];

// Brand palette from BuildWidgetRequest — empty array means fallback colors will be used.
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
    const mid=(lo+hi)/2;
    if (relLum(Math.round(r*mid),Math.round(g*mid),Math.round(b*mid)) > 0.12) hi=mid; else lo=mid;
  }
  const dr=Math.round(r*lo), dg=Math.round(g*lo), db=Math.round(b*lo);
  return { bg:`#${dr.toString(16).padStart(2,'0')}${dg.toString(16).padStart(2,'0')}${db.toString(16).padStart(2,'0')}`, fg:'#ffffff' };
}

const theme = getThemedCardBg(PALETTE);

const CARD_COLORS = ['#378ef0','#9256d9','#0fb5ae','#e68619','#d83790','#2dca72','#4046ca','#72b340'];

export default async function decorate(block, bridge) {
  let product;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      product = SAMPLE_DATA[0];
    } else {
      // Output schema is a single object, not an array.
      // structuredContent IS the product object directly.
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      product = structuredContent;
    }
  } else {
    // Standalone EDS preview
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
    const empty = document.createElement('p');
    empty.textContent = 'No product data available.';
    empty.style.cssText = 'padding:1rem;text-align:center;color:#666;';
    block.appendChild(empty);
    return;
  }

  const card = document.createElement('div');
  card.className = 'product-detail-card';

  // Left: Image container with CTA button
  const imageSection = document.createElement('div');
  imageSection.className = 'product-image-section';

  const imageContainer = document.createElement('div');
  imageContainer.className = 'product-image-container';

  const fallbackColor = CARD_COLORS[0];
  const colorDiv = () => {
    const d = document.createElement('div');
    d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
    return d;
  };

  if (product.image_url) {
    const img = document.createElement('img');
    img.src = product.image_url;
    img.alt = product.name || 'Product image';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    img.onerror = () => {
      if (img.parentNode) {
        img.parentNode.replaceChild(colorDiv(), img);
      }
    };
    imageContainer.appendChild(img);
  } else {
    imageContainer.appendChild(colorDiv());
  }

  imageSection.appendChild(imageContainer);

  // CTA button on image
  const ctaBtn = document.createElement('button');
  ctaBtn.className = 'cta-btn';
  ctaBtn.textContent = 'Shop Now';
  ctaBtn.setAttribute('aria-label', `Shop ${product.name || 'this product'}`);
  if (bridge) {
    ctaBtn.addEventListener('click', () => {
      bridge.sendMessage(`I want to buy the ${product.name}`);
    });
  }
  imageSection.appendChild(ctaBtn);

  card.appendChild(imageSection);

  // Right: Content section with darkened palette background
  const contentSection = document.createElement('div');
  contentSection.className = 'product-content-section';
  contentSection.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  // Product name
  const nameEl = document.createElement('h2');
  nameEl.className = 'product-name';
  nameEl.textContent = product.name || 'Product';
  contentSection.appendChild(nameEl);

  // Description
  if (product.description) {
    const descEl = document.createElement('p');
    descEl.className = 'product-description';
    descEl.textContent = product.description;
    contentSection.appendChild(descEl);
  }

  // Price
  if (product.price) {
    const priceEl = document.createElement('div');
    priceEl.className = 'product-price';
    priceEl.textContent = product.price;
    contentSection.appendChild(priceEl);
  }

  // Category chip
  if (product.category) {
    const categoryEl = document.createElement('span');
    categoryEl.className = 'product-category';
    categoryEl.textContent = product.category;
    contentSection.appendChild(categoryEl);
  }

  card.appendChild(contentSection);
  block.appendChild(card);
}