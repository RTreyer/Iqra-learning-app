import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { Circle, Path, Rect, Svg } from "react-native-svg";

import { StickerArt } from "@/components/world/StickerArt";
import { readableFill, yemen } from "@/theme/tokens";

/**
 * What a task brings back in Hudhud's story: a letter for his mail bag (Arabic and the
 * rest) or one of the trader's coffee sacks counted (maths). The lesson screen sets it.
 */
export type StorySymbol = "letter" | "sack";
export const StorySymbolContext = createContext<StorySymbol>("letter");

type Props = { count: number; current: number; color: string };

const ITEM = 30;
const PENDING = "#B9A58E";
const REED = "#C9A16B";
const WOOD = "#8E5A36";

type State = "done" | "now" | "open";

function Envelope({ state, fill, width }: { state: State; fill: string; width: number }) {
  const body =
    state === "done"
      ? { fill, stroke: fill, strokeWidth: 1.5 }
      : state === "now"
        ? { fill: "#FFFFFF", stroke: fill, strokeWidth: 2.5 }
        : { fill: yemen.paneEmpty, stroke: PENDING, strokeWidth: 1.5, strokeDasharray: "3 2" };
  return (
    <Svg width={width} height={(width * 22) / 30} viewBox="0 0 30 22">
      <Rect x={1.5} y={2} width={27} height={18} rx={3} {...body} />
      <Path
        d="M3 4.5 L15 13 L27 4.5"
        stroke={state === "done" ? "#FFFFFF" : state === "now" ? fill : "#CDBFAE"}
        strokeWidth={1.8}
        strokeLinejoin="round"
        fill="none"
      />
      {state === "done" ? <Circle cx={15} cy={13} r={3.2} fill={yemen.gold} /> : null}
    </Svg>
  );
}

function Sack({ state, fill, width }: { state: State; fill: string; width: number }) {
  const body =
    state === "done"
      ? { fill: REED, stroke: WOOD, strokeWidth: 1.5 }
      : state === "now"
        ? { fill: "#FFFFFF", stroke: fill, strokeWidth: 2.5 }
        : { fill: yemen.paneEmpty, stroke: PENDING, strokeWidth: 1.5, strokeDasharray: "3 2" };
  return (
    <Svg width={width} height={(width * 28) / 26} viewBox="0 0 26 28">
      <Path d="M4 26.5 Q0 14 8 7.5 H18 Q26 14 22 26.5 Z" {...body} />
      <Path d="M9 7.5 L8 2 L13 5 L18 2 L17 7.5 Z" {...body} />
      {state === "done" ? (
        <>
          <Path d="M8 9.5 H18" stroke={yemen.red} strokeWidth={2} />
          <Circle cx={10.5} cy={18} r={1.6} fill="#5E3220" />
          <Circle cx={15.5} cy={20} r={1.6} fill="#5E3220" />
        </>
      ) : null}
    </Svg>
  );
}

/** Hudhud's mail bag with a letter peeking out: where the collected letters go. */
function MailBag() {
  return (
    <Svg width={40} height={34} viewBox="0 0 40 34">
      <Path d="M7 12 Q20 -4 33 12" stroke={WOOD} strokeWidth={3} fill="none" />
      <Rect
        x={11}
        y={6}
        width={16}
        height={11}
        rx={1.5}
        fill="#FFFFFF"
        stroke="#D9C7A8"
        transform="rotate(-8 19 11)"
      />
      <Rect x={4} y={11} width={32} height={21} rx={5} fill={WOOD} />
      <Path d="M4 16 Q20 25 36 16 V14 a3 3 0 0 0 -3 -3 H7 a3 3 0 0 0 -3 3 Z" fill="#6B3F1F" />
      <Rect x={17} y={18} width={6} height={5} rx={1} fill={yemen.gold} />
    </Svg>
  );
}

/** One letter or sack; it hops once when its task is done, as if it flew into the bag. */
function Item({
  state,
  symbol,
  fill,
  width,
}: {
  state: State;
  symbol: StorySymbol;
  fill: string;
  width: number;
}) {
  const [hop] = useState(() => new Animated.Value(0));
  const wasDone = useRef(state === "done");
  useEffect(() => {
    if (state !== "done" || wasDone.current) return;
    wasDone.current = true;
    const anim = Animated.sequence([
      Animated.timing(hop, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(hop, { toValue: 0, friction: 4, useNativeDriver: true }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [state, hop]);
  const Drawing = symbol === "sack" ? Sack : Envelope;
  return (
    <Animated.View
      style={{
        transform: [
          { translateY: hop.interpolate({ inputRange: [0, 1], outputRange: [0, -12] }) },
          { scale: hop.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] }) },
        ],
      }}
    >
      <Drawing state={state} fill={fill} width={width} />
    </Animated.View>
  );
}

/**
 * Round progress as part of Hudhud's story, a picture instead of "question 2 of 5": one
 * letter (or sack) per task. Done ones are coloured, the current one is outlined in the
 * subject colour, the ones still to come are dashed. At the end of the row, in reading
 * direction, waits Hudhud's mail bag (or the trader's ship).
 */
export function StoryProgress({ count, current, color }: Props) {
  const symbol = useContext(StorySymbolContext);
  const fill = readableFill(color);
  // Many tasks: the items shrink so the row fits a phone.
  const width = count > 8 ? Math.max(14, Math.floor((8 * ITEM) / count)) : ITEM;
  return (
    <View
      testID="story-progress"
      style={styles.row}
      accessibilityRole="progressbar"
      aria-valuemin={0}
      aria-valuemax={count}
      aria-valuenow={current + 1}
    >
      {Array.from({ length: count }, (_, i) => (
        <Item
          key={i}
          symbol={symbol}
          state={i < current ? "done" : i === current ? "now" : "open"}
          fill={fill}
          width={width}
        />
      ))}
      <View style={styles.end}>
        {symbol === "sack" ? <StickerArt id="dhow" size={40} /> : <MailBag />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Arabic reads right to left: the first task is on the right, the bag waits on the left.
  row: {
    flexDirection: "row-reverse",
    gap: 4,
    justifyContent: "center",
    alignItems: "flex-end",
    flexWrap: "wrap",
  },
  end: { marginRight: 4 },
});
