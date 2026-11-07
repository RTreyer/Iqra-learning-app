/**
 * The pictures inside the exercises (a cat, an apple, a pencil, a boy in a thobe): small flat
 * drawings in the colours of the child's Yemen, in place of emoji, which look different on
 * every phone and often show a world foreign to the child. The content keeps naming a picture
 * by its emoji; this component draws it. An emoji without a drawing still shows as text.
 */

import React, { memo } from "react";
import { Text, View } from "react-native";
import { SvgXml } from "react-native-svg";

import { PICTURES } from "./registry";

/** Emoji variants that name the same picture: the presentation selector and skin tones. */
export function pictureKey(emoji: string): string {
  return emoji.replace(/️/g, "").replace(/[\u{1F3FB}-\u{1F3FF}]/gu, "");
}

export function hasPicture(emoji: string): boolean {
  return pictureKey(emoji) in PICTURES;
}

const xmlCache = new Map<string, string>();
function xmlFor(key: string): string | null {
  const inner = PICTURES[key];
  if (inner === undefined) return null;
  let xml = xmlCache.get(key);
  if (!xml) {
    xml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${inner}</svg>`;
    xmlCache.set(key, xml);
  }
  return xml;
}

type Props = {
  emoji: string;
  /** Width and height of the drawing in points. */
  size: number;
};

export const Picture = memo(function Picture({ emoji, size }: Props) {
  const key = pictureKey(emoji);
  const xml = xmlFor(key);
  if (!xml) {
    return <Text style={{ fontSize: size * 0.8, lineHeight: size * 1.05 }}>{emoji}</Text>;
  }
  return (
    <View testID={`picture-${key}`} style={{ width: size, height: size }}>
      <SvgXml xml={xml} width={size} height={size} />
    </View>
  );
});
