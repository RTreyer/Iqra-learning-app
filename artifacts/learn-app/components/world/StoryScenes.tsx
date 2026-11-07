/**
 * Pictures of Hudhud's story (content/story.ts), built from the app's own drawings: Hudhud,
 * Old Sana'a, the dhow, coffee and the people of the textbook. Each scene moves a little,
 * slowly, and only while it is shown.
 */

import React, { useEffect, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { Circle, Ellipse, Path, Rect, Svg } from "react-native-svg";

import { Art } from "@/components/art/Art";
import type { StorySceneId } from "@/content/story";
import { yemen } from "@/theme/tokens";
import { Hudhud } from "./Hudhud";
import { Skyline } from "./Skyline";
import { StickerArt } from "./StickerArt";

/** A value that swings 0 → 1 → 0 forever while mounted. */
function useSwing(duration = 1400): Animated.Value {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(v, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v, duration]);
  return v;
}

function Envelope({ size = 34, letter }: { size?: number; letter?: string }) {
  return (
    <View style={{ width: size, height: size * 0.7 }}>
      <Svg width={size} height={size * 0.7} viewBox="0 0 34 24">
        <Rect
          x={1}
          y={1}
          width={32}
          height={22}
          rx={3}
          fill="#FFFFFF"
          stroke="#B9A58E"
          strokeWidth={2}
        />
        <Path d="M1 3l16 11L33 3" stroke="#B9A58E" strokeWidth={2} fill="none" />
        <Circle cx={17} cy={15} r={3} fill={yemen.red} />
      </Svg>
      {letter ? <Text style={styles.envelopeLetter}>{letter}</Text> : null}
    </View>
  );
}

/** Scene 1: Hudhud, the postman, flies over Sana'a, his mail bag strapped across his chest. */
function Postman() {
  // A slow glide back and forth, a lighter bob on top of it, and a slight bank into the turn.
  const glide = useSwing(2600);
  const bob = useSwing(650);
  return (
    <View style={styles.scene}>
      <View style={styles.sky} />
      <Cloud left={30} top={34} />
      <Cloud left={250} top={70} small />
      <Animated.View
        style={[
          styles.flying,
          {
            transform: [
              { translateX: glide.interpolate({ inputRange: [0, 1], outputRange: [46, -46] }) },
              { translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [4, -8] }) },
              { rotate: glide.interpolate({ inputRange: [0, 1], outputRange: ["4deg", "-4deg"] }) },
            ],
          },
        ]}
      >
        <Hudhud size={140} hop={false} flap bag />
      </Animated.View>
      <View style={styles.ground}>
        <Skyline />
      </View>
    </View>
  );
}

function Cloud({ left, top, small }: { left: number; top: number; small?: boolean }) {
  const w = small ? 60 : 84;
  return (
    <Svg
      width={w}
      height={w * 0.45}
      viewBox="0 0 84 38"
      style={{ position: "absolute", left, top }}
    >
      <Path
        d="M14 34 Q2 34 4 24 Q6 14 18 16 Q22 4 36 6 Q48 0 56 12 Q72 8 76 22 Q84 34 70 34 Z"
        fill="#FFFFFF"
        opacity={0.9}
      />
    </Svg>
  );
}

/** Letters that fly out of each of the three letters (envelopes) the wind pulls from the bag. */
const LETTER_GROUPS = [
  ["أ", "ب", "ت"],
  ["م", "ر", "ن"],
  ["د", "ل", "س"],
];
const TILE_COLOURS = [yemen.red, yemen.blue, yemen.green, yemen.goldDeep];
/** Hudhud's size in the wind scene, and the mouth of his bag in that picture (px from top left). */
const WIND_BIRD = 140;
/** The front edge of the bag's mouth, where the wind catches each letter (viewBox units = px here). */
const BAG_AT = { x: 44, y: 92 };
/** One envelope's flight, and the pause between envelopes. */
const ENVELOPE_MS = 2600;
const STAGGER_MS = 1000;
/** Share of the flight after which the envelope bursts open and its letters fly on. */
const BURST = 0.42;

/**
 * One envelope pulled out of the bag by the wind. Hudhud looks left and the bag hangs at his
 * front, so the envelope slides out of the front of the bag, passes low under his beak, and
 * only rises once it is clear of him: it never crosses the bird. In the air it bursts open and
 * its letters flutter on as paper cards.
 */
