/**
 * Pictures of Hudhud's story (content/story.ts), built from the app's own drawings: Hudhud,
 * Old Sana'a, Rasha's clay bowl, the sidr tree, the people of the textbook. Each scene is a
 * living picture that moves slowly, and only while it is shown.
 */

import React, { useEffect, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { Circle, G, Path, Polygon, Rect, Svg } from "react-native-svg";

import { Art } from "@/components/art/Art";
import { Picture } from "@/components/pictures/Picture";
import { MESSAGE, STATIONS, type StationPlace, type StoryScene } from "@/content/story";
import { yemen } from "@/theme/tokens";
import { BowlArt, INK, Note, NoteLetters, messageLetters } from "./Bowl";
import { Hudhud } from "./Hudhud";
import {
  DryGroundArt,
  HillsArt,
  JugArt,
  NightSkyArt,
  RASHA_SHOULDER,
  Rasha,
  RashaArm,
  SunArt,
  TruckArt,
  WiltedPlantArt,
} from "./StoryArt";
import { DhowArt } from "./Voyage";
import { YemenMap } from "./YemenMap";
import { Skyline } from "./Skyline";
import { StickerArt } from "./StickerArt";
import { LOOP_NATIVE } from "./motion";

/** 0 → 1 once, after a delay. */
function useOnce(duration: number, delay = 0, easing = Easing.inOut(Easing.cubic)) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const anim = Animated.timing(v, { toValue: 1, duration, delay, easing, useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [v, duration, delay, easing]);
  return v;
}

/** 0 → 1 → 0 forever, after a delay. */
function useSwing(duration: number, delay = 0) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    let loop: Animated.CompositeAnimation | undefined;
    const start = setTimeout(() => {
      loop = Animated.loop(
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
    }, delay);
    return () => {
      clearTimeout(start);
      loop?.stop();
    };
  }, [v, duration, delay]);
  return v;
}

/** Hudhud's thought bubbles in the resolve scene: left, top and size, from his head upwards. */
const THOUGHT_DOTS: [number, number, number][] = [
  [212, 150, 10],
  [188, 124, 16],
];

/**
 * Counting the sacks: the sack row's place and spacing, so Hudhud can walk from one sack to
 * the next (his head over each in turn), and the timing of the walk.
 */
const SACK = 54;
const SACK_ROW_LEFT = 100;
const SACK_STEP = 50;
/** The centre of sack i, counted from the right (the row reads right to left). */
const sackCentre = (i: number) => SACK_ROW_LEFT + 4 * SACK_STEP + SACK / 2 - i * SACK_STEP;
/** From his box's left edge to his head (his beak points left). */
const BIRD_HEAD = 30;
const COUNT_FROM = 800;
const COUNT_MS = 3600;
/** He reaches the last sack at this share of the clock, then stops and cheers. */
const WALK_END = 0.92;

/** Eastern Arabic numerals, for counting in the pictures. */
const NUMBERS = ["١", "٢", "٣", "٤", "٥"];

/** Rasha's size on the back of the pick-up, and where her waving arm turns. */
const RASHA_ON_TRUCK = 96;
const ARM_BOX = (72 * RASHA_ON_TRUCK) / 130;

const lerp = (v: Animated.Value, from: number, to: number) =>
  v.interpolate({ inputRange: [0, 1], outputRange: [from, to] });

/** 0 → 1, then again from 0, forever (a day, a heat wave), after a delay. */
function useLoop(duration: number, delay = 0) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
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

/** Points of a clock (0 → 1) mapped to values: keyframes. */
function at(
  v: Animated.Value,
  inputRange: number[],
  outputRange: number[],
): Animated.AnimatedInterpolation<number>;
function at(
  v: Animated.Value,
  inputRange: number[],
  outputRange: string[],
): Animated.AnimatedInterpolation<string>;
function at(v: Animated.Value, inputRange: number[], outputRange: number[] | string[]) {
  return v.interpolate({ inputRange, outputRange: outputRange as number[], extrapolate: "clamp" });
}

/**
 * The roof Rasha's bowl stands on: sky, the mountains around Sana'a, the tower houses, and the
 * roof's wall with its white gypsum band. `sky` is drawn behind the mountains (sun, moon).
 */
function Rooftop({
  dusk = false,
  color,
  sky,
}: {
  dusk?: boolean;
  color?: string;
  sky?: React.ReactNode;
}) {
  // Depth, as in a cartoon: the far mountains drift slower than the houses nearer by.
  const drift = useOnce(9000, 0, Easing.inOut(Easing.sin));
  return (
    <>
      <View style={[styles.fill, { backgroundColor: color ?? (dusk ? "#E7B98C" : "#F9E3BF") }]} />
      {sky}
      <Animated.View style={[styles.hills, { transform: [{ translateX: lerp(drift, 0, -5) }] }]}>
        <HillsArt color={dusk ? "#D9A57C" : "#EBD3AE"} />
      </Animated.View>
      <Animated.View style={[styles.city, { transform: [{ translateX: lerp(drift, 0, -14) }] }]}>
        <Skyline />
      </Animated.View>
      <View style={styles.wall} />
      <View style={styles.wallTrim} />
    </>
  );
}

/** Morning over Sana'a: the night lifts, the sun rises, Hudhud wakes on his roof. */
function Roof() {
  const morning = useOnce(3200);
  const sun = useOnce(3600, 200, Easing.out(Easing.cubic));
  const rays = useSwing(2400, 1500);
  const wake = useOnce(700, 2200, Easing.out(Easing.back(2)));
  return (
    <View style={styles.scene}>
      <View style={[styles.fill, { backgroundColor: "#F9D9A6" }]} />
      <Animated.View
        style={[styles.fill, { backgroundColor: "#2B3A63", opacity: lerp(morning, 1, 0) }]}
      />
      <Animated.View
        style={[
          styles.sun,
          { transform: [{ translateY: lerp(sun, 150, 0) }, { scale: lerp(rays, 1, 1.06) }] },
        ]}
      >
        <SunArt size={120} />
      </Animated.View>
      <View style={styles.hills}>
        <HillsArt />
      </View>
      <View style={styles.city}>
        <Skyline />
      </View>
      <Animated.View
        style={[
          styles.roofBird,
          { transform: [{ translateY: lerp(wake, 10, 0) }, { scale: lerp(wake, 0.92, 1) }] },
        ]}
      >
        <Hudhud size={112} pose="cheer" />
      </Animated.View>
    </View>
  );
}

/** A heat wave rising from the dry ground. */
function HeatWave({ clock, left }: { clock: Animated.Value; left: `${number}%` }) {
  return (
    <Animated.View
      style={[
        styles.heatWave,
        {
          left,
          opacity: at(clock, [0, 0.3, 1], [0, 0.8, 0]),
          transform: [{ translateY: lerp(clock, 0, -70) }],
        },
      ]}
    >
      <Svg width={60} height={16} viewBox="0 0 60 16">
        <Path
          d="M2 8 Q9 1 16 8 T30 8 T44 8 T58 8"
          stroke="#FFF6D6"
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
    </Animated.View>
  );
}

