/**
 * Slugify a string.
 * @param {string} text - The input text to slugify.
 * @returns {string} The slugified string.
 */
const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '');            // Trim - from end
};

/**
 * Normalizes a single question record.
 * @param {object} item - The question object to normalize.
 * @returns {object} The normalized question object.
 */
const normalizeRecord = (item) => {
  const normalized = { ...item };

  // Trim and slugify
  if (typeof normalized.title === 'string') {
    normalized.title = normalized.title.trim();
  }
  
  if (typeof normalized.slug === 'string' && normalized.slug.trim()) {
    normalized.slug = normalized.slug.trim();
  } else {
    normalized.slug = slugify(normalized.title);
  }

  if (typeof normalized.topic === 'string') {
    normalized.topic = normalized.topic.trim();
  }
  if (typeof normalized.pattern === 'string') {
    normalized.pattern = normalized.pattern.trim();
  }

  // Normalize difficulty to lowercase (easy, medium, hard)
  if (typeof normalized.difficulty === 'string') {
    normalized.difficulty = normalized.difficulty.toLowerCase().trim();
  }

  // Trim frequency
  if (typeof normalized.frequency === 'string') {
    normalized.frequency = normalized.frequency.trim();
  }

  // Force source to be LeetCode
  normalized.source = 'LeetCode';

  // Normalize company tags (trim and capitalize matching approved companies or leave as is)
  if (Array.isArray(normalized.companyTags)) {
    normalized.companyTags = normalized.companyTags.map(tag => tag.trim());
  } else {
    normalized.companyTags = [];
  }

  // Normalize URLs
  if (typeof normalized.sourceUrl === 'string') {
    normalized.sourceUrl = normalized.sourceUrl.trim();
  } else {
    normalized.sourceUrl = null;
  }

  if (typeof normalized.videoSolutionUrl === 'string') {
    normalized.videoSolutionUrl = normalized.videoSolutionUrl.trim();
  } else {
    normalized.videoSolutionUrl = null;
  }

  if (typeof normalized.articleUrl === 'string') {
    normalized.articleUrl = normalized.articleUrl.trim();
  } else {
    normalized.articleUrl = null;
  }

  // Normalize list fields
  if (Array.isArray(normalized.prerequisites)) {
    normalized.prerequisites = normalized.prerequisites.map(pr => pr.trim());
  } else {
    normalized.prerequisites = [];
  }

  if (Array.isArray(normalized.recommendedNext)) {
    normalized.recommendedNext = normalized.recommendedNext.map(rn => rn.trim());
  } else {
    normalized.recommendedNext = [];
  }

  // Trim hint
  if (typeof normalized.hint === 'string') {
    normalized.hint = normalized.hint.trim();
  } else {
    normalized.hint = null;
  }

  // Normalize booleans
  normalized.isPremium = normalized.isPremium === true;
  normalized.isActive = normalized.isActive !== false;

  return normalized;
};

module.exports = {
  slugify,
  normalizeRecord
};
