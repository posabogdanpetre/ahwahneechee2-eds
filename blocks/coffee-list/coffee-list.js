/**
 * Coffee List block — renders the coffee catalog returned by the getcoffeelist MCP tool.
 *
 * Block contract: export default function decorate(block, bridge) { ... }
 *   bridge.toolResult → Promise<{ structuredContent: { coffees: Coffee[] } }>
 */

function renderCard(coffee, bridge) {
  const li = document.createElement('li');
  li.className = 'coffee-list-card';
  li.innerHTML = `
    <p class="coffee-list-card-category">${coffee.category}</p>
    <h3 class="coffee-list-card-name">${coffee.name}</h3>
    <p class="coffee-list-card-description">${coffee.shortDescription}</p>
    <div class="coffee-list-card-footer">
      <span class="coffee-list-card-price">${coffee.price}</span>
      <div class="coffee-list-card-actions">
        <button class="coffee-list-card-btn coffee-list-card-btn--details" data-id="${coffee.id}" data-name="${coffee.name}">View Details</button>
        <button class="coffee-list-card-btn coffee-list-card-btn--more" data-name="${coffee.name}">Tell me more</button>
      </div>
    </div>
  `;

  li.querySelector('.coffee-list-card-btn--details').addEventListener('click', (e) => {
    const { id } = e.currentTarget.dataset;
    bridge.sendMessage(`Show me the details for coffee "${id}"`);
  });

  li.querySelector('.coffee-list-card-btn--more').addEventListener('click', (e) => {
    const { name } = e.currentTarget.dataset;
    bridge.sendMessage(`Tell me more about ${name}`);
  });

  return li;
}

export default async function decorate(block, bridge) {
  block.innerHTML = '<div class="coffee-list-loading">Loading coffee catalog…</div>';

  try {
    const { structuredContent } = await bridge.toolResult;
    const coffees = structuredContent?.coffees || [];

    const wrapper = document.createElement('div');
    wrapper.className = 'coffee-list-carousel';

    const ul = document.createElement('ul');
    ul.className = 'coffee-list-track';
    coffees.forEach((coffee) => ul.append(renderCard(coffee, bridge)));

    wrapper.append(ul);
    block.replaceChildren(wrapper);
  } catch (err) {
    block.innerHTML = '<p class="coffee-list-error">Could not load the coffee catalog.</p>';
    // eslint-disable-next-line no-console
    console.error('[coffee-list]', err);
  }
}
