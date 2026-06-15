// Sample data for standalone EDS preview (no bridge).
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: 'Patagonia Manchester',
    address: '89 King Street, Manchester M2 7AZ',
    phone: '+44 (0)161 834 4005',
    directions_url: 'https://maps.google.com/?q=Patagonia+Manchester'
  },
  {
    name: 'Patagonia Bristol',
    address: '81 Park Street, Bristol BS1 5PF',
    phone: '+44 (0)1202017184',
    directions_url: 'https://maps.google.com/?q=Patagonia+Bristol'
  }
];

// Brand palette from BuildWidgetRequest — replace with actual palette[] from action payload.
// getThemedCardBg() darkens palette[0] to luminance ≤ 0.12 so white text has WCAG AA contrast.
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
  return {
    bg:`#${dr.toString(16).padStart(2,'0')}${dg.toString(16).padStart(2,'0')}${db.toString(16).padStart(2,'0')}`,
    fg:'#ffffff'
  };
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
      // structuredContent.stores — bare array outputSchema; key derived from actionName "find_store"
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      stores = structuredContent?.stores || [];
    }
  } else {
    stores = SAMPLE_DATA;
  }

  block.textContent = '';
  renderStoreLocator(block, stores, bridge, theme);

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

function renderStoreLocator(block, stores, bridge, theme) {
  const container = document.createElement('div');
  container.className = 'store-locator-container';

  if (!stores || stores.length === 0) {
    // Empty state: search card
    const searchCard = document.createElement('div');
    searchCard.className = 'search-card';
    searchCard.style.cssText = `background:${theme?.bg ?? '#1a3a5c'};color:${theme?.fg ?? '#fff'}`;

    const pinIcon = document.createElement('div');
    pinIcon.className = 'pin-icon';
    pinIcon.innerHTML = '📍';
    searchCard.appendChild(pinIcon);

    const heading = document.createElement('h2');
    heading.textContent = 'Find a store near you';
    searchCard.appendChild(heading);

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'search-input';
    input.placeholder = 'Enter ZIP code...';
    searchCard.appendChild(input);

    const searchBtn = document.createElement('button');
    searchBtn.className = 'search-btn';
    searchBtn.textContent = 'Search';
    if (bridge) {
      searchBtn.addEventListener('click', () => {
        const query = input.value.trim();
        if (query) {
          bridge.sendMessage(`Find stores near ${query}`);
        }
      });
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const query = input.value.trim();
          if (query) {
            bridge.sendMessage(`Find stores near ${query}`);
          }
        }
      });
    }
    searchCard.appendChild(searchBtn);

    container.appendChild(searchCard);
  } else {
    // With results: flex row of store cards (max 2 visible)
    const storesRow = document.createElement('div');
    storesRow.className = 'stores-row';

    stores.slice(0, 2).forEach((store) => {
      const card = document.createElement('div');
      card.className = 'store-card';

      const pinCircle = document.createElement('div');
      pinCircle.className = 'pin-circle';
      pinCircle.innerHTML = '📍';
      card.appendChild(pinCircle);

      const name = document.createElement('div');
      name.className = 'store-name';
      name.textContent = store.name || '';
      card.appendChild(name);

      const address = document.createElement('div');
      address.className = 'store-address';
      address.textContent = store.address || '';
      card.appendChild(address);

      if (store.phone) {
        const phone = document.createElement('div');
        phone.className = 'store-phone';
        phone.textContent = store.phone;
        card.appendChild(phone);
      }

      if (store.directions_url) {
        const directionsBtn = document.createElement('button');
        directionsBtn.className = 'directions-btn';
        directionsBtn.textContent = 'Get Directions';
        if (bridge) {
          directionsBtn.addEventListener('click', () => {
            bridge.openLink(store.directions_url);
          });
        } else {
          directionsBtn.addEventListener('click', () => {
            window.open(store.directions_url, '_blank');
          });
        }
        card.appendChild(directionsBtn);
      }

      storesRow.appendChild(card);
    });

    container.appendChild(storesRow);
  }

  block.appendChild(container);
}
