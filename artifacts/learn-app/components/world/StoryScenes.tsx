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
import { LOOP_NATIVE } from "./motion";

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
          useNativeDriver: LOOP_NATIVE,
        }),
        Animated.timing(v, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: LOOP_NATIVE,
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
        <Hudhud size={140} hop={false} flap bag={3} />
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

/** Letters that fly out of each of the three letters (envelopes) the storm tears from the bag. */
const LETTER_GROUPS = [
  ["أ", "ب", "ت"],
  ["م", "ر", "ن"],
  ["د", "ل", "س"],
];
const TILE_COLOURS = [yemen.red, yemen.blue, yemen.green, yemen.goldDeep];
/** Hudhud's size in the storm scene. */
const STORM_BIRD = 140;
/** The front edge of the bag's mouth, where the storm catches each letter (px in the bird box). */
const BAG_AT = { x: 44, y: 92 };
/** When the storm tears out each letter, after the scene opens; then the bag stays empty. */
const TEAR_AT_MS = [900, 1800, 2700];
/** One envelope's flight. */
const ENVELOPE_MS = 2300;
/** Share of the flight after which the envelope bursts open and its letters fly on. */
const BURST = 0.4;

/** A value that runs 0 → 1 over and over (no way back), after an initial delay. */
function useRun(duration: number, delay = 0): Animated.Value {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    // The loop starts after the delay; a loop nested in a sequence would not repeat.
    let loop: Animated.CompositeAnimation | undefined;
    const start = setTimeout(() => {
      loop = Animated.loop(
        Animated.timing(v, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: LOOP_NATIVE,
        }),
      );
      loop.start();
    }, delay);
    return () => {
      clearTimeout(start);
      loop?.stop();
    };
  }, [v, duration, delay]);
  return v;
}

/**
 * One envelope torn out of the bag by the storm, once. Hudhud looks left and the bag hangs at
 * his front, so the envelope slides out of the front of the bag, passes low under his beak, and
 * only then is flung up, spinning, away from him: it never crosses the bird. In the air it
 * bursts open and its letters whirl away as paper cards.
 */
