import React from "react";
import { Text } from "react-native";

import type { LessonType } from "@/content/types";
import { Icon, type IconName } from "./Icon";

/** One fixed picture per kind of activity, so the child learns what a stop means. */
const PICTURE: Record<LessonType, { icon: IconName } | { glyph: string }> = {
  story: { icon: "book" },
  naming: { icon: "speaker" },
  letter_pick: { glyph: "أ" },
  word_read: { icon: "eye" },
  listen_pick: { icon: "ear" },
  behavior: { icon: "check" },
  matching: { icon: "hand" },
  trace: { icon: "pencil" },
  build_word: { glyph: "بَا" },
  counting: { glyph: "١٢٣" },
  arithmetic: { glyph: "+" },
  picture_choice: { icon: "eye" },
  compare: { glyph: "<" },
  number_fill: { glyph: "؟" },
  sort: { icon: "hand" },
};

export function lessonPicture(type: LessonType, color: string, size: number): React.ReactNode {
  const picture = PICTURE[type];
  if ("icon" in picture) return <Icon name={picture.icon} size={size} color={color} />;
  return (
    <Text style={{ fontSize: size * 0.8, fontWeight: "900", color, lineHeight: size * 1.1 }}>
      {picture.glyph}
    </Text>
  );
}
