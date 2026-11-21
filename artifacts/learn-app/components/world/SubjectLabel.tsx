/**
 * Which subject the child is in, said plainly for the parents: the subject's name and a picture
 * of it that needs no reading (letters for Arabic, a sum for maths), in the subject's colour,
 * on every screen (as Duolingo keeps the course in one place). Hudhud also says the subject
 * when a lesson starts. Parents in the user test could not tell when their child was in Arabic
 * and when in maths; many mothers cannot read, hence the picture.
 */

import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { UiText } from "@/components/UiText";
import { books, type Book } from "@/content";
import { useLanguage } from "@/context/LanguageContext";
import * as haptics from "@/lib/haptics";
import { readableFill, touchTarget, yemen } from "@/theme/tokens";

/** The subject's name, as parents read it. */
export const SUBJECT_NAME: Record<string, string> = { arabic: "اللغة العربية", math: "الرياضيات" };
/** The subject's name as Hudhud says it (fully vocalised for the voice). */
export const SUBJECT_SPOKEN: Record<string, string> = {
  arabic: "اللُّغَةُ الْعَرَبِيَّةُ",
  math: "الرِّيَاضِيَّاتُ",
};

export const subjectName = (book: Book) => SUBJECT_NAME[book.subject] ?? book.title;

/** The first letter or number the child meets in the subject (the mark on the map). */
export function subjectMark(book: Book, digits: (v: string) => string): string {
  return book.subject === "math" ? digits("1") : "أ";
}

/** A picture of the subject that needs no reading: the first letters, or a sum. */
export function subjectPicture(book: Book, digits: (v: string) => string): string {
  return book.subject === "math" ? digits("1 + 2") : "أ ب ت";
}

export function SubjectLabel({
  book,
  size = "small",
  testID,
  onPress,
}: {
  book: Book;
  size?: "small" | "large";
  testID?: string;
  /** Without it the label only shows (and announces) the subject. */
  onPress?: () => void;
}) {
  const { t, digits, language } = useLanguage();
  const large = size === "large";
  const style = [
    styles.label,
    large ? styles.labelLarge : styles.labelSmall,
    { backgroundColor: readableFill(book.color) },
    { flexDirection: language === "en" ? "row" : "row-reverse" } as const,
  ];
  const content = (
    <>
      <View style={[styles.picture, large && styles.pictureLarge]}>
        <Text
          style={[
            styles.pictureText,
            large && styles.pictureTextLarge,
            { color: readableFill(book.color) },
          ]}
        >
          {subjectPicture(book, digits)}
        </Text>
      </View>
      <UiText style={[styles.name, large && styles.nameLarge]}>{subjectName(book)}</UiText>
    </>
  );
  const label = `${t("المادة")}: ${t(subjectName(book))}`;
  if (!onPress)
    return (
      <View testID={testID} accessible accessibilityLabel={label} style={style}>
        {content}
      </View>
    );
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      style={({ pressed }) => [style, pressed && styles.pressed]}
    >
      {content}
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
  const { t } = useLanguage();
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
                    chosen && styles.optionChosen,
                    pressed && styles.pressed,
                  ]}
                >
                  <SubjectLabel book={book} size="large" />
                </Pressable>
              );
            })}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  label: { alignItems: "center", alignSelf: "center", borderRadius: 999 },
  labelSmall: { minHeight: 32, gap: 8, paddingStart: 4, paddingEnd: 12, paddingVertical: 3 },
  labelLarge: {
    minHeight: touchTarget,
    gap: 10,
    paddingStart: 6,
    paddingEnd: 16,
    paddingVertical: 5,
  },
  picture: {
    minWidth: 26,
    height: 26,
    paddingHorizontal: 8,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  pictureLarge: { height: 36, borderRadius: 18, paddingHorizontal: 10 },
  pictureText: { fontSize: 14, fontWeight: "900", lineHeight: 20 },
  pictureTextLarge: { fontSize: 18, lineHeight: 26 },
  name: { color: "#FFFFFF", fontSize: 14, fontWeight: "800", lineHeight: 20 },
  nameLarge: { fontSize: 18, lineHeight: 26 },
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
    justifyContent: "center",
    minHeight: touchTarget + 16,
    padding: 8,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: yemen.sandShadow,
  },
  optionChosen: { borderColor: yemen.gold },
});
