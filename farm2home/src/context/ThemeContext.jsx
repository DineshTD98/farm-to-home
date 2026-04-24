import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();
const DAY_START_HOUR = 6;
const NIGHT_START_HOUR = 18;

const getThemeFromLocalTime = () => {
  const currentHour = new Date().getHours();
  return currentHour >= DAY_START_HOUR && currentHour < NIGHT_START_HOUR ? 'light' : 'dark';
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getThemeFromLocalTime);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const syncTimeTheme = () => setTheme(getThemeFromLocalTime());
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncTimeTheme();
      }
    };

    syncTimeTheme();
    const intervalId = window.setInterval(syncTimeTheme, 60 * 1000);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDarkMode: theme === 'dark',
        isAutoTheme: true,
      }}
    >
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
