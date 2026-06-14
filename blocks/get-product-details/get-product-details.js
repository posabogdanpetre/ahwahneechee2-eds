// Sample data for standalone preview (no bridge).
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = {
  name: "Men's Micro D Fleece Jacket",
  description: "Made with 100% recycled polyester, feels unbelievably soft, provides continual warmth, and dries quickly.",
  image_url: "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dwe09856fd/images/hi-res/26171_ELGR.jpg?sw=1400&sh=1400&sfrm=png&q=90&bgcolor=f3f4ef",
  price: "£63",
  category: "Men's Fleece"
};

// Brand palette from BuildWidgetRequest.
const PALETTE = ['#1a1a1a', '#2b6cb0'];

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
    bg: `#${dr.toString(16).padStart(2,'0')}${dg.toString(16).padStart(2,'0')}${db.toString(16).padStart(2,'0')}`,
    fg: '#ffffff'
  };
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
  const CARD_COLORS = ['#378ef0','#9256d9','#0fb5ae','#e68619','#d83790','#2dca72','#4046ca','#72b340'];
  const fallbackColor = CARD_COLORS[0];

  const card = document.createElement('div');
  card.className = 'product-card';

  // Image container (left side)
  const imageContainer = document.createElement('div');
  imageContainer.className = 'product-image';

  const colorDiv = () => {
    const d = document.createElement('div');
    d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
    return d;
  };

  if (item.image_url) {
    const img = document.createElement('img');
    img.src = item.image_url;
    img.alt = item.name || 'Product image';
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

  // CTA button on image
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

  card.appendChild(imageContainer);

  // Content container (right side)
  const content = document.createElement('div');
  content.className = 'product-content';
  content.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  const name = document.createElement('h2');
  name.className = 'product-name';
  name.textContent = item.name || 'Product';
  content.appendChild(name);

  if (item.description) {
    const desc = document.createElement('p');
    desc.className = 'product-description';
    desc.textContent = item.description;
    content.appendChild(desc);
  }

  if (item.price) {
    const price = document.createElement('div');
    price.className = 'product-price';
    price.textContent = item.price;
    content.appendChild(price);
  }

  if (item.category) {
    const category = document.createElement('span');
    category.className = 'product-category';
    category.textContent = item.category;
    content.appendChild(category);
  }

  // Specs section (if available)
  const hasSpecs = item.materials || item.weight || (item.colors && item.colors.length) || 
                   item.rating || item.review_count || (item.certifications && item.certifications.length);
  
  if (hasSpecs) {
    const specs = document.createElement('dl');
    specs.className = 'product-specs';

    if (item.materials) {
      const dt1 = document.createElement('dt');
      dt1.textContent = 'Materials';
      specs.appendChild(dt1);
      const dd1 = document.createElement('dd');
      dd1.textContent = item.materials;
      specs.appendChild(dd1);
    }

    if (item.weight) {
      const dt2 = document.createElement('dt');
      dt2.textContent = 'Weight';
      specs.appendChild(dt2);
      const dd2 = document.createElement('dd');
      dd2.textContent = item.weight;
      specs.appendChild(dd2);
    }

    if (item.colors && item.colors.length) {
      const dt3 = document.createElement('dt');
      dt3.textContent = 'Colors';
      specs.appendChild(dt3);
      const dd3 = document.createElement('dd');
      dd3.textContent = item.colors.join(', ');
      specs.appendChild(dd3);
    }

    if (item.rating) {
      const dt4 = document.createElement('dt');
      dt4.textContent = 'Rating';
      specs.appendChild(dt4);
      const dd4 = document.createElement('dd');
      dd4.textContent = `${item.rating}/5${item.review_count ? ` (${item.review_count} reviews)` : ''}`;
      specs.appendChild(dd4);
    }

    if (item.certifications && item.certifications.length) {
      const dt5 = document.createElement('dt');
      dt5.textContent = 'Certifications';
      specs.appendChild(dt5);
      const dd5 = document.createElement('dd');
      dd5.textContent = item.certifications.join(', ');
      specs.appendChild(dd5);
    }

    content.appendChild(specs);
  }

  card.appendChild(content);
  block.appendChild(card);
}