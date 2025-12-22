# 🌍 Language & Theme Switching Guide

## ✨ New Features Implemented

### 1. **Multi-Language Support (Arabic & English)**
- ✅ Full Arabic translation
- ✅ English as default language
- ✅ RTL (Right-to-Left) support for Arabic
- ✅ Persistent language selection
- ✅ Beautiful animated language switcher

### 2. **Dark Mode**
- ✅ Light and Dark themes
- ✅ Smooth transitions between themes
- ✅ Persistent theme selection
- ✅ Attractive toggle button with animations
- ✅ All components support dark mode

---

## 🎯 How to Use

### Language Switcher

**Location**: Top right corner of the header (when logged in) or login page

**Features**:
- Click to toggle between English and Arabic
- Shows current language with flag/text
- Smooth rotation animation on switch
- Persists across sessions

**Behavior**:
- Switches all UI text to selected language
- Changes text direction (LTR ↔ RTL)
- Updates menu items, buttons, labels, etc.

### Theme Toggle

**Location**: Next to language switcher in header

**Features**:
- Beautiful toggle switch with sun/moon icons
- Smooth sliding animation
- Background color changes
- Persists across sessions

**Behavior**:
- Switches between light and dark mode
- Updates all components instantly
- Smooth color transitions

---

## 🏗️ Technical Implementation

### 1. Settings Store (`settingsStore.js`)

```javascript
// Zustand store with persistence
const useSettingsStore = create(
  persist(
    (set, get) => ({
      language: 'en',      // 'en' or 'ar'
      direction: 'ltr',    // 'ltr' or 'rtl'
      theme: 'light',      // 'light' or 'dark'
      
      setLanguage: (language) => { ... },
      toggleLanguage: () => { ... },
      setTheme: (theme) => { ... },
      toggleTheme: () => { ... },
    }),
    { name: 'clinic_settings' }
  )
);
```

**Features**:
- Persists to localStorage
- Auto-applies settings on page load
- Updates document attributes (dir, lang, class)

---

### 2. Translation System

**Files**:
- `src/shared/i18n/en.js` - English translations
- `src/shared/i18n/ar.js` - Arabic translations
- `src/shared/i18n/index.js` - Translation hook

**Usage**:
```javascript
import { useTranslation } from '../../shared/i18n';

function MyComponent() {
  const { t } = useTranslation();
  
  return <h1>{t('dashboard.title')}</h1>;
}
```

**Translation Keys Structure**:
```javascript
{
  common: { save, cancel, edit, delete, ... },
  nav: { dashboard, patients, queue, ... },
  auth: { login, username, password, ... },
  dashboard: { title, welcome, ... },
  patients: { title, addPatient, ... },
  queue: { title, addToQueue, ... },
  visits: { title, newVisit, ... },
  prescriptions: { title, medications, ... },
  settings: { language, theme, ... },
  messages: { success, error, ... },
  validation: { required, invalidEmail, ... },
}
```

---

### 3. Dark Mode Implementation

**Tailwind Configuration**:
```javascript
// tailwind.config.js
export default {
  darkMode: 'class',  // Enable class-based dark mode
  // ...
}
```

**CSS Classes**:
```css
/* Light mode (default) */
.bg-white

/* Dark mode */
.dark:bg-gray-800
```

**Component Example**:
```javascript
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
  Content
</div>
```

---

### 4. RTL Support

**CSS**:
```css
[dir="rtl"] {
  direction: rtl;
}

[dir="ltr"] {
  direction: ltr;
}
```

**Auto-Applied**:
- When language is set to Arabic, `dir="rtl"` is added to `<html>`
- When language is set to English, `dir="ltr"` is added to `<html>`

---

## 📦 Components Created

### 1. ThemeToggle Component

**File**: `src/shared/ui/ThemeToggle.jsx`

**Features**:
- Animated toggle switch
- Sun icon for light mode
- Moon icon for dark mode
- Smooth sliding animation
- Hover and tap effects

### 2. LanguageSwitcher Component

**File**: `src/shared/ui/LanguageSwitcher.jsx`

**Features**:
- Language icon with rotation
- Current language display
- Hover effects
- Gradient indicator on hover

---

## 🎨 Updated Components

All major components updated to support dark mode:

1. ✅ **Card** - Dark background and borders
2. ✅ **Button** - Dark variants for all button types
3. ✅ **Input** - Dark background and text
4. ✅ **Header** - Dark mode support
5. ✅ **Sidebar** - Dark background and navigation
6. ✅ **MainLayout** - Dark background
7. ✅ **AuthLayout** - Dark gradient background
8. ✅ **Login** - Full dark mode support with toggles

---

## 🧪 Testing

### Test Language Switching:

1. Open the application
2. Click the language switcher (top right)
3. ✅ UI should switch to Arabic
4. ✅ Text direction should change to RTL
5. ✅ All text should be in Arabic
6. Click again to switch back to English

### Test Dark Mode:

1. Click the theme toggle (sun/moon button)
2. ✅ Background should change to dark
3. ✅ All text should be readable
4. ✅ All components should have dark variants
5. ✅ Smooth transitions should occur
6. Click again to switch back to light mode

### Test Persistence:

1. Switch language to Arabic
2. Switch theme to dark
3. Refresh the page
4. ✅ Language should still be Arabic
5. ✅ Theme should still be dark

---

## 📝 Translation Coverage

### Fully Translated Sections:

- ✅ Navigation menu
- ✅ Login page
- ✅ Common actions (save, cancel, edit, delete)
- ✅ Dashboard
- ✅ Patients module
- ✅ Queue module
- ✅ Visits module
- ✅ Prescriptions module
- ✅ Settings
- ✅ Messages and validation

### To Add Translations:

1. Add key to `en.js` and `ar.js`
2. Use `t('key.path')` in component
3. Test both languages

---

## 🚀 Future Enhancements

Possible improvements:

1. Add more languages (French, Spanish, etc.)
2. Add system theme detection (auto dark mode)
3. Add font size adjustment
4. Add color scheme customization
5. Add language-specific date formats
6. Add number formatting per locale

---

## 💡 Tips

1. **Always use translation keys** instead of hardcoded text
2. **Test both languages** when adding new features
3. **Use dark mode classes** for all new components
4. **Keep translations consistent** across the app
5. **Use semantic color classes** (e.g., `text-gray-900 dark:text-gray-100`)

---

## 🎉 Summary

Your Clinic Management System now supports:

✅ **English & Arabic** languages  
✅ **RTL support** for Arabic  
✅ **Dark mode** with smooth transitions  
✅ **Persistent settings** across sessions  
✅ **Beautiful UI** with animations  
✅ **Fully responsive** design  

**Enjoy your multilingual, theme-aware clinic system!** 🏥✨

