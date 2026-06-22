// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = {
  name: "Men's Better Sweater Fleece Jacket",
  description: "This warm, wind- and water-resistant fleece jacket features a zip-through collar and zippered handwarmer pockets. Made with recycled polyester and Fair Trade Certified™ sewn.",
  price: "$139.00",
  category: "Men's Jackets",
  colors: ["Black", "Navy Blue", "Forge Grey"],
  sizes: ["S", "M", "L", "XL", "XXL"],
  image_url: "https://example.com/better-sweater-jacket.jpg"
};

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
  for (let i=0; i<20; i++) { const m=(lo+hi)/2; if (relLum(Math.round(r*m),Math.round(g*m),Math.round(b*m)) > 0.12) hi=m; else lo=m; }
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
      const _result = await bridge.toolResult;
      item = (_result?.structuredContent || _result) || {};
    }
  } else {
    item = SAMPLE_DATA;
  }

  block.textContent = '';
  renderDetail(block, item, bridge);
  
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

function renderDetail(block, item, bridge) {
  const CARD_COLORS = ['#378ef0','#9256d9','#0fb5ae','#e68619','#d83790','#2dca72','#4046ca','#72b340'];
  const fallbackColor = CARD_COLORS[0];

  const card = document.createElement('div');
  card.className = 'detail-card';

  const imageContainer = document.createElement('div');
  imageContainer.className = 'detail-image';

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
    img.onerror = () => img.parentNode.replaceChild(colorDiv(), img);
    imageContainer.appendChild(img);
  } else {
    imageContainer.appendChild(colorDiv());
  }

  const ctaBtn = document.createElement('button');
  ctaBtn.className = 'image-cta';
  ctaBtn.textContent = 'Add to Bag';
  if (bridge) {
    ctaBtn.addEventListener('click', () => {
      bridge.sendMessage(`Add ${item.name} to my bag`);
    });
  }
  imageContainer.appendChild(ctaBtn);

  card.appendChild(imageContainer);

  const content = document.createElement('div');
  content.className = 'detail-content';
  content.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  const name = document.createElement('h2');
  name.className = 'detail-name';
  name.textContent = item.name || '';
  content.appendChild(name);

  if (item.category) {
    const category = document.createElement('span');
    category.className = 'detail-category';
    category.textContent = item.category;
    content.appendChild(category);
  }

  if (item.description) {
    const desc = document.createElement('p');
    desc.className = 'detail-description';
    desc.textContent = item.description;
    content.appendChild(desc);
  }

  if (item.price) {
    const price = document.createElement('div');
    price.className = 'detail-price';
    price.textContent = item.price;
    content.appendChild(price);
  }

  if (item.colors && item.colors.length > 0) {
    const colorsLabel = document.createElement('div');
    colorsLabel.className = 'detail-label';
    colorsLabel.textContent = 'Colors:';
    content.appendChild(colorsLabel);

    const colorsList = document.createElement('div');
    colorsList.className = 'detail-colors';
    colorsList.textContent = item.colors.join(', ');
    content.appendChild(colorsList);
  }

  if (item.sizes && item.sizes.length > 0) {
    const sizesLabel = document.createElement('div');
    sizesLabel.className = 'detail-label';
    sizesLabel.textContent = 'Sizes:';
    content.appendChild(sizesLabel);

    const sizesList = document.createElement('div');
    sizesList.className = 'detail-sizes';
    sizesList.textContent = item.sizes.join(', ');
    content.appendChild(sizesList);
  }

  card.appendChild(content);
  block.appendChild(card);
}