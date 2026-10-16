import React, { useCallback, useEffect, useMemo } from "react";
import { Text, View } from "react-native";
import { speak } from "@/lib/speech";
import { ChoiceCard } from "./shared/ChoiceCard";
import { DoneButton } from "./shared/DoneButton";
import { ListenButton } from "./shared/ListenButton";
import { ProgressDots } from "./shared/ProgressDots";
import { act } from "./shared/styles";
import { PROMPT_DELAY_MS, choiceState, useBounce, useQuiz } from "./shared/useQuiz";
import { useShuffled } from "./shared/useShuffled";
import { withAttemptReset } from "./shared/withAttemptReset";
import type { ActivityProps } from "./types";

function WordRead({ lesson, color, attemptKey, onComplete, onRoundResult }: ActivityProps<"word_read">) {
  const { rounds } = lesson;
  const quiz = useQuiz({ lesson, total: rounds.length, onComplete, onRoundResult });
  const round = rounds[quiz.roundIndex];
  const options = useShuffled(round.choices, round.correctIndex, attemptKey, quiz.roundIndex);
  const maxOptions = useMemo(() => Math.max(...rounds.map((r) => r.choices.length)), [rounds]);
  const { values, bounce } = useBounce(maxOptions);

  useEffect(() => {
    const t = setTimeout(() => speak(round.word), PROMPT_DELAY_MS);
    return () => clearTimeout(t);
  }, [round.word, quiz.roundIndex]);

  const handlePick = useCallback(
    (idx: number) => {
      const correct = idx === options.correctIndex;
      if (!quiz.pick(idx, correct)) return;
      if (correct) {
        speak("أحسنت!");
        bounce(idx, 1.1);
      } else {
        speak(round.choices[round.correctIndex]);
      }
    },
    [options.correctIndex, quiz, bounce, round],
  );

  const nextLabel = quiz.isLast ? `أَحْسَنْت! ${quiz.correctCount}/${rounds.length} 🌟 تابع` : "التالي ←";

  return (
    <View style={act.container}>
      <ProgressDots count={rounds.length} current={quiz.roundIndex} color={color} />
      <Text style={act.instruction}>
        سؤال {quiz.roundIndex + 1} من {rounds.length} — اضغط للاستماع ثم اختر
      </Text>
      <ListenButton text={round.word} color={color} />
      <View style={act.wordChoicesCol}>
        {options.items.map((choice, idx) => (
          <ChoiceCard
            key={idx}
            index={idx}
            word={choice}
            variant="word"
            state={choiceState(idx, quiz.picked, options.correctIndex)}
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

export const WordReadActivity = withAttemptReset(WordRead, "WordReadActivity");
