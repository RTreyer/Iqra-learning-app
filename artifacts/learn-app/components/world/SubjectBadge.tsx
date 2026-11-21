/**
 * Which subject the child is in, the same mark on every screen (as Duolingo keeps the course
 * flag in one place): أ for Arabic, ١ for maths, in the subject's colour. On the home screen it
 * also opens the subject picker. Parents in the user test could not tell when their child was
 * in Arabic and when in maths.
 */

import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { UiText } from "@/components/UiText";
import { books, type Book } from "@/content";
import { useLanguage } from "@/context/LanguageContext";
import * as haptics from "@/lib/haptics";
import { readableFill, touchTarget, yemen } from "@/theme/tokens";

/** The subject's name, for parents and screen readers (the child goes by the mark). */
export const SUBJECT_NAME: Record<string, string> = { arabic: "اللغة العربية", math: "الرياضيات" };

export const subjectName = (book: Book) => SUBJECT_NAME[book.subject] ?? book.title;

/** The first letter or number the child meets in the subject. */
export function subjectMark(book: Book, digits: (v: string) => string): string {
  return book.subject === "math" ? digits("1") : "أ";
}

export function SubjectBadge({
  book,
  size = 46,
  testID,
  onPress,
}: {
  book: Book;
  size?: number;
  testID?: string;
  /** Without it the badge only shows (and announces) the subject. */
  onPress?: () => void;
}) {
  const { t, digits } = useLanguage();
  const style = [
    styles.badge,
    {
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: size >= 40 ? 4 : 3,
      backgroundColor: readableFill(book.color),
    },
  ];
  const mark = (
    <Text style={[styles.mark, { fontSize: size * 0.46, lineHeight: size * 0.64 }]}>
      {subjectMark(book, digits)}
    </Text>
  );
  const label = `${t("المادة")}: ${t(subjectName(book))}`;
  if (!onPress)
    return (
      <View testID={testID} accessible accessibilityLabel={label} style={style}>
        {mark}
      </View>
    );
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      style={({ pressed }) => [style, pressed && styles.pressed]}
    >
      {mark}
    </Pressable>
  );
}

/** The two subjects, large, to switch between them; the current one ringed in gold. */
export function SubjectPicker({
  visible,
  current,
  onPick,
  onClose,
}: {
  visible: boolean;
  current: Book | undefined;
  onPick: (book: Book) => void;
  onClose: () => void;
}) {
  const { t, language } = useLanguage();
  const row = { flexDirection: language === "en" ? "row" : "row-reverse" } as const;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        testID="subject-picker-backdrop"
        accessibilityRole="button"
        accessibilityLabel={t("إغلاق")}
        onPress={onClose}
        style={styles.backdrop}
      >
        <View testID="subject-picker" style={styles.sheet}>
          <UiText style={styles.title}>اختر المادة</UiText>
          {books
            .filter((book) => book.available)
            .map((book) => {
              const chosen = book.id === current?.id;
              return (
                <Pressable
                  key={book.id}
                  testID={`pick-${book.id}`}
                  accessibilityRole="button"
                  accessibilityLabel={t(subjectName(book))}
                  accessibilityState={{ selected: chosen }}
                  onPress={() => {
                    haptics.tap();
                    onPick(book);
                  }}
                  style={({ pressed }) => [
                    styles.option,
                    row,
                    chosen && styles.optionChosen,
                    pressed && styles.pressed,
                  ]}
                >
                  <SubjectBadge book={book} size={52} />
                  <UiText style={styles.optionName}>{subjectName(book)}</UiText>
                </Pressable>
              );
            })}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  badge: { borderColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  mark: { color: "#FFFFFF", fontWeight: "900" },
  pressed: { opacity: 0.88, transform: [{ scale: 0.96 }] },
  backdrop: {
    flex: 1,
    minHeight: touchTarget,
    backgroundColor: "rgba(43, 29, 20, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  sheet: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    gap: 12,
  },
  title: { fontSize: 18, fontWeight: "800", color: yemen.ink, textAlign: "center" },
  option: {
    alignItems: "center",
    gap: 14,
    minHeight: touchTarget + 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: yemen.sandShadow,
  },
  optionChosen: { borderColor: yemen.gold },
  optionName: { fontSize: 18, fontWeight: "800", color: yemen.ink },
});
