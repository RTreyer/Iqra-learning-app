/**
 * A winding path of round stops: the units of a book, or the lessons of a unit. Done stops
 * are gold, the stop to play now is big, coloured and breathing, later stops are sand coloured
 * but can still be opened. Hudhud stands beside the stop to play now, his spoken line in a
 * bubble above him (the only Hudhud on the screen). Pictures only; text is a small caption
 * for parents.
 */

import React, { useEffect, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { Circle, Path, Svg } from "react-native-svg";

import * as haptics from "@/lib/haptics";
import { speak } from "@/lib/speech";
import { readableFill, touchTarget, yemen } from "@/theme/tokens";
import { Pulse } from "./Guide";
import { Art } from "@/components/art/Art";
import { Hudhud } from "./Hudhud";
import { Icon, StarIcon } from "./Icon";

export type StopState = "done" | "current" | "open";

export type Stop = {
  key: string;
  testID: string;
  accessibilityLabel: string;
  state: StopState;
  /** Picture inside the stop; receives the colour to draw in. */
  picture: (color: string, size: number) => React.ReactNode;
  /** Stars under a done stop (lessons). */
  stars?: number;
  /** Share done, drawn as a ring around the stop (units). */
  ring?: number;
  /** Small caption under the stop, for parents (e.g. "٣ / ٣١"). */
  caption?: string;
  /** Beside the stop: a section flag or the letters of a unit. */
  aside?: React.ReactNode;
  asideTestID?: string;
  /** testID on the gold done mark, for tests. */
  doneTestID?: string;
  /** A small flag on the stop, e.g. the letter whose lessons start here (design). */
  badge?: { text: string; label: string; testID?: string };
};

const ROW = 128;
const SIZE = 76;
const BIG = 96;
const SWING = 74;
const OFFSETS = [0, 1, 0, -1];
/** Until the path has measured itself (and in tests), assume a phone. */
const FALLBACK_WIDTH = 360;
/** Extra room above the stop where Hudhud stands, for him and his bubble. */
const GUIDE_ROOM = 84;
const BIRD = 74;
const BIRD_H = Math.round((BIRD * 130) / 140);
const BUBBLE_MAX = 210;

type Props = {
  stops: Stop[];
  color: string;
  onPress: (key: string) => void;
  /** Hudhud's line beside the stop to play now; said once when the path opens. */
  guide?: string;
  /** Where the stop to play now sits (px from the top of the path), to scroll it into view. */
  onGuideY?: (y: number) => void;
  /** Names this path (a book or unit id), so Hudhud flies on from where he last stood on it. */
  pathKey?: string;
  /** What waits at the end of the path (Hudhud's letter); `done` turns the way to it gold. */
  goal?: { node: React.ReactNode; done: boolean };
};

/** Room for the goal at the end of the path. */
const GOAL_ROW = ROW + 40;
/** A palm every few stops, on the side of the path that is free. */
const PALM_EVERY = 3;
const PALM = 58;

/** Where Hudhud last stood on each path this session (stop index), to fly on from there. */
const lastStop = new Map<string, number>();
/** How long Hudhud's flight from one stop to the next takes. */
const FLIGHT_MS = 1200;

/** Tests only: forget where Hudhud stood. */
export function resetPathMemory(): void {
  lastStop.clear();
}

export function PathMap({ stops, color, onPress, guide, onGuideY, pathKey, goal }: Props) {
  const [measured, setMeasured] = useState(0);
  const width = measured || FALLBACK_WIDTH;
  const fill = readableFill(color);
  const onLayout = (e: LayoutChangeEvent) => setMeasured(e.nativeEvent.layout.width);

  const current = stops.findIndex((s) => s.state === "current");
  // Hudhud stands at the stop to play now, or at the last stop once everything is done.
  const guideAt = guide ? (current >= 0 ? current : stops.length - 1) : -1;
  const centre = (i: number) => ({
    // Reading starts on the right: the path swings right first.
    x: width / 2 + OFFSETS[i % OFFSETS.length] * SWING,
    y: i * ROW + 54 + (guideAt >= 0 && i >= guideAt ? GUIDE_ROOM : 0),
  });
  const guideY = guideAt >= 0 ? centre(guideAt).y : null;
  // Hudhud goes through the map: he flies in from where he stood last time on this path (or
  // from the stop before, on a first visit) and lands beside the stop to play now; when that
  // stop changes while the path is open, he flies on from the old one.
  const [flight, setFlight] = useState<{ to: number; from: number | null } | null>(null);
  if (guideAt >= 0 && flight?.to !== guideAt) {
    const last = flight ? flight.to : pathKey !== undefined ? lastStop.get(pathKey) : undefined;
    const from =
      last !== undefined
        ? last !== guideAt && last < stops.length
          ? last
          : null
        : guideAt > 0
          ? guideAt - 1
          : null;
    setFlight({ to: guideAt, from });
  }
  const flyFrom = flight?.to === guideAt ? flight.from : null;
  useEffect(() => {
    if (pathKey !== undefined && guideAt >= 0) lastStop.set(pathKey, guideAt);
  }, [pathKey, guideAt]);
  useEffect(() => {
    if (guideY !== null) onGuideY?.(guideY);
  }, [guideY, onGuideY]);
  const height = stops.length * ROW + (guideAt >= 0 ? GUIDE_ROOM : 0) + (goal ? GOAL_ROW : 0);
  // The goal sits one step after the last stop.
  const ends = goal ? stops.length : stops.length - 1;
  const allDone = stops.every((s) => s.state === "done");
  const goldEnd = current >= 0 ? current : allDone ? (goal?.done ? ends : stops.length - 1) : -1;
  const pathTo = (end: number) => {
    if (end < 1) return "";
    let d = `M${centre(0).x} ${centre(0).y}`;
    for (let i = 1; i <= end; i++) {
      const a = centre(i - 1);
      const b = centre(i);
      d += ` C${a.x} ${a.y + ROW / 2} ${b.x} ${b.y - ROW / 2} ${b.x} ${b.y}`;
    }
    return d;
  };

  const pathFrom = (start: number, end: number) => {
    let d = `M${centre(start).x} ${centre(start).y}`;
    for (let i = start + 1; i <= end; i++) {
      const a = centre(i - 1);
      const b = centre(i);
      d += ` C${a.x} ${a.y + ROW / 2} ${b.x} ${b.y - ROW / 2} ${b.x} ${b.y}`;
    }
    return d;
  };

  return (
    <View style={{ height }} onLayout={onLayout}>
      {stops.length > 0 ? (
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          <Path
            d={pathTo(ends)}
            stroke={yemen.pathSand}
            strokeWidth={24}
            strokeLinecap="round"
            fill="none"
          />
          {current >= 0 && current < ends ? (
            // The way still ahead: a dashed line along the sand (design).
            <Path
              d={pathFrom(current, ends)}
              stroke="#FFFFFF"
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray="2 12"
              fill="none"
            />
          ) : null}
          {goldEnd > 0 ? (
            <Path
              d={pathTo(goldEnd)}
              stroke="#F1C463"
              strokeWidth={10}
              strokeLinecap="round"
              fill="none"
            />
          ) : null}
        </Svg>
      ) : null}
      {stops.map((stop, i) => {
        const offset = OFFSETS[i % OFFSETS.length];
        // Palms stand on the free side of the path, never where Hudhud stands.
        if (i % PALM_EVERY !== 1 || i === guideAt) return null;
        const { y } = centre(i);
        // Left edge of the picture, or the right edge when the path swings right here.
        const left = offset > 0 ? width - PALM - 6 : offset === 0 ? 16 : 6;
        return (
          <View
            key={`palm-${stop.key}`}
            pointerEvents="none"
            style={[styles.palm, { left, top: y - PALM / 2 - 6 }]}
          >
            <Art art="palm" size={PALM} />
          </View>
        );
      })}
      {goal ? (
        <View style={[styles.goal, { left: centre(ends).x - 84, top: centre(ends).y - 50 }]}>
          {goal.node}
        </View>
      ) : null}
      {stops.map((stop, i) => {
        const { x, y } = centre(i);
        const size = stop.state === "current" ? BIG : SIZE;
        const onRight = OFFSETS[i % OFFSETS.length] > 0;
        const guided = i === guideAt && guide !== undefined;
        const node = (
          <Pressable
            testID={stop.testID}
            accessibilityRole="button"
            accessibilityLabel={stop.accessibilityLabel}
            onPress={() => {
              haptics.tap();
              onPress(stop.key);
            }}
            style={({ pressed }) => [
              styles.stop,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor:
                  stop.state === "done"
                    ? yemen.gold
                    : stop.state === "current"
                      ? fill
                      : yemen.locked,
                boxShadow: `0 6px 0 ${
                  stop.state === "done"
                    ? yemen.goldEdge
                    : stop.state === "current"
                      ? readableFill(color, 9)
                      : "#CDBBA3"
                }`,
              },
              pressed && styles.pressed,
            ]}
          >
            {stop.ring !== undefined && stop.state !== "done" ? (
              <Ring share={stop.ring} size={size} />
            ) : null}
            {stop.picture(
              stop.state === "open" ? yemen.lockedInk : "#FFFFFF",
              stop.state === "current" ? 44 : 34,
            )}
            {stop.state === "done" && stop.doneTestID ? (
              <View testID={stop.doneTestID} style={styles.hidden} />
            ) : null}
          </Pressable>
        );
        return (
          <React.Fragment key={stop.key}>
            <View style={[styles.slot, { left: x - size / 2, top: y - size / 2 }]}>
              {stop.state === "current" ? <Pulse>{node}</Pulse> : node}
              {stop.badge ? (
                <View
                  testID={stop.badge.testID}
                  accessible
                  accessibilityRole="header"
                  accessibilityLabel={stop.badge.label}
                  style={[styles.badge, { borderColor: fill, left: size - 26, top: -10 }]}
                >
                  <Text style={[styles.badgeText, { color: fill }]}>{stop.badge.text}</Text>
                </View>
              ) : null}
            </View>
            {guided ? (
              <PathGuide
                key={`guide-${guideAt}`}
                text={guide}
                // Same side as the stop's label: the label then moves below Hudhud.
                side={onRight ? "left" : "right"}
                x={x}
                y={y}
                size={size}
                width={width}
                height={height}
                from={
                  flyFrom !== null
                    ? { dx: centre(flyFrom).x - x, dy: centre(flyFrom).y - y }
                    : undefined
                }
              />
            ) : null}
            <View
              pointerEvents="none"
              style={[styles.below, { left: x - 60, top: y + size / 2 + 6 }]}
            >
              {stop.state === "done" && stop.stars !== undefined ? (
                <View style={styles.stars}>
                  {[0, 1, 2].map((s) => (
                    <StarIcon key={s} size={16} dim={s >= (stop.stars ?? 0)} />
                  ))}
                </View>
              ) : null}
              {stop.caption ? <Text style={styles.caption}>{stop.caption}</Text> : null}
            </View>
            {stop.aside ? (
              <View
                testID={stop.asideTestID}
                style={[
                  styles.aside,
                  onRight
                    ? { right: width - x + size / 2 + 14, left: 8 }
                    : { left: x + size / 2 + 14, right: 8 },
                  {
                    // Beside the stop, or below Hudhud where he stands.
                    top: guided ? y + BIRD_H / 2 + 8 : y - 26,
                    alignItems: onRight ? "flex-end" : "flex-start",
                  },
                ]}
              >
                {stop.aside}
              </View>
            ) : null}
          </React.Fragment>
        );
      })}
    </View>
  );
}

