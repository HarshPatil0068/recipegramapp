export const THEME_KEY = 'recipegram-theme';

export const getPreferredTheme = () => {
  if (typeof window === 'undefined') return 'light';

  const storedTheme = window.localStorage.getItem(THEME_KEY);
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const applyTheme = (theme) => {
  if (typeof document === 'undefined') return;

  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
};

export const initializeTheme = () => {
  const theme = getPreferredTheme();
  applyTheme(theme);
  return theme;
};

export const persistTheme = (theme) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(THEME_KEY, theme);
  }
  applyTheme(theme);
};
