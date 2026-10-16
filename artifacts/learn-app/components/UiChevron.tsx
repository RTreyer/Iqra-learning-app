import React from "react";
import Svg, { Path } from "react-native-svg";
import { useLanguage } from "@/context/LanguageContext";

/** "Go forward" chevron drawn inline (no icon font to load); points left in Arabic, right in English. */
export function UiChevron({ size, color }: { size: number; color: string }) {
  const { language } = useLanguage();
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d={language === "en" ? "M9 18l6-6-6-6" : "M15 18l-6-6 6-6"}
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
