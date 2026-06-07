// Sample data for standalone EDS preview (no bridge).
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    "name": "Men's Down Sweater Jacket",
    "description": "Lightweight, windproof jacket with 800-fill-power recycled down insulation and a recycled nylon ripstop shell.",
    "image_url": "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw3c83e113/images/hi-res/84675_CLOR.jpg?sw=800&sh=800&sfrm=png&q=95&bgcolor=f3f4ef",
    "price": "£230",
    "category": "Insulated Jackets"
  },
  {
    "name": "Women's Better Sweater Fleece Jacket",
    "description": "Warm 100% recycled polyester full-zip fleece jacket with a sweater-knit aesthetic.",
    "image_url": "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dwb74b05e1/images/hi-res/25543_NENA.jpg?sw=800&sh=800&sfrm=png&q=95&bgcolor=f3f4ef",
    "price": "£130",
    "category": "Fleece"
  },
  {
    "name": "Men's Torrentshell 3L Rain Jacket",
    "description": "Waterproof/breathable 3-layer rain jacket with H2No Performance Standard shell, made without PFAS.",
    "image_url": "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw3f39aea6/images/hi-res/85241_LMST.jpg?sw=800&sh=800&sfrm=png&q=95&bgcolor=f3f4ef",
    "price": "£180",
    "category": "Rain Jackets"
  }
];

// Brand palette from BuildWidgetRequest
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
    bg: `#${dr.toString(16).padStart(2,'0')}${dg.toString(16).padStart(2,'0')}${db.toString(16).padStart(2,'0')}`,
    fg: '#ffffff'
  };
}

const theme = getThemedCardBg(PALETTE);

export default async function decorate(block, bridge) {
  let products;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      products = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // structuredContent.products — bare array outputSchema; key derived from actionName "search_products"
      products = structuredContent?.products || [];
    }
  } else {
    products = SAMPLE_DATA;
  }

  block.textContent = '';
  renderProducts(block, products, bridge);

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

function renderProducts(block, products, bridge) {
  const CARD_COLORS = ['#378ef0','#9256d9','#0fb5ae','#e68619','#d83790','#2dca72','#4046ca','#72b340'];

  const wrapper = document.createElement('div');
  wrapper.className = 'carousel-wrapper';
  wrapper.style.cssText = 'position:relative;';

  const carousel = document.createElement('div');
  carousel.className = 'products-carousel';

  const displayProducts = products.slice(0, 5);

  displayProducts.forEach((product, i) => {
    const card = document.createElement('div');
    card.className = 'product-card';

    const imageContainer = document.createElement('div');
    imageContainer.className = 'product-image';

    const fallbackColor = CARD_COLORS[i % CARD_COLORS.length];
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
      img.onerror = () => img.parentNode.replaceChild(colorDiv(), img);
      imageContainer.appendChild(img);
    } else {
      imageContainer.appendChild(colorDiv());
    }

    const ctaBtn = document.createElement('button');
    ctaBtn.className = 'cta-button';
    ctaBtn.textContent = 'View Details';
    ctaBtn.setAttribute('aria-label', `View details for ${product.name}`);
    if (bridge) {
      ctaBtn.addEventListener('click', () => {
        bridge.sendMessage(`Tell me more about ${product.name}`);
      });
    }
    imageContainer.appendChild(ctaBtn);

    card.appendChild(imageContainer);

    const info = document.createElement('div');
    info.className = 'product-info';
    info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

    const name = document.createElement('div');
    name.className = 'product-name';
    name.textContent = product.name;
    info.appendChild(name);

    if (product.description) {
      const desc = document.createElement('div');
      desc.className = 'product-description';
      desc.textContent = product.description;
      info.appendChild(desc);
    }

    const footer = document.createElement('div');
    footer.className = 'product-footer';

    const price = document.createElement('span');
    price.className = 'product-price';
    price.textContent = product.price || '';
    footer.appendChild(price);

    if (product.category) {
      const badge = document.createElement('span');
      badge.className = 'product-badge';
      badge.textContent = product.category;
      footer.appendChild(badge);
    }

    info.appendChild(footer);
    card.appendChild(info);

    carousel.appendChild(card);
  });

  wrapper.appendChild(carousel);

  // Navigation arrows
  const leftArrow = document.createElement('button');
  leftArrow.className = 'nav-arrow nav-arrow-left';
  leftArrow.textContent = '◀';
  leftArrow.setAttribute('aria-label', 'Scroll left');
  leftArrow.style.display = 'none';
  leftArrow.addEventListener('click', () => {
    carousel.scrollBy({ left: -236, behavior: 'smooth' });
  });
  leftArrow.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      carousel.scrollBy({ left: -236, behavior: 'smooth' });
    }
  });

  const rightArrow = document.createElement('button');
  rightArrow.className = 'nav-arrow nav-arrow-right';
  rightArrow.textContent = '▶';
  rightArrow.setAttribute('aria-label', 'Scroll right');
  rightArrow.addEventListener('click', () => {
    carousel.scrollBy({ left: 236, behavior: 'smooth' });
  });
  rightArrow.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      carousel.scrollBy({ left: 236, behavior: 'smooth' });
    }
  });

  const updateArrows = () => {
    const atStart = carousel.scrollLeft <= 1;
    const atEnd = carousel.scrollLeft >= carousel.scrollWidth - carousel.clientWidth - 1;
    leftArrow.style.display = atStart ? 'none' : 'flex';
    rightArrow.style.display = atEnd ? 'none' : 'flex';
  };

  carousel.addEventListener('scroll', updateArrows);
  updateArrows();

  wrapper.appendChild(leftArrow);
  wrapper.appendChild(rightArrow);

  // Right fade gradient
  if (displayProducts.length > 1) {
    const fade = document.createElement('div');
    fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);pointer-events:none;border-radius:0 10px 10px 0;`;
    wrapper.appendChild(fade);
  }

  block.appendChild(wrapper);
}
