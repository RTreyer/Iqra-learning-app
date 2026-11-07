import React, { useCallback } from "react";
import { Picture } from "@/components/pictures/Picture";
import { View } from "react-native";
import { NumberQuiz, mathStyles } from "./math/NumberQuiz";
import { COUNT_PROMPT } from "./math/prompts";
import { withAttemptReset } from "./shared/withAttemptReset";
import type { ActivityProps } from "./types";

const PROMPT = { shown: COUNT_PROMPT, spoken: COUNT_PROMPT };

function Counting(props: ActivityProps<"counting">) {
  const { rounds } = props.lesson;
  const roundOf = useCallback(
    (i: number) => ({ options: rounds[i].options, answer: rounds[i].count }),
    [rounds],
  );
  const promptOf = useCallback(() => PROMPT, []);
  const renderVisual = useCallback(
    (i: number) => (
      <View style={mathStyles.row} testID="counting-objects">
        {Array.from({ length: rounds[i].count }, (_, k) => (
          <Picture key={k} emoji={rounds[i].emoji} size={mathStyles.countEmoji.fontSize} />
        ))}
      </View>
    ),
    [rounds],
  );
  return (
    <NumberQuiz {...props} roundOf={roundOf} promptOf={promptOf} renderVisual={renderVisual} />
  );
}

export const CountingActivity = withAttemptReset(Counting, "CountingActivity");
