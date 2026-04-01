export default function decorate(block) {
  // All paragraphs inside this quote instance
  const paragraphs = Array.from(block.querySelectorAll('p'));

  // Prefer AEM authoring props when present
  const quoteByProp = block.querySelector('[data-aue-prop="quoteText"]');
  const authorByProp = block.querySelector('[data-aue-prop="author"]');

  // Quote text:
  // 1) AEM: data-aue-prop="quoteText"
  // 2) EDS: second <p> if available
  // 3) Fallback: first <p>
  const quoteTextEl =
    quoteByProp ||paragraphs[0];


  // Author:
  // 1) AEM: data-aue-prop="author"
  // 2) EDS: first <p> (as long as it's not the same as quote)
  let authorEl =
    authorByProp ||paragraphs[1];

  // If we have neither, nothing to render
  if (!quoteTextEl && !authorEl) {
    // Fail-safe: leave original markup in place
    // console.warn('quote block: no content found', block);
    return;
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