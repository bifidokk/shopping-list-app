export const STORAGE_KEYS = {
  SHOPPING_LISTS: 'shopping-lists',
  AUTH_TOKEN: 'authToken',
} as const;

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const TELEGRAM_WEBAPP = {
  BG_COLOR_FALLBACK: '#f5f5f5',
  THEME_BG_COLOR_VAR: 'var(--tg-theme-bg-color, #f5f5f5)',
} as const;

export const UI_CONFIG = {
  MAX_CONTENT_WIDTH: 'max-w-md',
  ANIMATION_DURATION: 200,
} as const;

export const COLORS = {
  PRIMARY: 'blue',
  SUCCESS: 'green',
  DANGER: 'red',
  WARNING: 'yellow',
} as const;