/**
 * Hudhud beside a stop with his line in a bubble above him, like a guide on the map. Tapping
 * him or the bubble says the line again; it is said once when the path opens.
 */
function PathGuide({
  text,
  side,
  x,
  y,
  size,
  width,
  height,
  from,
}: {
  text: string;
  side: "left" | "right";
  x: number;
  y: number;
  size: number;
  width: number;
  height: number;
  /** He flies in from this offset (another stop) before he lands and speaks. */
  from?: { dx: number; dy: number };
}) {
  const [flight] = useState(() => new Animated.Value(from ? 0 : 1));
  const [flying, setFlying] = useState(from !== undefined);
  const [start] = useState(from);
  useEffect(() => {
    if (!start) return;
    const anim = Animated.timing(flight, {
      toValue: 1,
      duration: FLIGHT_MS,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    });
    anim.start(() => setFlying(false));
    return () => anim.stop();
  }, [flight, start]);
  useEffect(() => {
    // He speaks once he has landed.
    const timer = setTimeout(() => speak(text), (start ? FLIGHT_MS : 0) + 300);
    return () => clearTimeout(timer);
  }, [text, start]);
  const travel = start
    ? [
        {
          translateX: flight.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [start.dx, start.dx * 0.45, 0],
          }),
        },
        {
          // An arc: up over the path, then down beside the stop.
          translateY: flight.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [start.dy, start.dy * 0.5 - 46, 0],
          }),
        },
      ]
    : [];
  const gap = 6;
  const edge = 8;
  const box =
    side === "left"
      ? {
          right: width - (x - size / 2 - gap),
          width: Math.min(BUBBLE_MAX, x - size / 2 - gap - edge),
        }
      : {
          left: x + size / 2 + gap,
          width: Math.min(BUBBLE_MAX, width - (x + size / 2 + gap) - edge),
        };
  return (
    <Pressable
      testID="guide"
      accessibilityRole="button"
      accessibilityLabel={text}
      onPress={() => {
        haptics.tap();
        speak(text);
      }}
      // Anchored at the bottom: Hudhud stands level with the stop, the bubble grows upwards.
      style={({ pressed }) => [
        styles.guide,
        box,
        { bottom: height - (y + BIRD_H / 2) },
        side === "left" ? styles.guideLeft : styles.guideRight,
        pressed && styles.guidePressed,
      ]}
    >
      <Animated.View
        style={[
          styles.bubble,
          start
            ? { opacity: flight.interpolate({ inputRange: [0, 0.8, 1], outputRange: [0, 0, 1] }) }
            : null,
        ]}
      >
        <View style={{ flexShrink: 0 }}>
          <Icon name="speaker" size={18} color={yemen.clay} />
        </View>
        <Text style={styles.bubbleText}>{text}</Text>
        <View style={[styles.tail, side === "left" ? styles.tailLeft : styles.tailRight]} />
      </Animated.View>
      {/* He looks at the stop: to the right when he stands on its left. */}
      <Animated.View style={{ transform: travel }}>
        <Hudhud size={BIRD} mirrored={side === "left"} flap={flying} hop={!flying} />
      </Animated.View>
    </Pressable>
  );
}

