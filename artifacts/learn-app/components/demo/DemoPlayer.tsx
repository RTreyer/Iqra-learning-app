import React, { useEffect, useRef, useState, type ComponentRef } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";

import { ActivityHost } from "@/components/ActivityHost";
import { UiText } from "@/components/UiText";
import { useLanguage } from "@/context/LanguageContext";
import { DEMO_END, DEMO_START, demoFor, type DemoId, type DemoStep } from "@/content/demos";
import { estimateSpeechMs, isSpeaking, speak, stopSpeaking } from "@/lib/speech";
import { colors, radius, touchTarget, yemen } from "@/theme/tokens";
import { useLatest } from "@/components/activities/shared/useLatest";
import { Icon } from "@/components/world/Icon";
import { useGuide } from "@/components/world/LessonGuide";
import { DemoContext, createRegistry, measureNode, type Box, type DemoEntry } from "./DemoContext";

/** The activity speaks its first prompt 400 ms after it mounts; wait for that to start. */
const SETTLE_MS = 800;
/** After a tap, the activity may speak (praise, the word): give it time to start. */
const AFTER_TAP_MS = 350;
const MOVE_MS = 800;
const PRESS_MS = 140;
const TRACE_MS = 2400;
const TRACE_FRAMES = 40;
const FIND_TIMEOUT_MS = 2000;
const POLL_MS = 150;
const SILENT_MAX_MS = 8000;
/** The hand is drawn in a box of this size; its fingertip sits at TIP. */
const HAND = 56;
const TIP = { x: 24, y: 6 };

const CANCELLED = Symbol("cancelled");
const noop = () => {};

type Props = {
  /** Which demo: an activity type, or `trace_lines` (demoIdFor). */
  id: DemoId;
  color: string;
  /** Spoken before the demo starts, e.g. the instruction when the child asks again. */
  preface?: string;
  onDone: () => void;
};

/**
 * Plays the worked example of an activity type: the real activity with the demo's own
 * content, driven by a hand that taps and traces while the voice explains. Touches are
 * blocked until it ends; Skip ends it at once. Nothing is scored.
 */
