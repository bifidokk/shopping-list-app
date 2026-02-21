export function initTelegramWebApp() {
  if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();

    document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff');
    document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000');
    document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#999999');
    document.documentElement.style.setProperty('--tg-theme-link-color', tg.themeParams.link_color || '#2481cc');
    document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#2481cc');
    document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
    document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color || '#f1f1f1');

    // Set safe area insets as CSS custom properties
    const setSafeAreaInsets = () => {
      const safeArea = tg.safeAreaInset || { top: 0, bottom: 0, left: 0, right: 0 };
      const contentSafeArea = tg.contentSafeAreaInset || { top: 0, bottom: 0, left: 0, right: 0 };
      document.documentElement.style.setProperty('--tg-safe-area-inset-top', `${safeArea.top}px`);
      document.documentElement.style.setProperty('--tg-safe-area-inset-bottom', `${safeArea.bottom}px`);
      document.documentElement.style.setProperty('--tg-content-safe-area-inset-top', `${contentSafeArea.top}px`);
      document.documentElement.style.setProperty('--tg-content-safe-area-inset-bottom', `${contentSafeArea.bottom}px`);
    };

    setSafeAreaInsets();
    tg.onEvent('safeAreaChanged', setSafeAreaInsets);
    tg.onEvent('contentSafeAreaChanged', setSafeAreaInsets);

    return tg;
  }
  return null;
}

export function useTelegramHaptics() {
  const haptic = window.Telegram?.WebApp?.HapticFeedback;

  return {
    impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
      haptic?.impactOccurred(style);
    },
    notification: (type: 'error' | 'success' | 'warning') => {
      haptic?.notificationOccurred(type);
    },
    selection: () => {
      haptic?.selectionChanged();
    },
  };
}

export function getTelegramUser() {
  return window.Telegram?.WebApp?.initDataUnsafe?.user || null;
}