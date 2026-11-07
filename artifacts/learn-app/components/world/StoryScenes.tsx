/**
 * Pictures of Hudhud's story (content/story.ts), built from the app's own drawings: Hudhud,
 * Old Sana'a, Rasha's clay bowl, the sidr tree, the people of the textbook. Each scene is a
 * living picture that moves slowly, and only while it is shown.
 */

import React, { useEffect, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { Circle, Ellipse, Path, Polygon, Rect, Svg } from "react-native-svg";

import { Art } from "@/components/art/Art";
import { Picture } from "@/components/pictures/Picture";
import { MESSAGE, STATIONS, type StationPlace, type StoryScene } from "@/content/story";
import { yemen } from "@/theme/tokens";
import { BowlArt, INK, Note, NoteLetters, messageLetters } from "./Bowl";
import { Hudhud } from "./Hudhud";
import { SidrTreeArt } from "./SidrTree";
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

const lerp = (v: Animated.Value, from: number, to: number) =>
  v.interpolate({ inputRange: [0, 1], outputRange: [from, to] });

/** The rooftop wall the bowl stands on, with the city behind. */
function Rooftop({ dusk = false }: { dusk?: boolean }) {
  return (
    <>
      <View style={[styles.fill, { backgroundColor: dusk ? "#E7B98C" : "#F9E3BF" }]} />
      <View style={styles.city}>
        <Skyline />
      </View>
      <View style={styles.wall} />
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
        <Svg width={120} height={120} viewBox="0 0 130 130">
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

/** Every morning Rasha puts water out for the birds; Hudhud comes and drinks. */
function Girl() {
  const come = useOnce(1400, 900, Easing.out(Easing.quad));
  const sip = useSwing(500, 2400);
  const shimmer = useSwing(900);
  return (
    <View style={styles.scene}>
      <Rooftop />
      <View style={styles.girl}>
        <Art art="girl" size={130} />
      </View>
      <Animated.View style={[styles.bowlOnWall, { opacity: lerp(shimmer, 0.92, 1) }]}>
        <BowlArt width={96} level={1} />
      </Animated.View>
      <Animated.View
        style={[
          styles.drinker,
          {
            transform: [
              { translateX: lerp(come, 140, 0) },
              { translateY: lerp(sip, 0, 8) },
              { rotate: sip.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-10deg"] }) },
            ],
          },
        ]}
      >
        <Hudhud size={86} hop={false} />
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
      <View style={styles.girl}>
        <Art art="girl" size={130} />
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

/** One morning the bowl is empty and she is gone: the door shut, Hudhud waits alone. */
function Gone() {
  const dim = useOnce(3600, 400);
  const look = useSwing(1600, 800);
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
              { rotate: look.interpolate({ inputRange: [0, 1], outputRange: ["-4deg", "4deg"] }) },
            ],
          },
        ]}
      >
        <Hudhud size={86} hop={false} />
      </Animated.View>
      <Animated.View
        style={[styles.fill, { backgroundColor: "#3B2A40", opacity: lerp(dim, 0, 0.35) }]}
      />
    </View>
  );
}

/**
 * The note clamped under the empty bowl: Hudhud tugs it out with his beak, looks at it, and
 * cannot read it. Beside the bowl, the seed she left.
 */
function Inscription() {
  // He pulls the note out from under the bowl once; then wonders.
  const pull = useOnce(1500, 900);
  const puzzle = useSwing(700, 2400);
  const glint = useSwing(1100, 400);
  const out = { transform: [{ translateY: lerp(pull, 0, 124) }, { translateX: lerp(pull, 0, 24) }] };
  return (
    <View style={styles.scene}>
      <View style={[styles.fill, { backgroundColor: "#F3DCC7" }]} />
      <View style={styles.noteStage}>
        <Animated.View
          style={[
            styles.pulledNote,
            { transform: [...out.transform, { rotate: pull.interpolate({ inputRange: [0, 1], outputRange: ["-4deg", "5deg"] }) }] },
          ]}
        >
          <Note width={150}>
            <NoteLetters readable={() => false} size={18} />
          </Note>
        </Animated.View>
        <View style={styles.bowlOver}>
          <BowlArt width={210} level={0} />
        </View>
        <Animated.View
          style={[
            styles.seedBeside,
            { opacity: lerp(glint, 0.75, 1), transform: [{ scale: lerp(glint, 1, 1.15) }] },
          ]}
        >
          <Svg width={22} height={16} viewBox="0 0 22 16">
            <Ellipse cx={11} cy={8} rx={10} ry={7} fill="#8E5A36" />
            <Path d="M4 8 Q11 3 18 8" stroke="#5E3220" strokeWidth={1.5} fill="none" />
          </Svg>
        </Animated.View>
        {/* Hudhud holds the note's corner in his beak and comes out with it. */}
        <Animated.View style={[styles.puller, out]}>
          <Animated.View
            style={{
              opacity: pull.interpolate({ inputRange: [0.85, 1], outputRange: [0, 1], extrapolate: "clamp" }),
              transform: [{ translateY: lerp(puzzle, 0, -6) }],
            }}
          >
            <Picture emoji="❓" size={30} />
          </Animated.View>
          <Hudhud size={84} hop={false} />
        </Animated.View>
      </View>
    </View>
  );
}

/** The choice: Hudhud with the note and the seed (the choices are buttons on the screen). */
function Choose() {
  return (
    <View style={[styles.scene, styles.chooseScene]}>
      <View style={styles.chooseRow}>
        <Note width={112} style={styles.heldNote}>
          <NoteLetters readable={() => false} size={12} />
        </Note>
        <Hudhud size={130} />
        <SidrTreeArt stage={0} size={80} />
      </View>
    </View>
  );
}

/** Hudhud sets out on Rasha's trail: the way over the mountains draws itself, dot by dot. */
function Trail() {
  // One clock for the whole trail: dot i appears at its share of it.
  const draw = useOnce(3000, 400, Easing.linear);
  const fly = useOnce(3400, 300, Easing.inOut(Easing.quad));
  return (
    <View style={styles.scene}>
      <View style={[styles.fill, { backgroundColor: "#E7F0FA" }]} />
      <Svg width="100%" height={300} viewBox="0 0 360 300" style={StyleSheet.absoluteFill}>
        <Polygon points="0,300 70,150 140,300" fill="#B48A50" />
        <Polygon points="100,300 200,120 300,300" fill="#8E5A36" />
        <Polygon points="230,300 310,170 380,300" fill="#A47148" />
        <Polygon points="186,146 200,120 214,146" fill="#F7F0E1" />
      </Svg>
      {Array.from({ length: TRAIL_DOTS }, (_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.trailDot,
            {
              right: 30 + i * 34,
              top: 210 - Math.sin(i / 2) * 60,
              opacity: draw.interpolate({
                inputRange: [i / TRAIL_DOTS, (i + 1) / TRAIL_DOTS],
                outputRange: [0, 1],
                extrapolate: "clamp",
              }),
            },
          ]}
        />
      ))}
      <Animated.View
        style={[
          styles.trailBird,
          { transform: [{ translateX: lerp(fly, 0, -230) }, { translateY: lerp(fly, 0, -40) }] },
        ]}
      >
        <Hudhud size={80} flap hop={false} />
      </Animated.View>
    </View>
  );
}

