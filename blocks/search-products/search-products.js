// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: "Men's Nano Puff Insulated Jacket",
    description: "Lightweight, packable synthetic insulation jacket that stays warm when wet, made with recycled materials.",
    image_url: "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw8079c0d9/images/hi-res/84213_BLSG.jpg?sw=768&sh=768&sfrm=png&q=95&bgcolor=f3f4ef",
    price: "£170",
    category: "Jackets"
  },
  {
    name: "Men's Triolet Alpine Jacket",
    description: "Alpine workhorse with 3-layer GORE-TEX waterproof/breathable fabric, built for cold and snowy conditions.",
    image_url: "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw3898a537/images/hi-res/84213_SMDB.jpg?sw=768&sh=768&sfrm=png&q=95&bgcolor=f3f4ef",
    price: "£380",
    category: "Jackets"
  },
  {
    name: "Women's Better Sweater 1/4-Zip Fleece",
    description: "Sweater-knit aesthetic with 100% recycled polyester fleece, a versatile everyday mid-layer.",
    image_url: "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw86f4117a/images/hi-res/84213_OLGG.jpg?sw=768&sh=768&sfrm=png&q=95&bgcolor=f3f4ef",
    price: "£110",
    category: "Fleece"
  },
  {
    name: "Men's Houdini Windbreaker Jacket",
    description: "Ultralight 100% recycled nylon windbreaker with weather-resistant protection, highly packable.",
    image_url: "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dwc92431d5/images/hi-res/84213_FGE.jpg?sw=768&sh=768&sfrm=png&q=95&bgcolor=f3f4ef",
    price: "£120",
    category: "Jackets"
  },
  {
    name: "Men's Jackson Glacier Down Jacket",
    description: "Waterproof down jacket with 700-fill recycled down and 100% recycled polyester shell for rain and wind protection.",
    image_url: "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dwd54245bb/images/hi-res/84213_BLK.jpg?sw=768&sh=768&sfrm=png&q=95&bgcolor=f3f4ef",
    price: "£350",
    category: "Jackets"
  }
];

const PALETTE = [];
const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  let [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const relLum = (r, g, b) => 0.2126 * lum(r) + 0.7152 * lum(g) + 0.0722 * lum(b);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0, hi = 1;
  for (let i = 0; i < 20; i++) {
    const m = (lo + hi) / 2;
    if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m;
  }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
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
  renderCarousel(block, items, bridge);

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

function renderCarousel(block, items, bridge) {
  const wrapper = document.createElement('div');
  wrapper.className = 'carousel-wrapper';

  const carousel = document.createElement('div');
  carousel.className = 'carousel';

  items.slice(0, 5).forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'product-card';

    const imageContainer = document.createElement('div');
    imageContainer.className = 'image-container';

    const fallbackColor = CARD_COLORS[i % CARD_COLORS.length];
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
    ctaBtn.className = 'cta-btn';
    ctaBtn.textContent = 'View Details';
    if (bridge) {
      ctaBtn.addEventListener('click', () => {
        bridge.sendMessage(`Tell me more about ${item.name}`);
      });
    }
    imageContainer.appendChild(ctaBtn);

    card.appendChild(imageContainer);

    const content = document.createElement('div');
    content.className = 'content';
    content.style.cssText = `background: ${theme?.bg ?? '#ffffff'}; color: ${theme?.fg ?? '#333'};`;

    const name = document.createElement('h3');
    name.className = 'name';
    name.textContent = item.name || '';
    content.appendChild(name);

    if (item.description) {
      const desc = document.createElement('p');
      desc.className = 'description';
      desc.textContent = item.description;
      content.appendChild(desc);
    }

    const meta = document.createElement('div');
    meta.className = 'meta';

    if (item.price) {
      const price = document.createElement('span');
      price.className = 'price';
      price.textContent = item.price;
      price.style.color = theme?.fg ?? '#2563eb';
      meta.appendChild(price);
    }

    if (item.category) {
      const category = document.createElement('span');
      category.className = 'category';
      category.textContent = item.category;
      meta.appendChild(category);
    }

    content.appendChild(meta);
    card.appendChild(content);
    carousel.appendChild(card);
  });

  wrapper.appendChild(carousel);

  const leftBtn = document.createElement('button');
  leftBtn.className = 'nav-btn left hidden';
  leftBtn.setAttribute('aria-label', 'Scroll left');
  leftBtn.textContent = '◀';
  leftBtn.addEventListener('click', () => {
    carousel.scrollBy({ left: -220, behavior: 'smooth' });
  });
  leftBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      carousel.scrollBy({ left: -220, behavior: 'smooth' });
    }
  });
  wrapper.appendChild(leftBtn);

  const rightBtn = document.createElement('button');
  rightBtn.className = 'nav-btn right';
  rightBtn.setAttribute('aria-label', 'Scroll right');
  rightBtn.textContent = '▶';
  rightBtn.addEventListener('click', () => {
    carousel.scrollBy({ left: 220, behavior: 'smooth' });
  });
  rightBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      carousel.scrollBy({ left: 220, behavior: 'smooth' });
    }
  });
  wrapper.appendChild(rightBtn);

  const fade = document.createElement('div');
  fade.className = 'fade-gradient';
  fade.style.cssText = `background: linear-gradient(to right, transparent, ${theme?.bg ?? '#ffffff'}cc);`;
  wrapper.appendChild(fade);

  const updateNavButtons = () => {
    const atStart = carousel.scrollLeft <= 1;
    const atEnd = carousel.scrollLeft >= carousel.scrollWidth - carousel.clientWidth - 1;
    leftBtn.classList.toggle('hidden', atStart);
    rightBtn.classList.toggle('hidden', atEnd);
  };

  carousel.addEventListener('scroll', updateNavButtons);
  updateNavButtons();

  block.appendChild(wrapper);
}