/** The hot summer: the sun burns, the earth is cracked, the jar is empty, Hudhud is thirsty. */
function Thirst() {
  const burn = useSwing(1300);
  const tired = useSwing(1500, 300);
  const wave1 = useLoop(2400, 0);
  const wave2 = useLoop(2400, 800);
  const wave3 = useLoop(2400, 1600);
  const leaf = useOnce(4600, 500, Easing.inOut(Easing.sin));
  return (
    <View style={styles.scene}>
      <View style={[styles.fill, { backgroundColor: "#F7C873" }]} />
      <Animated.View
        style={[
          styles.hotSun,
          { opacity: lerp(burn, 0.85, 1), transform: [{ scale: lerp(burn, 1, 1.1) }] },
        ]}
      >
        <SunArt size={140} hot />
      </Animated.View>
      <View style={styles.hills}>
        <HillsArt color="#E8B877" />
      </View>
      <View style={styles.dryGround}>
        <DryGroundArt />
      </View>
      <HeatWave clock={wave1} left="14%" />
      <HeatWave clock={wave2} left="46%" />
      <HeatWave clock={wave3} left="74%" />
      <View style={styles.wilted}>
        <WiltedPlantArt size={70} />
      </View>
      {/* The water jar lies empty on its side. */}
      <View style={styles.emptyJar}>
        <JugArt size={58} />
      </View>
      <Animated.View
        style={[
          styles.thirstyBird,
          {
            transform: [
              { translateY: lerp(tired, 0, 5) },
              { rotate: at(tired, [0, 1], ["2deg", "10deg"]) },
            ],
          },
        ]}
      >
        <Hudhud size={96} hop={false} />
      </Animated.View>
      <Animated.View
        style={[
          styles.leaf,
          {
            transform: [
              { translateX: lerp(leaf, -40, 380) },
              { translateY: at(leaf, [0, 0.25, 0.5, 0.75, 1], [0, 18, 4, 24, 10]) },
              { rotate: at(leaf, [0, 1], ["0deg", "540deg"]) },
            ],
          },
        ]}
      >
        <Picture emoji="🍂" size={26} />
      </Animated.View>
    </View>
  );
}

/** One morning a girl comes up to the roof, pours water into a bowl, and Hudhud peeks. */
function Girl() {
  const walk = useOnce(1500, 200, Easing.out(Easing.quad));
  const tilt = useOnce(600, 1800);
  const pour = useOnce(2000, 2300, Easing.linear);
  const flow = useSwing(180, 2300);
  const peek = useOnce(1100, 3400, Easing.out(Easing.quad));
  // She walks in (bobbing with her steps), then stands to pour.
  const [arrived, setArrived] = useState(false);
  // Hudhud walks up to the bowl, step by step, and stares: water!
  const [hudhud, setHudhud] = useState<"away" | "walk" | "wonder">("away");
  useEffect(() => {
    const timers = [
      setTimeout(() => setArrived(true), 1700),
      setTimeout(() => setHudhud("walk"), 3400),
      setTimeout(() => setHudhud("wonder"), 4500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);
  return (
    <View style={styles.scene}>
      <Rooftop />
      <View style={[styles.bowlOnWall, styles.bowlPour]}>
        <BowlArt width={96} level={0} />
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: pour }]}>
          <BowlArt width={96} level={1} />
        </Animated.View>
      </View>
      {/* The water runs from the spout into the bowl while she pours. */}
      <Animated.View
        style={[
          styles.stream,
          {
            opacity: at(pour, [0, 0.05, 0.9, 1], [0, 1, 1, 0]),
            transform: [{ scaleX: lerp(flow, 0.8, 1.2) }],
          },
        ]}
      />
      <Animated.View
        style={[styles.rashaPour, { transform: [{ translateX: lerp(walk, -150, 0) }] }]}
      >
        <Rasha size={140} pose="reach" walking={!arrived} />
      </Animated.View>
      <Animated.View
        style={[
          styles.jug,
          {
            transform: [
              { translateX: lerp(walk, -150, 0) },
              { rotate: at(tilt, [0, 1], ["0deg", "62deg"]) },
            ],
          },
        ]}
      >
        <JugArt size={46} />
      </Animated.View>
      <Animated.View
        style={[
          styles.peeker,
          {
            opacity: at(peek, [0, 0.2, 1], [0, 1, 1]),
            transform: [{ translateX: lerp(peek, 120, 0) }],
          },
        ]}
      >
        <Hudhud
          size={84}
          hop={false}
          walk={hudhud === "walk"}
          pose={hudhud === "wonder" ? "wonder" : "stand"}
        />
      </Animated.View>
    </View>
  );
}

/** Hudhud drinks; a sparrow and a dove come to drink too. Rasha smiles. */
function Drink() {
  const sip = useSwing(500, 600);
  const shimmer = useSwing(900);
  const sparrow = useOnce(1300, 1100, Easing.out(Easing.quad));
  const dove = useOnce(1400, 2100, Easing.out(Easing.quad));
  const peck = useSwing(420, 2400);
  return (
    <View style={styles.scene}>
      <Rooftop />
      <View style={styles.rasha}>
        <Rasha size={140} />
      </View>
      <Animated.View style={[styles.bowlOnWall, { opacity: lerp(shimmer, 0.92, 1) }]}>
        <BowlArt width={96} level={0.9} />
      </Animated.View>
      <Animated.View
        style={[
          styles.drinker,
          {
            transform: [
              { translateY: lerp(sip, 0, 8) },
              { rotate: at(sip, [0, 1], ["0deg", "-10deg"]) },
            ],
          },
        ]}
      >
        <Hudhud size={86} hop={false} />
      </Animated.View>
      <Animated.View
        style={[
          styles.sparrow,
          {
            transform: [
              { translateX: lerp(sparrow, -60, 0) },
              { translateY: at(sparrow, [0, 1], [-120, 0]) },
              { rotate: at(peck, [0, 1], ["0deg", "18deg"]) },
            ],
          },
        ]}
      >
        <Picture emoji="🐦" size={38} />
      </Animated.View>
      <Animated.View
        style={[
          styles.dove,
          {
            transform: [
              { translateX: lerp(dove, 70, 0) },
              { translateY: at(dove, [0, 1], [-140, 0]) },
            ],
          },
        ]}
      >
        <Picture emoji="🕊" size={46} />
      </Animated.View>
    </View>
  );
}

/** "You don't know us!" "But you are thirsty." A small heart rises between them. */
function Why() {
  const heart = useSwing(1200);
  return (
    <View style={styles.scene}>
      <Rooftop />
      <View style={styles.rasha}>
        <Rasha size={140} />
      </View>
      <View style={styles.bowlOnWall}>
        <BowlArt width={96} level={0.8} />
      </View>
      <Animated.View
        style={[
          styles.heart,
          {
            opacity: lerp(heart, 0.5, 1),
            transform: [{ translateY: lerp(heart, 6, -10) }, { scale: lerp(heart, 0.9, 1.1) }],
          },
        ]}
      >
        <Picture emoji="❤" size={40} />
      </Animated.View>
      <View style={[styles.drinker, styles.facing]}>
        <Hudhud size={90} hop={false} />
      </View>
    </View>
  );
}

