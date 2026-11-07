import React, { Children } from "react";
import { StyleSheet, Text, type TextProps } from "react-native";
import { useLanguage } from "@/context/LanguageContext";
import { explainLine } from "@/lib/explain";

// Opt-in interface labels only: regular Text still renders Arabic lesson content.
export function UiText({ children, style, accessibilityLabel, ...props }: TextProps) {
  const { language, t, digits } = useLanguage();
  // A menu label, else (English mode) a line of the content such as a unit's title.
  const label = (text: string) => {
    const menu = t(text);
    return language === "en" && menu === text ? explainLine(text) : menu;
  };
  const parts = Children.toArray(children);
  const plain = parts.every((part) => typeof part === "string" || typeof part === "number");
  const alignment = StyleSheet.flatten(style)?.textAlign;
  return (
    <Text
      {...props}
      accessibilityLabel={accessibilityLabel ? digits(label(accessibilityLabel)) : undefined}
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
      {plain ? digits(label(parts.join(""))) : children}
    </Text>
  );
}
