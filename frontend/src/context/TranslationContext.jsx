import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations } from '../translations';

const TranslationContext = createContext();

export const TranslationProvider = ({ children }) => {
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
    const translation = translations[locale]?.[key] || translations['en']?.[key] || key;
    return translation;
  };

  return (
    <TranslationContext.Provider value={{ t, locale, changeLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslationContext = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslationContext must be used within a TranslationProvider');
  }
  return context;
};
