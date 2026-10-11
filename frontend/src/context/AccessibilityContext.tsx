import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AccessibilitySettings {
  theme: 'light' | 'dark';
  reducedMotion: boolean;
  fontSize: 'standard' | 'medium' | 'large';
  lineSpacing: 'normal' | 'relaxed' | 'loose';
  letterSpacing: 'normal' | 'wide';
  dyslexiaFont: boolean;
  focusMode: boolean;
  highContrast: boolean;
  density: 'comfortable' | 'compact';
  disableAnimations: boolean;
  speechRate: number;
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
  isSpeaking: boolean;
  speakText: (text: string) => void;
  stopSpeaking: () => void;
  readCurrentPageAloud: () => void;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  theme: 'light',
  reducedMotion: false,
  fontSize: 'standard',
  lineSpacing: 'normal',
  letterSpacing: 'normal',
  dyslexiaFont: false,
  focusMode: false,
  highContrast: false,
  density: 'comfortable',
  disableAnimations: false,
  speechRate: 1.0,
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
    const prefersReducedMotion =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return { ...DEFAULT_SETTINGS, theme: defaultTheme, reducedMotion: prefersReducedMotion };
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    localStorage.setItem('ndce_accessibility', JSON.stringify(settings));
    localStorage.setItem('ndce_theme', settings.theme);

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

    // Line spacing (WCAG 2.2 SC 1.4.12 Text Spacing)
    root.classList.remove('line-spacing-normal', 'line-spacing-relaxed', 'line-spacing-loose');
    root.classList.add(`line-spacing-${settings.lineSpacing || 'normal'}`);

    // Letter spacing
    root.classList.remove('letter-spacing-normal', 'letter-spacing-wide');
    root.classList.add(`letter-spacing-${settings.letterSpacing || 'normal'}`);

    // Dyslexia-friendly typography
    if (settings.dyslexiaFont) {
      root.classList.add('dyslexia-font');
    } else {
      root.classList.remove('dyslexia-font');
    }

    // Focus mode (distraction reduction)
    if (settings.focusMode) {
      root.classList.add('focus-mode-active');
    } else {
      root.classList.remove('focus-mode-active');
    }

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

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/\s+/g, ' ').trim().slice(0, 4000);
    if (!cleanText) return;
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = settings.speechRate || 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const readCurrentPageAloud = () => {
    if (typeof document === 'undefined') return;
    const mainEl = document.querySelector('main') || document.body;
    const text = mainEl?.innerText || '';
    speakText(text);
  };

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
    stopSpeaking();
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
        isSpeaking,
        speakText,
        stopSpeaking,
        readCurrentPageAloud,
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