function BlownLetter({ index }: { index: number }) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(index * STAGGER_MS),
        Animated.timing(v, {
          toValue: 1,
          duration: ENVELOPE_MS,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.delay((LETTER_GROUPS.length - 1 - index) * STAGGER_MS),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v, index]);

  // Out under the beak first (low and forward), then up and away to where it bursts.
  const clear = { x: -62, y: 6 };
  const ex = -112 - index * 14;
  const ey = -64 + index * 18;
  const at = (via: number, end: number) =>
    v.interpolate({
      inputRange: [0, 0.16, BURST, 1],
      outputRange: [0, via, end, end],
      extrapolate: "clamp",
    });

  return (
    <>
      <Animated.View
        style={[
          styles.blownEnvelope,
          {
            left: BAG_AT.x - 17,
            top: BAG_AT.y - 12,
            // Starts tucked into the bag and grows as the wind pulls it out.
            opacity: v.interpolate({
              inputRange: [0, 0.06, BURST - 0.04, BURST + 0.04, 1],
              outputRange: [0, 1, 1, 0, 0],
            }),
            transform: [
              { translateX: at(clear.x, ex) },
              { translateY: at(clear.y, ey) },
              {
                rotate: v.interpolate({
                  inputRange: [0, 0.16, BURST],
                  outputRange: ["0deg", "-8deg", `${-30 + index * 18}deg`],
                  extrapolate: "clamp",
                }),
              },
              {
                scale: v.interpolate({
                  inputRange: [0, 0.16, BURST],
                  outputRange: [0.5, 0.9, 1.1],
                  extrapolate: "clamp",
                }),
              },
            ],
          },
        ]}
      >
        <Envelope size={34} />
      </Animated.View>
      {LETTER_GROUPS[index].map((letter, j) => {
        const dx = -30 - j * 22 + index * 8;
        const dy = -34 + j * 30;
        const turn = (j % 2 ? 1 : -1) * (18 + j * 8);
        return (
          <Animated.View
            key={letter}
            style={[
              styles.tile,
              {
                left: BAG_AT.x - 18,
                top: BAG_AT.y - 20,
                opacity: v.interpolate({
                  inputRange: [0, BURST - 0.02, BURST + 0.04, 0.85, 1],
                  outputRange: [0, 0, 1, 1, 0],
                }),
                transform: [
                  {
                    translateX: v.interpolate({
                      inputRange: [0, BURST, 1],
                      outputRange: [ex, ex, ex + dx],
                    }),
                  },
                  {
                    translateY: v.interpolate({
                      inputRange: [0, BURST, 0.7, 1],
                      outputRange: [ey, ey, ey + dy * 0.75, ey + dy],
                    }),
                  },
                  {
                    rotate: v.interpolate({
                      inputRange: [0, BURST, 1],
                      outputRange: ["0deg", "0deg", `${turn}deg`],
                    }),
                  },
                  {
                    scale: v.interpolate({
                      inputRange: [0, BURST, BURST + 0.1, 1],
                      outputRange: [0.3, 0.3, 1, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={[styles.tileLetter, { color: TILE_COLOURS[(index + j) % 4] }]}>
              {letter}
            </Text>
          </Animated.View>
        );
      })}
    </>
  );
}

/** Scene 2: a gust of wind pulls the letters out of Hudhud's bag and blows them away. */
function Wind() {
  const sway = useSwing(420);
  const gust = useSwing(1200);
  return (
    <View style={styles.scene}>
      <View style={styles.sky} />
      <Animated.View
        style={[
          styles.wind,
          {
            transform: [
              { translateX: gust.interpolate({ inputRange: [0, 1], outputRange: [24, -24] }) },
            ],
          },
        ]}
      >
        <Svg width={300} height={160} viewBox="0 0 300 160">
          <Path
            d="M10 50 Q90 10 160 50 T290 40"
            stroke="#C9D8EA"
            strokeWidth={8}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M20 100 Q110 70 180 105 T290 95"
            stroke="#D8E4F1"
            strokeWidth={6}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M40 140 Q120 120 200 140"
            stroke="#C9D8EA"
            strokeWidth={5}
            fill="none"
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>
      <View style={styles.windBird}>
        <Animated.View
          style={{
            transform: [
              { rotate: sway.interpolate({ inputRange: [0, 1], outputRange: ["-4deg", "5deg"] }) },
              { translateX: sway.interpolate({ inputRange: [0, 1], outputRange: [-2, 3] }) },
            ],
          }}
        >
          <Hudhud size={WIND_BIRD} hop={false} flap bag />
        </Animated.View>
        {LETTER_GROUPS.map((_, i) => (
          <BlownLetter key={i} index={i} />
        ))}
      </View>
    </View>
  );
}

function Sack({ x, size = 70 }: { x: number; size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 70 70"
      style={{ position: "absolute", left: x, bottom: 0 }}
    >
      <Path
        d="M14 18 Q35 8 56 18 L62 62 Q35 70 8 62 Z"
        fill="#B58A5A"
        stroke="#7A5530"
        strokeWidth={2}
      />
      <Path d="M18 18 Q35 26 52 18" stroke="#7A5530" strokeWidth={3} fill="none" />
      <Ellipse cx={30} cy={44} rx={4} ry={5.5} fill="#5E3220" />
      <Ellipse cx={41} cy={48} rx={4} ry={5.5} fill="#5E3220" />
      <Ellipse cx={36} cy={36} rx={4} ry={5.5} fill="#5E3220" />
    </Svg>
  );
}

/** Scene 3: the market of Mocha, sacks of coffee, a dhow, and nobody can count. */
function Market() {
  const swing = useSwing(900);
  return (
    <View style={styles.scene}>
      <View style={[styles.sky, { backgroundColor: "#FDF1DC" }]} />
      <View style={styles.sea} />
      <View style={styles.dhow}>
        <StickerArt id="dhow" size={110} />
      </View>
      <View style={styles.sacks}>
        <Sack x={0} />
        <Sack x={56} size={78} />
        <Sack x={120} />
        <Sack x={30} size={58} />
      </View>
      {["؟", "؟", "؟"].map((q, i) => (
        <Animated.Text
          key={i}
          style={[
            styles.question,
            { left: 40 + i * 52 },
            {
              transform: [
                {
                  translateY: swing.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, i % 2 ? -14 : 14],
                  }),
                },
              ],
            },
          ]}
        >
          {q}
        </Animated.Text>
      ))}
      <View style={styles.marketBird}>
        <Hudhud size={96} bag />
      </View>
    </View>
  );
}

/** Scene 4: the children wait at home for their messages; the ship waits too. */
function Waiting() {
  return (
    <View style={styles.scene}>
      <View style={styles.sky} />
      <View style={styles.waitHouse}>
        <Art art="house" size={170} />
      </View>
      <View style={styles.waitPeople}>
        <Art art="girl" size={84} />
        <Art art="boy" size={84} />
      </View>
      <View style={styles.waitShip}>
        <StickerArt id="dhow" size={84} />
      </View>
      <View style={styles.waitBird}>
        <Hudhud size={110} pose="cheer" bag />
      </View>
    </View>
  );
}

/** Scene 5 shows Hudhud between the two choices (the choices are buttons on the screen). */
function Choose() {
  return (
    <View style={[styles.scene, styles.chooseScene]}>
      <Hudhud size={140} bag />
    </View>
  );
}

const SCENES: Record<StorySceneId, () => React.ReactElement> = {
  postman: Postman,
  wind: Wind,
  market: Market,
  waiting: Waiting,
  choose: Choose,
};

export function StoryPicture({ id }: { id: StorySceneId }) {
  const Scene = SCENES[id];
  return <Scene />;
}

export { Envelope, Sack };

const styles = StyleSheet.create({
  scene: {
    width: "100%",
    height: 300,
    borderRadius: 28,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  sky: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "#E7F0FA" },
  ground: { position: "absolute", bottom: 0, left: 0, right: 0, alignItems: "center" },
  flying: { position: "absolute", top: 30, alignItems: "center" },
  envelopeLetter: {
    position: "absolute",
    top: -2,
    width: "100%",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "900",
    color: yemen.ink,
  },
  wind: { position: "absolute", top: 20 },
  // Hudhud on the right, so the letters have room to fly forward (left) away from him.
  windBird: { width: WIND_BIRD, height: (WIND_BIRD * 130) / 140, marginLeft: 120, marginTop: 70 },
  blownEnvelope: { position: "absolute" },
  tile: {
    position: "absolute",
    width: 36,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#D9CBB5",
    alignItems: "center",
    justifyContent: "center",
  },
  tileLetter: { fontSize: 24, fontWeight: "900", lineHeight: 34 },
  sea: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 90,
    backgroundColor: "#9CC3E6",
  },
  dhow: { position: "absolute", right: 18, bottom: 34 },
  sacks: { position: "absolute", left: 20, bottom: 10, width: 200, height: 90 },
  question: {
    position: "absolute",
    top: 70,
    fontSize: 42,
    fontWeight: "900",
    color: yemen.clay,
  },
  marketBird: { position: "absolute", top: 18, right: 120 },
  waitHouse: { position: "absolute", left: 10, bottom: 0 },
  waitPeople: { position: "absolute", left: 120, bottom: 6, flexDirection: "row" },
  waitBird: { position: "absolute", right: 14, top: 30 },
  waitShip: { position: "absolute", right: 10, bottom: 4 },
  chooseScene: { height: 170, backgroundColor: "transparent" },
});
