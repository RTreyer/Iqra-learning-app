/**
 * The map of Yemen at the end of chapter 1 (content/story.ts, MAP_PLACES): Hudhud's home in
 * Sana'a with Rasha's bowl, and the places he can go, one per thread: Sana'a itself, where the
 * old postman lets him carry letters (reading), and Mocha on the Red Sea, where the coffee
 * trader needs him (counting). Dotted flight paths lead from Sana'a to the places further off.
 *
 * Socotra is on the map too, marked as coming soon (a place for a subject still to come).
 *
 * The same component draws the picture (the scene) and, with `only`, just the places as
 * buttons over it, at exactly the same spots: both fit the 360 × 260 map into their box alike.
 * On the home screen it is the subject choice: each place shows its book's progress, the
 * subject the play button continues in is ringed in gold.
 */

import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import { Ellipse, G, Path, Polygon, Rect, Svg } from "react-native-svg";

import { useLine } from "@/components/Gloss";
import { Picture } from "@/components/pictures/Picture";
import { HOME_PLACE, MAP_PLACES, type MapPlace, type PlaceId } from "@/content/story";
import * as haptics from "@/lib/haptics";
import { touchTarget, yemen } from "@/theme/tokens";
import { BowlArt } from "./Bowl";
import { Hudhud } from "./Hudhud";
import { StickerArt } from "./StickerArt";

const MAP_W = 360;
const MAP_H = 260;

/** Longitude and latitude to the map's 360 × 260 drawing (a plain equirectangular sketch). */
export function project(lon: number, lat: number) {
  return { x: (lon - 42.3) * 31, y: (19.3 - lat) * 36 };
}

/** Yemen's outline, clockwise from Midi on the Red Sea (lon, lat), simplified. */
const OUTLINE: [number, number][] = [
  [42.8, 16.4],
  [43.3, 16.9],
  [44.5, 17.4],
  [46.4, 17.3],
  [47.0, 17.4],
  [52.0, 19.0],
  [53.1, 16.65],
  [52.2, 15.6],
  [51.2, 15.2],
  [49.12, 14.54],
  [48.0, 14.0],
  [46.7, 13.4],
  [45.03, 12.8],
  [43.45, 12.65],
  [43.25, 13.32],
  [42.95, 14.8],
  [42.7, 15.7],
];

