// Sample data for standalone EDS preview (no bridge).
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: "Patagonia London",
    address: "123 Regent Street",
    city: "London",
    country: "United Kingdom",
    phone: "+44 20 1234 5678",
    hours: "Mon-Sat 10:00-18:00",
    type: "Patagonia Store"
  },
  {
    name: "Mountain Equipment Co.",
    address: "456 Oxford Street",
    city: "London",
    country: "United Kingdom",
    phone: "+44 20 8765 4321",
    hours: "Mon-Sun 09:00-20:00",
    type: "Authorized Dealer"
  }
];

// Brand palette from BuildWidgetRequest — empty in this payload
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
  let stores;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      stores = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // structuredContent.stores — bare array outputSchema; key derived from actionName "find_store"
      stores = structuredContent?.stores || [];
    }
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  } else {
    stores = SAMPLE_DATA;
  }

  block.textContent = '';
  render(block, stores, bridge, theme);
}

function render(block, stores, bridge, theme) {
  if (!stores || stores.length === 0) {
    renderSearchCard(block, theme);
  } else {
    renderStoreCards(block, stores, theme);
  }
}

function renderSearchCard(block, theme) {
  const cardBg = theme?.bg ?? '#e8e8e8';
  const cardFg = theme?.fg ?? '#333';

  const card = document.createElement('div');
  card.className = 'search-card';
  card.style.cssText = `background:${cardBg};color:${cardFg}`;

  const icon = document.createElement('div');
  icon.className = 'pin-icon';
  icon.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>';
  card.appendChild(icon);

  const heading = document.createElement('h2');
  heading.textContent = 'Find a store near you';
  card.appendChild(heading);

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Enter ZIP code...';
  input.className = 'zip-input';
  card.appendChild(input);

  const btn = document.createElement('button');
  btn.className = 'search-btn';
  btn.textContent = 'Search';
  if (bridge) {
    btn.addEventListener('click', () => {
      const zip = input.value.trim();
      if (zip) {
        bridge.sendMessage(`Find stores near ${zip}`);
      }
    });
  }
  card.appendChild(btn);

  block.appendChild(card);
}

function renderStoreCards(block, stores, theme) {
  const cardBg = theme?.bg ?? '#e8e8e8';
  const cardFg = theme?.fg ?? '#333';

  const container = document.createElement('div');
  container.className = 'stores-container';

  stores.slice(0, 2).forEach(store => {
    const card = document.createElement('div');
    card.className = 'store-card';
    card.style.cssText = `background:${cardBg};color:${cardFg}`;

    const iconCircle = document.createElement('div');
    iconCircle.className = 'store-pin';
    iconCircle.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>';
    card.appendChild(iconCircle);

    const name = document.createElement('h3');
    name.textContent = store.name || '';
    card.appendChild(name);

    if (store.address) {
      const address = document.createElement('p');
      address.className = 'address';
      address.textContent = store.address;
      if (store.city) address.textContent += `, ${store.city}`;
      card.appendChild(address);
    }

    if (store.phone) {
      const phone = document.createElement('p');
      phone.className = 'phone';
      phone.textContent = store.phone;
      card.appendChild(phone);
    }

    if (store.hours) {
      const hours = document.createElement('p');
      hours.className = 'hours';
      hours.textContent = store.hours;
      card.appendChild(hours);
    }

    container.appendChild(card);
  });

  block.appendChild(container);
}
