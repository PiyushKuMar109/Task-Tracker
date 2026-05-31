// Utility to generate a unique tenant ID (8 char alphanumeric, lowercase)
export function generateTenantId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Optionally, generate tenant ID from a name (slug + 2 random chars)
export function generateTenantIdFromName(name) {
  if (!name) return generateTenantId();
  const cleaned = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 6);
  const randomSuffix = Math.random().toString(36).substring(2, 4);
  return cleaned + randomSuffix;
}
