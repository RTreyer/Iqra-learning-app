import React, { Children } from "react";
import { StyleSheet, Text, type TextProps } from "react-native";
import { useLanguage } from "@/context/LanguageContext";

// Opt-in interface labels only: regular Text still renders Arabic lesson content.
export function UiText({ children, style, accessibilityLabel, ...props }: TextProps) {
  const { language, t } = useLanguage();
  const parts = Children.toArray(children);
  const plain = parts.every((part) => typeof part === "string" || typeof part === "number");
  const alignment = StyleSheet.flatten(style)?.textAlign;
  return (
    <Text
      {...props}
      accessibilityLabel={accessibilityLabel ? t(accessibilityLabel) : undefined}
      style={[
        style,
        {
          writingDirection: language === "en" ? "ltr" : "rtl",
          ...(alignment === "left" || alignment === "right"
            ? { textAlign: language === "en" ? "left" : "right" }
            : {}),
        },
      ]}
    >
      {plain ? t(parts.join("")) : children}
    </Text>
  );
}