const TRAIL_DOTS = 9;

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

/** The seed in dry earth, and only a few drops of water. */
function Seed() {
  const drop = useSwing(900);
  return (
    <View style={styles.scene}>
      <View style={[styles.fill, { backgroundColor: "#F6E2C2" }]} />
      <Svg width="100%" height={300} viewBox="0 0 360 300" style={StyleSheet.absoluteFill}>
        <Rect x={0} y={190} width={360} height={110} fill="#C9A16B" />
        <Path
          d="M40 230 l30 10 l20 -14 M150 260 l26 -12 l18 16 M250 228 l30 14 l26 -10"
          stroke="#8E6A4A"
          strokeWidth={3}
          fill="none"
        />
      </Svg>
      <View style={styles.seedSoil}>
        <SidrTreeArt stage={0} size={110} />
      </View>
      <Animated.View
        style={[
          styles.fallingDrop,
          { opacity: lerp(drop, 1, 0.2), transform: [{ translateY: lerp(drop, -20, 70) }] },
        ]}
      >
        <Picture emoji="💧" size={30} />
      </Animated.View>
      <View style={styles.seedBird}>
        <Hudhud size={96} hop={false} />
      </View>
    </View>
  );
}

/** Who counts can share: the jar pours, half for the birds' bowl, half for the seedling. */
function Share() {
  const pour = useSwing(1300);
  const n1 = useOnce(400, 1200);
  const n2 = useOnce(400, 2000);
  return (
    <View style={styles.scene}>
      <View style={[styles.fill, { backgroundColor: "#EEF6E8" }]} />
      <View style={styles.ground} />
      <Animated.View
        style={[
          styles.jar,
          {
            transform: [
              { rotate: pour.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-30deg"] }) },
            ],
          },
        ]}
      >
        <Svg width={80} height={80} viewBox="0 0 40 40">
          <Path
            d="M14 6 H26 V10 Q34 16 32 28 Q30 37 20 37 Q10 37 8 28 Q6 16 14 10 Z"
            fill={yemen.clay}
            stroke={yemen.clayDeep}
            strokeWidth={2}
          />
        </Svg>
      </Animated.View>
      <View style={styles.shareRow}>
        <View style={styles.shareSide}>
          <Animated.Text style={[styles.shareNum, { opacity: n1 }]}>١</Animated.Text>
          <BowlArt width={90} level={0.5} />
        </View>
        <View style={styles.shareSide}>
          <Animated.Text style={[styles.shareNum, { opacity: n2 }]}>٢</Animated.Text>
          <SidrTreeArt stage={1} size={90} />
        </View>
      </View>
      <View style={styles.shareBird}>
        <Hudhud size={84} />
      </View>
    </View>
  );
}

/** The sidr tree stands in the courtyard, and the birds come to it. */
function Tree() {
  const sway = useSwing(2200);
  const birds = useSwing(1400, 600);
  return (
    <View style={styles.scene}>
      <View style={[styles.fill, { backgroundColor: "#E7F0FA" }]} />
      <View style={styles.ground} />
      <Animated.View
        style={[
          styles.bigTree,
          {
            transform: [
              {
                rotate: sway.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["-1.5deg", "1.5deg"],
                }),
              },
            ],
          },
        ]}
      >
        <SidrTreeArt stage={5} size={230} />
      </Animated.View>
      <Animated.View
        style={[styles.treeBirds, { transform: [{ translateY: lerp(birds, 0, -10) }] }]}
      >
        <Picture emoji="🐦" size={34} />
        <Picture emoji="🕊" size={34} />
      </Animated.View>
      <View style={styles.treeBowl}>
        <BowlArt width={80} level={1} />
      </View>
    </View>
  );
}

