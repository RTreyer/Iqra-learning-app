/**
 * The new beginning of Hudhud's story (content/story.ts): Hudhud is a day worker who does a
 * different job in Yemen every day, and dreams of building a school in his village. Each
 * scene is a living picture: the morning rises over Sana'a, the country passes below him as he
 * flies from job to job, stars twinkle over his dream, the coffee beans wait to be counted.
 * Everything moves slowly, and only while the scene is shown.
 */

import React, { useEffect, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { Circle, Ellipse, Path, Polygon, Rect, Svg } from "react-native-svg";

import { Art } from "@/components/art/Art";
import { Picture } from "@/components/pictures/Picture";
import { yemen } from "@/theme/tokens";
import { Hudhud } from "./Hudhud";
import { Skyline } from "./Skyline";
import { StickerArt } from "./StickerArt";
import { Envelope } from "./StoryScenes";
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

const lerp = (v: Animated.Value, from: number, to: number) =>
  v.interpolate({ inputRange: [0, 1], outputRange: [from, to] });

/** Scene: dawn over Sana'a. The night lifts, the sun rises, Hudhud wakes on a rooftop. */
export function Dawn() {
  const morning = useOnce(3200);
  const sun = useOnce(3600, 200, Easing.out(Easing.cubic));
  const rays = useSwing(2400, 1500);
  const wake = useOnce(700, 2200, Easing.out(Easing.back(2)));
  const flock = useOnce(6000, 600, Easing.linear);
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
        <Svg width={130} height={130} viewBox="0 0 130 130">
          {Array.from({ length: 12 }, (_, i) => (
            <Rect
              key={i}
              x={62}
              y={4}
              width={6}
              height={20}
              rx={3}
              fill="#F4C14B"
              opacity={0.7}
              transform={`rotate(${i * 30} 65 65)`}
            />
          ))}
          <Circle cx={65} cy={65} r={34} fill="#F6B73C" />
          <Circle cx={65} cy={65} r={26} fill="#FBD46E" />
        </Svg>
      </Animated.View>
      {/* Birds of the morning crossing the sky. */}
      <Animated.View
        style={[styles.flock, { transform: [{ translateX: lerp(flock, 380, -120) }] }]}
      >
        <Svg width={90} height={30} viewBox="0 0 90 30">
          {[0, 30, 58].map((x, i) => (
            <Path
              key={i}
              d={`M${x} ${12 + (i % 2) * 8} q6 -7 12 0 q6 -7 12 0`}
              stroke="#5E3220"
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
            />
          ))}
        </Svg>
      </Animated.View>
      <View style={styles.ground}>
        <Skyline />
      </View>
      <Animated.View
        style={[
          styles.roofBird,
          { transform: [{ translateY: lerp(wake, 10, 0) }, { scale: lerp(wake, 0.92, 1) }] },
        ]}
      >
        <Hudhud size={118} pose="cheer" />
      </Animated.View>
    </View>
  );
}

const PANEL = 360;

/** One of Hudhud's jobs as a strip of landscape. */
function Terraces() {
  return (
    <View style={[styles.panel, { backgroundColor: "#DDEFF7" }]}>
      <Svg width={PANEL} height={300} viewBox="0 0 360 300" style={StyleSheet.absoluteFill}>
        <Path d="M0 300 L0 150 Q90 80 180 120 Q270 70 360 140 L360 300 Z" fill="#B48A50" />
        {[0, 1, 2, 3].map((i) => (
          <Path
            key={i}
            d={`M0 ${300 - i * 34} L360 ${300 - i * 34} L360 ${276 - i * 34} L0 ${276 - i * 34} Z`}
            fill={i % 2 ? "#5BA05F" : "#3F8A4E"}
          />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <Path key={`e${i}`} d={`M0 ${276 - i * 34} H360`} stroke="#A0764A" strokeWidth={3} />
        ))}
      </Svg>
      <View style={[styles.prop, { left: 60, bottom: 146 }]}>
        <Picture emoji="👨" size={70} />
      </View>
      <View style={[styles.prop, { left: 150, bottom: 150 }]}>
        <Picture emoji="🌱" size={46} />
      </View>
      <View style={[styles.prop, { left: 210, bottom: 150 }]}>
        <Picture emoji="🌾" size={52} />
      </View>
    </View>
  );
}

