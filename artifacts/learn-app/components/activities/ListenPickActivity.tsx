import React, { useCallback, useEffect, useMemo } from "react";
import { View } from "react-native";
import { UiText } from "@/components/UiText";
import { speak } from "@/lib/speech";
import { PRAISE } from "./shared/strings";
import { ChoiceCard } from "./shared/ChoiceCard";
import { DoneButton } from "./shared/DoneButton";
import { ListenButton } from "./shared/ListenButton";
import { ProgressDots } from "./shared/ProgressDots";
import { act } from "./shared/styles";
import { PROMPT_DELAY_MS, choiceState, useBounce, useQuiz } from "./shared/useQuiz";
import { useShuffled } from "./shared/useShuffled";
import { withAttemptReset } from "./shared/withAttemptReset";
import type { ActivityProps } from "./types";

function ListenPick({ lesson, color, attemptKey, onComplete, onRoundResult }: ActivityProps<"listen_pick">) {
  const { questions } = lesson;
  const quiz = useQuiz({ lesson, total: questions.length, onComplete, onRoundResult });
  const { pick } = quiz;
  const q = questions[quiz.roundIndex];
  const options = useShuffled(q.choices, q.correctIndex, attemptKey, quiz.roundIndex);
  const maxOptions = useMemo(() => Math.max(...questions.map((x) => x.choices.length)), [questions]);
  const { values, bounce } = useBounce(maxOptions);

  useEffect(() => {
    const t = setTimeout(() => speak(q.word), PROMPT_DELAY_MS);
    return () => clearTimeout(t);
  }, [q.word, quiz.roundIndex]);

  const handlePick = useCallback(
    (idx: number) => {
      const correct = idx === options.correctIndex;
      if (!pick(idx, correct)) return;
      if (correct) {
        speak(PRAISE);
        bounce(idx, 1.15);
      } else {
        speak(q.choices[q.correctIndex].word);
      }
    },
    [options.correctIndex, pick, bounce, q],
  );

  const nextLabel = quiz.isLast ? `أَحْسَنْت! ${quiz.correctCount}/${questions.length} 🌟 تابع` : "التالي ←";

  return (
    <View style={act.container}>
      <ProgressDots count={questions.length} current={quiz.roundIndex} color={color} />
      <UiText style={act.instruction}>{`سؤال ${quiz.roundIndex + 1} من ${questions.length}`}</UiText>
      <ListenButton text={q.word} color={color} showText />
      <View style={act.choicesRow}>
        {options.items.map((choice, idx) => (
          <ChoiceCard
            key={idx}
            index={idx}
            word={choice.word}
            emoji={choice.emoji}
            variant="picture"
            state={choiceState(idx, quiz.picked, options.correctIndex)}
            selected={quiz.picked === idx}
            locked={quiz.locked}
            onPick={handlePick}
            scale={values[idx]}
          />
        ))}
      </View>
      {quiz.locked ? <DoneButton testID="activity-next" label={nextLabel} color={color} onPress={quiz.next} /> : null}
    </View>
  );
}

export const ListenPickActivity = withAttemptReset(ListenPick, "ListenPickActivity");
