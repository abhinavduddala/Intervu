const APPROVED_COMPANIES = new Set([
  'Amazon', 'Google', 'Microsoft', 'Meta', 'Apple', 'Uber', 'Adobe',
  'Atlassian', 'Oracle', 'Qualcomm', 'Goldman Sachs', 'JPMorgan Chase',
  'Walmart', 'Flipkart', 'PayPal', 'Salesforce', 'Roche', 'ValueMomentum',
  'Techolution'
].map(c => c.toLowerCase()));

/**
 * Validates a single question record.
 * @param {object} item - The question object to validate.
 * @param {number} recordNum - The 1-based index of the record.
 * @param {Map} topicsMap - Map of lowercase topic names to IDs.
 * @param {Map} patternsMap - Map of lowercase pattern names to IDs.
 * @returns {string[]} An array of validation error messages.
 */
const validateRecord = (item, recordNum, topicsMap, patternsMap) => {
  const errors = [];

  // 1. Title
  if (!item.title || typeof item.title !== 'string' || !item.title.trim()) {
    errors.push('title is required and must be a non-empty string');
  }

  // 2. Slug
  if (item.slug !== undefined && (typeof item.slug !== 'string' || !item.slug.trim())) {
    errors.push('slug must be a non-empty string if provided');
  }

  // 3. Topic
  if (!item.topic || typeof item.topic !== 'string' || !item.topic.trim()) {
    errors.push('topic is required and must be a non-empty string');
  } else {
    const topicKey = item.topic.toLowerCase().trim();
    if (!topicsMap.has(topicKey)) {
      errors.push(`topic "${item.topic}" does not exist in the database`);
    }
  }

  // 4. Pattern
  if (!item.pattern || typeof item.pattern !== 'string' || !item.pattern.trim()) {
    errors.push('pattern is required and must be a non-empty string');
  } else {
    const patternKey = item.pattern.toLowerCase().trim();
    if (!patternsMap.has(patternKey)) {
      errors.push(`pattern "${item.pattern}" does not exist in the database`);
    }
  }

  // 5. Difficulty
  if (!item.difficulty || typeof item.difficulty !== 'string' || !item.difficulty.trim()) {
    errors.push('difficulty is required and must be a non-empty string');
  } else {
    const diff = item.difficulty.toLowerCase().trim();
    if (!['easy', 'medium', 'hard'].includes(diff)) {
      errors.push(`difficulty must be one of 'Easy', 'Medium', 'Hard'. Got: "${item.difficulty}"`);
    }
  }

  // 6. Frequency
  if (item.frequency !== undefined && item.frequency !== null) {
    if (typeof item.frequency !== 'string' || !item.frequency.trim()) {
      errors.push('frequency must be a non-empty string');
    } else {
      const freq = item.frequency.toLowerCase().trim();
      if (!['very high', 'high', 'medium', 'low'].includes(freq)) {
        errors.push(`frequency must be one of 'Very High', 'High', 'Medium', 'Low'. Got: "${item.frequency}"`);
      }
    }
  }

  // 7. Company Tags
  if (item.companyTags !== undefined && item.companyTags !== null) {
    if (!Array.isArray(item.companyTags)) {
      errors.push('companyTags must be an array');
    } else {
      for (const tag of item.companyTags) {
        if (typeof tag !== 'string' || !tag.trim()) {
          errors.push('each company tag must be a non-empty string');
          break;
        }
        if (!APPROVED_COMPANIES.has(tag.toLowerCase().trim())) {
          errors.push(`company "${tag}" is not in the approved company list`);
        }
      }
    }
  }

  // 8. Estimated Time
  if (item.estimatedTime !== undefined && item.estimatedTime !== null) {
    const estTime = Number(item.estimatedTime);
    if (!Number.isInteger(estTime) || estTime <= 0) {
      errors.push('estimatedTime must be a positive integer');
    }
  }

  // 9. Learning Order
  if (item.learningOrder !== undefined && item.learningOrder !== null) {
    const lo = Number(item.learningOrder);
    if (!Number.isInteger(lo) || lo <= 0) {
      errors.push('learningOrder must be a positive integer');
    }
  }

  // 10. Acceptance Rate
  if (item.acceptanceRate !== undefined && item.acceptanceRate !== null) {
    const ar = Number(item.acceptanceRate);
    if (isNaN(ar) || ar < 0 || ar > 100) {
      errors.push('acceptanceRate must be a number between 0 and 100');
    }
  }

  // 11. Revision Priority
  if (item.revisionPriority !== undefined && item.revisionPriority !== null) {
    const rp = Number(item.revisionPriority);
    if (![1, 2, 3, 4].includes(rp)) {
      errors.push('revisionPriority must be 1, 2, 3, or 4');
    }
  }

  // 12. URLs
  const validateUrl = (urlStr, fieldName) => {
    if (urlStr !== undefined && urlStr !== null) {
      if (typeof urlStr !== 'string' || !urlStr.trim()) {
        errors.push(`${fieldName} must be a non-empty string`);
      } else {
        try {
          new URL(urlStr);
        } catch (e) {
          errors.push(`${fieldName} is an invalid URL: "${urlStr}"`);
        }
      }
    }
  };

  validateUrl(item.sourceUrl, 'sourceUrl');
  validateUrl(item.videoSolutionUrl, 'videoSolutionUrl');
  validateUrl(item.articleUrl, 'articleUrl');

  // 13. Prerequisites
  if (item.prerequisites !== undefined && item.prerequisites !== null) {
    if (!Array.isArray(item.prerequisites)) {
      errors.push('prerequisites must be an array');
    } else {
      for (const pr of item.prerequisites) {
        if (typeof pr !== 'string' || !pr.trim()) {
          errors.push('each prerequisite must be a non-empty string');
          break;
        }
      }
    }
  }

  // 14. Recommended Next
  if (item.recommendedNext !== undefined && item.recommendedNext !== null) {
    if (!Array.isArray(item.recommendedNext)) {
      errors.push('recommendedNext must be an array');
    } else {
      for (const rn of item.recommendedNext) {
        if (typeof rn !== 'string' || !rn.trim()) {
          errors.push('each recommendedNext must be a non-empty string');
          break;
        }
      }
    }
  }

  return errors;
};

module.exports = {
  validateRecord,
  APPROVED_COMPANIES
};
