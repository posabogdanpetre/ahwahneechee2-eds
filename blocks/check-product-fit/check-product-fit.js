// codegen:layout-pattern=generic-detail
// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = {
  product_id: 'pantofi-alergare-dama-asics-gel-kayano-32-sunny-sizzle-ss-2026',
  product_name: 'Pantofi alergare dama Asics Gel-Kayano 32 Sunny Sizzle SS 2026',
  fit_status: 'between sizes',
  suggested_size: '38',
  confidence: 0.72,
  reasoning: [
    'Foot length 24.5 cm maps to EU 38 on the Asics women’s size chart.',
    'Usual size 38 matches the measured length.',
    'Preference for extra room on long runs favors staying at 38 or sizing up to 39.',
  ],
  measurement_comparison: {
    foot_length: '24.5 cm supplied vs 24.3–24.6 cm published for size 38',
    activity: 'long-distance road running',
  },
  alternative_sizes: ['39', '37 1/2'],
  fit_caveats: [
    'Running shoes often fit 0.5–1 size larger than street shoes for toe splay.',
    'Published length ranges vary slightly by shoe model.',
  ],
  in_store_checks: [
    'Leave ~1 cm of space between longest toe and shoe end.',
    'Try both feet late in the day when feet are largest.',
    'Wear your usual running socks when testing.',
  ],
  product_url: 'https://www.sportguru.ro/sporturi/alergare/pantofi-alergare/pantofi-alergare-asfalt/pantofi-alergare-dama-asics-gel-kayano-32-sunny-sizzle-ss-2026',
};

function isCaution(status) {
  const s = String(status || '').toLowerCase();
  return s.includes('between') || s.includes('insufficient') || s.includes('incomplete') || s.includes('unknown');
}

function isSuitable(status) {
  return String(status || '').toLowerCase().includes('suitable');
}

function addList(parent, cls, values) {
  if (!Array.isArray(values) || values.length === 0) return;
  const ul = document.createElement('ul');
  ul.className = cls;
  values.forEach((v) => {
    const li = document.createElement('li');
    li.textContent = v;
    ul.appendChild(li);
  });
  parent.appendChild(ul);
}

function addSection(parent, label) {
  const h = document.createElement('div');
  h.className = 'cpf-section-label';
  h.textContent = label;
  parent.appendChild(h);
  return h;
}

function addChips(parent, values) {
  if (!Array.isArray(values) || values.length === 0) return;
  const wrap = document.createElement('div');
  wrap.className = 'cpf-chips';
  values.forEach((v) => {
    const chip = document.createElement('span');
    chip.className = 'cpf-chip';
    chip.textContent = v;
    wrap.appendChild(chip);
  });
  parent.appendChild(wrap);
}

