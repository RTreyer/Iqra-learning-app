import React, { useId } from "react";
import { Picture } from "@/components/pictures/Picture";
import { StyleSheet, View } from "react-native";
import { Circle, ClipPath, Defs, G, Line, Polygon, Rect, Svg } from "react-native-svg";
import { MATH_COLORS, groupLabel, picLabel } from "@/content/math/picLabel";
import type { MathPic as Pic, ShapeId } from "@/content/types";
import { colors } from "@/theme/tokens";

const SIZES = { small: 36, normal: 52, big: 72 } as const;

function ShapePath({ shape, fill, stroke }: { shape: ShapeId; fill: string; stroke: string }) {
  const common = { fill, stroke, strokeWidth: 4 };
  switch (shape) {
    case "circle":
      return <Circle cx={50} cy={50} r={44} {...common} />;
    case "square":
      return <Rect x={8} y={8} width={84} height={84} {...common} />;
    case "triangle":
      return <Polygon points="50,6 94,92 6,92" {...common} />;
    case "rectangle":
      return <Rect x={4} y={26} width={92} height={48} {...common} />;
  }
}

/** One math picture: an emoji, or an SVG shape with colour, size, shading and crossing out. */
export function MathPic({
  pic,
  decorative,
  size: fixedSize,
}: {
  pic: Pic;
  decorative?: boolean;
  /** Overrides the size from the picture, for compact rows. */
  size?: number;
}) {
  const clipId = "clip" + useId().replace(/[^A-Za-z0-9_-]/g, "");
  const size = fixedSize ?? SIZES[pic.size ?? "normal"];
  const label = picLabel(pic);
  return (
    <View
      {...(decorative
        ? { accessible: false, importantForAccessibility: "no-hide-descendants" as const }
        : { accessible: true, accessibilityRole: "image" as const, accessibilityLabel: label })}
      style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}
    >
      {"emoji" in pic ? (
        <Picture emoji={pic.emoji} size={size} />
      ) : (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          {pic.shaded ? (
            <>
              <Defs>
                <ClipPath id={clipId}>
                  <ShapePath shape={pic.shape} fill="#000" stroke="none" />
                </ClipPath>
              </Defs>
              <ShapePath shape={pic.shape} fill={colors.white} stroke="none" />
              <G clipPath={`url(#${clipId})`}>
                {/* Half: the right half; quarter: the top right quarter (the book's RTL reading start). */}
                <Rect
                  x={50}
                  y={0}
                  width={50}
                  height={pic.shaded === "half" ? 100 : 50}
                  fill={MATH_COLORS[pic.color]}
                />
              </G>
              <ShapePath shape={pic.shape} fill="none" stroke={colors.text} />
            </>
          ) : (
            <ShapePath shape={pic.shape} fill={MATH_COLORS[pic.color]} stroke={colors.text} />
          )}
        </Svg>
      )}
      {pic.crossed ? (
        <Svg style={StyleSheet.absoluteFill} viewBox="0 0 100 100">
          <Line
            x1={10}
            y1={10}
            x2={90}
            y2={90}
            stroke={colors.danger}
            strokeWidth={10}
            strokeLinecap="round"
          />
        </Svg>
      ) : null}
    </View>
  );
}

/** From this many pictures a group is drawn small, five to a line, like a ten frame (6 reads 5 + 1). */
const TEN_FRAME_FROM = 6;
const TEN_FRAME_PER_LINE = 5;
const GROUP_GAP = 6;

/** Several pictures side by side, wrapping, read right to left; 9 reads as 5 + 4, 10 as 5 + 5. */
export function PicGroup({
  pics,
  decorative,
  size,
}: {
  pics: Pic[];
  decorative?: boolean;
  size?: number;
}) {
  if (pics.length === 0) return null;
  const tenFrame = pics.length >= TEN_FRAME_FROM;
  const picSize = tenFrame ? (size ?? SIZES.small) : size;
  const frame =
    tenFrame && picSize !== undefined
      ? { maxWidth: TEN_FRAME_PER_LINE * picSize + (TEN_FRAME_PER_LINE - 1) * GROUP_GAP }
      : null;
  return (
    <View
      {...(decorative
        ? { accessible: false, importantForAccessibility: "no-hide-descendants" as const }
        : { accessible: true, accessibilityLabel: groupLabel(pics) })}
      testID="pic-group"
      style={[styles.group, frame]}
    >
      {pics.map((pic, i) => (
        <MathPic key={i} pic={pic} decorative={decorative} size={picSize} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: GROUP_GAP,
    maxWidth: 260,
  },
});
