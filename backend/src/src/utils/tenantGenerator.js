const crypto = require('crypto');

/**
 * Generates a unique tenant ID
 * Format: 8 character alphanumeric string (lowercase)
 * Example: "a3f7b2c1"
 */
function generateTenantId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generates a tenant ID based on company name
 * Converts company name to a slug-like format
 * @param {string} companyName - The company name
 * @returns {string} - Generated tenant ID
 */
function generateTenantIdFromName(companyName) {
  if (!companyName) return generateTenantId();
  
  // Convert to lowercase and remove special characters
  const cleaned = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 6);
  
  // Add 2 random characters for uniqueness
  const randomSuffix = crypto.randomBytes(1).toString('hex').substring(0, 2);
  return cleaned + randomSuffix;
}

module.exports = {
  generateTenantId,
  generateTenantIdFromName
};
