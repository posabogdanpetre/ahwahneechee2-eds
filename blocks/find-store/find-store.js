// Sample data for standalone EDS preview (no bridge).
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: "Patagonia Store London",
    address: "123 Regent Street, London W1B 5TH",
    phone: "+44 20 1234 5678",
    hours: "Mon-Sat 10am-7pm, Sun 12pm-6pm",
    type: "Patagonia Store"
  },
  {
    name: "Outdoor Gear Authorized Dealer",
    address: "45 High Street, Manchester M1 2AB",
    phone: "+44 161 234 5678",
    hours: "Mon-Fri 9am-6pm, Sat 10am-5pm",
    type: "Authorized Dealer"
  }
];

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
  } else {
    stores = SAMPLE_DATA;
  }

  block.textContent = '';

  if (!stores || stores.length === 0) {
    renderEmptyState(block, bridge);
  } else {
    renderStores(block, stores, bridge);
  }

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

function renderEmptyState(block, bridge) {
  const container = document.createElement('div');
  container.className = 'find-store-empty';
  container.style.cssText = `background:${theme?.bg ?? '#f5f5f5'};color:${theme?.fg ?? '#333'}`;

  // Pin icon
  const iconWrapper = document.createElement('div');
  iconWrapper.className = 'pin-icon';
  iconWrapper.innerHTML = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.7;color:#666"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
  container.appendChild(iconWrapper);

  // Heading
  const heading = document.createElement('h2');
  heading.textContent = 'Find a store near you';
  heading.style.cssText = `color:${theme?.fg ?? '#333'}`;
  container.appendChild(heading);

  // Input
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Enter ZIP code…';
  input.className = 'zip-input';
  container.appendChild(input);

  // Button
  const button = document.createElement('button');
  button.className = 'search-btn';
  button.textContent = 'Search';
  if (bridge) {
    button.addEventListener('click', () => {
      const location = input.value.trim();
      if (location) {
        bridge.sendMessage(`Find stores near ${location}`);
      }
    });
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const location = input.value.trim();
        if (location) {
          bridge.sendMessage(`Find stores near ${location}`);
        }
      }
    });
  }
  container.appendChild(button);

  block.appendChild(container);
}

function renderStores(block, stores, bridge) {
  const container = document.createElement('div');
  container.className = 'find-store-results';

  // Show up to 2 stores in a flex row
  const displayStores = stores.slice(0, 2);

  displayStores.forEach((store) => {
    const card = document.createElement('div');
    card.className = 'store-card';
    card.style.cssText = `background:${theme?.bg ?? '#f5f5f5'};color:${theme?.fg ?? '#333'}`;

    // Pin circle
    const pinCircle = document.createElement('div');
    pinCircle.className = 'store-pin';
    pinCircle.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#666"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
    card.appendChild(pinCircle);

    // Store name
    const name = document.createElement('div');
    name.className = 'store-name';
    name.textContent = store.name || '';
    name.style.cssText = `color:${theme?.fg ?? '#333'}`;
    card.appendChild(name);

    // Address
    if (store.address) {
      const address = document.createElement('div');
      address.className = 'store-address';
      address.textContent = store.address;
      card.appendChild(address);
    }

    // Phone
    if (store.phone) {
      const phone = document.createElement('div');
      phone.className = 'store-phone';
      phone.textContent = store.phone;
      card.appendChild(phone);
    }

    // Hours
    if (store.hours) {
      const hours = document.createElement('div');
      hours.className = 'store-hours';
      hours.textContent = store.hours;
      card.appendChild(hours);
    }

    // Type badge (optional)
    if (store.type) {
      const type = document.createElement('div');
      type.className = 'store-type';
      type.textContent = store.type;
      card.appendChild(type);
    }

    container.appendChild(card);
  });

  block.appendChild(container);
}
