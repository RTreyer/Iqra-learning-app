/**
 * Wide story pictures (160 × 100 view box) redrawn as inline SVG from the textbook's
 * story page. The picture is described in docs/content/textbooks first and never copied.
 */

import React from "react";
import { View } from "react-native";
import { Svg } from "react-native-svg";

import type { SceneId } from "@/content/types";

import { Birdcage } from "./Birdcage";
import { Grocery } from "./Grocery";
import { Kitchen } from "./Kitchen";

const SCENES: Record<SceneId, () => React.JSX.Element> = {
  grocery: Grocery,
  birdcage: Birdcage,
  kitchen: Kitchen,
};

type Props = { id: SceneId; accessibilityLabel?: string };

/** Fills the width of its parent at 16:10. */
export function Scene({ id, accessibilityLabel }: Props) {
  const Drawing = SCENES[id];
  return (
    <View
      style={{ width: "100%", aspectRatio: 1.6 }}
      accessible={Boolean(accessibilityLabel)}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      <Svg width="100%" height="100%" viewBox="0 0 160 100">
        <Drawing />
      </Svg>
    </View>
  );
}
