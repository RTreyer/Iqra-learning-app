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

/** Scene 1: Hudhud, the postman, flies over Sana'a with his bag of messages. */
function Postman() {
  const swing = useSwing(1600);
  return (
    <View style={styles.scene}>
      <View style={styles.sky} />
      <Animated.View
        style={[
          styles.flying,
          {
            transform: [
              { translateX: swing.interpolate({ inputRange: [0, 1], outputRange: [30, -30] }) },
              { translateY: swing.interpolate({ inputRange: [0, 1], outputRange: [0, -14] }) },
            ],
          },
        ]}
      >
        <Hudhud size={130} hop={false} />
        <View style={styles.bag}>
          <Envelope size={30} />
          <Envelope size={30} />
        </View>
      </Animated.View>
      <View style={styles.ground}>
        <Skyline />
      </View>
    </View>
  );
}

const FLYING = ["أ", "ب", "ت", "م", "ر", "ن", "د", "ل"];

/** One letter blown out of a message, round and round. */
function FlyingLetter({ letter, index }: { letter: string; index: number }) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(v, {
        toValue: 1,
        duration: 2600,
        delay: index * 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [v, index]);
  const angle = (index / FLYING.length) * Math.PI * 2;
  const dx = Math.cos(angle) * 130;
  const dy = Math.sin(angle) * 110 - 40;
  return (
    <Animated.Text
      style={[
        styles.letter,
        {
          color: [yemen.red, yemen.blue, yemen.green, yemen.goldDeep][index % 4],
          opacity: v.interpolate({ inputRange: [0, 0.15, 0.8, 1], outputRange: [0, 1, 1, 0] }),
          transform: [
            { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, dx] }) },
            { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, dy] }) },
            { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "300deg"] }) },
          ],
        },
      ]}
    >
      {letter}
    </Animated.Text>
  );
}

/** Scene 2: a gust of wind blows the letters out of the messages. */
function Wind() {
  const swing = useSwing(500);
  return (
    <View style={styles.scene}>
      <View style={styles.sky} />
      <Svg width={300} height={160} viewBox="0 0 300 160" style={styles.wind}>
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
      <View style={styles.centre}>
        {FLYING.map((letter, i) => (
          <FlyingLetter key={letter} letter={letter} index={i} />
        ))}
        <Animated.View
          style={{
            transform: [
              { rotate: swing.interpolate({ inputRange: [0, 1], outputRange: ["-8deg", "8deg"] }) },
            ],
          }}
        >
          <Hudhud size={120} hop={false} />
        </Animated.View>
        <View style={styles.openEnvelopes}>
          <Envelope size={40} />
          <Envelope size={40} />
        </View>
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
        <Hudhud size={96} />
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
        <Hudhud size={110} pose="cheer" />
      </View>
    </View>
  );
}

/** Scene 5 shows Hudhud between the two choices (the choices are buttons on the screen). */
function Choose() {
  return (
    <View style={[styles.scene, styles.chooseScene]}>
      <Hudhud size={140} />
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
  bag: { position: "absolute", bottom: 4, left: 50, flexDirection: "row", gap: 2 },
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
  centre: { alignItems: "center", justifyContent: "center" },
  letter: { position: "absolute", fontSize: 34, fontWeight: "900" },
  openEnvelopes: { flexDirection: "row", gap: 8, marginTop: -6 },
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
