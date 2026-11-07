/**
 * A winding path of round stops: the units of a book, or the lessons of a unit. Done stops
 * are gold, the stop to play now is big, coloured and breathing with Hudhud on it, later stops
 * are sand coloured but can still be opened. Pictures only; text is a small caption for parents.
 */

import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import { Circle, Path, Svg } from "react-native-svg";

import * as haptics from "@/lib/haptics";
import { readableFill, yemen } from "@/theme/tokens";
import { Pulse } from "./Guide";
import { Hudhud } from "./Hudhud";
import { StarIcon } from "./Icon";

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

type Props = { stops: Stop[]; color: string; onPress: (key: string) => void };

export function PathMap({ stops, color, onPress }: Props) {
  const [measured, setMeasured] = useState(0);
  const width = measured || FALLBACK_WIDTH;
  const fill = readableFill(color);
  const onLayout = (e: LayoutChangeEvent) => setMeasured(e.nativeEvent.layout.width);

  const centre = (i: number) => ({
    // Reading starts on the right: the path swings right first.
    x: width / 2 + OFFSETS[i % OFFSETS.length] * SWING,
    y: i * ROW + 54,
  });
  const current = stops.findIndex((s) => s.state === "current");
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
    <View style={{ height: stops.length * ROW }} onLayout={onLayout}>
      {stops.length > 0 ? (
        <Svg width={width} height={stops.length * ROW} style={StyleSheet.absoluteFill}>
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
            {stop.state === "current" ? (
              <View
                pointerEvents="none"
                style={[styles.bird, { left: x + size / 2 - 44, top: y - size / 2 - 50 }]}
              >
                <Hudhud size={62} />
              </View>
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
                  { top: y - 26, alignItems: onRight ? "flex-end" : "flex-start" },
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
  bird: { position: "absolute" },
  below: { position: "absolute", width: 120, alignItems: "center", gap: 2 },
  stars: { flexDirection: "row", gap: 2 },
  caption: { fontSize: 13, fontWeight: "700", color: yemen.inkSoft },
  aside: { position: "absolute" },
  ring: { position: "absolute" },
  hidden: { position: "absolute", width: 1, height: 1, opacity: 0 },
});
