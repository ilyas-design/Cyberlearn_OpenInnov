'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// Define the types for our language context
type Locale = 'en' | 'fr';
type Translations = Record<string, any>;

interface LanguageContextType {
  locale: Locale;
  translations: Translations;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

// Create the context with default values
const LanguageContext = createContext<LanguageContextType>({
  locale: 'fr',
  translations: {},
  setLocale: () => {},
  t: () => '',
});

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  
  // Default to French or get from localStorage if available
  const [locale, setLocaleState] = useState<Locale>('fr');
  const [translations, setTranslations] = useState<Translations>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load translations for the current locale
  useEffect(() => {
    const loadTranslations = async () => {
      setIsLoading(true);
      try {
        // Dynamic import of the translations
        const translationModule = await import(`../locales/${locale}.json`);
        setTranslations(translationModule.default);
      } catch (error) {
        console.error('Failed to load translations:', error);
        // Fallback to empty translations object
        setTranslations({});
      }
      setIsLoading(false);
    };

    loadTranslations();
  }, [locale]);

  // Load the locale from localStorage on client side
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && (savedLocale === 'en' || savedLocale === 'fr')) {
      setLocaleState(savedLocale);
    }
  }, []);

  // Set locale and save to localStorage
  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
    
    // Optional: Redirect to the same page in the new locale
    // This would require path structure with locale prefixes like /en/about, /fr/about
    // router.push(pathname.replace(/^\/(en|fr)/, `/${newLocale}`));
  };

  // Translation function
  const t = (key: string): string => {
    if (isLoading) return '';
    
    // Split the key path (e.g., 'hero.title')
    const keys = key.split('.');
    
    // Navigate through the translations object
    let result = translations;
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) break;
    }
    
    // Return the found translation or the key as fallback
    return typeof result === 'string' ? result : key;
  };

  return (
    <LanguageContext.Provider value={{ locale, translations, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