function TornLetter({ index }: { index: number }) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const anim = Animated.sequence([
      Animated.delay(TEAR_AT_MS[index]),
      Animated.timing(v, {
        toValue: 1,
        duration: ENVELOPE_MS,
        easing: Easing.linear,
        useNativeDriver: LOOP_NATIVE,
      }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [v, index]);

  // Out under the beak first (low and forward), then flung up and away to where it bursts.
  const clear = { x: -58, y: 8 };
  const ex = -118 - index * 12;
  const ey = -70 + index * 20;
  const at = (via: number, end: number) =>
    v.interpolate({
      inputRange: [0, 0.14, BURST, 1],
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
            opacity: v.interpolate({
              inputRange: [0, 0.05, BURST - 0.04, BURST + 0.04, 1],
              outputRange: [0, 1, 1, 0, 0],
            }),
            transform: [
              { translateX: at(clear.x, ex) },
              { translateY: at(clear.y, ey) },
              {
                rotate: v.interpolate({
                  inputRange: [0, 0.14, BURST],
                  outputRange: ["0deg", "-10deg", `${index % 2 ? 300 : -320}deg`],
                  extrapolate: "clamp",
                }),
              },
              {
                scale: v.interpolate({
                  inputRange: [0, 0.14, BURST],
                  outputRange: [0.5, 0.9, 1.15],
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
        // Each card whirls: out, a loop with the gust, and away.
        const dx = -34 - j * 22 + index * 8;
        const dy = -30 + j * 32;
        const swirl = j % 2 ? 26 : -26;
        return (
          <Animated.View
            key={letter}
            style={[
              styles.tile,
              {
                left: BAG_AT.x - 18,
                top: BAG_AT.y - 20,
                opacity: v.interpolate({
                  inputRange: [0, BURST - 0.02, BURST + 0.04, 0.88, 1],
                  outputRange: [0, 0, 1, 1, 0],
                }),
                transform: [
                  {
                    translateX: v.interpolate({
                      inputRange: [0, BURST, 0.6, 0.8, 1],
                      outputRange: [ex, ex, ex + dx * 0.4, ex + dx * 0.7 + swirl, ex + dx],
                    }),
                  },
                  {
                    translateY: v.interpolate({
                      inputRange: [0, BURST, 0.6, 0.8, 1],
                      outputRange: [ey, ey, ey + dy * 0.5 - 22, ey + dy * 0.6 + 14, ey + dy],
                    }),
                  },
                  {
                    rotate: v.interpolate({
                      inputRange: [0, BURST, 1],
                      outputRange: ["0deg", "0deg", `${(j % 2 ? 1 : -1) * (200 + j * 80)}deg`],
                    }),
                  },
                  {
                    scale: v.interpolate({
                      inputRange: [0, BURST, BURST + 0.1, 1],
                      outputRange: [0.3, 0.3, 1, 0.9],
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

/** A streak of blown sand racing across the picture, again and again. */
function SandStreak({ top, width, ms, delay, opacity }: StreakProps) {
  const run = useRun(ms, delay);
  return (
    <Animated.View
      style={[
        styles.streak,
        {
          top,
          width,
          opacity,
          transform: [
            {
              translateX: run.interpolate({ inputRange: [0, 1], outputRange: [420, -width - 40] }),
            },
          ],
        },
      ]}
    />
  );
}
type StreakProps = { top: number; width: number; ms: number; delay: number; opacity: number };

/** A grain of sand tumbling across with the gusts. */
function Grain({ top, size, ms, delay, wobble }: GrainProps) {
  const run = useRun(ms, delay);
  return (
    <Animated.View
      style={[
        styles.grain,
        {
          top,
          width: size,
          height: size,
          borderRadius: size / 2,
          transform: [
            { translateX: run.interpolate({ inputRange: [0, 1], outputRange: [400, -30] }) },
            {
              translateY: run.interpolate({
                inputRange: [0, 0.25, 0.5, 0.75, 1],
                outputRange: [0, -wobble, 0, wobble, 0],
              }),
            },
          ],
        },
      ]}
    />
  );
}
type GrainProps = { top: number; size: number; ms: number; delay: number; wobble: number };

/** A dark cloud rolling across the sky. */
function StormCloud({
  top,
  width,
  ms,
  delay,
}: {
  top: number;
  width: number;
  ms: number;
  delay: number;
}) {
  const run = useRun(ms, delay);
  return (
    <Animated.View
      style={[
        styles.stormCloud,
        {
          top,
          transform: [
            {
              translateX: run.interpolate({ inputRange: [0, 1], outputRange: [400, -width - 20] }),
            },
          ],
        },
      ]}
    >
      <Svg width={width} height={width * 0.45} viewBox="0 0 84 38">
        <Path
          d="M14 34 Q2 34 4 24 Q6 14 18 16 Q22 4 36 6 Q48 0 56 12 Q72 8 76 22 Q84 34 70 34 Z"
          fill="#6F6A73"
          opacity={0.85}
        />
      </Svg>
    </Animated.View>
  );
}

// Fixed, varied paths so the storm looks wild but plays the same every time.
const STREAKS: StreakProps[] = Array.from({ length: 11 }, (_, i) => ({
  top: 30 + ((i * 53) % 230),
  width: 60 + ((i * 37) % 90),
  ms: 700 + ((i * 131) % 600),
  delay: (i * 97) % 700,
  opacity: 0.35 + ((i * 17) % 40) / 100,
}));
const GRAINS: GrainProps[] = Array.from({ length: 22 }, (_, i) => ({
  top: 20 + ((i * 71) % 250),
  size: 3 + (i % 4),
  ms: 900 + ((i * 113) % 700),
  delay: (i * 61) % 900,
  wobble: 6 + ((i * 7) % 14),
}));

/**
 * Scene 2: a sandstorm. Dark clouds roll in, sand races across, Hudhud fights the gusts with
 * beating wings, and the storm tears his three letters from the bag one by one, until the bag
 * is empty. No lightning and no thunder: exciting, not frightening.
 */
function Storm() {
  const [left, setLeft] = useState(3);
  useEffect(() => {
    const timers = TEAR_AT_MS.map((ms, i) => setTimeout(() => setLeft(2 - i), ms));
    return () => timers.forEach(clearTimeout);
  }, []);

  // Hudhud is shaken by the gusts and pushed back, then fights his way forward again.
  const shake = useRun(520);
  const push = useSwing(900);
  const haze = useSwing(1100);
  return (
    <View style={[styles.scene, styles.stormSky]}>
      <Animated.View
        style={[
          styles.haze,
          { opacity: haze.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.45] }) },
        ]}
      />
      <StormCloud top={-6} width={150} ms={5200} delay={0} />
      <StormCloud top={22} width={110} ms={3900} delay={1300} />
      <StormCloud top={-14} width={130} ms={4600} delay={2600} />
      {STREAKS.map((p, i) => (
        <SandStreak key={`s${i}`} {...p} />
      ))}
      <View style={styles.stormBird}>
        <Animated.View
          style={{
            transform: [
              { translateX: push.interpolate({ inputRange: [0, 1], outputRange: [-4, 18] }) },
              {
                rotate: shake.interpolate({
                  inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
                  outputRange: ["-10deg", "7deg", "-6deg", "10deg", "-4deg", "-10deg"],
                }),
              },
              {
                translateY: shake.interpolate({
                  inputRange: [0, 0.25, 0.5, 0.75, 1],
                  outputRange: [0, -6, 2, -4, 0],
                }),
              },
            ],
          }}
        >
          <Hudhud size={STORM_BIRD} hop={false} flap bag={left} />
        </Animated.View>
        {LETTER_GROUPS.map((_, i) => (
          <TornLetter key={i} index={i} />
        ))}
      </View>
      {GRAINS.map((p, i) => (
        <Grain key={`g${i}`} {...p} />
      ))}
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
        <Hudhud size={96} bag={0} />
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
        <Hudhud size={110} pose="cheer" bag={0} />
      </View>
    </View>
  );
}

/** Scene 5 shows Hudhud between the two choices (the choices are buttons on the screen). */
function Choose() {
  return (
    <View style={[styles.scene, styles.chooseScene]}>
      <Hudhud size={140} bag={0} />
    </View>
  );
}

const SCENES: Record<StorySceneId, () => React.ReactElement> = {
  postman: Postman,
  wind: Storm,
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
  // Hudhud on the right, so the letters have room to fly forward (left) away from him.
  stormBird: {
    width: STORM_BIRD,
    height: (STORM_BIRD * 130) / 140,
    marginLeft: 120,
    marginTop: 70,
  },
  stormSky: { backgroundColor: "#D6BF94" },
  haze: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "#7E6A50",
  },
  stormCloud: { position: "absolute", left: 0 },
  streak: {
    position: "absolute",
    left: 0,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFF4DD",
  },
  grain: { position: "absolute", left: 0, backgroundColor: "#8A6A3E" },
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
  chooseScene: { backgroundColor: "transparent" },
});
