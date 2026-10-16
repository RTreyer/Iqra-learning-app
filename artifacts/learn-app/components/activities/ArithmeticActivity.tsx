import React, { useCallback } from "react";
import { Text, View } from "react-native";
import type { ArithmeticRound } from "@/content/types";
import { toArabicDigits } from "@/lib/arabicNumbers";
import { NumberQuiz, mathStyles } from "./math/NumberQuiz";
import { withAttemptReset } from "./shared/withAttemptReset";
import type { ActivityProps } from "./types";

const answerOf = ({ a, b, op }: ArithmeticRound) => (op === "+" ? a + b : a - b);

function DotGroup({ count, color }: { count: number; color: string }) {
  return (
    <View style={mathStyles.dotGroup}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={[mathStyles.dot, { backgroundColor: color }]} />
      ))}
    </View>
  );
}

function Arithmetic(props: ActivityProps<"arithmetic">) {
  const { rounds } = props.lesson;
  const roundOf = useCallback((i: number) => ({ options: rounds[i].options, answer: answerOf(rounds[i]) }), [rounds]);
  // Digits are spoken as written; reading numbers as Arabic words is out of scope.
  const promptOf = useCallback(
    (i: number) => `${toArabicDigits(rounds[i].a)} ${rounds[i].op} ${toArabicDigits(rounds[i].b)} = ؟`,
    [rounds],
  );
  const renderVisual = useCallback(
    (i: number) => (
      <View style={mathStyles.row} testID="arithmetic-visual">
        <DotGroup count={rounds[i].a} color="#059669" />
        <Text style={mathStyles.operator}>{rounds[i].op}</Text>
        <DotGroup count={rounds[i].b} color="#F59E0B" />
        <Text style={mathStyles.operator}>=</Text>
        <Text style={mathStyles.questionMark}>؟</Text>
      </View>
    ),
    [rounds],
  );
  return <NumberQuiz {...props} roundOf={roundOf} promptOf={promptOf} renderVisual={renderVisual} />;
}

export const ArithmeticActivity = withAttemptReset(Arithmetic, "ArithmeticActivity");
