import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * ThemeContext - Gerencia tema claro/escuro da aplicação
 */

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(
    typeof window !== 'undefined'
      ? document.documentElement.classList.contains('dark')
      : false
  );

  // Sincronizar com localStorage e preferência do sistema
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    let shouldBeDark = prefersDark;

    if (savedTheme === 'dark') {
      shouldBeDark = true;
    } else if (savedTheme === 'light') {
      shouldBeDark = false;
    }

    const html = document.documentElement;
    if (shouldBeDark) {
      html.classList.add('dark');
      setIsDark(true);
    } else {
      html.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    const newIsDark = !isDark;

    if (newIsDark) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    setIsDark(newIsDark);
  };

  const value = {
    isDark,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext deve ser usado dentro de ThemeProvider');
  }
  return context;
};

export default ThemeContext;
