// Internationalization service

import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import enTranslations from '../i18n/en.json';
import esTranslations from '../i18n/es.json';

export type Locale = 'en' | 'es';

const translations = {
  en: enTranslations,
  es: esTranslations,
};

class I18nService {
  private currentLocale: Locale = 'en';
  private listeners: Array<(locale: Locale) => void> = [];

  constructor() {
    this.init();
  }

  private async init() {
    try {
      // Try to get saved locale from storage
      const savedLocale = await AsyncStorage.getItem('locale');
      if (savedLocale && this.isValidLocale(savedLocale)) {
        this.currentLocale = savedLocale as Locale;
      } else {
        // Fall back to device locale
        const deviceLocales = getLocales();
        const deviceLocale = deviceLocales[0]?.languageCode;
        
        if (deviceLocale && this.isValidLocale(deviceLocale)) {
          this.currentLocale = deviceLocale as Locale;
        }
      }
    } catch (error) {
      console.warn('Error initializing i18n:', error);
    }
  }

  private isValidLocale(locale: string): boolean {
    return locale === 'en' || locale === 'es';
  }

  getLocale(): Locale {
    return this.currentLocale;
  }

  async setLocale(locale: Locale) {
    if (!this.isValidLocale(locale)) {
      console.warn(`Invalid locale: ${locale}`);
      return;
    }

    this.currentLocale = locale;
    
    try {
      await AsyncStorage.setItem('locale', locale);
    } catch (error) {
      console.warn('Error saving locale to storage:', error);
    }

    // Notify listeners
    this.listeners.forEach(listener => listener(locale));
  }

  subscribe(listener: (locale: Locale) => void) {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  t(key: string, params?: Record<string, string | number>): string {
    const keys = key.split('.');
    let value: any = translations[this.currentLocale];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key not found
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            console.warn(`Translation key not found: ${key}`);
            return key;
          }
        }
        break;
      }
    }

    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string for key: ${key}`);
      return key;
    }

    // Handle pluralization
    if (params && 'count' in params) {
      const count = params.count;
      const pluralKey = `${key}_plural`;
      
      if (count !== 1) {
        const pluralValue = this.t(pluralKey);
        if (pluralValue !== pluralKey) {
          value = pluralValue;
        }
      }
    }

    // Replace parameters
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        value = value.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
      });
    }

    return value;
  }

  // Convenience method for getting available locales
  getAvailableLocales(): Array<{ code: Locale; name: string }> {
    return [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Español' },
    ];
  }
}

// Create singleton instance
export const i18n = new I18nService();

// Hook for React components
import { useState, useEffect } from 'react';

export const useTranslation = () => {
  const [locale, setLocale] = useState<Locale>(i18n.getLocale());

  useEffect(() => {
    const unsubscribe = i18n.subscribe((newLocale) => {
      setLocale(newLocale);
    });

    return unsubscribe;
  }, []);

  return {
    t: i18n.t.bind(i18n),
    locale,
    setLocale: i18n.setLocale.bind(i18n),
    availableLocales: i18n.getAvailableLocales(),
  };
};
