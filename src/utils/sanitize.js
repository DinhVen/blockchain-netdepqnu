/**
 * Sanitize user input to prevent XSS attacks
 */
export const sanitizeText = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validate and sanitize URL
 */
export const sanitizeUrl = (url) => {
  if (!url) return '';
  const trimmed = url.trim();
  
  // Check if it's a valid HTTP/HTTPS URL
  try {
    const urlObj = new URL(trimmed);
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return '';
    }
    return trimmed;
  } catch {
    return '';
  }
};

/**
 * Validate MSSV format (8 digits)
 */
export const validateMSSV = (mssv) => {
  if (!mssv) return false;
  return /^\d{8}$/.test(mssv.trim());
};

/**
 * Validate email format
 */
export const validateQNUEmail = (email) => {
  if (!email) return false;
  return /@st\.qnu\.edu\.vn$/i.test(email.trim());
};

/**
 * Truncate text to max length
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  const str = String(text);
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};
