// Sample data for standalone EDS preview (no bridge).
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: "Men's Nano Puff Insulated Jacket",
    description: "Weather-resistant, lightweight and packable synthetic insulation layer that stays warm when wet.",
    image_url: "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw8079c0d9/images/hi-res/84213_BLSG.jpg",
    price: "£170",
    category: "Jackets"
  },
  {
    name: "Men's Torrentshell 3L Rain Jacket",
    description: "Waterproof and breathable 3-layer rain jacket providing excellent performance and durability.",
    image_url: "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw3f39aea6/images/hi-res/85241_LMST.jpg",
    price: "£180",
    category: "Jackets"
  },
  {
    name: "Women's Better Sweater Fleece Jacket",
    description: "Full-zip jacket made of warm, 100% recycled polyester fleece.",
    image_url: "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dwb74b05e1/images/hi-res/25543_NENA.jpg",
    price: "£130",
    category: "Fleece"
  },
  {
    name: "Women's Down Sweater Insulated Jacket",
    description: "Lightweight, windproof jacket with a recycled nylon shell and 800-fill-power down.",
    image_url: "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw4729f37a/images/hi-res/84684_BNLB.jpg",
    price: "£230",
    category: "Jackets"
  },
  {
    name: "Men's R1 Air Fleece Midlayer Jacket",
    description: "Lightweight, highly breathable and quick-drying technical fleece jacket for cool conditions.",
    image_url: "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dwce5a595b/images/hi-res/40275_CLOR.jpg",
    price: "£130",
    category: "Fleece"
  },
  {
    name: "Black Hole Pack 32L",
    description: "Weather-resistant pack perfect for the daily commute and rugged enough to haul around the globe.",
    image_url: "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dwa49c297f/images/hi-res/49302_SMFO.jpg",
    price: "£155",
    category: "Packs & Gear"
  }
];

// Brand palette from BuildWidgetRequest — used to derive card info strip background.
const PALETTE = ['#1a1a1a', '#2d6ae0'];

// Darken palette[0] to luminance ≤ 0.12 for WCAG AA contrast with white text.
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
  let items;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      items = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // structuredContent.products — bare array outputSchema; key derived from actionName "search_products"
      items = structuredContent?.products || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  block.textContent = '';
  renderProducts(block, items, bridge);

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
  const wrapper = document.createElement('div');
  wrapper.className = 'products-wrapper';

  const carousel = document.createElement('div');
  carousel.className = 'products-carousel';

  const CARD_COLORS = ['#378ef0','#9256d9','#0fb5ae','#e68619','#d83790','#2dca72','#4046ca','#72b340'];

  products.forEach((product, i) => {
    const card = document.createElement('div');
    card.className = 'product-card';

    // Image container with CTA overlay
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
      img.alt = product.name || '';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      img.onerror = () => img.parentNode.replaceChild(colorDiv(), img);
      imageContainer.appendChild(img);
    } else {
      imageContainer.appendChild(colorDiv());
    }

    // CTA button on image
    const ctaBtn = document.createElement('button');
    ctaBtn.className = 'cta-overlay';
    ctaBtn.textContent = 'View Details';
    if (bridge) {
      ctaBtn.addEventListener('click', () => {
        bridge.sendMessage(`Tell me more about ${product.name}`);
      });
    }
    imageContainer.appendChild(ctaBtn);

    card.appendChild(imageContainer);

    // Card content section with darkened palette background
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

    if (product.price) {
      const price = document.createElement('span');
      price.className = 'product-price';
      price.textContent = product.price;
      footer.appendChild(price);
    }

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

  // Navigation arrows
  const leftArrow = document.createElement('button');
  leftArrow.className = 'carousel-arrow carousel-arrow-left';
  leftArrow.setAttribute('aria-label', 'Scroll left');
  leftArrow.textContent = '◀';
  leftArrow.style.display = 'none';

  const rightArrow = document.createElement('button');
  rightArrow.className = 'carousel-arrow carousel-arrow-right';
  rightArrow.setAttribute('aria-label', 'Scroll right');
  rightArrow.textContent = '▶';

  const updateArrows = () => {
    const scrollLeft = carousel.scrollLeft;
    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
    leftArrow.style.display = scrollLeft <= 1 ? 'none' : 'flex';
    rightArrow.style.display = scrollLeft >= maxScroll - 1 ? 'none' : 'flex';
  };

  const scrollBy = (direction) => {
    const cardWidth = 220 + 16; // card width + gap
    carousel.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
  };

  leftArrow.addEventListener('click', () => scrollBy(-1));
  rightArrow.addEventListener('click', () => scrollBy(1));
  leftArrow.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollBy(-1);
    }
  });
  rightArrow.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollBy(1);
    }
  });

  carousel.addEventListener('scroll', updateArrows);
  updateArrows();

  // Right fade gradient
  const fade = document.createElement('div');
  fade.className = 'carousel-fade';
  fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);pointer-events:none;border-radius:0 10px 10px 0;`;

  wrapper.appendChild(leftArrow);
  wrapper.appendChild(carousel);
  wrapper.appendChild(rightArrow);
  wrapper.appendChild(fade);

  block.appendChild(wrapper);
}
