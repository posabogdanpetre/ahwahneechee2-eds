/**
 * Places List block — renders the Ahwahneechee sacred places catalog
 * returned by the explore-places MCP tool.
 *
 * Block contract: export default function decorate(block, bridge) { ... }
 *   bridge.toolResult → Promise<{ structuredContent: { places: Place[] } }>
 *   bridge.sendMessage(text) → sends a follow-up user message to ChatGPT
 */

const TYPE_LABELS = {
  Valley: 'Valley',
  Waterfall: 'Waterfall',
  'Rock Formation': 'Rock',
  Forest: 'Forest',
};

function renderCard(place, bridge) {
  const li = document.createElement('li');
  li.className = 'places-list-card';

  const typeSlug = (place.type || '').toLowerCase().replace(/\s+/g, '-');

  const badge = document.createElement('span');
  badge.className = `places-list-badge places-list-badge--${typeSlug}`;
  badge.textContent = TYPE_LABELS[place.type] || place.type;

  const nativeName = document.createElement('p');
  nativeName.className = 'places-list-native-name';
  nativeName.textContent = place.nativeName;

  const name = document.createElement('h3');
  name.className = 'places-list-name';
  name.textContent = place.name;

  const meaning = document.createElement('p');
  meaning.className = 'places-list-meaning';
  meaning.textContent = `"${place.meaning}"`;

  const desc = document.createElement('p');
  desc.className = 'places-list-description';
  desc.textContent = place.shortDescription;

  const btn = document.createElement('button');
  btn.className = 'places-list-btn';
  btn.textContent = `Explore ${place.nativeName}`;
  btn.dataset.placeId = place.id;
  btn.dataset.placeName = place.name;
  btn.addEventListener('click', (e) => {
    const { placeId } = e.currentTarget.dataset;
    bridge.sendMessage(`Tell me more about the Ahwahneechee place "${placeId}"`);
  });

  li.append(badge, nativeName, name, meaning, desc, btn);
  return li;
}

export default async function decorate(block, bridge) {
  block.innerHTML = '<div class="places-list-loading">Loading sacred places\u2026</div>';

  try {
    const { structuredContent } = await bridge.toolResult;
    const places = structuredContent?.places || [];

    const wrapper = document.createElement('div');
    wrapper.className = 'places-list-carousel';

    const ul = document.createElement('ul');
    ul.className = 'places-list-track';
    places.forEach((place) => ul.append(renderCard(place, bridge)));

    wrapper.append(ul);
    block.replaceChildren(wrapper);
  } catch (err) {
    block.innerHTML = '<p class="places-list-error">Could not load the sacred places.</p>';
    // eslint-disable-next-line no-console
    console.error('[places-list]', err);
  }
}