/**
 * Day after day: the sun crosses the sky, night falls and lifts again. Every morning Rasha
 * comes with water; Hudhud waits for her on the wall.
 */
function Days() {
  const day = useLoop(2800, 300);
  const visit = at(day, [0, 0.14, 0.22, 0.58, 0.66, 1], [0, 0, 1, 1, 0, 0]);
  return (
    <View style={styles.scene}>
      <Rooftop
        sky={
          <Animated.View
            style={[
              styles.daySun,
              {
                transform: [
                  { translateX: at(day, [0, 1], [-30, 330]) },
                  { translateY: at(day, [0, 0.5, 1], [130, 0, 130]) },
                ],
              },
            ]}
          >
            <SunArt size={70} />
          </Animated.View>
        }
      />
      <Animated.View style={[styles.rasha, { opacity: visit }]}>
        <Rasha size={140} pose="wave" />
      </Animated.View>
      <View style={styles.bowlOnWall}>
        <BowlArt width={96} level={0} />
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { opacity: at(day, [0, 0.24, 0.3, 0.86, 1], [0, 0, 1, 1, 0]) },
          ]}
        >
          <BowlArt width={96} level={1} />
        </Animated.View>
      </View>
      <View style={styles.drinker}>
        <Hudhud size={86} />
      </View>
      {/* Night: the sky darkens, the stars and the moon come out. */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.fill,
          {
            backgroundColor: "#2B3A63",
            opacity: at(day, [0, 0.1, 0.9, 1], [0.6, 0, 0, 0.6]),
          },
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[styles.nightSky, { opacity: at(day, [0, 0.08, 0.92, 1], [1, 0, 0, 1]) }]}
      >
        <NightSkyArt />
      </Animated.View>
    </View>
  );
}

/**
 * The day she left: the family's pick-up, loaded with their things, drives away down the
 * street. Rasha waves from the back; Hudhud flies after it a little, then stays.
 */
function Leave() {
  const drive = useOnce(5400, 1300, Easing.in(Easing.quad));
  const wave = useSwing(520, 300);
  const rattle = useSwing(160);
  const follow = useOnce(1600, 2600, Easing.inOut(Easing.quad));
  const dust = useLoop(700, 1300);
  const away = { transform: [{ translateX: lerp(drive, 0, -460) }] };
  return (
    <View style={styles.scene}>
      <View style={[styles.fill, { backgroundColor: "#F2C48D" }]} />
      <View style={styles.hills}>
        <HillsArt color="#E3B07E" />
      </View>
      <View style={styles.city}>
        <Skyline />
      </View>
      <View style={styles.street} />
      <Animated.View style={[styles.truckBox, away]}>
        <Animated.View style={{ transform: [{ translateY: lerp(rattle, 0, -2) }] }}>
          <TruckArt width={210} layer="load" />
          {/* Rasha stands at the back between the bundles, looks back, sad, and waves. */}
          <View style={styles.truckRasha}>
            <Rasha size={RASHA_ON_TRUCK} pose="wave" sad ownArm />
            <Animated.View
              style={[
                styles.rashaArm,
                { transform: [{ rotate: at(wave, [0, 1], ["-30deg", "18deg"]) }] },
              ]}
            >
              <RashaArm size={RASHA_ON_TRUCK} />
            </Animated.View>
          </View>
          <View style={StyleSheet.absoluteFill}>
            <TruckArt width={210} layer="body" />
          </View>
        </Animated.View>
        <Animated.View
          style={[
            styles.dust,
            {
              opacity: at(dust, [0, 0.3, 1], [0, 0.7, 0]),
              transform: [{ translateX: lerp(dust, 0, 30) }, { scale: lerp(dust, 0.6, 1.4) }],
            },
          ]}
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.follower,
          {
            transform: [
              { translateX: at(follow, [0, 0.6, 1], [0, -70, -60]) },
              { translateY: at(follow, [0, 0.4, 1], [0, -30, 0]) },
            ],
          },
        ]}
      >
        {/* He flies after her a little, then lands and hangs his head. */}
        <Animated.View style={{ opacity: at(follow, [0, 0.9, 1], [1, 1, 0]) }}>
          <Hudhud size={70} flap hop={false} />
        </Animated.View>
        <Animated.View
          style={[StyleSheet.absoluteFill, { opacity: at(follow, [0, 0.9, 1], [0, 0, 1]) }]}
        >
          <Hudhud size={70} pose="sad" hop={false} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

/**
 * The next morning the bowl stays empty. Hudhud waits and waits; the day goes by, a dry leaf
 * blows past, night falls, and she does not come. Hudhud lays back his crest and cries.
 */
function Gone() {
  const dusk = useOnce(4400, 600, Easing.inOut(Easing.quad));
  const look = useSwing(1500, 600);
  // Once night has fallen, a tear runs down, again and again.
  const tear = useLoop(1800, 3400);
  const leaf = useOnce(4000, 900, Easing.inOut(Easing.sin));
  // He paces along the wall, step by step, then turns back to look at her door.
  const pace = useOnce(1600, 300, Easing.linear);
  const [walking, setWalking] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setWalking(false), 1900);
    return () => clearTimeout(t);
  }, []);
  return (
    <View style={styles.scene}>
      <Rooftop dusk />
      <View style={styles.door}>
        <Art art="door" size={110} />
      </View>
      <View style={styles.bowlOnWall}>
        <BowlArt width={96} level={0} />
      </View>
      <Animated.View
        style={[
          styles.drinker,
          {
            transform: [
              { translateX: lerp(pace, 0, 44) },
              { translateY: lerp(dusk, 0, 10) },
              { rotate: at(look, [0, 1], ["-3deg", "3deg"]) },
            ],
          },
        ]}
      >
        {/* Waiting, looking about; as the night comes he gives up and hangs his head. */}
        <Animated.View style={{ opacity: at(dusk, [0, 0.4, 0.6], [1, 1, 0]) }}>
          <Hudhud size={86} hop={false} walk={walking} mirrored={walking} />
        </Animated.View>
        <Animated.View
          style={[StyleSheet.absoluteFill, { opacity: at(dusk, [0, 0.4, 0.6], [0, 0, 1]) }]}
        >
          <Hudhud size={86} pose="sad" hop={false} />
          <Animated.View
            style={[
              styles.tear,
              {
                opacity: at(tear, [0, 0.15, 0.7, 1], [0, 1, 1, 0]),
                transform: [{ translateY: lerp(tear, 0, 30) }],
              },
            ]}
          />
        </Animated.View>
      </Animated.View>
      <Animated.View
        style={[
          styles.leaf,
          {
            transform: [
              { translateX: lerp(leaf, 380, -40) },
              { translateY: at(leaf, [0, 0.3, 0.6, 1], [0, 30, 14, 40]) },
              { rotate: at(leaf, [0, 1], ["0deg", "-480deg"]) },
            ],
          },
        ]}
      >
        <Picture emoji="🍂" size={24} />
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[styles.fill, { backgroundColor: "#2B2440", opacity: lerp(dusk, 0, 0.5) }]}
      />
      <Animated.View
        pointerEvents="none"
        style={[styles.nightSky, { opacity: at(dusk, [0, 0.6, 1], [0, 0, 1]) }]}
      >
        <NightSkyArt />
      </Animated.View>
    </View>
  );
}

