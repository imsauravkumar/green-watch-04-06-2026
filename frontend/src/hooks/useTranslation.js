import { useState, useEffect } from 'react';
import { translations } from '../translations';

export const useTranslation = () => {
  const [locale, setLocale] = useState(() => {
    return localStorage.getItem('greenwatch_locale') || 'en';
  });

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLocale(lang);
      localStorage.setItem('greenwatch_locale', lang);
    }
  };

  const t = (key) => {
    // Resolve key path
    const translation = translations[locale]?.[key] || translations['en']?.[key] || key;
    return translation;
  };

  return { t, locale, changeLanguage };
};
export default useTranslation;
