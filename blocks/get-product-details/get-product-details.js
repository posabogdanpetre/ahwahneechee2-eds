// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = {
  name: "Men's Boulder Fork Rain Jacket",
  description: "Low-profile 3-layer shell with exceptional waterproof/breathable protection.",
  image_url: "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dwe30ba363/images/hi-res/85140_SMDB.jpg?sw=1400&sh=1400&sfrm=png&q=90&bgcolor=f3f4ef",
  price: "£250",
  category: "Men's Jackets",
  materials: "100% recycled nylon with H2No Performance Standard",
  available_colors: ["Smolder Blue", "Black", "Basin Green"],
  available_sizes: ["S", "M", "L", "XL", "XXL"],
  sustainability: "Fair Trade Certified, 100% recycled materials"
};

// Brand palette from BuildWidgetRequest
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
  renderProduct(block, item, bridge, theme);

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

function renderProduct(block, item, bridge, theme) {
  const card = document.createElement('div');
  card.className = 'product-detail-card';

  // Left side: Image with CTA button
  const imageSection = document.createElement('div');
  imageSection.className = 'product-image-section';

  const imageContainer = document.createElement('div');
  imageContainer.className = 'product-image-container';

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
    img.onerror = () => img.parentNode.replaceChild(colorDiv(), img);
    imageContainer.appendChild(img);
  } else {
    imageContainer.appendChild(colorDiv());
  }

  const ctaBtn = document.createElement('button');
  ctaBtn.className = 'product-cta';
  ctaBtn.textContent = 'Shop Now';
  ctaBtn.setAttribute('aria-label', `Shop ${item.name || 'product'}`);
  if (bridge) {
    ctaBtn.addEventListener('click', () => {
      bridge.sendMessage(`I want to buy ${item.name}`);
    });
  }

  imageSection.appendChild(imageContainer);
  imageSection.appendChild(ctaBtn);

  // Right side: Product details
  const detailsSection = document.createElement('div');
  detailsSection.className = 'product-details-section';

  const name = document.createElement('h2');
  name.className = 'product-name';
  name.textContent = item.name || '';
  detailsSection.appendChild(name);

  if (item.category) {
    const category = document.createElement('span');
    category.className = 'product-category';
    category.textContent = item.category;
    detailsSection.appendChild(category);
  }

  if (item.description) {
    const desc = document.createElement('p');
    desc.className = 'product-description';
    desc.textContent = item.description;
    detailsSection.appendChild(desc);
  }

  if (item.price) {
    const price = document.createElement('div');
    price.className = 'product-price';
    price.textContent = item.price;
    detailsSection.appendChild(price);
  }

  if (item.materials) {
    const materialsLabel = document.createElement('div');
    materialsLabel.className = 'product-label';
    materialsLabel.textContent = 'Materials';
    detailsSection.appendChild(materialsLabel);

    const materials = document.createElement('div');
    materials.className = 'product-value';
    materials.textContent = item.materials;
    detailsSection.appendChild(materials);
  }

  if (item.available_colors && item.available_colors.length > 0) {
    const colorsLabel = document.createElement('div');
    colorsLabel.className = 'product-label';
    colorsLabel.textContent = 'Available Colors';
    detailsSection.appendChild(colorsLabel);

    const colors = document.createElement('div');
    colors.className = 'product-value';
    colors.textContent = item.available_colors.join(', ');
    detailsSection.appendChild(colors);
  }

  if (item.available_sizes && item.available_sizes.length > 0) {
    const sizesLabel = document.createElement('div');
    sizesLabel.className = 'product-label';
    sizesLabel.textContent = 'Available Sizes';
    detailsSection.appendChild(sizesLabel);

    const sizes = document.createElement('div');
    sizes.className = 'product-value';
    sizes.textContent = item.available_sizes.join(', ');
    detailsSection.appendChild(sizes);
  }

  if (item.sustainability) {
    const sustainLabel = document.createElement('div');
    sustainLabel.className = 'product-label';
    sustainLabel.textContent = 'Sustainability';
    detailsSection.appendChild(sustainLabel);

    const sustain = document.createElement('div');
    sustain.className = 'product-value';
    sustain.textContent = item.sustainability;
    detailsSection.appendChild(sustain);
  }

  card.appendChild(imageSection);
  card.appendChild(detailsSection);
  block.appendChild(card);
}