function Sea() {
  const bob = useSwing(900);
  return (
    <View style={[styles.panel, { backgroundColor: "#E7F0FA" }]}>
      <View style={[styles.water]} />
      <Animated.View
        style={[
          styles.prop,
          { left: 70, bottom: 92, transform: [{ translateY: lerp(bob, 0, -6) }] },
        ]}
      >
        <StickerArt id="dhow" size={130} />
      </Animated.View>
      <Animated.View
        style={[
          styles.prop,
          {
            left: 230,
            bottom: 70,
            transform: [{ translateY: lerp(bob, 10, -40) }, { rotate: "-20deg" }],
          },
        ]}
      >
        <Picture emoji="🐟" size={48} />
      </Animated.View>
    </View>
  );
}

function Mountains() {
  const buzz = useSwing(500);
  return (
    <View style={[styles.panel, { backgroundColor: "#F6E9D4" }]}>
      <Svg width={PANEL} height={300} viewBox="0 0 360 300" style={StyleSheet.absoluteFill}>
        <Polygon points="0,300 90,120 180,300" fill="#A47148" />
        <Polygon points="120,300 240,90 360,300" fill="#8E5A36" />
        <Polygon points="220,130 240,90 262,130" fill="#F7F0E1" />
        <Rect x={0} y={250} width={360} height={50} fill="#D9B077" />
      </Svg>
      <View style={[styles.prop, { left: 70, bottom: 40 }]}>
        <Picture emoji="🍯" size={70} />
      </View>
      {[0, 1, 2].map((i) => (
        <Animated.View
          key={i}
          style={[
            styles.prop,
            {
              left: 150 + i * 40,
              bottom: 110 + (i % 2) * 30,
              transform: [{ translateY: lerp(buzz, i % 2 ? -6 : 6, i % 2 ? 6 : -6) }],
            },
          ]}
        >
          <Picture emoji="🐝" size={34} />
        </Animated.View>
      ))}
    </View>
  );
}

/**
 * Scene: Hudhud's jobs. The country of Yemen passes below him from right to left as he flies:
 * the farmer's terraces, the fishermen's sea, the beekeeper's mountains.
 */
export function Jobs() {
  const pan = useOnce(8200, 400, Easing.inOut(Easing.quad));
  const bob = useSwing(650);
  return (
    <View style={styles.scene}>
      <Animated.View
        style={[styles.strip, { transform: [{ translateX: lerp(pan, 0, 2 * PANEL) }] }]}
      >
        <Terraces />
        <Sea />
        <Mountains />
      </Animated.View>
      <Animated.View style={[styles.flyingBird, { transform: [{ translateY: lerp(bob, 4, -8) }] }]}>
        <Hudhud size={110} flap hop={false} />
      </Animated.View>
    </View>
  );
}

/** A star that twinkles on its own beat. */
function Star({ left, top, delay }: { left: number; top: number; delay: number }) {
  const twinkle = useSwing(900 + (delay % 5) * 140, delay);
  return (
    <Animated.View style={[styles.star, { left, top, opacity: lerp(twinkle, 0.3, 1) }]}>
      <Svg width={14} height={14} viewBox="0 0 14 14">
        <Polygon points="7,0 8.6,5.4 14,7 8.6,8.6 7,14 5.4,8.6 0,7 5.4,5.4" fill="#FFF1C2" />
      </Svg>
    </Animated.View>
  );
}

const STARS = Array.from({ length: 14 }, (_, i) => ({
  left: ((i * 71) % 340) + 8,
  top: ((i * 37) % 110) + 10,
  delay: i * 230,
}));

/**
 * Scene: the dream. At night, under the stars, Hudhud reads by a lantern and dreams of a school
 * in his village: it draws itself in his thought bubble, and children come to it one by one.
 */
