import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useStorage } from "@plasmohq/storage/hook";
import type { Language, Translations } from "./i18n";
import { en, zh } from "./i18n";

type TranslationFunction = (
  key: keyof Translations | `${keyof Translations}.${string}`,
) => string;

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationFunction;
  translations: Translations;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguageState] = useStorage<Language>("language", "zh");
  const [translations, setTranslations] = useState<Translations>(zh);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const newTranslations = language === "zh" ? zh : en;
    setTranslations(newTranslations);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t: TranslationFunction = (key) => {
    const keys = key.split(".");
    let result: any = translations;

    for (const k of keys) {
      if (result && typeof result === "object" && k in result) {
        result = result[k];
      } else {
        return key;
      }
    }

    return typeof result === "string" ? result : key;
  };

  // Prevent hydration mismatch by rendering children only after mount
  if (!mounted) {
    return (
      <I18nContext.Provider
        value={{
          language: "zh",
          setLanguage: () => {},
          t: (k) => k,
          translations: zh,
        }}
      >
        {children}
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, translations }}>
      {children}
    </I18nContext.Provider>
  );
}
