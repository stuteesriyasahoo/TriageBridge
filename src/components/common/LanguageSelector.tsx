'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { SUPPORTED_LANGUAGES, LanguageMeta } from '../../lib/languages';
import { SupportedLocale } from '../../lib/types';
import { Globe, Search, Check, ChevronDown, Mic, Volume2 } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'header' | 'inline' | 'modal' | 'pill';
  className?: string;
  showDetails?: boolean;
}

export function LanguageSelector({
  variant = 'header',
  className = '',
  showDetails = false,
}: LanguageSelectorProps) {
  const { locale, setLocale, currentLanguageMeta, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input on open
      setTimeout(() => searchInputRef.current?.focus(), 60);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredLanguages = SUPPORTED_LANGUAGES.filter((lang) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      lang.nameEn.toLowerCase().includes(q) ||
      lang.nameNative.toLowerCase().includes(q) ||
      lang.script.toLowerCase().includes(q) ||
      lang.code.toLowerCase().includes(q)
    );
  });

  const handleSelect = (code: SupportedLocale) => {
    setLocale(code);
    setIsOpen(false);
    setSearchQuery('');
  };

  if (variant === 'inline') {
    return (
      <div className={`w-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-xs ${className}`}>
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 flex items-center justify-center font-medium">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Select Language / भाषा चुनें
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                23 Languages (English + 22 Official Indian Languages)
              </p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 font-medium">
            Active: {currentLanguageMeta.nameNative} ({currentLanguageMeta.nameEn})
          </span>
        </div>

        {/* Search bar */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search language in English or native script (e.g. Odia, ଓଡ଼ିଆ, Hindi, বাংলা)..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0F8B8D]"
          />
        </div>

        {/* Grid list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
          {filteredLanguages.map((lang) => {
            const isSelected = locale === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang.code)}
                className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'border-[#0F8B8D] bg-teal-50/70 dark:bg-teal-950/40 text-teal-900 dark:text-teal-100 font-medium ring-1 ring-[#0F8B8D]'
                    : 'border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200'
                }`}
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-sm font-semibold truncate flex items-center gap-1.5">
                    {lang.nameNative}
                    {lang.direction === 'rtl' && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
                        RTL
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {lang.nameEn} • {lang.script}
                  </span>
                </div>
                {isSelected ? (
                  <Check className="w-4 h-4 text-[#0F8B8D] shrink-0" />
                ) : (
                  <div className="flex items-center gap-1 opacity-60 shrink-0">
                    {lang.speechRecognitionSupported && (
                      <span title="Voice STT supported">
                        <Mic className="w-3 h-3 text-slate-400" />
                      </span>
                    )}
                    {lang.textToSpeechSupported && (
                      <span title="Voice TTS supported">
                        <Volume2 className="w-3 h-3 text-slate-400" />
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Header Dropdown Variant (Default)
  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-medium transition-all shadow-xs backdrop-blur-xs"
        aria-expanded={isOpen}
        aria-label="Select Application Language"
      >
        <Globe className="w-3.5 h-3.5 text-teal-300 shrink-0" />
        <span className="font-semibold">{currentLanguageMeta.nameNative}</span>
        <span className="text-slate-200 text-[11px] hidden sm:inline-block">
          ({currentLanguageMeta.nameEn})
        </span>
        {currentLanguageMeta.direction === 'rtl' && (
          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-400/30 text-amber-200 uppercase font-bold">
            RTL
          </span>
        )}
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-300 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Select Language (23)
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Active: {currentLanguageMeta.nameNative}
            </span>
          </div>

          {/* Search Bar */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search English or native script..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Scrollable list */}
          <div className="max-h-72 overflow-y-auto p-1.5 space-y-1 divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredLanguages.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No matching language found
              </div>
            ) : (
              filteredLanguages.map((lang) => {
                const isSelected = locale === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelect(lang.code)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                      isSelected
                        ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-950 dark:text-teal-200 font-medium'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {lang.nameNative}
                        </span>
                        {lang.direction === 'rtl' && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 uppercase font-bold">
                            RTL
                          </span>
                        )}
                        {lang.speechRecognitionSupported && (
                          <span title="Voice STT Available">
                            <Mic className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {lang.nameEn} • {lang.script}
                      </span>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 text-center">
            Zero-reload instant translation • Fallback to English
          </div>
        </div>
      )}
    </div>
  );
}
