const STORAGE_PREFIX = 'clinic_';
const AUTH_KEYS = new Set(['auth_token', 'current_user']);

const getStorageArea = (key) => (AUTH_KEYS.has(key) ? sessionStorage : localStorage);

export const storage = {
  get: (key) => {
    try {
      const area = getStorageArea(key);
      const item = area.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  },

  set: (key, value) => {
    try {
      const area = getStorageArea(key);
      area.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error writing to storage:', error);
      return false;
    }
  },

  remove: (key) => {
    try {
      const area = getStorageArea(key);
      area.removeItem(STORAGE_PREFIX + key);
      return true;
    } catch (error) {
      console.error('Error removing from storage:', error);
      return false;
    }
  },

  clear: () => {
    try {
      [localStorage, sessionStorage].forEach((area) => {
        Object.keys(area)
          .filter(key => key.startsWith(STORAGE_PREFIX))
          .forEach(key => area.removeItem(key));
      });
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  },
};
