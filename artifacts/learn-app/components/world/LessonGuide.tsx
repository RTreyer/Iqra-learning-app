/**
 * Hudhud in the lessons: he stands above every activity, his bubble shows what to do, and he
 * reacts to the child's answers (a happy hop when right, a puzzled wobble when wrong). During a
 * worked example the bubble shows what he is explaining. Activities report answers through
 * `useGuide().react`; outside a lesson that is a no-op.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLine } from "@/components/Gloss";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";

import * as haptics from "@/lib/haptics";
import { speak } from "@/lib/speech";
import { touchTarget, yemen } from "@/theme/tokens";
import { Hudhud } from "./Hudhud";
import { Icon } from "./Icon";
import { LOOP_NATIVE } from "./motion";

export type GuideReaction = "right" | "wrong";
export type GuideMood = "idle" | GuideReaction;

type GuideApi = {
  /** An answer was given: Hudhud reacts to it. */
  react: (reaction: GuideReaction) => void;
  /** Show this line in Hudhud's bubble instead of the task (null: back to the task). */
  say: (line: string | null) => void;
};

const GuideContext = createContext<GuideApi>({ react: () => {}, say: () => {} });

export function useGuide(): GuideApi {
  return useContext(GuideContext);
}

/** How long Hudhud shows his reaction before he waits again. */
const REACTION_MS = 1000;

/** The lesson screen's guide: reactions and the line shown, plus the API for activities. */
export function useGuideState() {
  const [mood, setMood] = useState<GuideMood>("idle");
  const [line, setLine] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const react = useCallback((reaction: GuideReaction) => {
    if (timer.current) clearTimeout(timer.current);
    setMood(reaction);
    timer.current = setTimeout(() => setMood("idle"), REACTION_MS);
  }, []);
  const api = useMemo(() => ({ react, say: setLine }), [react]);
  return { api, mood, line };
}

export function GuideProvider({ api, children }: { api: GuideApi; children: React.ReactNode }) {
  return <GuideContext.Provider value={api}>{children}</GuideContext.Provider>;
}

/** Hudhud with the task in a bubble; tapping him says it again. */
export function LessonGuide({ text, mood = "idle" }: { text: string; mood?: GuideMood }) {
  const line = useLine();
  const [move] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (mood === "idle") return;
    move.setValue(0);
    const anim = Animated.timing(move, {
      toValue: 1,
      duration: 700,
      easing: Easing.linear,
      useNativeDriver: LOOP_NATIVE,
    });
    anim.start();
    return () => anim.stop();
  }, [mood, move]);
  const motion =
    mood === "right"
      ? [
          {
            translateY: move.interpolate({
              inputRange: [0, 0.25, 0.5, 0.75, 1],
              outputRange: [0, -14, 0, -8, 0],
            }),
          },
        ]
      : mood === "wrong"
        ? [
            {
              rotate: move.interpolate({
                inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
                outputRange: ["0deg", "-12deg", "9deg", "-6deg", "3deg", "0deg"],
              }),
            },
          ]
        : [];
  return (
    <Pressable
      testID="lesson-guide"
      accessibilityRole="button"
      accessibilityLabel={line(text)}
      onPress={() => {
        haptics.tap();
        speak(text);
      }}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Animated.View testID={`lesson-guide-${mood}`} style={{ transform: motion }}>
        <Hudhud size={58} pose={mood === "right" ? "cheer" : "stand"} />
      </Animated.View>
      <View style={styles.bubble}>
        <View style={styles.speaker}>
          <Icon name="speaker" size={18} color={yemen.clay} />
        </View>
        <Text style={styles.text}>{line(text)}</Text>
        <View style={styles.tail} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    minHeight: touchTarget,
  },
  pressed: { opacity: 0.85 },
  bubble: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    boxShadow: `0 3px 0 ${yemen.sandShadow}`,
  },
  speaker: { flexShrink: 0 },
  text: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: yemen.ink,
    textAlign: "center",
    writingDirection: "rtl",
    lineHeight: 25,
  },
  tail: {
    position: "absolute",
    right: -6,
    top: "50%",
    marginTop: -6,
    width: 12,
    height: 12,
    backgroundColor: "#FFFFFF",
    transform: [{ rotate: "45deg" }],
  },
});
