import React, { useCallback } from "react";
import { Text, View } from "react-native";
import { NumberQuiz, mathStyles } from "./math/NumberQuiz";
import { withAttemptReset } from "./shared/withAttemptReset";
import type { ActivityProps } from "./types";

const PROMPT = { shown: "كَمْ عَدَدُهَا؟", spoken: "كَمْ عَدَدُهَا؟" };

function Counting(props: ActivityProps<"counting">) {
  const { rounds } = props.lesson;
  const roundOf = useCallback((i: number) => ({ options: rounds[i].options, answer: rounds[i].count }), [rounds]);
  const promptOf = useCallback(() => PROMPT, []);
  const renderVisual = useCallback(
    (i: number) => (
      <View style={mathStyles.row} testID="counting-objects">
        {Array.from({ length: rounds[i].count }, (_, k) => (
          <Text key={k} style={mathStyles.countEmoji}>
            {rounds[i].emoji}
          </Text>
        ))}
      </View>
    ),
    [rounds],
  );
  return <NumberQuiz {...props} roundOf={roundOf} promptOf={promptOf} renderVisual={renderVisual} />;
}

export const CountingActivity = withAttemptReset(Counting, "CountingActivity");
