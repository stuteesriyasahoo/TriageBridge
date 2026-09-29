'use client';

import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { theme, mounted, toggleTheme } = useTheme();

  if (!mounted) {
    return (
      <button
        type="button"
        disabled
        className={`p-2 rounded-xl text-slate-200 opacity-60 flex items-center gap-1.5 focus:outline-hidden cursor-default ${className}`}
        aria-label="Toggle Light and Dark Mode"
      >
        <span className="w-4 h-4 block" />
        {showLabel && (
          <span className="text-xs font-medium">Theme</span>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 dark:text-slate-300 dark:hover:text-white transition-colors flex items-center gap-1.5 focus:outline-hidden ${className}`}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle Light and Dark Mode"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-teal-200" />
      )}
      {showLabel && (
        <span className="text-xs font-medium">
          {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
        </span>
      )}
    </button>
  );
}
