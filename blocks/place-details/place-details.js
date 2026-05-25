/**
 * Place Details block — renders full cultural and historical details
 * for one Ahwahneechee sacred place, returned by the get-place-details MCP tool.
 *
 * Block contract: export default function decorate(block, bridge) { ... }
 *   bridge.toolResult → Promise<{ structuredContent: { place: Place | null } }>
 *   bridge.sendMessage(text) → sends a follow-up user message to ChatGPT
 */

const TYPE_LABELS = {
  Valley: 'Valley',
  Waterfall: 'Waterfall',
  'Rock Formation': 'Rock Formation',
  Forest: 'Forest',
};

function renderDetails(place, bridge) {
  const wrapper = document.createElement('div');
  wrapper.className = 'place-details-wrapper';

  const typeSlug = (place.type || '').toLowerCase().replace(/\s+/g, '-');

  const badge = document.createElement('span');
  badge.className = `place-details-badge place-details-badge--${typeSlug}`;
  badge.textContent = TYPE_LABELS[place.type] || place.type;

  const nativeName = document.createElement('p');
  nativeName.className = 'place-details-native-name';
  nativeName.textContent = place.nativeName;

  const name = document.createElement('h2');
  name.className = 'place-details-name';
  name.textContent = place.name;

  const meaning = document.createElement('blockquote');
  meaning.className = 'place-details-meaning';
  meaning.textContent = `"${place.meaning}"`;

  const description = document.createElement('p');
  description.className = 'place-details-description';
  description.textContent = place.description;

  const sigBox = document.createElement('div');
  sigBox.className = 'place-details-significance';
  const sigLabel = document.createElement('span');
  sigLabel.className = 'place-details-significance-label';
  sigLabel.textContent = 'Cultural significance';
  const sigText = document.createElement('p');
  sigText.className = 'place-details-significance-text';
  sigText.textContent = place.significance;
  sigBox.append(sigLabel, sigText);

  const actions = document.createElement('div');
  actions.className = 'place-details-actions';

  const storyBtn = document.createElement('button');
  storyBtn.className = 'place-details-btn place-details-btn--primary';
  storyBtn.textContent = `Hear the Legend`;
  storyBtn.addEventListener('click', () => {
    bridge.sendMessage(`Tell me the legend of "${place.id}"`);
  });

  const backBtn = document.createElement('button');
  backBtn.className = 'place-details-btn place-details-btn--secondary';
  backBtn.textContent = 'All Sacred Places';
  backBtn.addEventListener('click', () => {
    bridge.sendMessage('Show me all Ahwahneechee sacred places');
  });

  actions.append(storyBtn, backBtn);
  wrapper.append(badge, nativeName, name, meaning, description, sigBox, actions);
  return wrapper;
}

export default async function decorate(block, bridge) {
  block.innerHTML = '<div class="place-details-loading">Loading place details\u2026</div>';

  try {
    const { structuredContent } = await bridge.toolResult;
    const { place } = structuredContent || {};

    if (!place) {
      block.innerHTML = '<p class="place-details-error">Place not found.</p>';
      return;
    }

    block.replaceChildren(renderDetails(place, bridge));
  } catch (err) {
    block.innerHTML = '<p class="place-details-error">Could not load place details.</p>';
    // eslint-disable-next-line no-console
    console.error('[place-details]', err);
  }
}
