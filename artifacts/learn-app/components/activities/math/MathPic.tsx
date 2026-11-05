import React, { useId } from "react";
import { StyleSheet, Text, View } from "react-native";
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
export function MathPic({ pic }: { pic: Pic }) {
  const clipId = "clip" + useId().replace(/[^A-Za-z0-9_-]/g, "");
  const size = SIZES[pic.size ?? "normal"];
  const label = picLabel(pic);
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={label}
      style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}
    >
      {"emoji" in pic ? (
        <Text style={{ fontSize: size * 0.8 }}>{pic.emoji}</Text>
      ) : (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          {pic.shaded ? (
            <>
              <Defs>
                <ClipPath id={clipId}>
                  <ShapePath shape={pic.shape} fill="#000" stroke="none" />
                </ClipPath>
              </Defs>
              <ShapePath shape={pic.shape} fill={colors.white} stroke={MATH_COLORS[pic.color]} />
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
              <ShapePath shape={pic.shape} fill="none" stroke={MATH_COLORS[pic.color]} />
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

/** Several pictures side by side, wrapping, read right to left. */
export function PicGroup({ pics }: { pics: Pic[] }) {
  return (
    <View accessible accessibilityLabel={groupLabel(pics)} style={styles.group}>
      {pics.map((pic, i) => (
        <MathPic key={i} pic={pic} />
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
    gap: 6,
    maxWidth: 260,
  },
});
