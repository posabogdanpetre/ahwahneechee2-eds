/**
 * Cultural Story block — renders an Ahwahneechee legend or oral tradition story
 * returned by the get-cultural-story MCP tool.
 *
 * Block contract: export default function decorate(block, bridge) { ... }
 *   bridge.toolResult → Promise<{ structuredContent: { story: Story } }>
 *   bridge.sendMessage(text) → sends a follow-up user message to ChatGPT
 */

function renderStory(story, bridge) {
  const wrapper = document.createElement('div');
  wrapper.className = 'cultural-story-wrapper';

  const label = document.createElement('p');
  label.className = 'cultural-story-label';
  label.textContent = 'Ahwahneechee Legend';

  const title = document.createElement('h2');
  title.className = 'cultural-story-title';
  title.textContent = story.title;

  const place = document.createElement('p');
  place.className = 'cultural-story-place';
  place.textContent = story.placeName;

  const divider = document.createElement('hr');
  divider.className = 'cultural-story-divider';

  const textContainer = document.createElement('div');
  textContainer.className = 'cultural-story-text';

  const paragraphs = story.text.split(/\n\n+/);
  paragraphs.forEach((para, i) => {
    const p = document.createElement('p');
    p.textContent = para.trim();
    if (i === 0) p.classList.add('cultural-story-text--lead');
    textContainer.append(p);
  });

  const actions = document.createElement('div');
  actions.className = 'cultural-story-actions';

  const exploreBtn = document.createElement('button');
  exploreBtn.className = 'cultural-story-btn cultural-story-btn--primary';
  exploreBtn.textContent = 'Explore this Place';
  exploreBtn.addEventListener('click', () => {
    bridge.sendMessage(`Tell me more about the Ahwahneechee place "${story.placeId}"`);
  });

  const anotherBtn = document.createElement('button');
  anotherBtn.className = 'cultural-story-btn cultural-story-btn--secondary';
  anotherBtn.textContent = 'Another Legend';
  anotherBtn.addEventListener('click', () => {
    bridge.sendMessage('Tell me another Ahwahneechee legend');
  });

  const allPlacesBtn = document.createElement('button');
  allPlacesBtn.className = 'cultural-story-btn cultural-story-btn--ghost';
  allPlacesBtn.textContent = 'All Sacred Places';
  allPlacesBtn.addEventListener('click', () => {
    bridge.sendMessage('Show me all Ahwahneechee sacred places');
  });

  actions.append(exploreBtn, anotherBtn, allPlacesBtn);
  wrapper.append(label, title, place, divider, textContainer, actions);
  return wrapper;
}

export default async function decorate(block, bridge) {
  block.innerHTML = '<div class="cultural-story-loading">Retrieving the legend\u2026</div>';

  try {
    const { structuredContent } = await bridge.toolResult;
    const { story } = structuredContent || {};

    if (!story) {
      block.innerHTML = '<p class="cultural-story-error">No story found.</p>';
      return;
    }

    block.replaceChildren(renderStory(story, bridge));
  } catch (err) {
    block.innerHTML = '<p class="cultural-story-error">Could not load the story.</p>';
    // eslint-disable-next-line no-console
    console.error('[cultural-story]', err);
  }
}
