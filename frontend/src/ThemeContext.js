// ThemeContext provides dark/light mode state and toggling for the app
import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// Create a React context for theme mode
const ThemeContext = createContext();

// Custom hook to access theme mode and toggler
export function useThemeMode() {
  return useContext(ThemeContext);
}

// Provider component to wrap the app and manage theme state
export function CustomThemeProvider({ children }) {
  // Detect system preference and check localStorage for saved mode
  const systemPrefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('darkMode');
    return stored !== null ? JSON.parse(stored) : systemPrefersDark;
  });

  // Persist dark mode preference in localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Create a Material UI theme object based on mode
  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  }), [darkMode]);

  // Memoize context value
  const value = useMemo(() => ({ darkMode, setDarkMode }), [darkMode]);

  // Provide theme and context to children
  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
}
