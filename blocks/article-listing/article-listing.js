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
 * Builds GraphQL query for fetching articles
 * @param {string} modelName - Content Fragment Model name
 * @param {string} rootPath - Optional root path filter
 * @param {number} limit - Maximum number of articles
 * @returns {string} GraphQL query
 */
function buildGraphQLQuery(modelName, rootPath, limit) {
  // Build filter clause if rootPath is provided
  const filterClause = rootPath 
    ? `filter: { _path: { _expressions: [{ value: "${rootPath}", _operator: STARTS_WITH }] } }`
    : '';

  return `
    query {
      ${modelName}List(
        ${filterClause}
        _orderBy: {
          _metadata: {
            _lastModified: DESC
          }
        }
        _limit: ${limit}
      ) {
        items {
          _path
          title
          description
          articlePath
        }
      }
    }
  `;
}

/**
 * Fetches articles from AEM GraphQL endpoint
 * @param {string} endpoint - GraphQL endpoint URL
 * @param {string} modelName - Content Fragment Model name
 * @param {string} rootPath - Optional root path filter
 * @param {number} limit - Maximum number of articles to fetch
 * @returns {Promise<Array>} Array of article objects
 */
async function fetchArticles(endpoint, modelName, rootPath, limit = 5) {
  try {
    const query = buildGraphQLQuery(modelName, rootPath, limit);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status}`);
    }

    const result = await response.json();
    
    // Check for GraphQL errors
    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    // Extract articles from GraphQL response
    const listKey = `${modelName}List`;
    const items = result.data?.[listKey]?.items || [];
    
    // Map Content Fragment data to article format
    const articles = items.map((item) => ({
      title: item.title || 'Untitled',
      description: item.description || 'No description available',
      path: item.articlePath || item._path || '#',
      _path: item._path,
    }));

    return articles;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching articles from GraphQL:', error);
    return [];
  }
}

/**
 * Creates an article card element
 * @param {Object} article - Article data
 * @returns {HTMLElement} Article card element
 */
function createArticleCard(article) {
  const card = document.createElement('div');
  card.classList.add('article-listing__card');

  const title = document.createElement('h3');
  title.classList.add('article-listing__title');
  title.textContent = article.title;

  const description = document.createElement('p');
  description.classList.add('article-listing__description');
  description.textContent = article.description || 'No description available';

  const link = document.createElement('a');
  link.classList.add('article-listing__link');
  link.href = article.path;
  link.textContent = 'Read More';
  link.setAttribute('aria-label', `Read more about ${article.title}`);

  card.append(title, description, link);
  return card;
}

/**
 * Decorates the article listing block
 * @param {Element} block - The block element
 */
export default async function decorate(block) {
  // Get authorable values
  const graphqlEndpoint = getProp(block, 'graphqlEndpoint') || '/content/cq:graphql/global/endpoint.json';
  const contentFragmentModel = getProp(block, 'contentFragmentModel') || 'article';
  const articleRootPath = getProp(block, 'articleRootPath') || '';
  const maxArticles = parseInt(getProp(block, 'maxArticles'), 10) || 5;

  // Show loading state
  block.innerHTML = '<div class="article-listing__loading">Loading articles...</div>';

  try {
    // Fetch articles from GraphQL
    const articles = await fetchArticles(
      graphqlEndpoint,
      contentFragmentModel,
      articleRootPath,
      maxArticles,
    );

    // Clear loading state
    block.innerHTML = '';

    if (articles.length === 0) {
      // No articles found
      const noArticles = document.createElement('div');
      noArticles.classList.add('article-listing__empty');
      noArticles.textContent = articleRootPath 
        ? `No articles found in ${articleRootPath}` 
        : 'No articles found';
      block.append(noArticles);
      return;
    }

    // Create container
    const container = document.createElement('div');
    container.classList.add('article-listing__container');

    // Create cards for each article
    articles.forEach((article) => {
      const card = createArticleCard(article);
      container.append(card);
    });

    block.append(container);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error decorating article listing:', error);
    block.innerHTML = '<div class="article-listing__error">Error loading articles. Please try again later.</div>';
  }
}
