

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Lang = "ro" | "en";
export type Text = { ro: string; en: string };

const KEY = "vizibil.lang";
const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "ro",
  setLang: () => {},
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ro");

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved === "en" || saved === "ro") setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem(KEY, l);
  }, []);

  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export function useLang() {
  return useContext(Ctx);
}

/** L("text in romana", "english text") sau L({ ro, en }) */
export function useL() {
  const { lang } = useContext(Ctx);
  return useCallback(
    (ro: string | Text, en?: string) =>
      typeof ro === "string" ? (lang === "ro" ? ro : en ?? ro) : ro[lang],
    [lang]
  );
}
