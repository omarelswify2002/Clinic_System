import { create } from 'zustand';
import { persist } from 'zustand/middleware';


const useSettingsStore = create(
  persist(
    (set, get) => ({
      // Language settings
      language: 'en', // 'en' or 'ar'
      direction: 'ltr', // 'ltr' or 'rtl'
      
      // Theme settings
      theme: 'light', // 'light' or 'dark'
      
      // Actions
      setLanguage: (language) => {
        const direction = language === 'ar' ? 'rtl' : 'ltr';
        set({ language, direction });
        
        // Update document direction and lang attribute
        document.documentElement.dir = direction;
        document.documentElement.lang = language;
      },
      
      toggleLanguage: () => {
        const currentLang = get().language;
        const newLang = currentLang === 'en' ? 'ar' : 'en';
        get().setLanguage(newLang);
      },
      
      setTheme: (theme) => {
        set({ theme });
        
        // Update document class for dark mode
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
      
      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },
    }),
    {
      name: 'clinic_settings', // localStorage key
      onRehydrateStorage: () => (state) => {
        // Apply settings on app load
        if (state) {
          document.documentElement.dir = state.direction;
          document.documentElement.lang = state.language;
          
          if (state.theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
    }
  )
);

export { useSettingsStore };
export default useSettingsStore;

