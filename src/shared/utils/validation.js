export const validateNationalId = (nationalId) => {
  if (!nationalId) return false;
  // Basic validation - adjust based on your country's national ID format
  const cleaned = nationalId.replace(/\s/g, '');
  return cleaned.length >= 10 && /^\d+$/.test(cleaned);
};

export const validatePhone = (phone) => {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  return cleaned.length >= 10 && /^\+?\d+$/.test(cleaned);
};

export const validateEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateRequired = (value) => {
  if (typeof value === 'string') return value.trim().length > 0;
  return value !== null && value !== undefined;
};

