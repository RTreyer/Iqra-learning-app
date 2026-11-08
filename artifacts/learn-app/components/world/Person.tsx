/**
 * A person of Hudhud's story (the teacher, the fisherman, the old postman, the trader ...),
 * drawn from the app's pictures (components/pictures/people.ts) and brought to life like a
 * cartoon character:
 * - the face shows a mood: smiling, happy (laughing eyes, an open smile), astonished (round
 *   eyes, raised brows, a round mouth) or sad (brows up in the middle, the mouth turned down).
 *   The people pictures share one face (two eyes, one smiling mouth), which is redrawn here;
 * - open eyes blink now and then;
 * - the body speaks too: breathing, a happy bounce, a start of surprise, a sad slump.
 * Pictures without that face (the camel, the birds) keep it and only move.
 */

import React, { useEffect, useMemo, useState } from "react";
import { Animated, Easing, View } from "react-native";
import { SvgXml } from "react-native-svg";

import { PICTURES } from "@/components/pictures/registry";
import { pictureKey } from "@/components/pictures/Picture";
import type { PersonMood as Mood } from "@/content/story";
import { key, useCycle } from "./motion";

export type { Mood };

const INK = "#2B1D14";
const MOUTH_INSIDE = "#7A3418";
const SKIN = "#C68A5B";

const EYE = /<circle cx="([\d.]+)" cy="([\d.]+)" r="2\.2" fill="#2B1D14"\/>/g;
const MOUTH =
  /<path d="M([\d.]+) ([\d.]+) Q([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)" stroke="#2B1D14" stroke-width="3" fill="none" stroke-linecap="round"\/>/;

type Face = { xml: string; eyes: [number, number][] };

/** The picture with its face redrawn for the mood, and where its eyes are (for blinking). */
export function faceFor(xml: string, mood: Mood): Face {
  const eyes: [number, number][] = [];
  for (const m of xml.matchAll(EYE)) {
    if (eyes.length < 2) eyes.push([Number(m[1]), Number(m[2])]);
  }
  const mouth = xml.match(MOUTH);
  if (eyes.length < 2 || !mouth || mood === "smile") return { xml, eyes };
  const [x1, y1, qx, qy, x2, y2] = mouth.slice(1).map(Number);
  const eye = (x: number, y: number, i: number) => {
    switch (mood) {
      case "wonder":
        return (
          `<path d="M${x - 4} ${y - 5.5} Q${x} ${y - 8.5} ${x + 4} ${y - 5.5}" stroke="${INK}" stroke-width="1.8" fill="none" stroke-linecap="round"/>` +
          `<circle cx="${x}" cy="${y}" r="3.7" fill="#FFFFFF" stroke="${INK}" stroke-width="1"/>` +
          `<circle cx="${x}" cy="${y + 0.3}" r="2" fill="${INK}"/>`
        );
      case "happy":
        return `<path d="M${x - 2.9} ${y + 0.9} Q${x} ${y - 2.8} ${x + 2.9} ${y + 0.9}" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
      case "sad": {
        // Brows raised towards the middle of the face.
        const inner = i === 0 ? 1 : -1;
        return (
          `<path d="M${x - 3.6 * inner} ${y - 4.6} L${x + 2 * inner} ${y - 6.8}" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>` +
          `<circle cx="${x}" cy="${y}" r="2.2" fill="${INK}"/>`
        );
      }
    }
  };
  let i = 0;
  let out = xml.replace(EYE, (m, x, y) => (i < 2 ? eye(Number(x), Number(y), i++) : m));
  const mid = (x1 + x2) / 2;
  const mouthXml =
    mood === "wonder"
      ? `<ellipse cx="${mid}" cy="${(y1 + qy) / 2 + 0.5}" rx="2.4" ry="3.2" fill="${MOUTH_INSIDE}"/>`
      : mood === "happy"
        ? `<path d="M${x1 - 1} ${y1} Q${qx} ${qy + 4} ${x2 + 1} ${y2} Z" fill="${MOUTH_INSIDE}"/>`
        : `<path d="M${x1} ${y1 + 3.5} Q${qx} ${y1 - 1.5} ${x2} ${y2 + 3.5}" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  out = out.replace(MOUTH, mouthXml);
  return { xml: out, eyes };
}

export function Person({
  emoji,
  mood = "smile",
  size = 86,
}: {
  emoji: string;
  mood?: Mood;
  size?: number;
}) {
  const base = PICTURES[pictureKey(emoji)];
  const face = useMemo(() => (base ? faceFor(base, mood) : null), [base, mood]);
  const open = mood === "smile" || mood === "sad";
  const blink = useCycle(open && (face?.eyes.length ?? 0) === 2, 4300, 700);
  const lid = key(blink, [0, 0.9, 0.93, 0.97, 1], [0, 0, 1, 0, 0]);
  const breath = useCycle(mood !== "happy", mood === "sad" ? 3600 : 2600);
  const bounce = useCycle(mood === "happy", 820);
  // A start of surprise: a quick jump back, once, when the person begins to wonder.
  const [start] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (mood !== "wonder") return;
    start.setValue(0);
    const anim = Animated.timing(start, {
      toValue: 1,
      duration: 520,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [mood, start]);
  if (!face) return <View style={{ width: size, height: size }} />;
  const s = size / 100;
  const body =
    mood === "happy"
      ? [
          { translateY: key(bounce, [0, 0.3, 0.6, 1], [0, -5, 0, 0]) },
          { scaleY: key(bounce, [0, 0.6, 0.7, 0.8, 1], [1, 1, 0.95, 1, 1]) },
        ]
      : mood === "wonder"
        ? [
            { translateY: key(start, [0, 0.35, 1], [0, -7, -2]) },
            { rotate: key(start, [0, 0.35, 1], ["0deg", "-5deg", "-3deg"]) },
          ]
        : mood === "sad"
          ? [
              { translateY: 3 },
              { rotate: "2deg" },
              { scaleY: key(breath, [0, 0.5, 1], [0.97, 0.985, 0.97]) },
            ]
          : [{ scaleY: key(breath, [0, 0.5, 1], [1, 1.02, 1]) }];
  return (
    <Animated.View
      testID={`person-${pictureKey(emoji)}`}
      accessibilityLabel={mood}
      style={{ width: size, height: size, transformOrigin: "50% 100%", transform: body }}
    >
      <SvgXml
        xml={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${face.xml}</svg>`}
        width={size}
        height={size}
      />
      {open
        ? face.eyes.map(([x, y]) => (
            <Animated.View
              key={x}
              style={{
                position: "absolute",
                left: (x - 3) * s,
                top: (y - 3) * s,
                width: 6 * s,
                height: 6 * s,
                borderRadius: size,
                backgroundColor: SKIN,
                transformOrigin: "50% 0%",
                transform: [{ scaleY: lid }],
              }}
            />
          ))
        : null}
    </Animated.View>
  );
}