export function Dream() {
  const glow = useSwing(1200);
  const school = useOnce(2600, 800);
  const kids = [useOnce(500, 2600), useOnce(500, 3100), useOnce(500, 3600)];
  return (
    <View style={styles.scene}>
      <View style={[styles.fill, { backgroundColor: "#1D2A4F" }]} />
      {STARS.map((s, i) => (
        <Star key={i} {...s} />
      ))}
      <View style={styles.moon}>
        <Svg width={46} height={46} viewBox="0 0 46 46">
          <Path d="M30 4 A20 20 0 1 0 42 32 A16 16 0 1 1 30 4 Z" fill="#F4E3A1" />
        </Svg>
      </View>
      <View style={styles.nightGround} />
      {/* His dream, in a thought bubble: the school draws itself, the children come. */}
      <View style={styles.thought}>
        <Svg width={190} height={140} viewBox="0 0 190 140" style={StyleSheet.absoluteFill}>
          <Path
            d="M30 100 Q4 98 10 70 Q4 36 40 34 Q50 6 90 12 Q124 0 140 26 Q182 26 178 62 Q190 96 154 104 Q130 124 96 112 Q64 126 30 100 Z"
            fill="#FFFFFF"
            opacity={0.92}
          />
        </Svg>
        <Animated.View
          style={{ opacity: lerp(school, 0.15, 1), transform: [{ scale: lerp(school, 0.85, 1) }] }}
        >
          <Art art="school" size={92} />
        </Animated.View>
        <View style={styles.kids}>
          {(["👧", "👦", "👧"] as const).map((e, i) => (
            <Animated.View
              key={i}
              style={{ opacity: kids[i], transform: [{ translateY: lerp(kids[i], 10, 0) }] }}
            >
              <Picture emoji={e} size={30} />
            </Animated.View>
          ))}
        </View>
      </View>
      <View style={styles.bubbleDots}>
        <View style={[styles.dot, { width: 14, height: 14 }]} />
        <View style={[styles.dot, { width: 9, height: 9, marginLeft: 16 }]} />
      </View>
      <View style={styles.dreamer}>
        <Animated.View style={[styles.lanternGlow, { opacity: lerp(glow, 0.18, 0.4) }]} />
        <Svg width={34} height={46} viewBox="0 0 34 46" style={styles.lantern}>
          <Path d="M17 2 V8" stroke="#5E3220" strokeWidth={3} />
          <Rect x={7} y={8} width={20} height={6} rx={2} fill="#C98A3A" />
          <Rect
            x={8}
            y={14}
            width={18}
            height={24}
            rx={4}
            fill="#FCE29A"
            stroke="#C98A3A"
            strokeWidth={2}
          />
          <Ellipse cx={17} cy={27} rx={4} ry={6} fill="#F4A21E" />
          <Rect x={6} y={38} width={22} height={5} rx={2} fill="#C98A3A" />
        </Svg>
        <Hudhud size={108} />
        <View style={styles.book}>
          <Picture emoji="📖" size={44} />
        </View>
      </View>
    </View>
  );
}

/**
 * Scene: today's two jobs. On one side the post (letters to carry), on the other the coffee
 * market (sacks to count); Hudhud in the middle looks from one to the other.
 */
export function Today() {
  const [look, setLook] = useState(false);
  useEffect(() => {
    const timer = setInterval(() => setLook((l) => !l), 1300);
    return () => clearInterval(timer);
  }, []);
  const glowPost = useSwing(1300);
  return (
    <View style={styles.scene}>
      <View style={[styles.half, styles.halfRight, { backgroundColor: "#E7F0FA" }]}>
        <Animated.View style={{ transform: [{ scale: lerp(glowPost, 1, 1.06) }] }}>
          <Envelope size={70} />
        </Animated.View>
        <Picture emoji="🏘" size={78} />
      </View>
      <View style={[styles.half, styles.halfLeft, { backgroundColor: "#F6E2C2" }]}>
        <Animated.View style={{ transform: [{ scale: lerp(glowPost, 1.06, 1) }] }}>
          <Picture emoji="☕" size={58} />
        </Animated.View>
        <View style={styles.sackRow}>
          <SackPicture size={50} />
          <SackPicture size={58} />
          <SackPicture size={50} />
        </View>
      </View>
      <View style={styles.todayBird}>
        <Hudhud size={120} mirrored={look} />
      </View>
    </View>
  );
}

