import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AccessibilitySettings {
  theme: 'light' | 'dark';
  reducedMotion: boolean;
  fontSize: 'standard' | 'medium' | 'large';
  highContrast: boolean;
  density: 'comfortable' | 'compact';
  disableAnimations: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  updateSetting: <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => void;
  resetSettings: () => void;
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
  closeDrawer: () => void;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  theme: 'light',
  reducedMotion: false,
  fontSize: 'standard',
  highContrast: false,
  density: 'comfortable',
  disableAnimations: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const savedTheme = localStorage.getItem('ndce_theme') as 'light' | 'dark' | null;
    const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const defaultTheme: 'light' | 'dark' = savedTheme || (prefersDark ? 'dark' : 'light');

    const saved = localStorage.getItem('ndce_accessibility');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          theme: savedTheme || parsed.theme || defaultTheme,
        };
      } catch {
        return { ...DEFAULT_SETTINGS, theme: defaultTheme };
      }
    }
    // Respect OS preference if present
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return { ...DEFAULT_SETTINGS, theme: defaultTheme, reducedMotion: prefersReducedMotion };
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('ndce_accessibility', JSON.stringify(settings));
    localStorage.setItem('ndce_theme', settings.theme);

    // Apply classes to root HTML element
    const root = document.documentElement;

    // Dark mode class
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Font size
    root.classList.remove('text-size-standard', 'text-size-medium', 'text-size-large');
    root.classList.add(`text-size-${settings.fontSize}`);

    // Contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Density
    root.classList.remove('density-comfortable', 'density-compact');
    root.classList.add(`density-${settings.density}`);

    // Reduced motion
    if (settings.reducedMotion || settings.disableAnimations) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  }, [settings]);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const toggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);
  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        theme: settings.theme,
        toggleTheme,
        updateSetting,
        resetSettings,
        isDrawerOpen,
        toggleDrawer,
        closeDrawer,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
