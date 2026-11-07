/**
 * The English explanation mode on screen (lib/explain.ts): `useLine` shows a line of Hudhud or
 * the app in English, `Gloss` shows small below a piece of learning what it means. In Arabic
 * mode both leave everything as it is.
 */

import React, { useCallback } from "react";
import { StyleSheet, Text, type StyleProp, type TextStyle } from "react-native";

import { useLanguage } from "@/context/LanguageContext";
import { explainLine, gloss } from "@/lib/explain";

/** Translates a line for display; re-renders with the menu language. */
export function useLine(): (text: string) => string {
  const { language } = useLanguage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback((text: string) => explainLine(text), [language]);
}

/** The English meaning of a word or sentence, or the reading of a letter, below it. */
export function Gloss({ text, style }: { text: string; style?: StyleProp<TextStyle> }) {
  useLanguage();
  const meaning = gloss(text);
  if (!meaning) return null;
  return (
    <Text testID="gloss" style={[styles.gloss, style]} numberOfLines={3}>
      {meaning}
    </Text>
  );
}

const styles = StyleSheet.create({
  gloss: {
    fontSize: 12,
    fontWeight: "600",
    fontStyle: "italic",
    color: "#7D6A52",
    textAlign: "center",
    writingDirection: "ltr",
  },
});
