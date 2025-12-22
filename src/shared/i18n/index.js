import { en } from './en';
import { ar } from './ar';
import useSettingsStore from '../../app/settingsStore';

const translations = {
  en,
  ar,
};

// Hook to use translations
export const useTranslation = () => {
  const language = useSettingsStore((state) => state.language);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    return value;
  };

  return { t, language };
};

export { en, ar };