function renderDetail(block, item, bridge) {
  const card = document.createElement('div');
  card.className = 'cpf-card';
  if (isCaution(item.fit_status)) card.classList.add('cpf-caution');

  // Header: title + status chip
  const header = document.createElement('div');
  header.className = 'cpf-header';

  const title = document.createElement('h3');
  title.className = 'cpf-title';
  title.textContent = item.product_name || 'Fit result';
  header.appendChild(title);

  if (item.fit_status) {
    const chip = document.createElement('span');
    chip.className = 'cpf-status';
    if (isCaution(item.fit_status)) chip.classList.add('cpf-status-caution');
    else if (isSuitable(item.fit_status)) chip.classList.add('cpf-status-ok');
    chip.textContent = item.fit_status;
    header.appendChild(chip);
  }
  card.appendChild(header);

  // Lead: suggested size
  if (item.suggested_size) {
    const lead = document.createElement('div');
    lead.className = 'cpf-lead';
    const leadLabel = document.createElement('span');
    leadLabel.className = 'cpf-lead-label';
    leadLabel.textContent = 'Suggested size';
    const leadValue = document.createElement('span');
    leadValue.className = 'cpf-lead-value';
    leadValue.textContent = item.suggested_size;
    lead.appendChild(leadLabel);
    lead.appendChild(leadValue);
    card.appendChild(lead);
  }

  // Confidence indicator
  if (typeof item.confidence === 'number') {
    const conf = document.createElement('div');
    conf.className = 'cpf-conf';
    const pct = Math.round(Math.max(0, Math.min(1, item.confidence)) * 100);
    const confTop = document.createElement('div');
    confTop.className = 'cpf-conf-top';
    const cl = document.createElement('span');
    cl.textContent = 'Confidence';
    const cv = document.createElement('span');
    cv.className = 'cpf-conf-pct';
    cv.textContent = pct + '%';
    confTop.appendChild(cl);
    confTop.appendChild(cv);
    conf.appendChild(confTop);
    const track = document.createElement('div');
    track.className = 'cpf-conf-track';
    const fill = document.createElement('div');
    fill.className = 'cpf-conf-fill';
    fill.style.width = pct + '%';
    track.appendChild(fill);
    conf.appendChild(track);
    card.appendChild(conf);
  }

  // Reasoning
  if (Array.isArray(item.reasoning) && item.reasoning.length) {
    addSection(card, 'Why this size');
    addList(card, 'cpf-reasoning', item.reasoning);
  }

  // Measurement comparison — aligned rows
  const mc = item.measurement_comparison;
  if (mc && typeof mc === 'object' && Object.keys(mc).length) {
    addSection(card, 'Measurement comparison');
    const rows = document.createElement('div');
    rows.className = 'cpf-rows';
    Object.keys(mc).forEach((k) => {
      const row = document.createElement('div');
      row.className = 'cpf-row';
      const rk = document.createElement('span');
      rk.className = 'cpf-row-key';
      rk.textContent = k.replace(/_/g, ' ');
      const rv = document.createElement('span');
      rv.className = 'cpf-row-val';
      rv.textContent = mc[k];
      row.appendChild(rk);
      row.appendChild(rv);
      rows.appendChild(row);
    });
    card.appendChild(rows);
  }

  // Alternative sizes
  if (Array.isArray(item.alternative_sizes) && item.alternative_sizes.length) {
    addSection(card, 'Alternative sizes');
    addChips(card, item.alternative_sizes);
  }

  // Fit caveats
  if (Array.isArray(item.fit_caveats) && item.fit_caveats.length) {
    addSection(card, 'Caveats');
    addList(card, 'cpf-caveats', item.fit_caveats);
  }

  // In-store checks
  if (Array.isArray(item.in_store_checks) && item.in_store_checks.length) {
    addSection(card, 'Check in store');
    addList(card, 'cpf-checks', item.in_store_checks);
  }

  // CTAs — max 2
  const actions = document.createElement('div');
  actions.className = 'cpf-actions';

  const viewBtn = document.createElement('button');
  viewBtn.className = 'cpf-btn cpf-btn-primary';
  viewBtn.type = 'button';
  viewBtn.textContent = 'View Product';
  if (bridge && item.product_url) {
    viewBtn.addEventListener('click', () => bridge.openLink(item.product_url));
  }
  actions.appendChild(viewBtn);

  const anotherBtn = document.createElement('button');
  anotherBtn.className = 'cpf-btn cpf-btn-secondary';
  anotherBtn.type = 'button';
  anotherBtn.textContent = 'Check Another Size';
  if (bridge) {
    const nm = item.product_name || 'this product';
    anotherBtn.addEventListener('click', () => bridge.sendMessage('Check another size for ' + nm));
  }
  actions.appendChild(anotherBtn);

  card.appendChild(actions);
  block.appendChild(card);
}

export default async function decorate(block, bridge) {
  let item;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      item = SAMPLE_DATA;
    } else {
      // Detail concept — structuredContent IS the item (flat). No wrapper key.
      const _result = await bridge.toolResult;
      item = _result?.structuredContent || {};
    }
  } else {
    item = SAMPLE_DATA;
  }

  block.textContent = '';
  if (!item || !item.product_name) {
    const empty = document.createElement('p');
    empty.className = 'cpf-empty';
    empty.textContent = 'No fit result was found.';
    block.appendChild(empty);
  } else {
    renderDetail(block, item, bridge);
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
