import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance, useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>(systemColorScheme || 'light');

  const isDark = theme === 'dark';

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme Colors
export const Colors = {
  light: {
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    primary: '#1E3A8A',
    accent: '#FACC15',
    border: '#E5E7EB',
    error: '#EF4444',
    success: '#10B981',
  },
  dark: {
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    primary: '#3B82F6',
    accent: '#FACC15',
    border: '#374151',
    error: '#F87171',
    success: '#34D399',
  }
};