/**
 * The note clamped under the empty bowl: Hudhud tugs it out with his beak, looks at it, and
 * cannot read it.
 */
function Inscription() {
  // He pulls the note out from under the bowl once; then wonders.
  const pull = useOnce(1500, 900);
  const puzzle = useSwing(700, 2400);
  // Out from under the bowl comes a note: he stares at it, astonished.
  const [stare, setStare] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setStare(true), 2400);
    return () => clearTimeout(t);
  }, []);
  const out = {
    transform: [{ translateY: lerp(pull, 0, 124) }, { translateX: lerp(pull, 0, 24) }],
  };
  return (
    <View style={styles.scene}>
      <View style={[styles.fill, { backgroundColor: "#F3DCC7" }]} />
      <View style={styles.noteStage}>
        <Animated.View
          style={[
            styles.pulledNote,
            {
              transform: [
                ...out.transform,
                {
                  rotate: pull.interpolate({ inputRange: [0, 1], outputRange: ["-4deg", "5deg"] }),
                },
              ],
            },
          ]}
        >
          <Note width={150}>
            <NoteLetters readable={() => false} size={18} />
          </Note>
        </Animated.View>
        <View style={styles.bowlOver}>
          <BowlArt width={210} level={0} />
        </View>
        {/* Hudhud holds the note's corner in his beak and comes out with it. */}
        <Animated.View style={[styles.puller, out]}>
          <Animated.View
            style={{
              opacity: pull.interpolate({
                inputRange: [0.85, 1],
                outputRange: [0, 1],
                extrapolate: "clamp",
              }),
              transform: [{ translateY: lerp(puzzle, 0, -6) }],
            }}
          >
            <Picture emoji="❓" size={30} />
          </Animated.View>
          <Hudhud size={84} hop={false} pose={stare ? "wonder" : "stand"} />
        </Animated.View>
      </View>
    </View>
  );
}

/**
 * Hudhud's resolve: on his roof, Rasha's note before him, he thinks of her: thought bubbles rise
 * from his head, and in the cloud Rasha appears and waves. He will go and look for her.
 */
function Turn() {
  const think = useOnce(2000, 500, Easing.out(Easing.quad));
  const glow = useSwing(900, 800);
  const wave = useSwing(700, 2200);
  return (
    <View style={styles.scene}>
      <Rooftop />
      <Animated.View
        style={[
          styles.turnNote,
          { transform: [{ translateY: lerp(glow, 0, -4) }, { rotate: "-8deg" }] },
        ]}
      >
        <Animated.View style={[styles.halo, { opacity: lerp(glow, 0.3, 0.8) }]} />
        <Note width={96}>
          <NoteLetters readable={() => false} size={11} />
        </Note>
      </Animated.View>
      <View style={styles.turnBird}>
        <Hudhud size={118} hop={false} />
      </View>
      {/* His thought: two small bubbles rise, then the cloud with Rasha in it. */}
      {THOUGHT_DOTS.map(([left, top, size], i) => (
        <Animated.View
          key={i}
          style={[
            styles.thoughtDot,
            { left, top, width: size, height: size, borderRadius: size / 2 },
            {
              opacity: at(think, [i * 0.2, i * 0.2 + 0.15], [0, 1]),
              transform: [{ scale: at(think, [i * 0.2, i * 0.2 + 0.15], [0.3, 1]) }],
            },
          ]}
        />
      ))}
      <Animated.View
        style={[
          styles.thought,
          {
            opacity: at(think, [0.4, 0.7], [0, 1]),
            transform: [
              { scale: at(think, [0.4, 1], [0.6, 1]) },
              { translateY: lerp(wave, 0, -3) },
            ],
          },
        ]}
      >
        <Rasha size={84} pose="wave" />
      </Animated.View>
    </View>
  );
}

/** Rasha's note, unfolded: every letter we learn lights up on it, one after another. */
function BowlScene() {
  const words = [...MESSAGE.words, MESSAGE.name].map((w) => messageLetters(w));
  const count = words.flat().length;
  // One clock: letter i (counted over all words) lights up at its share of it.
  const light = useOnce(count * 260 + 400, 500, Easing.linear);
  let index = 0;
  return (
    <View style={styles.scene}>
      <View style={[styles.fill, { backgroundColor: "#F3DCC7" }]} />
      <View style={styles.ledge} />
      <View style={styles.smallBowl}>
        <BowlArt width={110} level={0.4} />
      </View>
      <View style={styles.bigNote}>
        <Note width={250} style={styles.unfolded}>
          {words.map((letters, w) => (
            <View key={w} style={styles.noteRow}>
              {letters.map((l) => {
                const i = index++;
                return (
                  <View key={i}>
                    <Text style={[styles.noteLetter, styles.paleLetter]}>{l}</Text>
                    <Animated.Text
                      style={[
                        styles.noteLetter,
                        styles.glowLetter,
                        {
                          opacity: light.interpolate({
                            inputRange: [i / count, (i + 1) / count],
                            outputRange: [0, 1],
                            extrapolate: "clamp",
                          }),
                        },
                      ]}
                    >
                      {l}
                    </Animated.Text>
                  </View>
                );
              })}
            </View>
          ))}
        </Note>
      </View>
      <View style={styles.noteBird}>
        <Hudhud size={86} pose="cheer" />
      </View>
    </View>
  );
}

/**
 * He folds her note into his bag and flies off: the note slips into the bag, then Hudhud beats
 * his wings and rises over Sana'a, smaller and smaller. The empty bowl stays on the roof.
 */
function FlyOff() {
  const tuck = useOnce(1000, 700);
  const fly = useOnce(2600, 2000, Easing.in(Easing.quad));
  return (
    <View style={styles.scene}>
      <Rooftop />
      <View style={styles.bowlOnWall}>
        <BowlArt width={96} level={0} />
      </View>
      <Animated.View
        style={[
          styles.flyNote,
          {
            opacity: at(tuck, [0, 0.85, 1], [1, 1, 0]),
            transform: [
              { translateX: lerp(tuck, 0, 70) },
              { translateY: lerp(tuck, 0, 4) },
              { scale: lerp(tuck, 1, 0.3) },
              { rotate: at(tuck, [0, 1], ["-6deg", "24deg"]) },
            ],
          },
        ]}
      >
        <Note width={62}>
          <NoteLetters readable={() => false} size={7} />
        </Note>
      </Animated.View>
      <Animated.View
        style={[
          styles.drinker,
          {
            transform: [
              { translateX: lerp(fly, 0, -250) },
              { translateY: lerp(fly, 0, -200) },
              { scale: lerp(fly, 1, 0.4) },
            ],
          },
        ]}
      >
        <Animated.View style={{ opacity: at(tuck, [0, 0.9, 1], [1, 1, 0]) }}>
          <Hudhud size={86} bag={0} hop={false} />
        </Animated.View>
        <Animated.View
          style={[StyleSheet.absoluteFill, { opacity: at(tuck, [0, 0.9, 1], [0, 0, 1]) }]}
        >
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: at(fly, [0, 0.04], [1, 0]) }]}>
            <Hudhud size={86} bag={1} hop={false} />
          </Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: at(fly, [0, 0.04], [0, 1]) }]}>
            <Hudhud size={86} bag={1} flap hop={false} />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

