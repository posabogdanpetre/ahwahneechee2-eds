// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = {
  name: 'Men\'s Nano Puff® Jacket',
  description: 'Lightweight, windproof, water-resistant PrimaLoft® Gold Insulation Eco jacket with a 100% recycled polyester shell and lining. Warm, compressible insulation for cold, dry conditions.',
  price: '£200',
  category: 'Insulated Jackets',
  materials: '100% recycled polyester ripstop shell with PrimaLoft® Gold Insulation Eco 60-g',
  weight: '337 g',
  available_sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  image_url: 'https://www.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw3c8a8e3d/images/hi-res/84212_BLK_FD1.jpg'
};

// Brand palette from BuildWidgetRequest.
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
  const card = document.createElement('div');
  card.className = 'product-detail-card';

  // Image container (left side)
  const imageContainer = document.createElement('div');
  imageContainer.className = 'product-image';

  const fallbackColor = '#378ef0';
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

    // CTA button on image
    const ctaBtn = document.createElement('button');
    ctaBtn.className = 'image-cta';
    ctaBtn.textContent = 'Shop Now';
    if (bridge) {
      ctaBtn.addEventListener('click', () => {
        bridge.sendMessage(`I want to buy the ${product.name}`);
      });
    }
    imageContainer.appendChild(ctaBtn);
  } else {
    imageContainer.appendChild(colorDiv());
  }

  card.appendChild(imageContainer);

  // Content container (right side)
  const content = document.createElement('div');
  content.className = 'product-content';
  content.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  // Name
  const name = document.createElement('h2');
  name.className = 'product-name';
  name.textContent = product.name || 'Product';
  content.appendChild(name);

  // Category badge
  if (product.category) {
    const badge = document.createElement('span');
    badge.className = 'category-badge';
    badge.textContent = product.category;
    content.appendChild(badge);
  }

  // Description
  if (product.description) {
    const desc = document.createElement('p');
    desc.className = 'product-description';
    desc.textContent = product.description;
    content.appendChild(desc);
  }

  // Price
  if (product.price) {
    const price = document.createElement('div');
    price.className = 'product-price';
    price.textContent = product.price;
    content.appendChild(price);
  }

  // Specs section
  const specsContainer = document.createElement('div');
  specsContainer.className = 'product-specs';

  if (product.materials) {
    const materialsLabel = document.createElement('div');
    materialsLabel.className = 'spec-label';
    materialsLabel.textContent = 'Materials';
    specsContainer.appendChild(materialsLabel);

    const materialsValue = document.createElement('div');
    materialsValue.className = 'spec-value';
    materialsValue.textContent = product.materials;
    specsContainer.appendChild(materialsValue);
  }

  if (product.weight) {
    const weightLabel = document.createElement('div');
    weightLabel.className = 'spec-label';
    weightLabel.textContent = 'Weight';
    specsContainer.appendChild(weightLabel);

    const weightValue = document.createElement('div');
    weightValue.className = 'spec-value';
    weightValue.textContent = product.weight;
    specsContainer.appendChild(weightValue);
  }

  if (product.available_sizes && product.available_sizes.length > 0) {
    const sizesLabel = document.createElement('div');
    sizesLabel.className = 'spec-label';
    sizesLabel.textContent = 'Available Sizes';
    specsContainer.appendChild(sizesLabel);

    const sizesValue = document.createElement('div');
    sizesValue.className = 'spec-value';
    sizesValue.textContent = product.available_sizes.join(', ');
    specsContainer.appendChild(sizesValue);
  }

  content.appendChild(specsContainer);

  card.appendChild(content);
  block.appendChild(card);
}
