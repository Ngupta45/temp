/**
 * Converts a DAM image URL to Scene7 URL
 * @param {string} damUrl - The DAM URL from AEM
 * @returns {string} Scene7 URL
 */
function convertToScene7Url(damUrl) {
  // If already a Scene7 URL, return as-is
  if (damUrl.includes('scene7.com') || damUrl.includes('.is/image/')) {
    return damUrl;
  }

  // Extract the asset path from DAM URL
  // Example: /content/dam/mysite/products/product1.jpg
  const assetPath = damUrl.replace(/^.*\/content\/dam\//, '');
  
  // Build Scene7 URL (adjust domain and company name as per your Scene7 config)
  // Format: https://{company}.scene7.com/is/image/{company}/{assetPath}
  // You may need to adjust this based on your Scene7 configuration
  const scene7Domain = 'YOUR_COMPANY.scene7.com'; // Replace with your Scene7 domain
  const scene7Company = 'YOUR_COMPANY'; // Replace with your Scene7 company name
  
  // Remove file extension for Scene7
  const assetName = assetPath.replace(/\.[^/.]+$/, '');
  
  return `https://${scene7Domain}/is/image/${scene7Company}/${assetName}`;
}

/**
 * Gets authorable property value from block
 * @param {Element} block - The block element
 * @param {string} propName - The property name
 * @returns {string|null} The property value
 */
function getProp(block, propName) {
  const el = block.querySelector(`[data-aue-prop="${propName}"]`);
  return el ? el.textContent.trim() : null;
}

/**
 * Decorates the product hero block
 * @param {Element} block - The block element
 */
export default function decorate(block) {
  // Get authorable values from block or use defaults
  const heading = getProp(block, 'heading') || 'Product Hero';
  const ctaText = getProp(block, 'ctaText') || 'Learn More';
  const ctaLink = getProp(block, 'ctaLink') || '#';
  const imageAlt = getProp(block, 'imageAlt') || heading;

  // Get image element
  const picture = block.querySelector('picture');
  const img = picture ? picture.querySelector('img') : null;

  let imageUrl = '';
  if (img && img.src) {
    // Convert DAM URL to Scene7 URL
    imageUrl = convertToScene7Url(img.src);
  }

  // Build the product hero structure
  const productHeroHTML = `
    <div class="product-hero__container">
      <div class="product-hero__content">
        <h1 class="product-hero__heading">${heading}</h1>
        <div class="product-hero__cta">
          <a href="${ctaLink}" class="product-hero__button" title="${ctaText}">
            ${ctaText}
          </a>
        </div>
      </div>
      <div class="product-hero__image">
        ${imageUrl ? `<img src="${imageUrl}" alt="${imageAlt}" loading="eager" />` : ''}
      </div>
    </div>
  `;

  // Clear and set new content
  block.innerHTML = productHeroHTML;
}
