/**
 * Coffee Details block — renders the full product details returned by the getcoffeedetails MCP tool.
 *
 * Block contract: export default function decorate(block, bridge) { ... }
 *   bridge.toolResult → Promise<{ structuredContent: { coffee: Coffee | null } }>
 *   bridge.sendMessage(text) → sends a follow-up user message into the ChatGPT conversation
 */

import { LLMApp } from '../../scripts/llm-apps/llmapps-sdk.js';

/**
 * @param {LLMApp} bridge
 * @param {object} coffee
 */
function renderDetails(coffee, bridge) {
  const wrapper = document.createElement('div');
  wrapper.className = 'coffee-details-wrapper';

  const img = document.createElement('img');
  img.className = 'coffee-details-image';
  img.src = coffee.imageUrl;
  img.alt = coffee.name;
  img.loading = 'lazy';

  const body = document.createElement('div');
  body.className = 'coffee-details-body';

  const category = document.createElement('p');
  category.className = 'coffee-details-category';
  category.textContent = coffee.category;

  const name = document.createElement('h2');
  name.className = 'coffee-details-name';
  name.textContent = coffee.name;

  const meta = document.createElement('p');
  meta.className = 'coffee-details-meta';
  meta.textContent = `SKU: ${coffee.sku}`;

  const price = document.createElement('p');
  price.className = 'coffee-details-price';
  price.textContent = coffee.price;

  const description = document.createElement('p');
  description.className = 'coffee-details-description';
  description.textContent = coffee.longDescription;

  const actions = document.createElement('div');
  actions.className = 'coffee-details-actions';

  const orderBtn = document.createElement('button');
  orderBtn.className = 'coffee-details-btn coffee-details-btn--primary';
  orderBtn.textContent = 'Order Now';
  orderBtn.addEventListener('click', () => {
    bridge.sendMessage(`I'd like to order ${coffee.name} (${coffee.sku})`);
  });

  const backBtn = document.createElement('button');
  backBtn.className = 'coffee-details-btn coffee-details-btn--secondary';
  backBtn.textContent = 'Back to Catalog';
  backBtn.addEventListener('click', () => {
    bridge.sendMessage('Show me the full coffee catalog');
  });

  actions.append(orderBtn, backBtn);
  body.append(category, name, meta, price, description, actions);
  wrapper.append(img, body);

  return wrapper;
}

export default async function decorate(block, bridge) {
  block.innerHTML = '<div class="coffee-details-loading">Loading coffee details\u2026</div>';

  try {
    const { structuredContent } = await bridge.toolResult;
    const { coffee } = structuredContent || {};

    if (!coffee) {
      block.innerHTML = '<p class="coffee-details-error">Coffee not found.</p>';
      return;
    }

    block.replaceChildren(renderDetails(coffee, bridge));
  } catch (err) {
    block.innerHTML = '<p class="coffee-details-error">Could not load coffee details.</p>';
    // eslint-disable-next-line no-console
    console.error('[coffee-details]', err);
  }
}