/** The map of Yemen: home in Sana'a, and the places to fly to (the choice is made on it). */
function MapScene() {
  return (
    <View style={styles.scene}>
      <YemenMap pins={[{ place: "arabic" }, { place: "math" }, { place: "socotra" }]} />
    </View>
  );
}

/**
 * Mukalla on the Arabian Sea: white houses at the foot of brown mountains, the sea in front,
 * a quay to stand on (fills the scene).
 */
function Mukalla() {
  return (
    <Svg width="100%" height={300} viewBox="0 0 360 300" style={StyleSheet.absoluteFill}>
      <Path
        d="M0 180 L36 112 L84 150 L138 76 L196 132 L246 88 L302 126 L360 98 L360 230 L0 230 Z"
        fill="#9C6B45"
      />
      <Path d="M138 76 L150 96 L128 100 Z M246 88 L258 104 L236 106 Z" fill="#B88A60" />
      {[
        [10, 170, 46, 60],
        [60, 182, 40, 48],
        [104, 160, 50, 70],
        [160, 176, 44, 54],
        [208, 166, 52, 64],
        [264, 180, 40, 50],
        [308, 168, 52, 62],
      ].map(([x, y, w, h]) => (
        <G key={x}>
          <Rect
            x={x}
            y={y}
            width={w}
            height={h}
            fill="#FBF7EE"
            stroke="#D9CDB8"
            strokeWidth={1.5}
          />
          <Rect x={x + 8} y={y + 10} width={7} height={10} rx={2} fill="#5E7E9C" />
          <Rect x={x + w - 15} y={y + 10} width={7} height={10} rx={2} fill="#5E7E9C" />
          <Rect x={x + 8} y={y + 28} width={7} height={10} rx={2} fill="#5E7E9C" />
        </G>
      ))}
      <Rect x={0} y={228} width={360} height={30} fill="#4F8FD6" />
      <Path
        d="M20 240 q8 -5 16 0 t16 0 M150 246 q8 -5 16 0 t16 0 M270 238 q8 -5 16 0 t16 0"
        stroke="#FFFFFF"
        strokeWidth={2}
        fill="none"
        opacity={0.7}
      />
      <Rect x={0} y={256} width={360} height={44} fill="#D9C7A8" />
      {/* The post box at the post office. */}
      <G transform="translate(176 206)">
        <Rect x={0} y={0} width={22} height={34} rx={5} fill="#C8402F" />
        <Rect x={4} y={8} width={14} height={4} rx={2} fill="#5E1A12" />
        <Rect x={8} y={34} width={6} height={18} fill="#5E3220" />
      </G>
    </Svg>
  );
}

/**
 * In Mukalla the old postman gives Hudhud work: letters fly into his bag, one after another,
 * to be delivered, and at every door he can ask about Rasha.
 */
function Post() {
  const letters = useOnce(2400, 700, Easing.inOut(Easing.quad));
  const nod = useSwing(900, 300);
  return (
    <View style={styles.scene}>
      <View style={[styles.fill, { backgroundColor: "#E7F0FA" }]} />
      <Mukalla />
      <Animated.View
        style={[styles.postman, { transform: [{ rotate: at(nod, [0, 1], ["-2deg", "2deg"]) }] }]}
      >
        <Picture emoji="👴" size={96} />
      </Animated.View>
      {[0, 1, 2].map((i) => (
        <Animated.View
          key={i}
          style={[
            styles.flyingLetter,
            {
              opacity: at(letters, [i / 3, i / 3 + 0.05, (i + 0.9) / 3, (i + 1) / 3], [0, 1, 1, 0]),
              transform: [
                { translateX: at(letters, [i / 3, (i + 1) / 3], [0, 170]) },
                { translateY: at(letters, [i / 3, (i + 0.5) / 3, (i + 1) / 3], [0, -50, 10]) },
              ],
            },
          ]}
        >
          <Picture emoji="✉" size={34} />
        </Animated.View>
      ))}
      <View style={styles.postBird}>
        <Animated.View style={{ opacity: at(letters, [0, 0.95, 1], [1, 1, 0]) }}>
          <Hudhud size={88} bag={1} hop={false} pose="wonder" />
        </Animated.View>
        <Animated.View
          style={[StyleSheet.absoluteFill, { opacity: at(letters, [0, 0.95, 1], [0, 0, 1]) }]}
        >
          <Hudhud size={88} bag={3} pose="cheer" />
        </Animated.View>
      </View>
    </View>
  );
}

/** The coffee terraces of Haraz, with a village of tower houses on the ridge (fills the scene). */
function Terraces({ village = false }: { village?: boolean }) {
  return (
    <Svg width="100%" height={300} viewBox="0 0 360 300" style={StyleSheet.absoluteFill}>
      <Path d="M0 300 L0 150 Q90 80 180 120 Q270 70 360 140 L360 300 Z" fill="#B48A50" />
      {village
        ? [70, 104, 230, 262].map((x, i) => (
            <G key={x}>
              <Rect x={x} y={92 - (i % 2) * 16} width={28} height={50} fill="#A55B34" />
              <Path d={`M${x} ${100 - (i % 2) * 16} h28`} stroke="#FFFFFF" strokeWidth={3} />
            </G>
          ))
        : null}
      {[0, 1, 2, 3, 4].map((i) => (
        <G key={i}>
          <Path
            d={`M0 ${300 - i * 30} H360 V${274 - i * 30} H0 Z`}
            fill={i % 2 ? "#5BA05F" : "#3F8A4E"}
          />
          <Path d={`M0 ${274 - i * 30} H360`} stroke="#8E6A4A" strokeWidth={3} />
          {/* Coffee shrubs with red cherries along each terrace. */}
          {[30, 100, 170, 240, 310].map((x) => (
            <G key={x}>
              <Circle cx={x + (i % 2) * 30} cy={280 - i * 30} r={9} fill="#2F6B3B" />
              <Circle cx={x + (i % 2) * 30 + 4} cy={278 - i * 30} r={2.2} fill="#C8402F" />
            </G>
          ))}
        </G>
      ))}
    </Svg>
  );
}

/**
 * In Mocha by the Red Sea: the coffee trader sits by his sacks on the quay and does not know
 * how many there are; his helper has gone, and his ship waits. Hudhud flies in beside him.
 */
