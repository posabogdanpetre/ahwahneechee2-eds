// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = {
  name: "Men's Nano Puff Jacket",
  description: "Lightweight, windproof, and water-resistant insulation for cold conditions. Made with 100% recycled materials.",
  price: "$249",
  category: "Insulated Jackets",
  materials: "100% recycled polyester with PrimaLoft Gold Insulation Eco",
  features: "Zippered hand pockets, elastic cuffs, drawcord hem, packable design",
  fit: "Regular",
  image_url: "https://www.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw123/images/hi-res/84212_SMDB_FR1.jpg"
};

// Brand palette from BuildWidgetRequest — used to derive card background.
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
  return {
    bg:`#${dr.toString(16).padStart(2,'0')}${dg.toString(16).padStart(2,'0')}${db.toString(16).padStart(2,'0')}`,
    fg:'#ffffff'
  };
}

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
      product = structuredContent || {};
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
  const theme = getThemedCardBg(PALETTE);
  const CARD_COLORS = ['#378ef0','#9256d9','#0fb5ae','#e68619','#d83790','#2dca72','#4046ca','#72b340'];
  const fallbackColor = CARD_COLORS[0];

  const card = document.createElement('div');
  card.className = 'product-card';

  // Image container (left side)
  const imageContainer = document.createElement('div');
  imageContainer.className = 'product-image';

  const imageWrapper = document.createElement('div');
  imageWrapper.className = 'image-wrapper';

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
      if (img.parentNode) img.parentNode.replaceChild(colorDiv(), img);
    };
    imageWrapper.appendChild(img);
  } else {
    imageWrapper.appendChild(colorDiv());
  }

  imageContainer.appendChild(imageWrapper);

  // CTA button on image
  const ctaBtn = document.createElement('button');
  ctaBtn.className = 'cta-btn';
  ctaBtn.textContent = 'Shop Now';
  ctaBtn.setAttribute('aria-label', `Shop ${product.name || 'this product'}`);
  if (bridge) {
    ctaBtn.addEventListener('click', () => {
      bridge.sendMessage(`I want to shop for ${product.name || 'this product'}`);
    });
  }
  imageContainer.appendChild(ctaBtn);

  card.appendChild(imageContainer);

  // Content container (right side)
  const content = document.createElement('div');
  content.className = 'product-content';
  content.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  const name = document.createElement('h2');
  name.className = 'product-name';
  name.textContent = product.name || 'Product';
  content.appendChild(name);

  if (product.description) {
    const desc = document.createElement('p');
    desc.className = 'product-description';
    desc.textContent = product.description;
    content.appendChild(desc);
  }

  if (product.price) {
    const price = document.createElement('div');
    price.className = 'product-price';
    price.textContent = product.price;
    content.appendChild(price);
  }

  if (product.category) {
    const category = document.createElement('span');
    category.className = 'product-category';
    category.textContent = product.category;
    content.appendChild(category);
  }

  // Additional fields for detail view
  if (product.materials) {
    const materials = document.createElement('div');
    materials.className = 'product-detail';
    const label = document.createElement('strong');
    label.textContent = 'Materials: ';
    materials.appendChild(label);
    const text = document.createTextNode(product.materials);
    materials.appendChild(text);
    content.appendChild(materials);
  }

  if (product.features) {
    const features = document.createElement('div');
    features.className = 'product-detail';
    const label = document.createElement('strong');
    label.textContent = 'Features: ';
    features.appendChild(label);
    const text = document.createTextNode(product.features);
    features.appendChild(text);
    content.appendChild(features);
  }

  if (product.fit) {
    const fit = document.createElement('div');
    fit.className = 'product-detail';
    const label = document.createElement('strong');
    label.textContent = 'Fit: ';
    fit.appendChild(label);
    const text = document.createTextNode(product.fit);
    fit.appendChild(text);
    content.appendChild(fit);
  }

  card.appendChild(content);
  block.appendChild(card);
}
