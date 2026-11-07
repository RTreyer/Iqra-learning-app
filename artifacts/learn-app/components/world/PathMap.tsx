/**
 * A winding path of round stops: the units of a book, or the lessons of a unit. Done stops
 * are gold, the stop to play now is big, coloured and breathing, later stops are sand coloured
 * but can still be opened. Hudhud stands beside the stop to play now, his spoken line in a
 * bubble above him (the only Hudhud on the screen). Pictures only; text is a small caption
 * for parents.
 */

import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import { Circle, Path, Svg } from "react-native-svg";

import * as haptics from "@/lib/haptics";
import { speak } from "@/lib/speech";
import { readableFill, touchTarget, yemen } from "@/theme/tokens";
import { Pulse } from "./Guide";
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
};

export function PathMap({ stops, color, onPress, guide, onGuideY }: Props) {
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
  useEffect(() => {
    if (guideY !== null) onGuideY?.(guideY);
  }, [guideY, onGuideY]);
  const height = stops.length * ROW + (guideAt >= 0 ? GUIDE_ROOM : 0);
  const goldEnd =
    current >= 0 ? current : stops.every((s) => s.state === "done") ? stops.length - 1 : -1;
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

  return (
    <View style={{ height }} onLayout={onLayout}>
      {stops.length > 0 ? (
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          <Path
            d={pathTo(stops.length - 1)}
            stroke={yemen.pathSand}
            strokeWidth={24}
            strokeLinecap="round"
            fill="none"
          />
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
            </View>
            {guided ? (
              <PathGuide
                text={guide}
                // Same side as the stop's label: the label then moves below Hudhud.
                side={onRight ? "left" : "right"}
                x={x}
                y={y}
                size={size}
                width={width}
                height={height}
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
}: {
  text: string;
  side: "left" | "right";
  x: number;
  y: number;
  size: number;
  width: number;
  height: number;
}) {
  useEffect(() => {
    const timer = setTimeout(() => speak(text), 300);
    return () => clearTimeout(timer);
  }, [text]);
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
      <View style={styles.bubble}>
        <View style={{ flexShrink: 0 }}>
          <Icon name="speaker" size={18} color={yemen.clay} />
        </View>
        <Text style={styles.bubbleText}>{text}</Text>
        <View style={[styles.tail, side === "left" ? styles.tailLeft : styles.tailRight]} />
      </View>
      {/* He looks at the stop: to the right when he stands on its left. */}
      <Hudhud size={BIRD} mirrored={side === "left"} />
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