function Trader() {
  const land = useOnce(1600, 500, Easing.out(Easing.quad));
  // He beats his wings as he comes down, folds them as he lands.
  const [landed, setLanded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLanded(true), 2100);
    return () => clearTimeout(t);
  }, []);
  const wonder = useSwing(800, 1600);
  return (
    <View style={styles.scene}>
      <View style={[styles.fill, { backgroundColor: "#E7F0FA" }]} />
      <View style={styles.sea} />
      <View style={[styles.sand, styles.quay]} />
      <View style={styles.boat}>
        <DhowArt stage={0} size={120} />
      </View>
      <View style={styles.trader}>
        <Picture emoji="👨" size={96} />
      </View>
      <View style={styles.sackPile}>
        <View style={styles.sackRow}>
          <Picture emoji="🫘" size={50} />
          <Picture emoji="🫘" size={50} />
          <Picture emoji="🫘" size={50} />
        </View>
        <View style={[styles.sackRow, styles.sackTop]}>
          <Picture emoji="🫘" size={50} />
          <Picture emoji="🫘" size={50} />
        </View>
      </View>
      <Animated.View
        style={[
          styles.wonder,
          {
            opacity: at(land, [0, 0.8, 1], [0, 0, 1]),
            transform: [{ translateY: lerp(wonder, 0, -6) }],
          },
        ]}
      >
        <Picture emoji="❓" size={34} />
      </Animated.View>
      <Animated.View
        style={[
          styles.arriving,
          {
            transform: [
              { translateX: lerp(land, 140, 0) },
              { translateY: at(land, [0, 1], [-120, 0]) },
            ],
          },
        ]}
      >
        <Hudhud size={80} hop={false} flap={!landed} />
      </Animated.View>
    </View>
  );
}

/**
 * Who can count can help: Hudhud walks along the trader's sacks, behind them, his head over
 * their tops; as he reaches each sack its number lights up on it. Then he cheers. Far off, the
 * ship waits on the sea.
 */
function Sacks() {
  // One clock for the walk and the counting: he reaches sack i at its share of the walk.
  const count = useOnce(COUNT_MS, COUNT_FROM, Easing.linear);
  const sail = useSwing(2400);
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDone(true), COUNT_FROM + COUNT_MS * WALK_END);
    return () => clearTimeout(t);
  }, []);
  const reach = (i: number) => (i / (NUMBERS.length - 1)) * WALK_END;
  return (
    <View style={styles.scene}>
      <View style={[styles.fill, { backgroundColor: "#F6E2C2" }]} />
      <View style={styles.farSea} />
      <Animated.View style={[styles.farShip, { transform: [{ translateX: lerp(sail, 0, 14) }] }]}>
        <Picture emoji="⛵" size={44} />
      </Animated.View>
      <View style={[styles.ground, { backgroundColor: "#C9A16B" }]} />
      <View style={styles.trader}>
        <Picture emoji="👨" size={90} />
      </View>
      {/* Behind the sacks: only his head and back show over them. */}
      <Animated.View
        style={[
          styles.countBird,
          {
            transform: [
              {
                translateX: at(
                  count,
                  [0, WALK_END],
                  [sackCentre(0) - BIRD_HEAD, sackCentre(NUMBERS.length - 1) - BIRD_HEAD],
                ),
              },
            ],
          },
        ]}
      >
        <Hudhud size={84} walk={!done} hop={done} pose={done ? "cheer" : "stand"} />
      </Animated.View>
      <View style={styles.sackLine}>
        {NUMBERS.map((n, i) => (
          <View key={n} style={styles.countedSack}>
            <Picture emoji="🫘" size={SACK} />
            <Animated.View
              style={[
                styles.sackBadge,
                {
                  opacity: at(count, [Math.max(0, reach(i) - 0.03), reach(i) + 0.03], [0, 1]),
                  transform: [
                    {
                      scale: at(
                        count,
                        [reach(i), reach(i) + 0.03, reach(i) + 0.07],
                        [0.4, 1.35, 1],
                      ),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.sackNumber}>{n}</Text>
            </Animated.View>
          </View>
        ))}
      </View>
    </View>
  );
}

/** On the way home: a bowl of water for the birds at every door, and birds drinking. */
function Return() {
  const fly = useLoop(7000);
  const stops = ["🏪", "house", "⛵", "house", "🏪", "house", "⛵", "house"];
  return (
    <View style={styles.scene}>
      <View style={[styles.fill, { backgroundColor: "#F9E3BF" }]} />
      <View style={styles.hills}>
        <HillsArt />
      </View>
      <View style={styles.ground} />
      {/* The way slides by: two rounds of the same doors, so it never ends. */}
      <Animated.View style={[styles.wayStrip, { transform: [{ translateX: lerp(fly, 0, 600) }] }]}>
        {stops.map((stop, i) => (
          <View key={i} style={styles.wayStop}>
            {stop === "house" ? <Art art="house" size={96} /> : <Picture emoji={stop} size={86} />}
            <View style={styles.wayBowl}>
              <BowlArt width={46} level={1} />
            </View>
            <View style={styles.wayBird}>
              <Picture emoji={i % 2 ? "🕊" : "🐦"} size={22} />
            </View>
          </View>
        ))}
      </Animated.View>
      <View style={styles.flyingHome}>
        <Hudhud size={80} flap hop={false} />
      </View>
    </View>
  );
}

/** On Hudhud's roof a little girl, new in the house, fills Rasha's bowl; he drinks. */
function NewGirl() {
  const tilt = useOnce(600, 900);
  const pour = useOnce(1800, 1400, Easing.linear);
  const flow = useSwing(180, 1400);
  const sip = useSwing(500, 3300);
  return (
    <View style={styles.scene}>
      <Rooftop />
      <View style={[styles.bowlOnWall, styles.bowlPour]}>
        <BowlArt width={96} level={0} />
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: pour }]}>
          <BowlArt width={96} level={1} />
        </Animated.View>
      </View>
      <Animated.View
        style={[
          styles.stream,
          {
            opacity: at(pour, [0, 0.05, 0.9, 1], [0, 1, 1, 0]),
            transform: [{ scaleX: lerp(flow, 0.8, 1.2) }],
          },
        ]}
      />
      <View style={styles.rashaPour}>
        <Rasha size={120} pose="reach" dress="#2E8BC0" />
      </View>
      <Animated.View
        style={[styles.jug, { transform: [{ rotate: at(tilt, [0, 1], ["0deg", "62deg"]) }] }]}
      >
        <JugArt size={46} />
      </Animated.View>
      <Animated.View
        style={[
          styles.drinker,
          styles.newGirlBird,
          {
            transform: [
              { translateY: lerp(sip, 0, 8) },
              { rotate: at(sip, [0, 1], ["0deg", "-10deg"]) },
            ],
          },
        ]}
      >
        <Hudhud size={86} hop={false} />
      </Animated.View>
    </View>
  );
}

/** Rasha's kindness stayed: at sunset the birds drink from her bowl, Hudhud circles over Sana'a. */
function Home() {
  const fly = useSwing(2600);
  const peck = useSwing(450, 400);
  return (
    <View style={styles.scene}>
      <View style={[styles.fill, { backgroundColor: "#F7C98B" }]} />
      <View style={styles.sunset} />
      <View style={styles.hills}>
        <HillsArt color="#E3B07E" />
      </View>
      <View style={styles.city}>
        <Skyline />
      </View>
      <View style={styles.homeBowl}>
        <BowlArt width={110} level={1} />
        <Animated.View
          style={[
            styles.homeSparrow,
            { transform: [{ rotate: at(peck, [0, 1], ["0deg", "18deg"]) }] },
          ]}
        >
          <Picture emoji="🐦" size={34} />
        </Animated.View>
        <View style={styles.homeDove}>
          <Picture emoji="🕊" size={40} />
        </View>
      </View>
      <Animated.View
        style={[
          styles.homeBird,
          { transform: [{ translateX: lerp(fly, -120, 60) }, { translateY: lerp(fly, -20, 10) }] },
        ]}
      >
        <Hudhud size={80} flap hop={false} />
      </Animated.View>
    </View>
  );
}