export function DemoPlayer({ id, color, preface, onDone }: Props) {
  const { t } = useLanguage();
  const demo = demoFor(id);
  const [registry] = useState(createRegistry);
  const [mounted, setMounted] = useState(false);
  const [handShown, setHandShown] = useState(false);
  const [hand] = useState(() => new Animated.ValueXY({ x: 0, y: 0 }));
  const [handScale] = useState(() => new Animated.Value(1));
  const root = useRef<ComponentRef<typeof View> | null>(null);
  const done = useLatest(onDone);
  // Hudhud tells the example: what the voice says shows in his bubble above the lesson.
  const guide = useGuide();
  const steps = useLatest(demo.steps);
  const intro = useLatest(preface);

  useEffect(() => {
    let alive = true;
    let handPlaced = false;
    const live = async <T,>(p: Promise<T>): Promise<T> => {
      const value = await p;
      if (!alive) throw CANCELLED;
      return value;
    };
    const sleep = (ms: number) => live(new Promise<void>((r) => setTimeout(r, ms)));
    const say = (text: string) => {
      guide.say(text);
      return sayAloud(text);
    };
    const sayAloud = (text: string) =>
      live(
        new Promise<void>((resolve) => {
          let settled = false;
          const finish = () => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            resolve();
          };
          const timer = setTimeout(finish, estimateSpeechMs(text));
          speak(text, { onDone: finish });
        }),
      );
    const waitSilent = async () => {
      const until = Date.now() + SILENT_MAX_MS;
      while (Date.now() < until && (await live(isSpeaking()))) await sleep(POLL_MS);
    };
    const animate = (animation: Animated.CompositeAnimation, ms: number) =>
      live(
        new Promise<void>((resolve) => {
          const timer = setTimeout(resolve, ms + 300);
          animation.start(() => {
            clearTimeout(timer);
            resolve();
          });
        }),
      );
    const find = async (step: { testID: string } | { label: string }) => {
      const until = Date.now() + FIND_TIMEOUT_MS;
      for (;;) {
        const entry = registry.find(step);
        if (entry || Date.now() >= until) return entry;
        await sleep(POLL_MS);
      }
    };
    const origin = () => live(measureNode(root.current));
    /** Hand position (top left of its box) that puts the fingertip on `x, y` of the root. */
    const handAt = (x: number, y: number) => ({ x: x - TIP.x, y: y - TIP.y });
    const placeHand = async (rootBox: Box | null) => {
      if (handPlaced) return;
      handPlaced = true;
      // Enter from the bottom middle of the demo.
      hand.setValue(handAt((rootBox?.width ?? 300) / 2, (rootBox?.height ?? 400) - HAND));
      setHandShown(true);
    };
    const moveTo = async (entry: DemoEntry) => {
      const [rootBox, box] = [await origin(), await live(entry.measure())];
      await placeHand(rootBox);
      if (!rootBox || !box) return;
      const to = handAt(box.x - rootBox.x + box.width / 2, box.y - rootBox.y + box.height / 2);
      await animate(
        Animated.timing(hand, { toValue: to, duration: MOVE_MS, useNativeDriver: false }),
        MOVE_MS,
      );
    };
    const press = () =>
      animate(
        Animated.sequence([
          Animated.timing(handScale, { toValue: 0.8, duration: PRESS_MS, useNativeDriver: false }),
          Animated.timing(handScale, { toValue: 1, duration: PRESS_MS, useNativeDriver: false }),
        ]),
        2 * PRESS_MS,
      );
    const trace = async (entry: DemoEntry, relative?: { x: number; y: number }[]) => {
      const points = entry.tracePath?.(relative) ?? null;
      if (!points || points.length === 0 || !entry.draw) return;
      const [rootBox, pad] = [await origin(), await live(entry.measure())];
      await placeHand(rootBox);
      const dx = rootBox && pad ? pad.x - rootBox.x : 0;
      const dy = rootBox && pad ? pad.y - rootBox.y : 0;
      await animate(
        Animated.timing(hand, {
          toValue: handAt(dx + points[0].x, dy + points[0].y),
          duration: MOVE_MS,
          useNativeDriver: false,
        }),
        MOVE_MS,
      );
      const stride = Math.max(1, Math.ceil(points.length / TRACE_FRAMES));
      for (let k = stride; k < points.length; k += stride) {
        const p = points[k];
        hand.setValue(handAt(dx + p.x, dy + p.y));
        entry.draw(points.slice(0, k + 1), false);
        await sleep(TRACE_MS / TRACE_FRAMES);
      }
      entry.draw(points, true);
    };
    const play = async (step: DemoStep) => {
      if ("say" in step) return say(step.say);
      const target = "tap" in step ? step.tap : step.trace;
      const entry = await find(target);
      if (!entry) {
        if (__DEV__) console.warn(`Demo ${id}: nothing to show for`, target);
        return;
      }
      if ("trace" in step) {
        await trace(entry, step.path);
      } else {
        await moveTo(entry);
        await press();
        entry.press?.();
      }
      await sleep(AFTER_TAP_MS);
      await waitSilent();
    };

    (async () => {
      try {
        if (intro.current) await say(intro.current);
        await say(DEMO_START);
        setMounted(true);
        await sleep(SETTLE_MS);
        await waitSilent();
        for (const step of steps.current) await play(step);
        await say(DEMO_END);
        done.current();
      } catch (e) {
        if (e !== CANCELLED) throw e;
      }
    })();
    return () => {
      alive = false;
      stopSpeaking();
      guide.say(null);
    };
  }, [id, registry, hand, handScale, done, steps, intro, guide]);

  const skip = () => {
    stopSpeaking();
    done.current();
  };

  return (
    <View ref={root} style={styles.root} testID="demo">
      <View style={styles.badge}>
        <Icon name="eye" size={20} color={yemen.inkSoft} />
        <UiText style={styles.badgeText}>مثال</UiText>
      </View>
      {mounted ? (
        <DemoContext.Provider value={registry}>
          <ActivityHost lesson={demo.lesson} color={color} attemptKey="demo" onComplete={noop} />
        </DemoContext.Provider>
      ) : null}
      {/* Blocks the child's touches while the hand plays. */}
      <View
        testID="demo-blocker"
        style={StyleSheet.absoluteFill}
        onStartShouldSetResponder={() => true}
      >
        {handShown ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.hand,
              { transform: [...hand.getTranslateTransform(), { scale: handScale }] },
            ]}
          >
            <Icon name="hand" size={HAND} color={yemen.clayDeep} />
          </Animated.View>
        ) : null}
        <Pressable
          testID="demo-skip"
          accessibilityRole="button"
          accessibilityLabel={t("تخطَّ")}
          onPress={skip}
          hitSlop={8}
          style={({ pressed }) => [styles.skip, pressed && styles.pressed]}
        >
          <UiText style={styles.skipText}>تخطَّ</UiText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 4 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 8,
    borderRadius: radius.md,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: { fontSize: 16, fontWeight: "800", color: colors.text },
  hand: {
    position: "absolute",
    left: 0,
    top: 0,
    width: HAND,
    height: HAND,
    alignItems: "center",
    justifyContent: "center",
  },
  skip: {
    position: "absolute",
    top: 0,
    left: 0,
    minWidth: touchTarget,
    minHeight: touchTarget,
    paddingHorizontal: 12,
    borderRadius: touchTarget / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.75 },
  skipText: { fontSize: 15, fontWeight: "700", color: colors.text },
});
