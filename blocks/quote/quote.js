export default function decorate(block) {
  // All paragraphs inside this quote instance
  const paragraphs = Array.from(block.querySelectorAll('p'));

  // Prefer AEM authoring props when present
  const quoteByProp = block.querySelector('[data-aue-prop="quoteText"]');
  const authorByProp = block.querySelector('[data-aue-prop="author"]');
  const variationByProp = block.querySelector('[data-aue-prop="variation"]');

  let quoteTextEl = quoteByProp || paragraphs[0];
  let authorEl = authorByProp || paragraphs[1];
  const variationEl = variationByProp || paragraphs[2];

  // If we have neither, nothing to render
  if (!quoteTextEl && !authorEl) {
    return;
  }

  // Read variation value and apply as a modifier class
  const variation = variationEl?.textContent?.trim().toLowerCase();
  if (variation && variation !== 'default') {
    block.classList.add(`quote--${variation}`);
  }

  // Build semantic markup
  const figure = document.createElement('figure');
  figure.classList.add('quote__figure');

  const blockquote = document.createElement('blockquote');
  blockquote.classList.add('quote__text');

  const figcaption = document.createElement('figcaption');
  figcaption.classList.add('quote__author');

  if (quoteTextEl) {
    blockquote.innerHTML = quoteTextEl.innerHTML || quoteTextEl.textContent;
  }

  if (authorEl && authorEl.textContent.trim()) {
    figcaption.textContent = authorEl.textContent.trim();
  } else {
    authorEl = null;
  }

  // Assemble
  figure.append(blockquote);
  if (authorEl) {
    figure.append(figcaption);
  }

  // Replace original block content
  block.innerHTML = '';
  block.append(figure);
}