function SackPicture({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 70 70">
      <Path
        d="M14 18 Q35 8 56 18 L62 62 Q35 70 8 62 Z"
        fill="#B58A5A"
        stroke="#7A5530"
        strokeWidth={2}
      />
      <Path d="M18 18 Q35 26 52 18" stroke="#7A5530" strokeWidth={3} fill="none" />
      <Ellipse cx={30} cy={44} rx={4} ry={5.5} fill="#5E3220" />
      <Ellipse cx={41} cy={48} rx={4} ry={5.5} fill="#5E3220" />
    </Svg>
  );
}

const BEANS = Array.from({ length: 9 }, (_, i) => ({
  x: 40 + (i % 5) * 52 + (i > 4 ? 26 : 0),
  y: i > 4 ? 200 : 236,
  r: ((i * 47) % 60) - 30,
}));
const COUNTS = ["١", "٢", "٣"];

/**
 * Scene: so many beans. Coffee beans spill from an open sack; Hudhud starts to count them
 * (one, two, three numbers pop up), then gets lost: question marks.
 */
export function Beans() {
  const spill = useOnce(1200, 200, Easing.out(Easing.quad));
  const pops = [useOnce(400, 1400), useOnce(400, 2000), useOnce(400, 2600)];
  const lost = useOnce(500, 3400, Easing.out(Easing.back(2)));
  const wobble = useSwing(400, 3400);
  return (
    <View style={styles.scene}>
      <View style={[styles.fill, { backgroundColor: "#F6E2C2" }]} />
      <View style={[styles.fill, styles.table]} />
      <View style={styles.openSack}>
        <SackPicture size={120} />
      </View>
      {BEANS.map((b, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bean,
            {
              left: b.x,
              top: b.y,
              opacity: spill,
              transform: [
                { translateX: lerp(spill, 260 - b.x, 0) },
                { translateY: lerp(spill, -60, 0) },
                { rotate: `${b.r}deg` },
              ],
            },
          ]}
        >
          <Svg width={30} height={22} viewBox="0 0 30 22">
            <Ellipse cx={15} cy={11} rx={14} ry={10} fill="#6B3A1E" />
            <Path d="M4 11 Q15 4 26 11" stroke="#3B1E0C" strokeWidth={2.5} fill="none" />
          </Svg>
        </Animated.View>
      ))}
      {COUNTS.map((n, i) => (
        <Animated.Text
          key={n}
          style={[
            styles.count,
            {
              // Counted on the front row, the beans nearest the child.
              left: BEANS[5 + i].x + 4,
              top: BEANS[5 + i].y - 44,
              opacity: pops[i],
              transform: [{ scale: lerp(pops[i], 0.4, 1) }],
            },
          ]}
        >
          {n}
        </Animated.Text>
      ))}
      <Animated.Text
        style={[
          styles.lost,
          {
            opacity: lost,
            transform: [
              { scale: lerp(lost, 0.3, 1) },
              {
                rotate: wobble.interpolate({ inputRange: [0, 1], outputRange: ["-8deg", "8deg"] }),
              },
            ],
          },
        ]}
      >
        ؟ ؟
      </Animated.Text>
      <View style={styles.beansBird}>
        <Hudhud size={104} />
      </View>
    </View>
  );
}

/** Scene: the dhow waits in the harbour of Mocha for the coffee; the sea rocks it. */
export function Ship() {
  const rock = useSwing(1100);
  const sail = useSwing(1800, 300);
  return (
    <View style={styles.scene}>
      <View style={[styles.fill, { backgroundColor: "#FAD9A8" }]} />
      <View style={styles.sunsetSun} />
      <View style={styles.harbourSea} />
      <Animated.View
        style={[
          styles.harbourShip,
          {
            transform: [
              { translateY: lerp(rock, 0, -7) },
              { rotate: sail.interpolate({ inputRange: [0, 1], outputRange: ["-3deg", "3deg"] }) },
            ],
          },
        ]}
      >
        <StickerArt id="dhow" size={150} />
      </Animated.View>
      <View style={styles.quay}>
        <SackPicture size={56} />
        <SackPicture size={64} />
        <SackPicture size={56} />
      </View>
      <View style={styles.shipBird}>
        <Hudhud size={100} pose="cheer" />
      </View>
    </View>
  );
}

