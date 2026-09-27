'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLocale } from '../lib/types';
import { getTranslations } from '../lib/translations';
import { en } from '../lib/translations/en';
import {
  LanguageMeta,
  getLanguageMeta,
  isRTLLocale,
  detectBrowserLocale,
  SUPPORTED_LANGUAGES,
} from '../lib/languages';
import { useAuth } from './AuthContext';

export interface LanguageContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: typeof en;
  direction: 'ltr' | 'rtl';
  isRTL: boolean;
  currentLanguageMeta: LanguageMeta;
  formatDate: (date: Date | string | number) => string;
  formatTime: (date: Date | string | number) => string;
  formatDateTime: (date: Date | string | number) => string;
  formatNumber: (num: number) => string;
}

const defaultMeta = SUPPORTED_LANGUAGES[0];

const LanguageContext = createContext<LanguageContextType>({
  locale: 'en',
  setLocale: () => {},
  t: en,
  direction: 'ltr',
  isRTL: false,
  currentLanguageMeta: defaultMeta,
  formatDate: (d) => String(d),
  formatTime: (d) => String(d),
  formatDateTime: (d) => String(d),
  formatNumber: (n) => String(n),
});

const LANGUAGE_KEY = 'tb_locale_v1';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>('en');
  const [isInitialized, setIsInitialized] = useState(false);
  const { currentUser, updatePreferredLanguage } = useAuth();

  // Initialize on mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang') as SupportedLocale | null;
        if (urlLang && SUPPORTED_LANGUAGES.some((lang) => lang.code === urlLang)) {
          setLocaleState(urlLang);
          localStorage.setItem(LANGUAGE_KEY, urlLang);
          return;
        }
      }
      const saved = localStorage.getItem(LANGUAGE_KEY) as SupportedLocale | null;
      if (saved && SUPPORTED_LANGUAGES.some((lang) => lang.code === saved)) {
        setLocaleState(saved);
      } else if (currentUser?.preferredLanguage) {
        setLocaleState(currentUser.preferredLanguage);
      } else {
        const detected = detectBrowserLocale();
        setLocaleState(detected);
      }
    } catch {
      setLocaleState('en');
    } finally {
      setIsInitialized(true);
    }
  }, [currentUser?.preferredLanguage]);

  // Update HTML tag dir and lang attributes dynamically without reloads
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const isRtl = isRTLLocale(locale);
      document.documentElement.lang = locale;
      document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
      if (isRtl) {
        document.documentElement.classList.add('rtl-layout');
      } else {
        document.documentElement.classList.remove('rtl-layout');
      }
    }
  }, [locale]);

  const setLocale = (newLocale: SupportedLocale) => {
    if (!SUPPORTED_LANGUAGES.some((l) => l.code === newLocale)) return;
    setLocaleState(newLocale);
    try {
      localStorage.setItem(LANGUAGE_KEY, newLocale);
    } catch {
      // ignore
    }
    // Sync with user profile if logged in
    try {
      if (currentUser) {
        updatePreferredLanguage(newLocale);
      }
    } catch {
      // ignore
    }
  };

  const currentLanguageMeta = getLanguageMeta(locale);
  const isRTL = currentLanguageMeta.direction === 'rtl';
  const t = getTranslations(locale);

  const getIntlLocale = (loc: SupportedLocale): string => {
    if (loc === 'or') return 'or-IN';
    if (loc === 'hi') return 'hi-IN';
    if (loc === 'en') return 'en-IN';
    return currentLanguageMeta.bcp47 || 'en-IN';
  };

  // Localized Date, Time, and Number formatting
  const formatDate = (date: Date | string | number): string => {
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return String(date);
      const intlLoc = getIntlLocale(locale);
      return new Intl.DateTimeFormat(intlLoc, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(d);
    } catch {
      return String(date);
    }
  };

  const formatTime = (date: Date | string | number): string => {
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return String(date);
      const intlLoc = getIntlLocale(locale);
      return new Intl.DateTimeFormat(intlLoc, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(d);
    } catch {
      return String(date);
    }
  };

  const formatDateTime = (date: Date | string | number): string => {
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return String(date);
      const intlLoc = getIntlLocale(locale);
      return new Intl.DateTimeFormat(intlLoc, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(d);
    } catch {
      return String(date);
    }
  };

  const formatNumber = (num: number): string => {
    try {
      const intlLoc = getIntlLocale(locale);
      return new Intl.NumberFormat(intlLoc).format(num);
    } catch {
      return String(num);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        t,
        direction: currentLanguageMeta.direction,
        isRTL,
        currentLanguageMeta,
        formatDate,
        formatTime,
        formatDateTime,
        formatNumber,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
