import * as React from "react";
import { cn } from "../lib/utils";
import { designTokenProvider } from "../lib/design-tokens";

/**
 * Design System Provider Context
 * Provides design tokens and theme configuration to all child components
 */
interface DesignSystemContextValue {
  /** Design token provider instance */
  tokens: typeof designTokenProvider;
  /** Current theme mode */
  theme: 'light' | 'dark' | 'system';
  /** Toggle theme mode */
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  /** Color preference for nutrition components */
  colorMode: 'default' | 'colorblind-friendly';
  /** Set color accessibility mode */
  setColorMode: (mode: 'default' | 'colorblind-friendly') => void;
  /** Language/locale for components */
  locale: 'en' | 'nl' | 'ar';
  /** Set component locale */
  setLocale: (locale: 'en' | 'nl' | 'ar') => void;
  /** Ali-specific preferences */
  aliPreferences: {
    proteinTarget: number;
    halalRequired: boolean;
    showProteinEfficiency: boolean;
  };
  /** Update Ali-specific preferences */
  setAliPreferences: (preferences: Partial<DesignSystemContextValue['aliPreferences']>) => void;
}

const DesignSystemContext = React.createContext<DesignSystemContextValue | undefined>(undefined);

/**
 * Hook to use design system context
 * Must be used within a DesignSystemProvider
 */
export function useDesignSystem() {
  const context = React.useContext(DesignSystemContext);
  if (context === undefined) {
    throw new Error('useDesignSystem must be used within a DesignSystemProvider');
  }
  return context;
}

/**
 * Hook to safely use design system context (returns undefined if not in provider)
 */
export function useDesignSystemOptional() {
  return React.useContext(DesignSystemContext);
}

export interface DesignSystemProviderProps {
  children: React.ReactNode;
  /** Default theme mode */
  defaultTheme?: 'light' | 'dark' | 'system';
  /** Default color accessibility mode */
  defaultColorMode?: 'default' | 'colorblind-friendly';
  /** Default locale */
  defaultLocale?: 'en' | 'nl' | 'ar';
  /** Default Ali preferences */
  defaultAliPreferences?: Partial<DesignSystemContextValue['aliPreferences']>;
  /** Enable theme persistence in localStorage */
  enablePersistence?: boolean;
  /** Custom CSS class for the provider container */
  className?: string;
}

/**
 * Design System Provider Component
 * Wraps the application to provide design tokens, theme, and preferences
 */
export function DesignSystemProvider({
  children,
  defaultTheme = 'system',
  defaultColorMode = 'default',
  defaultLocale = 'en',
  defaultAliPreferences = {},
  enablePersistence = true,
  className,
}: DesignSystemProviderProps) {
  const [theme, setThemeState] = React.useState<'light' | 'dark' | 'system'>(defaultTheme);
  const [colorMode, setColorMode] = React.useState<'default' | 'colorblind-friendly'>(defaultColorMode);
  const [locale, setLocale] = React.useState<'en' | 'nl' | 'ar'>(defaultLocale);
  const [aliPreferences, setAliPreferencesState] = React.useState({
    proteinTarget: 170, // Ali's 170g protein target
    halalRequired: true, // Ali requires halal products
    showProteinEfficiency: true,
    ...defaultAliPreferences,
  });

  // Persist preferences to localStorage
  React.useEffect(() => {
    if (!enablePersistence || typeof window === 'undefined') return;

    const stored = localStorage.getItem('design-system-preferences');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.theme) setThemeState(parsed.theme);
        if (parsed.colorMode) setColorMode(parsed.colorMode);
        if (parsed.locale) setLocale(parsed.locale);
        if (parsed.aliPreferences) {
          setAliPreferencesState(prev => ({ ...prev, ...parsed.aliPreferences }));
        }
      } catch (error) {
        console.warn('Failed to parse stored design system preferences:', error);
      }
    }
  }, [enablePersistence]);

  // Save preferences to localStorage
  const savePreferences = React.useCallback(() => {
    if (!enablePersistence || typeof window === 'undefined') return;

    const preferences = {
      theme,
      colorMode,
      locale,
      aliPreferences,
    };

    localStorage.setItem('design-system-preferences', JSON.stringify(preferences));
  }, [theme, colorMode, locale, aliPreferences, enablePersistence]);

  React.useEffect(() => {
    savePreferences();
  }, [savePreferences]);

  // Apply theme to document
  React.useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Apply color mode classes
  React.useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('colorblind-friendly');

    if (colorMode === 'colorblind-friendly') {
      root.classList.add('colorblind-friendly');
    }
  }, [colorMode]);

  // Apply locale classes
  React.useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('locale-en', 'locale-nl', 'locale-ar');
    root.classList.add(`locale-${locale}`);

    // Set dir attribute for RTL languages
    root.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
  }, [locale]);

  // Enhanced theme setter with persistence
  const setTheme = React.useCallback((newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
  }, []);

  // Enhanced Ali preferences setter
  const setAliPreferences = React.useCallback((
    updates: Partial<DesignSystemContextValue['aliPreferences']>
  ) => {
    setAliPreferencesState(prev => ({ ...prev, ...updates }));
  }, []);

  const contextValue: DesignSystemContextValue = React.useMemo(() => ({
    tokens: designTokenProvider,
    theme,
    setTheme,
    colorMode,
    setColorMode,
    locale,
    setLocale,
    aliPreferences,
    setAliPreferences,
  }), [theme, setTheme, colorMode, locale, aliPreferences, setAliPreferences]);

  return (
    <DesignSystemContext.Provider value={contextValue}>
      <div
        className={cn(
          "design-system-root",
          `theme-${theme}`,
          `color-mode-${colorMode}`,
          `locale-${locale}`,
          className
        )}
        data-theme={theme}
        data-color-mode={colorMode}
        data-locale={locale}
      >
        {children}
      </div>
    </DesignSystemContext.Provider>
  );
}