function Ring({ share, size }: { share: number; size: number }) {
  const r = size / 2 + 6;
  const c = 2 * Math.PI * r;
  const box = size + 16;
  return (
    <Svg width={box} height={box} style={[styles.ring, { left: -8 - 5, top: -8 - 5 }]}>
      <Circle
        cx={box / 2}
        cy={box / 2}
        r={r}
        stroke="rgba(0,0,0,0.08)"
        strokeWidth={6}
        fill="none"
      />
      {share > 0 ? (
        <Circle
          cx={box / 2}
          cy={box / 2}
          r={r}
          stroke={yemen.gold}
          strokeWidth={6}
          fill="none"
          strokeDasharray={`${c * share} ${c}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${box / 2} ${box / 2})`}
        />
      ) : null}
    </Svg>
  );
}

const styles = StyleSheet.create({
  slot: { position: "absolute" },
  stop: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 5,
    borderColor: "#FFFFFF",
  },
  pressed: { opacity: 0.88, transform: [{ scale: 0.95 }] },
  guide: { position: "absolute", gap: 6, minHeight: touchTarget },
  palm: { position: "absolute", opacity: 0.9 },
  badge: {
    position: "absolute",
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontSize: 20, fontWeight: "900", lineHeight: 30 },
  goal: { position: "absolute" },
  guideLeft: { alignItems: "flex-end" },
  guideRight: { alignItems: "flex-start" },
  guidePressed: { opacity: 0.85 },
  bubble: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    boxShadow: `0 4px 0 ${yemen.sandShadow}`,
  },
  bubbleText: {
    flexShrink: 1,
    fontSize: 17,
    fontWeight: "700",
    color: yemen.ink,
    textAlign: "center",
    writingDirection: "rtl",
    lineHeight: 26,
  },
  tail: {
    position: "absolute",
    bottom: -7,
    width: 14,
    height: 14,
    backgroundColor: "#FFFFFF",
    transform: [{ rotate: "45deg" }],
  },
  tailLeft: { right: BIRD / 2 - 7 },
  tailRight: { left: BIRD / 2 - 7 },
  below: { position: "absolute", width: 120, alignItems: "center", gap: 2 },
  stars: { flexDirection: "row", gap: 2 },
  caption: { fontSize: 13, fontWeight: "700", color: yemen.inkSoft },
  aside: { position: "absolute" },
  ring: { position: "absolute" },
  hidden: { position: "absolute", width: 1, height: 1, opacity: 0 },
});
