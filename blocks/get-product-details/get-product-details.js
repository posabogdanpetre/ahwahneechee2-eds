// Sample data for standalone EDS preview (no bridge).
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_PRODUCT = {
  name: 'Men\'s Nano Puff Jacket',
  price: '£179',
  description: 'Warm, windproof, water-resistant—the Nano Puff Jacket uses incredibly lightweight and highly compressible 60-g PrimaLoft Gold Insulation Eco and has a 100% recycled polyester shell and lining.',
  category: 'Insulated Jackets',
  fit: 'Regular Fit',
  weight: '337 g',
  materials: '100% Recycled Polyester with 60-g PrimaLoft Gold Insulation Eco',
  rating: 4.7,
  review_count: 1243,
  certifications: 'Fair Trade Certified, bluesign approved',
  image_url: 'https://www.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw3f3e8f3f/images/hi-res/84212_NENA.jpg'
};

// Brand palette from BuildWidgetRequest — empty array, using fallbacks.
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
      product = SAMPLE_PRODUCT;
    } else {
      // Single object output — structuredContent is the product object itself
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      product = structuredContent || SAMPLE_PRODUCT;
    }
  } else {
    product = SAMPLE_PRODUCT;
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

  // Left side: Image with CTA
  const imageSection = document.createElement('div');
  imageSection.className = 'product-image-section';

  const CARD_COLORS = ['#378ef0','#9256d9','#0fb5ae','#e68619','#d83790','#2dca72','#4046ca','#72b340'];
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
    img.className = 'product-image';
    img.onerror = () => img.parentNode.replaceChild(colorDiv(), img);
    imageSection.appendChild(img);
  } else {
    imageSection.appendChild(colorDiv());
  }

  const ctaBtn = document.createElement('button');
  ctaBtn.className = 'shop-now-btn';
  ctaBtn.textContent = 'Shop Now';
  if (bridge) {
    ctaBtn.addEventListener('click', () => {
      bridge.sendMessage(`I'd like to purchase the ${product.name}`);
    });
  }
  imageSection.appendChild(ctaBtn);

  card.appendChild(imageSection);

  // Right side: Product details
  const detailsSection = document.createElement('div');
  detailsSection.className = 'product-details-section';
  detailsSection.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  const name = document.createElement('h2');
  name.className = 'product-name';
  name.textContent = product.name || 'Product';
  detailsSection.appendChild(name);

  if (product.category) {
    const categoryChip = document.createElement('span');
    categoryChip.className = 'category-chip';
    categoryChip.textContent = product.category;
    detailsSection.appendChild(categoryChip);
  }

  if (product.description) {
    const desc = document.createElement('p');
    desc.className = 'product-description';
    desc.textContent = product.description;
    detailsSection.appendChild(desc);
  }

  if (product.price) {
    const price = document.createElement('div');
    price.className = 'product-price';
    price.textContent = product.price;
    detailsSection.appendChild(price);
  }

  // Additional specs
  const specsContainer = document.createElement('div');
  specsContainer.className = 'product-specs';

  if (product.fit) {
    const fitSpec = document.createElement('div');
    fitSpec.className = 'spec-item';
    const fitLabel = document.createElement('span');
    fitLabel.className = 'spec-label';
    fitLabel.textContent = 'Fit: ';
    const fitValue = document.createElement('span');
    fitValue.textContent = product.fit;
    fitSpec.appendChild(fitLabel);
    fitSpec.appendChild(fitValue);
    specsContainer.appendChild(fitSpec);
  }

  if (product.weight) {
    const weightSpec = document.createElement('div');
    weightSpec.className = 'spec-item';
    const weightLabel = document.createElement('span');
    weightLabel.className = 'spec-label';
    weightLabel.textContent = 'Weight: ';
    const weightValue = document.createElement('span');
    weightValue.textContent = product.weight;
    weightSpec.appendChild(weightLabel);
    weightSpec.appendChild(weightValue);
    specsContainer.appendChild(weightSpec);
  }

  if (product.materials) {
    const materialsSpec = document.createElement('div');
    materialsSpec.className = 'spec-item';
    const materialsLabel = document.createElement('span');
    materialsLabel.className = 'spec-label';
    materialsLabel.textContent = 'Materials: ';
    const materialsValue = document.createElement('span');
    materialsValue.textContent = product.materials;
    materialsSpec.appendChild(materialsLabel);
    materialsSpec.appendChild(materialsValue);
    specsContainer.appendChild(materialsSpec);
  }

  if (product.rating && product.review_count) {
    const ratingSpec = document.createElement('div');
    ratingSpec.className = 'spec-item rating-item';
    const ratingText = document.createElement('span');
    ratingText.textContent = `★ ${product.rating} (${product.review_count} reviews)`;
    ratingSpec.appendChild(ratingText);
    specsContainer.appendChild(ratingSpec);
  }

  if (product.certifications) {
    const certsSpec = document.createElement('div');
    certsSpec.className = 'spec-item certifications-item';
    const certsLabel = document.createElement('span');
    certsLabel.className = 'spec-label';
    certsLabel.textContent = 'Certifications: ';
    const certsValue = document.createElement('span');
    certsValue.textContent = product.certifications;
    certsSpec.appendChild(certsLabel);
    certsSpec.appendChild(certsValue);
    specsContainer.appendChild(certsSpec);
  }

  detailsSection.appendChild(specsContainer);
  card.appendChild(detailsSection);
  block.appendChild(card);
}