/** Scene: the people wait for their messages, looking out of their windows. */
export function Waiting() {
  const float = useSwing(1100);
  return (
    <View style={styles.scene}>
      <View style={[styles.fill, { backgroundColor: "#E7F0FA" }]} />
      <View style={styles.waitHouse}>
        <Art art="house" size={170} />
      </View>
      <View style={styles.waitPeople}>
        <Art art="girl" size={84} />
        <Art art="boy" size={84} />
      </View>
      {[0, 1, 2].map((i) => (
        <Animated.View
          key={i}
          style={[
            styles.prop,
            {
              left: 150 + i * 56,
              top: 40 + (i % 2) * 24,
              transform: [{ translateY: lerp(float, i % 2 ? -8 : 8, i % 2 ? 8 : -8) }],
            },
          ]}
        >
          <Picture emoji="❓" size={38} />
        </Animated.View>
      ))}
      <View style={styles.waitBird}>
        <Hudhud size={110} pose="cheer" bag={0} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: {
    width: "100%",
    height: 300,
    borderRadius: 28,
    overflow: "hidden",
  },
  fill: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  ground: { position: "absolute", bottom: 0, left: 0, right: 0, alignItems: "center" },
  sun: { position: "absolute", top: 26, left: 40 },
  flock: { position: "absolute", top: 40, left: 0 },
  roofBird: { position: "absolute", right: 46, bottom: 92 },
  strip: {
    position: "absolute",
    top: 0,
    right: 0,
    height: 300,
    width: 3 * PANEL,
    flexDirection: "row-reverse",
  },
  panel: { width: PANEL, height: 300, overflow: "hidden" },
  prop: { position: "absolute" },
  water: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 110,
    backgroundColor: "#4F8FD6",
  },
  flyingBird: { position: "absolute", top: 34, left: 0, right: 0, alignItems: "center" },
  star: { position: "absolute" },
  moon: { position: "absolute", top: 18, right: 24 },
  nightGround: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 64,
    backgroundColor: "#2B3D2E",
  },
  thought: {
    position: "absolute",
    left: 14,
    top: 30,
    width: 190,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 4,
  },
  kids: { flexDirection: "row", gap: 2, marginTop: -6 },
  bubbleDots: { position: "absolute", left: 196, top: 176 },
  dot: { borderRadius: 10, backgroundColor: "#FFFFFF", opacity: 0.92, marginBottom: 6 },
  dreamer: { position: "absolute", right: 22, bottom: 30, alignItems: "center" },
  lanternGlow: {
    position: "absolute",
    left: -40,
    bottom: 4,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F8C04A",
  },
  lantern: { position: "absolute", left: -30, bottom: 6 },
  book: { position: "absolute", left: -6, bottom: -6 },
  half: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "50%",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  halfRight: { right: 0 },
  halfLeft: { left: 0 },
  sackRow: { flexDirection: "row", alignItems: "flex-end" },
  todayBird: { position: "absolute", bottom: 14, left: 0, right: 0, alignItems: "center" },
  table: { top: 190, backgroundColor: "#C98A3A" },
  openSack: { position: "absolute", right: 20, top: 110, transform: [{ rotate: "-20deg" }] },
  bean: { position: "absolute" },
  count: { position: "absolute", fontSize: 34, fontWeight: "900", color: yemen.blue },
  lost: {
    position: "absolute",
    top: 70,
    left: 120,
    fontSize: 52,
    fontWeight: "900",
    color: yemen.clay,
  },
  beansBird: { position: "absolute", left: 14, top: 26 },
  sunsetSun: {
    position: "absolute",
    left: 40,
    top: 60,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#F6A53C",
  },
  harbourSea: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
    backgroundColor: "#3F7DC0",
  },
  harbourShip: { position: "absolute", left: 30, bottom: 70 },
  quay: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 170,
    height: 70,
    backgroundColor: "#B48A50",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingBottom: 30,
  },
  shipBird: { position: "absolute", right: 34, bottom: 92 },
  waitHouse: { position: "absolute", left: 10, bottom: 0 },
  waitPeople: { position: "absolute", left: 120, bottom: 6, flexDirection: "row" },
  waitBird: { position: "absolute", right: 14, top: 30 },
});