const PLACE_SKY: Record<StationPlace, string> = {
  post: "#E7F0FA",
  door: "#F9E3BF",
  school: "#E7F0FA",
  beach: "#E7F0FA",
  road: "#F6E9D4",
  garden: "#EEF6E8",
  well: "#F6E9D4",
  village: "#E7F0FA",
  terraces: "#E7F0FA",
  market: "#F6E2C2",
  port: "#E7F0FA",
};

/** The ground of a station: the city, the sea, the mountains, a garden. */
function PlaceGround({ place }: { place: StationPlace }) {
  switch (place) {
    case "post":
      return <Mukalla />;
    case "door":
      // A door in Mukalla, on Hudhud's first round as the postman.
      return (
        <>
          <Mukalla />
          <View style={styles.stationArt}>
            <Art art="door" size={110} />
          </View>
        </>
      );
    case "school":
      return (
        <>
          <View style={styles.ground} />
          <View style={styles.stationArt}>
            <Art art="school" size={150} />
          </View>
        </>
      );
    case "beach":
      return (
        <>
          <View style={styles.sea} />
          <View style={styles.sand} />
          <View style={styles.boat}>
            <StickerArt id="dhow" size={110} />
          </View>
        </>
      );
    case "road":
      return (
        <Svg width="100%" height={300} viewBox="0 0 360 300" style={StyleSheet.absoluteFill}>
          <Polygon points="0,300 90,170 180,300" fill="#B48A50" />
          <Polygon points="160,300 260,150 360,300" fill="#8E5A36" />
          <Path d="M120 300 L170 200 L190 200 L250 300 Z" fill="#9C8B7A" />
          <Path d="M180 210 V230 M182 245 V270 M185 282 V300" stroke="#F7F0E1" strokeWidth={4} />
        </Svg>
      );
    case "garden":
      return (
        <>
          <View style={styles.ground} />
          <View style={styles.gardenTree}>
            <Art art="palm" size={140} />
          </View>
        </>
      );
    case "market":
      // The trader's storehouse in the market: his sacks along the wall.
      return (
        <>
          <View style={styles.city}>
            <Skyline />
          </View>
          <View style={[styles.ground, { backgroundColor: "#C9A16B" }]} />
          <View style={styles.stationArt}>
            <Picture emoji="🏪" size={120} />
          </View>
        </>
      );
    case "port":
      // Mocha: the sea, the quay, the trader's dhow.
      return (
        <>
          <View style={styles.sea} />
          <View style={[styles.sand, styles.quay]} />
          <View style={styles.boat}>
            <DhowArt stage={3} size={130} />
          </View>
        </>
      );
    case "well":
      return (
        <>
          <View style={styles.ground} />
          <Svg width={130} height={110} viewBox="0 0 130 110" style={styles.stationArt}>
            <Rect
              x={20}
              y={50}
              width={90}
              height={56}
              rx={6}
              fill="#B9A58E"
              stroke="#6E5B48"
              strokeWidth={3}
            />
            <Path d="M20 64 H110 M20 80 H110 M20 96 H110" stroke="#9C8B7A" strokeWidth={2} />
            <Path d="M28 50 V12 H102 V50" stroke="#8E5A36" strokeWidth={6} fill="none" />
            <Path d="M65 12 V40" stroke="#5E3220" strokeWidth={2} />
          </Svg>
        </>
      );
    case "village":
    case "terraces":
      return <Terraces village={place === "village"} />;
  }
}

/**
 * A stop on Hudhud's journey (STATIONS): the place, the person he meets, and the thing to read
 * or count, which glows gently, with Hudhud beside it.
 */
function Station({ unit }: { unit?: string }) {
  const station = STATIONS[unit ?? ""];
  const glow = useSwing(1000);
  const bob = useSwing(700);
  if (!station) return <View style={styles.scene} />;
  return (
    <View style={styles.scene}>
      <View style={[styles.fill, { backgroundColor: PLACE_SKY[station.place] }]} />
      <PlaceGround place={station.place} />
      <View style={styles.person}>
        <Picture emoji={station.person} size={86} />
      </View>
      <Animated.View style={[styles.thing, { transform: [{ scale: lerp(glow, 1, 1.12) }] }]}>
        <View style={styles.thingHalo} />
        <Picture emoji={station.thing} size={52} />
      </Animated.View>
      <Animated.View
        style={[styles.stationBird, { transform: [{ translateY: lerp(bob, 0, -6) }] }]}
      >
        <Hudhud size={92} hop={false} />
      </Animated.View>
    </View>
  );
}

const SCENES: Record<StoryScene["id"], (props: { unit?: string }) => React.ReactElement> = {
  roof: Roof,
  thirst: Thirst,
  girl: Girl,
  drink: Drink,
  why: Why,
  days: Days,
  leave: Leave,
  gone: Gone,
  inscription: Inscription,
  turn: Turn,
  flyoff: FlyOff,
  map: MapScene,
  post: Post,
  bowl: BowlScene,
  trader: Trader,
  sacks: Sacks,
  return: Return,
  newgirl: NewGirl,
  home: Home,
  station: Station,
};

/**
 * The camera, as in a cartoon: it pushes in slowly while a scene plays. The map is left still,
 * since its places are buttons laid over it (app/intro.tsx).
 */