/**
 * Theme Toggle Component
 * Provides a quick way to toggle between light/dark/system themes
 */
export interface ThemeToggleProps {
  className?: string;
  showLabels?: boolean;
}

export function ThemeToggle({ className, showLabels = false }: ThemeToggleProps) {
  const { theme, setTheme } = useDesignSystem();

  const themes: Array<{ value: 'light' | 'dark' | 'system'; label: string; icon: string }> = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'system', label: 'System', icon: '💻' },
  ];

  return (
    <div className={cn("flex gap-1 p-1 bg-muted rounded-md", className)}>
      {themes.map(({ value, label, icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-medium transition-colors",
            theme === value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <span>{icon}</span>
          {showLabels && <span>{label}</span>}
        </button>
      ))}
    </div>
  );
}

/**
 * Locale Selector Component
 * Provides a way to switch between supported locales
 */
export interface LocaleSelectorProps {
  className?: string;
  showLabels?: boolean;
}

export function LocaleSelector({ className, showLabels = true }: LocaleSelectorProps) {
  const { locale, setLocale } = useDesignSystem();

  const locales: Array<{ value: 'en' | 'nl' | 'ar'; label: string; flag: string }> = [
    { value: 'en', label: 'English', flag: '🇬🇧' },
    { value: 'nl', label: 'Nederlands', flag: '🇳🇱' },
    { value: 'ar', label: 'العربية', flag: '🇸🇦' },
  ];

  return (
    <div className={cn("flex gap-1 p-1 bg-muted rounded-md", className)}>
      {locales.map(({ value, label, flag }) => (
        <button
          key={value}
          onClick={() => setLocale(value)}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-medium transition-colors",
            locale === value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <span>{flag}</span>
          {showLabels && <span>{label}</span>}
        </button>
      ))}
    </div>
  );
}

/**
 * Ali Preferences Panel Component
 * Provides controls for Ali-specific preferences
 */
export interface AliPreferencesPanelProps {
  className?: string;
}

export function AliPreferencesPanel({ className }: AliPreferencesPanelProps) {
  const { aliPreferences, setAliPreferences } = useDesignSystem();

  return (
    <div className={cn("space-y-4 p-4 bg-muted/50 rounded-lg", className)}>
      <h3 className="text-sm font-medium">Ali's Preferences</h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="protein-target" className="text-sm">
            Daily Protein Target
          </label>
          <input
            id="protein-target"
            type="number"
            min="100"
            max="300"
            value={aliPreferences.proteinTarget}
            onChange={(e) => setAliPreferences({ proteinTarget: Number(e.target.value) })}
            className="w-16 px-2 py-1 text-xs border rounded"
          />
        </div>

        <div className="flex items-center justify-between">
          <label htmlFor="halal-required" className="text-sm">
            Halal Required
          </label>
          <input
            id="halal-required"
            type="checkbox"
            checked={aliPreferences.halalRequired}
            onChange={(e) => setAliPreferences({ halalRequired: e.target.checked })}
            className="rounded"
          />
        </div>

        <div className="flex items-center justify-between">
          <label htmlFor="show-efficiency" className="text-sm">
            Show Protein Efficiency
          </label>
          <input
            id="show-efficiency"
            type="checkbox"
            checked={aliPreferences.showProteinEfficiency}
            onChange={(e) => setAliPreferences({ showProteinEfficiency: e.target.checked })}
            className="rounded"
          />
        </div>
      </div>
    </div>
  );
}

export default DesignSystemProvider;