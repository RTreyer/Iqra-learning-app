import React from "react";
import { Line, Polyline, Svg } from "react-native-svg";
import type { CompareAnswer } from "@/content/math/answers";

/**
 * The comparison sign drawn as SVG so bidi can never mirror it. `first` sits on the right,
 * so "more" opens towards the right (the bigger side), drawn like "<".
 */
export function CompareSymbol({
  answer,
  color,
  size = 40,
}: {
  answer: CompareAnswer;
  color: string;
  size?: number;
}) {
  const stroke = {
    stroke: color,
    strokeWidth: 10,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {answer === "equal" ? (
        <>
          <Line x1={15} y1={35} x2={85} y2={35} {...stroke} />
          <Line x1={15} y1={65} x2={85} y2={65} {...stroke} />
        </>
      ) : answer === "more" ? (
        <Polyline points="85,15 15,50 85,85" {...stroke} />
      ) : (
        <Polyline points="15,15 85,50 15,85" {...stroke} />
      )}
    </Svg>
  );
}
