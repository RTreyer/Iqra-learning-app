/**
 * Parents' corner, behind a press-and-hold gate a young child does not open by chance:
 * grade, menu language, voice and vibration, watching Hudhud's story again, progress at a
 * glance, and resetting progress.
 */

import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { BackButton } from "@/components/BackButton";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { ScreenBackground } from "@/components/ScreenBackground";
import { UiText } from "@/components/UiText";
import { Icon } from "@/components/world/Icon";
import { books, grades, unitLessonIds } from "@/content";
import { useLanguage } from "@/context/LanguageContext";
import { useProgress } from "@/context/ProgressContext";
import { useSettings, type Settings } from "@/context/SettingsContext";
import { useScreenPadding } from "@/hooks/useScreenPadding";
import { routes } from "@/lib/routes";
import { STICKERS, stickersEarned } from "@/lib/stickers";
import { readableFill, touchTarget, yemen } from "@/theme/tokens";

/** How long the gate must be held. */
const GATE_HOLD_MS = 1500;

function Gate({ onOpen }: { onOpen: () => void }) {
  const { t } = useLanguage();
  const [fill] = useState(() => new Animated.Value(0));
  const start = () =>
    Animated.timing(fill, {
      toValue: 1,
      duration: GATE_HOLD_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  const cancel = () => {
    fill.stopAnimation();
    fill.setValue(0);
  };
  return (
    <View style={styles.gate}>
      <Icon name="lock" size={56} color={yemen.lockedInk} strokeWidth={1.8} />
      <UiText style={styles.gateText}>هذا الركن للأهل. اضغط على الزر مطوّلاً.</UiText>
      <Pressable
        testID="parents-gate"
        accessibilityRole="button"
        accessibilityLabel={t("اضغط مطوّلاً")}
        delayLongPress={GATE_HOLD_MS}
        onPressIn={start}
        onPressOut={cancel}
        onLongPress={onOpen}
        style={styles.gateButton}
      >
        <Animated.View
          style={[
            styles.gateFill,
            { width: fill.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) },
          ]}
        />
        <UiText style={styles.gateLabel}>اضغط مطوّلاً</UiText>
      </Pressable>
    </View>
  );
}

function Toggle({
  id,
  label,
  value,
  onChange,
}: {
  id: keyof Settings;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const { t, language } = useLanguage();
  return (
    <View style={[styles.toggleRow, { flexDirection: language === "en" ? "row" : "row-reverse" }]}>
      <UiText style={styles.rowLabel}>{label}</UiText>
      <Pressable
        testID={`setting-${id}`}
        accessibilityRole="switch"
        accessibilityLabel={t(label)}
        accessibilityState={{ checked: value }}
        onPress={() => onChange(!value)}
        style={styles.switchHit}
      >
        <View style={[styles.track, { backgroundColor: value ? yemen.green : "#B9AC9B" }]}>
          <View style={[styles.knob, value ? styles.knobOn : styles.knobOff]} />
        </View>
      </Pressable>
    </View>
  );
}

export default function ParentsScreen() {
  const [open, setOpen] = useState(false);
  const { t, digits, language } = useLanguage();
  const { settings, update } = useSettings();
  const { progress, getUnitProgress, resetProgress } = useProgress();
  const pad = useScreenPadding();
  const [confirming, setConfirming] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  useEffect(() => {
    if (!resetDone) return;
    const timer = setTimeout(() => setResetDone(false), 3000);
    return () => clearTimeout(timer);
  }, [resetDone]);

  const row = { flexDirection: language === "en" ? "row" : "row-reverse" } as const;
  const align = { textAlign: language === "en" ? "left" : "right" } as const;

  return (
    <ScreenBackground style={[styles.screen, { paddingTop: pad.top + 4 }]}>
      <View style={[styles.header, row]}>
        <BackButton fallback={routes.home()} />
        <UiText style={styles.title}>ركن الأهل</UiText>
        <View style={{ width: touchTarget }} />
      </View>

      {!open ? (
        <Gate onOpen={() => setOpen(true)} />
      ) : (
        <ScrollView
          testID="parents-content"
          contentContainerStyle={[styles.content, { paddingBottom: pad.bottom + 24 }]}
        >
          <View style={styles.card}>
            <UiText style={[styles.cardTitle, align]}>الصف</UiText>
            <View style={[styles.grades, row]}>
              {grades.map((grade) => {
                const available = grade.books.some((b) => b.available);
                return (
                  <View
                    key={grade.number}
                    testID={`grade-${grade.number}`}
                    accessible
                    accessibilityLabel={
                      available ? t(grade.title) : `${t(grade.title)}، ${t("قريباً")}`
                    }
                    accessibilityState={{ disabled: !available, selected: available }}
                    style={[styles.gradeChip, available ? styles.gradeOn : styles.gradeOff]}
                  >
                    <Text style={[styles.gradeText, available && styles.gradeTextOn]}>
                      {digits(grade.number)}
                    </Text>
                  </View>
                );
              })}
            </View>
            <UiText style={[styles.note, align]}>الصفوف ٢ إلى ٦ قريباً.</UiText>
          </View>

          <View style={styles.card}>
            <UiText style={[styles.cardTitle, align]}>لغة القوائم</UiText>
            <LanguageSwitch />
          </View>

          <View style={styles.card}>
            <Toggle
              id="sound"
              label="الصوت"
              value={settings.sound}
              onChange={(sound) => update({ sound })}
            />
            <Toggle
              id="haptics"
              label="الاهتزاز"
              value={settings.haptics}
              onChange={(haptics) => update({ haptics })}
            />
          </View>

          {/* Hudhud's story from the start: chapter 1, the chapters, every station. */}
          <View style={styles.card}>
            <UiText style={[styles.cardTitle, align]}>قصة هدهد</UiText>
            <UiText style={[styles.note, align]}>
              تبدأ القصة من جديد: الفصل الأول والفصول وكل محطة. التقدم والنجوم والملصقات تبقى.
            </UiText>
            <Pressable
              testID="story-restart"
              accessibilityRole="button"
              accessibilityLabel={t("شاهد القصة من جديد")}
              onPress={() => {
                update({ introSeen: false, chaptersSeen: [] });
                // Home: the play button now tells the story.
                router.replace(routes.home());
              }}
              style={({ pressed }) => [
                styles.button,
                styles.storyButton,
                row,
                pressed && styles.pressed,
              ]}
            >
              <Icon name="book" size={22} color="#FFFFFF" />
              <UiText style={styles.buttonText}>شاهد القصة من جديد</UiText>
            </Pressable>
          </View>

          <View style={styles.card}>
            <UiText style={[styles.cardTitle, align]}>التقدم</UiText>
            {books
              .filter((book) => book.available)
              .map((book) => {
                const p = getUnitProgress(book.units.flatMap(unitLessonIds));
                return (
                  <View key={book.id} style={[styles.progressRow, row]}>
                    <UiText style={styles.progressName}>{book.title}</UiText>
                    <View style={[styles.progressTrack, row]}>
                      <View
                        style={{
                          width: `${p.total ? Math.round((p.done / p.total) * 100) : 0}%`,
                          backgroundColor: readableFill(book.color),
                          borderRadius: 6,
                        }}
                      />
                    </View>
                    <Text style={styles.progressCount}>{digits(`${p.done} / ${p.total}`)}</Text>
                  </View>
                );
              })}
            <View style={[styles.progressRow, row]}>
              <UiText style={styles.progressName}>ألبوم الملصقات</UiText>
              <Text style={styles.progressCount}>
                {digits(`${stickersEarned(progress.totalStars)} / ${STICKERS.length}`)}
              </Text>
            </View>
          </View>

          {confirming ? (
            <View style={[styles.card, styles.danger]}>
              <UiText style={[styles.dangerText, align]}>
                سيُمسح كل التقدم: النجوم والدروس والملصقات. لا يمكن التراجع.
              </UiText>
              <View style={[styles.confirmRow, row]}>
                <Pressable
                  testID="reset-confirm"
                  accessibilityRole="button"
                  accessibilityLabel={t("نعم، امسح التقدم")}
                  onPress={async () => {
                    await resetProgress();
                    setConfirming(false);
                    setResetDone(true);
                  }}
                  style={[styles.button, { backgroundColor: yemen.red }]}
                >
                  <UiText style={styles.buttonText}>نعم، امسح التقدم</UiText>
                </Pressable>
                <Pressable
                  testID="reset-cancel"
                  accessibilityRole="button"
                  accessibilityLabel={t("إلغاء")}
                  onPress={() => setConfirming(false)}
                  style={[styles.button, { backgroundColor: yemen.inkSoft }]}
                >
                  <UiText style={styles.buttonText}>إلغاء</UiText>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              testID="reset-progress"
              accessibilityRole="button"
              accessibilityLabel={t("مسح التقدم")}
              onPress={() => setConfirming(true)}
              style={styles.resetLink}
            >
              <UiText style={styles.resetText}>{resetDone ? "تم مسح التقدم" : "مسح التقدم"}</UiText>
            </Pressable>
          )}
        </ScrollView>
      )}
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
  title: { fontSize: 22, fontWeight: "800", color: yemen.ink },
  gate: { flex: 1, alignItems: "center", justifyContent: "center", gap: 20, padding: 32 },
  gateText: { fontSize: 17, color: yemen.inkSoft, textAlign: "center", lineHeight: 26 },
  gateButton: {
    width: 240,
    height: 64,
    borderRadius: 32,
    backgroundColor: yemen.inkSoft,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  gateFill: { position: "absolute", top: 0, bottom: 0, right: 0, backgroundColor: yemen.clay },
  gateLabel: { color: "#FFFFFF", fontSize: 19, fontWeight: "800" },
  content: { padding: 16, gap: 12 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 14, gap: 10 },
  cardTitle: { fontSize: 17, fontWeight: "800", color: yemen.ink },
  grades: { gap: 6 },
  gradeChip: {
    flex: 1,
    height: touchTarget,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  gradeOn: { backgroundColor: yemen.green },
  gradeOff: { backgroundColor: "#EFE8DE" },
  gradeText: { fontSize: 20, fontWeight: "800", color: yemen.lockedInk },
  gradeTextOn: { color: "#FFFFFF" },
  note: { fontSize: 13, color: yemen.inkSoft },
  toggleRow: { alignItems: "center", justifyContent: "space-between", minHeight: touchTarget },
  rowLabel: { fontSize: 17, fontWeight: "700", color: yemen.ink },
  switchHit: { width: 64, height: touchTarget, alignItems: "center", justifyContent: "center" },
  track: { width: 56, height: 32, borderRadius: 16, justifyContent: "center" },
  knob: {
    position: "absolute",
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
  },
  knobOn: { left: 3 },
  knobOff: { left: 27 },
  progressRow: { alignItems: "center", gap: 10, minHeight: 32 },
  progressName: { width: 96, fontSize: 15, fontWeight: "700", color: yemen.ink },
  progressTrack: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#EFE8DE",
    overflow: "hidden",
  },
  progressCount: { fontSize: 14, color: yemen.inkSoft, marginStart: "auto" },
  danger: { borderWidth: 2, borderColor: yemen.red },
  dangerText: { fontSize: 15, color: yemen.ink, lineHeight: 22 },
  confirmRow: { gap: 10 },
  button: {
    flex: 1,
    minHeight: touchTarget,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  buttonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800", textAlign: "center" },
  resetLink: {
    alignSelf: "center",
    minHeight: touchTarget,
    justifyContent: "center",
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: yemen.red,
  },
  resetText: { color: yemen.red, fontSize: 15, fontWeight: "700" },
  storyButton: { flex: 0, backgroundColor: yemen.clay, gap: 8 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
});