function Camera({ children }: { children: React.ReactNode }) {
  const push = useOnce(9000, 0, Easing.inOut(Easing.sin));
  return (
    <View style={styles.frame}>
      <Animated.View
        style={[
          styles.lens,
          { transform: [{ scale: lerp(push, 1, 1.07) }, { translateY: lerp(push, 0, -4) }] },
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
}

export function StoryPicture({ scene }: { scene: StoryScene }) {
  const Scene = SCENES[scene.id];
  if (scene.id === "map") return <Scene unit={scene.unit} />;
  return (
    <Camera>
      <Scene unit={scene.unit} />
    </Camera>
  );
}

const styles = StyleSheet.create({
  frame: { width: "100%", height: 300, borderRadius: 28, overflow: "hidden" },
  lens: { width: "100%", height: 300 },
  scene: { width: "100%", height: 300, borderRadius: 28, overflow: "hidden" },
  fill: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  city: { position: "absolute", bottom: 0, left: 0, right: 0, alignItems: "center" },
  wall: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 70,
    backgroundColor: "#C98A5B",
  },
  wallTrim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 64,
    height: 6,
    backgroundColor: "#FFFFFF",
    opacity: 0.85,
  },
  hills: { position: "absolute", left: 0, right: 0, bottom: 96, height: 120 },
  nightSky: { position: "absolute", left: 0, right: 0, top: 0, height: 140 },
  hotSun: { position: "absolute", top: 4, left: 18 },
  dryGround: { position: "absolute", left: 0, right: 0, bottom: 0, height: 100 },
  heatWave: { position: "absolute", bottom: 86 },
  wilted: { position: "absolute", left: 26, bottom: 74 },
  emptyJar: { position: "absolute", left: 100, bottom: 70, transform: [{ rotate: "100deg" }] },
  thirstyBird: { position: "absolute", right: 28, bottom: 70 },
  leaf: { position: "absolute", left: 0, top: 110 },
  rasha: { position: "absolute", left: 20, bottom: 46 },
  rashaPour: { position: "absolute", left: 44, bottom: 46 },
  jug: { position: "absolute", left: 112, bottom: 112 },
  bowlPour: { left: 146 },
  stream: {
    position: "absolute",
    left: 158,
    bottom: 88,
    width: 5,
    height: 36,
    borderRadius: 3,
    backgroundColor: "#4F8FD6",
  },
  peeker: { position: "absolute", right: 8, bottom: 70 },
  sparrow: { position: "absolute", left: 124, bottom: 96 },
  dove: { position: "absolute", left: 292, bottom: 64 },
  daySun: { position: "absolute", top: 20, left: 0 },
  street: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 64,
    backgroundColor: "#BFA98C",
  },
  truckBox: { position: "absolute", left: 110, bottom: 22 },
  // Cut off below the side of the bed: she stands inside it.
  truckRasha: { position: "absolute", left: 146, top: 2, height: 62, overflow: "hidden" },
  rashaArm: {
    position: "absolute",
    left: (RASHA_SHOULDER.x * RASHA_ON_TRUCK) / 130 - ARM_BOX / 2,
    top: (RASHA_SHOULDER.y * RASHA_ON_TRUCK) / 130 - ARM_BOX / 2,
  },
  tear: {
    position: "absolute",
    left: 23,
    top: 41,
    width: 5,
    height: 7,
    borderRadius: 3,
    backgroundColor: "#7FB8E8",
  },
  dust: {
    position: "absolute",
    right: -24,
    bottom: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#E8D5B8",
  },
  follower: { position: "absolute", right: 16, top: 70 },
  turnNote: { position: "absolute", left: 22, bottom: 58 },
  halo: {
    position: "absolute",
    left: -12,
    top: -18,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFF1C2",
  },
  turnBird: { position: "absolute", right: 56, bottom: 40 },
  thoughtDot: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E2CFA4",
  },
  thought: {
    position: "absolute",
    left: 60,
    top: 10,
    width: 150,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E2CFA4",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  sun: { position: "absolute", top: 26, left: 40 },
  roofBird: { position: "absolute", right: 46, bottom: 92 },
  bowlOnWall: { position: "absolute", left: 140, bottom: 62 },
  drinker: { position: "absolute", left: 210, bottom: 84 },
  facing: { left: 220 },
  heart: { position: "absolute", left: 160, top: 50 },
  door: { position: "absolute", left: 24, bottom: 62 },
  ledge: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 64,
    backgroundColor: "#E5C3A4",
  },
  noteStage: {
    position: "absolute",
    top: 16,
    left: 0,
    right: 0,
    height: 270,
    alignItems: "center",
  },
  // Under the bowl at first; only a corner shows below its foot.
  pulledNote: { position: "absolute", top: 34 },
  bowlOver: { position: "absolute", top: 0 },
  puller: { position: "absolute", top: 4, right: "6%", alignItems: "center" },
  smallBowl: { position: "absolute", left: 12, bottom: 34 },
  bigNote: { position: "absolute", top: 26, left: 0, right: 0, alignItems: "center" },
  unfolded: { paddingVertical: 18, transform: [{ rotate: "-2deg" }] },
  noteRow: { flexDirection: "row-reverse", justifyContent: "center", gap: 6 },
  noteLetter: {
    fontSize: 26,
    fontWeight: "900",
    lineHeight: 38,
    minWidth: 16,
    textAlign: "center",
  },
  paleLetter: { color: "#D8CBAE" },
  glowLetter: {
    position: "absolute",
    color: INK,
    textShadowColor: "#F4C14B",
    textShadowRadius: 8,
  },
  noteBird: { position: "absolute", right: 14, bottom: 18 },
  ground: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 70,
    backgroundColor: "#8FB27A",
  },
  sunset: {
    position: "absolute",
    left: 30,
    top: 50,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#F6A53C",
  },
  homeBird: { position: "absolute", left: 140, top: 50 },
  homeBowl: { position: "absolute", right: 34, bottom: 34 },
  homeSparrow: { position: "absolute", left: -6, top: -22 },
  homeDove: { position: "absolute", right: -10, top: -30 },
  trader: { position: "absolute", left: 18, bottom: 40 },
  sackPile: { position: "absolute", left: 120, bottom: 34, alignItems: "center" },
  sackRow: { flexDirection: "row", gap: -6 },
  sackTop: { position: "absolute", top: -34 },
  wonder: { position: "absolute", left: 170, top: 128 },
  arriving: { position: "absolute", right: 14, bottom: 40 },
  farSea: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 96,
    height: 40,
    backgroundColor: "#9CC3E0",
  },
  farShip: { position: "absolute", right: 40, top: 70 },
  sackLine: {
    position: "absolute",
    left: SACK_ROW_LEFT,
    width: 4 * SACK_STEP + SACK,
    bottom: 40,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  countedSack: { width: SACK, alignItems: "center" },
  // The number on the sack, as he reaches it.
  sackBadge: {
    position: "absolute",
    top: 20,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: yemen.blue,
    alignItems: "center",
    justifyContent: "center",
  },
  sackNumber: { fontSize: 15, fontWeight: "900", color: yemen.blue, lineHeight: 20 },
  countBird: { position: "absolute", left: 0, bottom: 56 },
  wayStrip: {
    position: "absolute",
    bottom: 40,
    right: 0,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  wayStop: { width: 150, alignItems: "center", justifyContent: "flex-end" },
  wayBowl: { position: "absolute", right: 6, bottom: -4 },
  wayBird: { position: "absolute", right: 18, bottom: 22 },
  flyingHome: { position: "absolute", left: "38%", top: 40 },
  newGirlBird: { left: 236 },
  flyNote: { position: "absolute", left: 150, bottom: 104 },
  postman: { position: "absolute", left: 16, bottom: 18 },
  flyingLetter: { position: "absolute", left: 90, bottom: 110 },
  postBird: { position: "absolute", right: 20, bottom: 20 },
  // Mocha's stone quay, wide enough for the trader to stand on.
  quay: { height: 96, backgroundColor: "#B9A58E" },
  stationArt: { position: "absolute", left: 20, bottom: 50 },
  sea: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 60,
    height: 90,
    backgroundColor: "#4F8FD6",
  },
  sand: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 64,
    backgroundColor: "#E8C690",
  },
  boat: { position: "absolute", left: 30, bottom: 100 },
  gardenTree: { position: "absolute", left: 20, bottom: 40 },
  person: { position: "absolute", left: 150, bottom: 40 },
  thing: {
    position: "absolute",
    left: 170,
    top: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  thingHalo: {
    position: "absolute",
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "#FFF1C2",
    opacity: 0.8,
  },
  stationBird: { position: "absolute", right: 18, bottom: 70 },
});