/** A little girl comes and waters the tree with Hudhud. */
function NewGirl() {
  const pour = useSwing(1100);
  return (
    <View style={styles.scene}>
      <View style={[styles.fill, { backgroundColor: "#F9E3BF" }]} />
      <View style={styles.ground} />
      <View style={styles.midTree}>
        <SidrTreeArt stage={5} size={200} />
      </View>
      <View style={styles.smallGirl}>
        <Art art="girl" size={100} />
      </View>
      <Animated.View
        style={[
          styles.pourDrop,
          { opacity: lerp(pour, 1, 0.2), transform: [{ translateY: lerp(pour, 0, 40) }] },
        ]}
      >
        <Picture emoji="💧" size={24} />
      </Animated.View>
      <View style={styles.branchBird}>
        <Hudhud size={70} hop={false} />
      </View>
    </View>
  );
}

/** Rasha's kindness stayed: Hudhud flies over the mountains, and always comes back. */
function Home() {
  const fly = useSwing(2600);
  return (
    <View style={styles.scene}>
      <View style={[styles.fill, { backgroundColor: "#F7C98B" }]} />
      <View style={styles.sunset} />
      <View style={styles.city}>
        <Skyline />
      </View>
      <View style={styles.homeTree}>
        <SidrTreeArt stage={5} size={120} />
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
  roof: "#F9E3BF",
  door: "#F9E3BF",
  school: "#E7F0FA",
  beach: "#E7F0FA",
  road: "#F6E9D4",
  garden: "#EEF6E8",
  well: "#F6E9D4",
  village: "#E7F0FA",
  terraces: "#E7F0FA",
  rain: "#D9E4EE",
  courtyard: "#F6E2C2",
};

/** The ground of a station: the city, the sea, the mountains, a garden. */
function PlaceGround({ place }: { place: StationPlace }) {
  switch (place) {
    case "roof":
    case "door":
      return (
        <>
          <View style={styles.city}>
            <Skyline />
          </View>
          {place === "door" ? (
            <View style={styles.stationArt}>
              <Art art="door" size={110} />
            </View>
          ) : null}
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
    case "courtyard":
      return (
        <>
          <View style={[styles.ground, place === "courtyard" && { backgroundColor: "#C9A16B" }]} />
          <View style={styles.gardenTree}>
            {place === "garden" ? (
              <Art art="palm" size={140} />
            ) : (
              <SidrTreeArt stage={1} size={110} />
            )}
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
      return (
        <Svg width="100%" height={300} viewBox="0 0 360 300" style={StyleSheet.absoluteFill}>
          <Path d="M0 300 L0 160 Q90 90 180 130 Q270 80 360 150 L360 300 Z" fill="#B48A50" />
          {[0, 1, 2, 3].map((i) => (
            <Path
              key={i}
              d={`M0 ${300 - i * 30} H360 V${276 - i * 30} H0 Z`}
              fill={i % 2 ? "#5BA05F" : "#3F8A4E"}
            />
          ))}
          {place === "village"
            ? [60, 110, 250].map((x, i) => (
                <Rect key={i} x={x} y={130 - (i % 2) * 14} width={30} height={46} fill="#A55B34" />
              ))
            : null}
        </Svg>
      );
    case "rain":
      return (
        <>
          <View style={styles.ground} />
          <RainDrops />
        </>
      );
  }
}

function RainDrops() {
  const fall = useSwing(800);
  return (
    <Animated.View style={[styles.rain, { transform: [{ translateY: lerp(fall, -10, 20) }] }]}>
      {Array.from({ length: 8 }, (_, i) => (
        <View key={i} style={[styles.rainDrop, { left: 20 + i * 42, top: (i % 3) * 30 }]} />
      ))}
    </Animated.View>
  );
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
  girl: Girl,
  why: Why,
  gone: Gone,
  inscription: Inscription,
  choose: Choose,
  trail: Trail,
  bowl: BowlScene,
  seed: Seed,
  share: Share,
  tree: Tree,
  newgirl: NewGirl,
  home: Home,
  station: Station,
};

export function StoryPicture({ scene }: { scene: StoryScene }) {
  const Scene = SCENES[scene.id];
  return <Scene unit={scene.unit} />;
}

const styles = StyleSheet.create({
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
  sun: { position: "absolute", top: 26, left: 40 },
  roofBird: { position: "absolute", right: 46, bottom: 92 },
  girl: { position: "absolute", left: 20, bottom: 50 },
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
  noteStage: { position: "absolute", top: 16, left: 0, right: 0, height: 270, alignItems: "center" },
  // Under the bowl at first; only a corner shows below its foot.
  pulledNote: { position: "absolute", top: 34 },
  bowlOver: { position: "absolute", top: 0 },
  seedBeside: { position: "absolute", top: 118, left: "12%" },
  puller: { position: "absolute", top: 4, right: "6%", alignItems: "center" },
  smallBowl: { position: "absolute", left: 12, bottom: 34 },
  bigNote: { position: "absolute", top: 26, left: 0, right: 0, alignItems: "center" },
  unfolded: { paddingVertical: 18, transform: [{ rotate: "-2deg" }] },
  noteRow: { flexDirection: "row-reverse", justifyContent: "center", gap: 6 },
  noteLetter: { fontSize: 26, fontWeight: "900", lineHeight: 38, minWidth: 16, textAlign: "center" },
  paleLetter: { color: "#D8CBAE" },
  glowLetter: {
    position: "absolute",
    color: INK,
    textShadowColor: "#F4C14B",
    textShadowRadius: 8,
  },
  noteBird: { position: "absolute", right: 14, bottom: 18 },
  chooseScene: { backgroundColor: "transparent", alignItems: "center", justifyContent: "center" },
  heldNote: { flexShrink: 0, marginBottom: 24, transform: [{ rotate: "5deg" }] },
  chooseRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  trailDot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: yemen.clay,
  },
  trailBird: { position: "absolute", right: 10, top: 150 },
  ground: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 70,
    backgroundColor: "#8FB27A",
  },
  seedSoil: { position: "absolute", left: 0, right: 0, bottom: 60, alignItems: "center" },
  fallingDrop: { position: "absolute", left: 160, top: 40 },
  seedBird: { position: "absolute", right: 20, top: 30 },
  jar: { position: "absolute", top: 20, left: 140 },
  shareRow: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
  },
  shareSide: { alignItems: "center" },
  shareNum: { fontSize: 30, fontWeight: "900", color: yemen.blue },
  shareBird: { position: "absolute", right: 8, top: 8 },
  bigTree: { position: "absolute", left: 0, right: 0, bottom: 30, alignItems: "center" },
  treeBirds: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 60,
  },
  treeBowl: { position: "absolute", left: 30, bottom: 30 },
  midTree: { position: "absolute", right: 20, bottom: 40 },
  smallGirl: { position: "absolute", left: 40, bottom: 40 },
  pourDrop: { position: "absolute", left: 150, bottom: 110 },
  branchBird: { position: "absolute", right: 70, top: 60 },
  sunset: {
    position: "absolute",
    left: 30,
    top: 50,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#F6A53C",
  },
  homeTree: { position: "absolute", right: 30, bottom: 50 },
  homeBird: { position: "absolute", left: 140, top: 50 },
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
  rain: { position: "absolute", top: 0, left: 0, right: 0, height: 120 },
  rainDrop: {
    position: "absolute",
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: "#4F8FD6",
  },
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
