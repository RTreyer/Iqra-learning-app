import AsyncStorage from "@react-native-async-storage/async-storage";
import { renderHook, waitFor } from "@testing-library/react-native";
import React from "react";
import { DEFAULT_LANGUAGE, LanguageProvider, useLanguage } from "@/context/LanguageContext";

afterEach(() => AsyncStorage.clear());

function wrapper({ children }: { children: React.ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}

test("a fresh install starts in English", async () => {
  expect(DEFAULT_LANGUAGE).toBe("en");
  const { result } = renderHook(() => useLanguage(), { wrapper });
  await waitFor(() => expect(result.current.loaded).toBe(true));
  expect(result.current.language).toBe("en");
});

test("a stored choice of Arabic wins over the default", async () => {
  await AsyncStorage.setItem("iqra_ui_language", "ar");
  const { result } = renderHook(() => useLanguage(), { wrapper });
  await waitFor(() => expect(result.current.language).toBe("ar"));
});
