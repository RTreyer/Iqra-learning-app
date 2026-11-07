/**
 * Hudhud with a speech bubble. The bubble only mirrors what the voice says, for parents; the
 * child hears it. Tapping Hudhud or the bubble says it again.
 */

import React, { useEffect, useState } from "react";
import { useLine } from "@/components/Gloss";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { speak } from "@/lib/speech";
import * as haptics from "@/lib/haptics";
import { touchTarget, yemen } from "@/theme/tokens";
import { Hudhud, type HudhudPose } from "./Hudhud";
import { Icon } from "./Icon";
import { LOOP_NATIVE } from "./motion";

type Props = {
  /** Spoken line, fully vocalised. */
  text: string;
  /** Say it once when the screen opens. */
  speakOnMount?: boolean;
  pose?: HudhudPose;
  birdSize?: number;
  /** Bird on the start (right) side of the bubble, looking at it; otherwise bird above. */
  layout?: "row" | "stack";
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export function Guide({
  text,
  speakOnMount = false,
  pose = "stand",
  birdSize = 84,
  layout = "row",
  testID = "guide",
  style,
}: Props) {
  const line = useLine();
  useEffect(() => {
    if (!speakOnMount) return;
    const timer = setTimeout(() => speak(text), 300);
    return () => clearTimeout(timer);
  }, [speakOnMount, text]);

  const say = () => {
    haptics.tap();
    speak(text);
  };

  const bubble = (
    <View style={[styles.bubble, layout === "row" ? styles.bubbleRow : styles.bubbleStack]}>
      <View style={{ flexShrink: 0 }}>
        <Icon name="speaker" size={22} color={yemen.clay} />
      </View>
      <Text style={styles.text}>{line(text)}</Text>
    </View>
  );

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={line(text)}
      onPress={say}
      style={({ pressed }) => [
        layout === "row" ? styles.row : styles.stack,
        pressed && styles.pressed,
        style,
      ]}
    >
      {layout === "stack" ? bubble : null}
      <Hudhud size={birdSize} pose={pose} />
      {layout === "row" ? bubble : null}
    </Pressable>
  );
}

/**
 * A soft ring that breathes around the one thing to tap next. The button itself stays still,
 * so a small finger (or a test) never chases a moving target.
 */
export function Pulse({
  children,
  color = yemen.gold,
  style,
}: {
  children: React.ReactNode;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const [glow] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(glow, {
        toValue: 1,
        duration: 1600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: LOOP_NATIVE,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [glow]);
  return (
    <View style={style}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.halo,
          {
            backgroundColor: color,
            opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }),
            transform: [
              { scale: glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] }) },
            ],
          },
        ]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  halo: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, borderRadius: 999 },
  row: { flexDirection: "row-reverse", alignItems: "center", gap: 6, minHeight: touchTarget },
  stack: { alignItems: "center", gap: 4, minHeight: touchTarget },
  pressed: { opacity: 0.85 },
  bubble: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    boxShadow: `0 4px 0 ${yemen.sandShadow}`,
  },
  bubbleRow: { flexShrink: 1 },
  bubbleStack: { maxWidth: "100%" },
  text: {
    flexShrink: 1,
    fontSize: 20,
    fontWeight: "700",
    color: yemen.ink,
    textAlign: "center",
    writingDirection: "rtl",
    lineHeight: 30,
  },
});
