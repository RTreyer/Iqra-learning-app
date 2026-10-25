import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { translateUi, type UiLanguage } from "@/content/ui-translations";
import { arabicDigitsIn } from "@/lib/arabicNumbers";

const LANGUAGE_KEY = "iqra_ui_language";
type LanguageContextValue = {
  language: UiLanguage;
  setLanguage: (language: UiLanguage) => void;
  t: (text: string) => string;
  /** Numbers as the child reads them: Eastern Arabic digits in Arabic, unchanged in English. */
  digits: (value: number | string) => string;
  storageError: boolean;
};
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, updateLanguage] = useState<UiLanguage>("ar");
  const [storageError, setStorageError] = useState(false);
  const changedByUser = useRef(false);
  const writes = useRef<Promise<void>>(Promise.resolve());
  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(LANGUAGE_KEY)
      .then((stored) => {
        if (mounted && !changedByUser.current && (stored === "ar" || stored === "en"))
          updateLanguage(stored);
      })
      .catch(() => {
        if (mounted) setStorageError(true);
      });
    return () => {
      mounted = false;
    };
  }, []);
  const setLanguage = useCallback((next: UiLanguage) => {
    changedByUser.current = true;
    updateLanguage(next);
    // Serialize writes so rapid toggles cannot save an older selection last.
    writes.current = writes.current.then(async () => {
      try {
        await AsyncStorage.setItem(LANGUAGE_KEY, next);
        setStorageError(false);
      } catch {
        setStorageError(true);
      }
    });
  }, []);
  const t = useCallback((text: string) => translateUi(text, language), [language]);
  const digits = useCallback(
    (value: number | string) => (language === "ar" ? arabicDigitsIn(String(value)) : String(value)),
    [language],
  );
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, digits, storageError }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