const points = (ll: [number, number][]) =>
  ll
    .map(([lon, lat]) => {
      const { x, y } = project(lon, lat);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

/** The highlands, as small peaks: the mountains around Sana'a, Haraz, Ibb, Hadramawt. */
const PEAKS: [number, number][] = [
  [43.7, 15.9],
  [44.6, 15.0],
  [43.9, 14.4],
  [44.5, 14.1],
  [45.4, 14.6],
  [48.6, 15.4],
  [49.6, 15.6],
];

/** Where the drawing sits in a box of this size (fitted whole, centred). */
function fit(width: number, height: number) {
  const s = Math.min(width / MAP_W, height / MAP_H);
  return { s, ox: (width - MAP_W * s) / 2, oy: (height - MAP_H * s) / 2 };
}

export type MapPin = {
  place: PlaceId;
  testID?: string;
  accessibilityLabel?: string;
  onPress?: () => void;
  /** Under the place's name instead of who waits there: the book's title on the home screen. */
  caption?: React.ReactNode;
  /** How much of the place's book is done (0 to 1), as a bar under its label. */
  share?: number;
  /** The subject the play button continues in. */
  selected?: boolean;
};

const PIN = 58;
/** A place still to come is drawn smaller. */
const PIN_SOON = 46;
/** A label's height: the name and one line under it; the progress bar adds its own. */
const LABEL_H = 44;
const TRACK_H = 14;

/**
 * Where each place's label goes, so none covers another: Sana'a's beside it (towards the open
 * land), Mocha's beside it (it sits on the coast at the map's edge), Socotra's beside it.
 */
const LABEL_AT: Record<PlaceId, "above" | "below" | "beside"> = {
  arabic: "beside",
  math: "beside",
  socotra: "beside",
};

export function YemenMap({
  pins,
  only = false,
  bird = true,
}: {
  pins: MapPin[];
  only?: boolean;
  /** Hudhud on his roof in Sana'a, with her note in his bag. */
  bird?: boolean;
}) {
  const [box, setBox] = useState({ width: 0, height: 0 });
  const line = useLine();
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== box.width || height !== box.height) setBox({ width, height });
  };
  // Until the box is measured (and in tests), a phone-sized stage.
  const width = box.width || 358;
  const height = box.height || 300;
  const { s, ox, oy } = fit(width, height);
  const at = (place: { lon: number; lat: number }) => {
    const { x, y } = project(place.lon, place.lat);
    return { left: ox + x * s, top: oy + y * s };
  };
  const home = at(HOME_PLACE);
  // A place in Sana'a itself (the postman's alley) takes the home's spot: no separate marker,
  // no way to fly there.
  const atHome = (place: PlaceId) =>
    MAP_PLACES[place].lon === HOME_PLACE.lon && MAP_PLACES[place].lat === HOME_PLACE.lat;
  const homeIsPlace = pins.some(({ place }) => atHome(place));

  return (
    <View style={[styles.box, only && styles.clear]} onLayout={onLayout} pointerEvents="box-none">
      {only ? null : (
        <>
          <Svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${MAP_W} ${MAP_H}`}
            style={StyleSheet.absoluteFill}
          >
            {/* The seas: the Red Sea in the west, the Gulf of Aden and the Arabian Sea in the south. */}
            <Rect x={-40} y={-40} width={MAP_W + 80} height={MAP_H + 80} fill="#9CC3E0" />
            <Path
              d="M60 250 q8 -5 16 0 t16 0 M160 236 q8 -5 16 0 t16 0 M250 200 q8 -5 16 0 t16 0 M2 60 q6 -4 12 0"
              stroke="#FFFFFF"
              strokeWidth={2}
              fill="none"
              opacity={0.7}
            />
            {/* The neighbours' land, and the horn of Africa across the strait. */}
            <Path
              d="M10 -40 H400 V102 L335 95 L301 11 L146 68 L127 72 L68 68 L31 86 L15.5 104 L6 96 Z"
              fill="#EADCC2"
            />
            <Path d="M-40 222 L4 236 L24 256 L40 300 L-40 300 Z" fill="#EADCC2" />
            <Polygon points={points(OUTLINE)} fill="#F2D3A2" stroke="#B5522E" strokeWidth={2.2} />
            {PEAKS.map(([lon, lat]) => {
              const { x, y } = project(lon, lat);
              return (
                <G key={`${lon}`}>
                  <Path
                    d={`M${x - 9} ${y + 6} L${x} ${y - 7} L${x + 9} ${y + 6} Z`}
                    fill="#C9A16B"
                  />
                  <Path
                    d={`M${x - 3} ${y - 2.5} L${x} ${y - 7} L${x + 3} ${y - 2.5} Z`}
                    fill="#FFFFFF"
                    opacity={0.7}
                  />
                </G>
              );
            })}
            {/* Socotra, far out in the sea. */}
            <Ellipse
              cx={346}
              cy={249}
              rx={13}
              ry={5}
              fill="#F2D3A2"
              stroke="#B5522E"
              strokeWidth={1.5}
            />
            {/* The ways Hudhud can fly, from his roof in Sana'a. */}
            {pins.map(({ place }) => {
              if (atHome(place)) return null;
              const from = project(HOME_PLACE.lon, HOME_PLACE.lat);
              const to = project(MAP_PLACES[place].lon, MAP_PLACES[place].lat);
              const mx = (from.x + to.x) / 2;
              const my = Math.min(from.y, to.y) - 30;
              const soon = MAP_PLACES[place].soon;
              return (
                <Path
                  key={place}
                  d={`M${from.x} ${from.y} Q${mx} ${my} ${to.x} ${to.y}`}
                  stroke={soon ? "#8A8378" : "#7A3418"}
                  strokeWidth={soon ? 1.6 : 2.4}
                  strokeDasharray={soon ? "2 6" : "5 6"}
                  strokeLinecap="round"
                  fill="none"
                  opacity={soon ? 0.6 : 1}
                />
              );
            })}
          </Svg>
          {/* Home: Rasha's bowl on the roof in Sana'a, and Hudhud, her note under his wing. */}
          {/* When a place is in Sana'a itself, its badge marks home; else Rasha's bowl does. */}
          {homeIsPlace ? null : (
            <View style={[styles.home, { left: home.left - 28, top: home.top - 16 }]}>
              <BowlArt width={40} level={0} />
              <Text style={styles.homeName}>{line(HOME_PLACE.name)}</Text>
            </View>
          )}
          {bird ? (
            <View style={[styles.bird, { left: home.left - 40, top: home.top - 92 }]}>
              <Hudhud size={58} />
            </View>
          ) : null}
        </>
      )}
      {pins.map((pin) => (
        <Place
          key={pin.place}
          id={pin.place}
          pin={pin}
          place={MAP_PLACES[pin.place]}
          spot={at(MAP_PLACES[pin.place])}
          width={width}
          height={height}
          only={only}
        />
      ))}
    </View>
  );
}

/** A place to fly to: its picture in a round badge, its name and who is waiting there. */
function Place({
  pin,
  id,
  place,
  spot,
  width,
  height,
  only,
}: {
  pin: MapPin;
  id: PlaceId;
  place: MapPlace;
  spot: { left: number; top: number };
  width: number;
  height: number;
  only: boolean;
}) {
  const line = useLine();
  const soon = place.soon === true;
  const pinSize = soon ? PIN_SOON : PIN;
  const LABEL = soon ? 92 : 118;
  const labelHeight = pin.share !== undefined ? LABEL_H + TRACK_H : LABEL_H;
  // The label goes where LABEL_AT says (beside: towards the middle of the map); the whole
  // place stays inside the map at the edges.
  const at = LABEL_AT[id];
  const beside = at === "beside";
  const leftward = beside && spot.left > width / 2;
  const span = beside ? pinSize + 4 + LABEL : LABEL;
  const want = beside
    ? leftward
      ? spot.left + pinSize / 2 - span
      : spot.left - pinSize / 2
    : spot.left - LABEL / 2;
  const left = Math.max(4, Math.min(width - span - 4, want));
  const top =
    at === "above" ? spot.top + pinSize / 2 - pinSize - 2 - labelHeight : spot.top - pinSize / 2;
  const clampedTop = Math.max(4, Math.min(height - pinSize - 4, top));
  const content = (
    <>
      <View
        style={[
          styles.badge,
          { width: pinSize, height: pinSize, borderRadius: pinSize / 2 },
          { borderColor: pin.selected ? yemen.gold : place.color },
          pin.selected && styles.badgeOn,
          soon && styles.badgeSoon,
        ]}
      >
        {place.sticker ? (
          <StickerArt id={place.sticker} size={soon ? 32 : 40} />
        ) : (
          <Picture emoji={place.picture} size={36} />
        )}
      </View>
      <View
        style={[
          styles.label,
          { backgroundColor: place.color, height: labelHeight },
          pin.selected && styles.labelOn,
        ]}
      >
        <Text style={styles.name}>{line(place.name)}</Text>
        {pin.caption ?? <Text style={styles.what}>{line(place.what)}</Text>}
        {pin.share !== undefined ? (
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.round(pin.share * 100)}%` }]} />
          </View>
        ) : null}
      </View>
    </>
  );
  const style = [
    styles.place,
    beside && (leftward ? styles.besideLeft : styles.beside),
    at === "above" && styles.above,
    { left, top: clampedTop, width: span },
  ];
  if (!pin.onPress)
    return (
      <View
        style={[style, only && styles.hidden]}
        accessible={soon}
        accessibilityLabel={soon ? `${line(place.name)}: ${line(place.what)}` : undefined}
      >
        {content}
      </View>
    );
  return (
    <Pressable
      testID={pin.testID}
      accessibilityRole="button"
      accessibilityLabel={pin.accessibilityLabel}
      accessibilityState={{ selected: pin.selected === true, disabled: soon }}
      onPress={() => {
        haptics.tap();
        pin.onPress?.();
      }}
      style={({ pressed }) => [style, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, borderRadius: 28, overflow: "hidden", backgroundColor: "#9CC3E0" },
  clear: { backgroundColor: "transparent", overflow: "visible" },
  home: { position: "absolute", alignItems: "center" },
  homeName: {
    fontSize: 12,
    fontWeight: "900",
    color: yemen.ink,
    backgroundColor: "#FFFFFFCC",
    paddingHorizontal: 6,
    borderRadius: 8,
    overflow: "hidden",
  },
  bird: { position: "absolute" },
  place: { position: "absolute", alignItems: "center", minHeight: touchTarget, gap: 2 },
  hidden: { opacity: 0 },
  beside: { flexDirection: "row", gap: 4 },
  above: { flexDirection: "column-reverse" },
  besideLeft: { flexDirection: "row-reverse", gap: 4 },
  badgeOn: { borderWidth: 5, transform: [{ scale: 1.08 }] },
  badgeSoon: { borderStyle: "dashed", opacity: 0.85 },
  labelOn: { borderWidth: 3, borderColor: yemen.gold },
  track: {
    width: 76,
    height: 7,
    borderRadius: 4,
    marginTop: 3,
    marginBottom: 2,
    backgroundColor: "rgba(255,255,255,0.35)",
    overflow: "hidden",
    flexDirection: "row-reverse",
  },
  fill: { height: 7, borderRadius: 4, backgroundColor: "#F4C14B", minWidth: 7 },
  badge: {
    width: PIN,
    height: PIN,
    borderRadius: PIN / 2,
    borderWidth: 4,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 3px 0 rgba(94, 50, 32, 0.35)",
  },
  label: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignItems: "center",
    justifyContent: "center",
    maxWidth: "100%",
  },
  name: { fontSize: 14, fontWeight: "900", color: "#FFFFFF", lineHeight: 20 },
  what: { fontSize: 11, fontWeight: "700", color: "#FFFFFF", lineHeight: 16 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.95 }] },
});
