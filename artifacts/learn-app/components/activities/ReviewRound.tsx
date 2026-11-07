import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLine } from "@/components/Gloss";
import { Icon } from "@/components/world/Icon";
import { Picture } from "@/components/pictures/Picture";
import { Pressable, StyleSheet, Text, View } from "react-native";
import * as haptics from "@/lib/haptics";
import { toArabicDigits } from "@/lib/arabicNumbers";
import type { ReviewItem } from "@/lib/reviewItems";
import { speak } from "@/lib/speech";
import { colors, touchTarget } from "@/theme/tokens";
import { mathStyles } from "./math/NumberQuiz";
import { COUNT_PROMPT, answerOf, arithmeticPrompt } from "./math/prompts";
import { ChoiceCard, type ChoiceVariant } from "./shared/ChoiceCard";
import { ListenButton } from "./shared/ListenButton";
import { PRAISE } from "./shared/strings";
import { act } from "./shared/styles";
import { ADVANCE_MS, PROMPT_DELAY_MS, TRY_AGAIN, choiceState, useBounce } from "./shared/useQuiz";
import { useLatest } from "./shared/useLatest";
import { useShuffled } from "./shared/useShuffled";
import { withAttemptReset } from "./shared/withAttemptReset";
import { useGuide } from "@/components/world/LessonGuide";
import { TargetCard } from "./shared/TargetCard";

type Props = {
  item: ReviewItem;
  /** Changes for every round; the round remounts and resets on change. */
  attemptKey: string;
  /** Called once per round, right at the first tap, with its result. */
  onFirstTap: (correct: boolean) => void;
  /** Called once per round, the advance delay after the first tap. */
  onAdvance: () => void;
  color?: string;
};

type Option = { word: string; emoji?: string };

type RoundSpec = {
  options: Option[];
  correctIndex: number;
  variant: ChoiceVariant;
  /** Spoken when the round opens. */
  prompt: string;
};

function numberRound(options: number[], answer: number, prompt: string): RoundSpec {
  return {
    options: options.map((n) => ({ word: toArabicDigits(n) })),
    correctIndex: options.indexOf(answer),
    variant: "number",
    prompt,
  };
}

/** Choices, scoring and speech of one review item, per kind. */
function roundOf(item: ReviewItem): RoundSpec {
  switch (item.kind) {
    case "letter":
      return {
        options: item.letters.map((word) => ({ word })),
        correctIndex: item.correctIndex,
        variant: "letter",
        prompt: item.targetLetter,
      };
    case "word":
      return {
        options: item.choices.map((word) => ({ word })),
        correctIndex: item.correctIndex,
        variant: "word",
        prompt: item.word,
      };
    case "question":
      return {
        options: item.choices,
        correctIndex: item.correctIndex,
        variant: "picture",
        prompt: item.word,
      };
    case "count":
      return numberRound(item.options, item.count, COUNT_PROMPT);
    case "calc":
      return numberRound(
        item.options,
        answerOf(item),
        arithmeticPrompt(item.a, item.op, item.b).spoken,
      );
  }
}

function Prompt({ item, color, spoken }: { item: ReviewItem; color: string; spoken: string }) {
  const line = useLine();
  switch (item.kind) {
    case "letter":
      return <TargetCard text={item.targetLetter} color={color} testID="review-target" />;
    case "word":
      return <ListenButton text={item.word} color={color} />;
    case "question":
      return <ListenButton text={item.word} color={color} showText />;
    case "count":
    case "calc": {
      const shown =
        item.kind === "count" ? COUNT_PROMPT : arithmeticPrompt(item.a, item.op, item.b).shown;
      return (
        <View style={styles.numberPrompt}>
          {item.kind === "count" ? (
            <View style={mathStyles.row} testID="review-count-objects">
              {Array.from({ length: item.count }, (_, k) => (
                <Picture key={k} emoji={item.emoji} size={mathStyles.countEmoji.fontSize} />
              ))}
            </View>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`🔊 ${line(shown)}`}
            style={styles.question}
            onPress={() => speak(spoken)}
          >
            <Icon name="speaker" size={24} color="#065F46" />
            <Text style={styles.questionText}>{line(shown)}</Text>
          </Pressable>
        </View>
      );
    }
  }
}

/**
 * One review item with the lesson quiz rules: the first tap is the one recorded; a wrong tap
 * greys its option out and the child tries again until the answer is found.
 */
function Round({ item, attemptKey, onFirstTap, onAdvance, color = colors.success }: Props) {
  const guide = useGuide();
  const round = useMemo(() => roundOf(item), [item]);
  const shuffled = useShuffled(round.options, round.correctIndex, attemptKey, item.id);
  const { values, bounce } = useBounce(round.options.length);
  const [picked, setPicked] = useState<number | null>(null);
  const [wrong, setWrong] = useState<readonly number[]>([]);
  const locked = useRef(false);
  const tried = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useLatest({ onFirstTap, onAdvance });

  useEffect(() => {
    const t = setTimeout(() => speak(round.prompt), PROMPT_DELAY_MS);
    return () => clearTimeout(t);
  }, [round.prompt]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const handlePick = useCallback(
    (idx: number) => {
      if (locked.current || wrong.includes(idx)) return;
      const correct = idx === shuffled.correctIndex;
      // Report the first tap now: the child may leave before the advance delay ends.
      if (!tried.current) {
        tried.current = true;
        latest.current.onFirstTap(correct);
      }
      if (!correct) {
        haptics.error();
        guide.react("wrong");
        setWrong([...wrong, idx]);
        speak(`${TRY_AGAIN}، ${round.prompt}`);
        return;
      }
      locked.current = true;
      setPicked(idx);
      haptics.success();
      guide.react("right");
      speak(PRAISE);
      bounce(idx, 1.15);
      timer.current = setTimeout(() => latest.current.onAdvance(), ADVANCE_MS);
    },
    [shuffled.correctIndex, bounce, round.prompt, latest, wrong, guide],
  );

  const rowStyle =
    round.variant === "word"
      ? act.wordChoicesCol
      : round.variant === "letter"
        ? act.letterChoicesRow
        : act.choicesRow;

  return (
    <View style={act.container} testID="review-round">
      <Prompt item={item} color={color} spoken={round.prompt} />
      <View style={rowStyle}>
        {shuffled.items.map((option, idx) => (
          <ChoiceCard
            key={idx}
            index={idx}
            word={option.word}
            emoji={option.emoji}
            variant={round.variant}
            state={choiceState(idx, picked, shuffled.correctIndex, wrong)}
            selected={picked === idx}
            locked={picked !== null}
            onPick={handlePick}
            scale={values[idx]}
          />
        ))}
      </View>
    </View>
  );
}

export const ReviewRound = withAttemptReset(Round, "ReviewRound");

const styles = StyleSheet.create({
  numberPrompt: { alignItems: "center", gap: 16, maxWidth: 300 },
  question: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(209,250,229,0.9)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: touchTarget,
  },
  questionText: { fontSize: 20, fontWeight: "600", color: "#065F46", textAlign: "center" },
});
