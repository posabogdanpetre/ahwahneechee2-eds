const SAMPLE_DATA = [
  {
    "name": "Men's Boulder Fork Rain Jacket",
    "description": "Low-profile 3-layer shell with exceptional waterproof/breathable protection.",
    "image_url": "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dwe30ba363/images/hi-res/85140_SMDB.jpg?sw=1400&sh=1400&sfrm=png&q=90&bgcolor=f3f4ef",
    "price": "£250",
    "category": "Men's Jackets"
  },
  {
    "name": "Men's Triolet Alpine Jacket",
    "description": "Alpine climbing workhorse built to thrive in cold, snowy conditions with 3-layer waterproof fabric.",
    "image_url": "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw95d91ca9/images/hi-res/83403_CPRG.jpg?sw=1400&sh=1400&sfrm=png&q=90&bgcolor=f3f4ef",
    "price": "£370",
    "category": "Men's Jackets"
  },
  {
    "name": "Men's Windsweep Lightweight Windbreaker Jacket",
    "description": "Lightweight, packable windbreaker made of 100% organic cotton, Fair Trade Certified.",
    "image_url": "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw3ae01c29/images/hi-res/20320_INBK.jpg?sw=1400&sh=1400&sfrm=png&q=90&bgcolor=f3f4ef",
    "price": "£210",
    "category": "Men's Jackets"
  },
  {
    "name": "Women's Better Sweater Fleece Jacket",
    "description": "Warm full-zip jacket made of 100% recycled polyester with sweater-knit aesthetic.",
    "image_url": "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dwb74b05e1/images/hi-res/25543_NENA.jpg?sw=1400&sh=1400&sfrm=png&q=90&bgcolor=f3f4ef",
    "price": "£130",
    "category": "Women's Fleece"
  },
  {
    "name": "Women's R1 Air Fleece Midlayer Zip-Neck",
    "description": "Lightweight, highly breathable, quick-drying technical fleece for cool conditions.",
    "image_url": "https://eu.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dw2ade861d/images/hi-res/40251_QVLT.jpg?sw=1400&sh=1400&sfrm=png&q=90&bgcolor=f3f4ef",
    "price": "£120",
    "category": "Women's Fleece"
  }
];

const PALETTE = [];

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#','');
  if(hex.length===3)hex=hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  if(hex.length!==6)return null;
  let [r,g,b]=[parseInt(hex.slice(0,2),16),parseInt(hex.slice(2,4),16),parseInt(hex.slice(4,6),16)];
  if(isNaN(r)||isNaN(g)||isNaN(b))return null;
  const lum=(c)=>{const s=c/255;return s<=0.03928?s/12.92:Math.pow((s+0.055)/1.055,2.4);};
  const relLum=(r,g,b)=>0.2126*lum(r)+0.7152*lum(g)+0.0722*lum(b);
  if(relLum(r,g,b)<=0.12)return{bg:`#${hex}`,fg:'#ffffff'};
  let lo=0,hi=1;
  for(let i=0;i<20;i++){const m=(lo+hi)/2;if(relLum(Math.round(r*m),Math.round(g*m),Math.round(b*m))>0.12)hi=m;else lo=m;}
  const dr=Math.round(r*lo),dg=Math.round(g*lo),db=Math.round(b*lo);
  return{bg:`#${dr.toString(16).padStart(2,'0')}${dg.toString(16).padStart(2,'0')}${db.toString(16).padStart(2,'0')}`,fg:'#ffffff'};
}

const theme = getThemedCardBg(PALETTE);
const CARD_COLORS = ['#378ef0','#9256d9','#0fb5ae','#e68619','#d83790','#2dca72','#4046ca','#72b340'];

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
  const wrapper = document.createElement('div');
  wrapper.className = 'carousel-wrapper';

  const carousel = document.createElement('div');
  carousel.className = 'carousel-track';

  const displayProducts = products.slice(0, 5);

  displayProducts.forEach((product, index) => {
    const card = document.createElement('div');
    card.className = 'product-card';

    const imageContainer = document.createElement('div');
    imageContainer.className = 'image-container';

    const fallbackColor = CARD_COLORS[index % CARD_COLORS.length];
    const colorDiv = () => {
      const d = document.createElement('div');
      d.style.cssText = `width:100%;height:100%;background:${fallbackColor};`;
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
    info.style.background = theme?.bg ?? '#1a1a1a';
    info.style.color = theme?.fg ?? '#fff';

    const name = document.createElement('h3');
    name.className = 'product-name';
    name.textContent = product.name;
    info.appendChild(name);

    if (product.description) {
      const desc = document.createElement('p');
      desc.className = 'product-description';
      desc.textContent = product.description;
      info.appendChild(desc);
    }

    const meta = document.createElement('div');
    meta.className = 'product-meta';

    const price = document.createElement('span');
    price.className = 'product-price';
    price.textContent = product.price;
    meta.appendChild(price);

    if (product.category) {
      const category = document.createElement('span');
      category.className = 'product-category';
      category.textContent = product.category;
      meta.appendChild(category);
    }

    info.appendChild(meta);
    card.appendChild(info);

    carousel.appendChild(card);
  });

  wrapper.appendChild(carousel);

  const leftArrow = document.createElement('button');
  leftArrow.className = 'nav-arrow nav-arrow-left';
  leftArrow.setAttribute('aria-label', 'Scroll left');
  leftArrow.innerHTML = '◀';
  leftArrow.style.display = 'none';

  const rightArrow = document.createElement('button');
  rightArrow.className = 'nav-arrow nav-arrow-right';
  rightArrow.setAttribute('aria-label', 'Scroll right');
  rightArrow.innerHTML = '▶';

  const updateArrows = () => {
    const scrollLeft = carousel.scrollLeft;
    const scrollWidth = carousel.scrollWidth;
    const clientWidth = carousel.clientWidth;
    leftArrow.style.display = scrollLeft <= 1 ? 'none' : 'flex';
    rightArrow.style.display = scrollLeft + clientWidth >= scrollWidth - 1 ? 'none' : 'flex';
  };

  const scrollLeft = () => carousel.scrollBy({ left: -236, behavior: 'smooth' });
  const scrollRight = () => carousel.scrollBy({ left: 236, behavior: 'smooth' });

  leftArrow.addEventListener('click', scrollLeft);
  leftArrow.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollLeft();
    }
  });

  rightArrow.addEventListener('click', scrollRight);
  rightArrow.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollRight();
    }
  });

  carousel.addEventListener('scroll', updateArrows);

  wrapper.appendChild(leftArrow);
  wrapper.appendChild(rightArrow);

  if (displayProducts.length > 2) {
    const fade = document.createElement('div');
    fade.className = 'fade-gradient';
    wrapper.appendChild(fade);
  }

  block.appendChild(wrapper);

  setTimeout(updateArrows, 100);
}
