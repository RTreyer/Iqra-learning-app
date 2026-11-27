/**
 * Parents' corner, behind the parents' PIN (components/parents/ParentsLock.tsx): the children
 * on this phone (docs/KINDERPROFILE.md), grade, menu language, voice and vibration, watching
 * Hudhud's story again; right after the children, what the active child learned per subject
 * (today, this week, in all, and the last lesson).
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { BackButton } from "@/components/BackButton";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { ScreenBackground } from "@/components/ScreenBackground";
import { UiText } from "@/components/UiText";
import { ChildrenCard } from "@/components/parents/ChildrenCard";
import { ParentsLock, PinSetup } from "@/components/parents/ParentsLock";
import { Avatar, profileLabel } from "@/components/world/Avatar";
import { Icon } from "@/components/world/Icon";
import { SubjectLabel, subjectName } from "@/components/world/SubjectLabel";
import { books, grades } from "@/content";
import { useLanguage } from "@/context/LanguageContext";
import { useProfiles } from "@/context/ProfilesContext";
import { useProgress } from "@/context/ProgressContext";
import { useSettings, type Settings } from "@/context/SettingsContext";
import { useScreenPadding } from "@/hooks/useScreenPadding";
import { VOICE_HINT_KEY } from "@/hooks/useVoiceHint";
import { useVoiceState, type VoiceState } from "@/hooks/useVoiceState";
import { speak } from "@/lib/speech";
import { routes } from "@/lib/routes";
import { lastLesson, subjectActivity } from "@/lib/subjectActivity";
import { STICKERS, stickersEarned } from "@/lib/stickers";
import { readableFill, touchTarget, yemen } from "@/theme/tokens";

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

const VOICE_LINES: Record<VoiceState, string> = {
  works: "الصوت العربي يعمل.",
  missing:
    "لا يوجد صوت عربي على هذا الجهاز. ثبّت صوتاً عربياً من إعدادات تحويل النص إلى كلام، ثم جرّب الصوت.",
  unknown: "اضغط «جرّب الصوت»: يجب أن تسمع هدهد.",
};

/**
 * The Arabic voice, for the parents (UX-03): whether it works, a button to hear it, and,
 * without a voice, a way to stop the child's warning for good. Lessons are spoken, so a phone
 * without a voice needs an adult.
 */
function VoiceCard() {
  const { t, language } = useLanguage();
  const voice = useVoiceState();
  const [silenced, setSilenced] = useState(false);
  const row = { flexDirection: language === "en" ? "row" : "row-reverse" } as const;
  const align = { textAlign: language === "en" ? "left" : "right" } as const;
  return (
    <View style={styles.card} testID="voice-status">
      <UiText style={[styles.cardTitle, align]}>الصوت العربي</UiText>
      <View style={[row, styles.voiceRow]}>
        <View
          style={[
            styles.voiceIcon,
            {
              backgroundColor:
                voice === "missing" ? yemen.clay : voice === "works" ? yemen.green : yemen.inkSoft,
            },
          ]}
        >
          <Icon name={voice === "missing" ? "speakerOff" : "speaker"} size={24} color="#FFFFFF" />
        </View>
        <UiText testID={`voice-${voice}`} style={[styles.note, styles.voiceText, align]}>
          {VOICE_LINES[voice]}
        </UiText>
      </View>
      <Pressable
        testID="voice-test"
        accessibilityRole="button"
        accessibilityLabel={t("جرّب الصوت")}
        onPress={() => speak("مَرْحَبًا! أَنَا هُدْهُدٌ.")}
        style={({ pressed }) => [styles.button, styles.storyButton, row, pressed && styles.pressed]}
      >
        <Icon name="speaker" size={22} color="#FFFFFF" />
        <UiText style={styles.buttonText}>جرّب الصوت</UiText>
      </Pressable>
      {voice === "missing" && !silenced ? (
        <Pressable
          testID="voice-hint-off"
          accessibilityRole="button"
          accessibilityLabel={t("لا تُظهِر التنبيه للطفل بعد الآن")}
          onPress={() => {
            setSilenced(true);
            AsyncStorage.setItem(VOICE_HINT_KEY, "1").catch(() => {});
          }}
          style={({ pressed }) => [styles.textButton, pressed && styles.pressed]}
        >
          <UiText style={[styles.textButtonLabel, align]}>لا تُظهِر التنبيه للطفل بعد الآن</UiText>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function ParentsScreen() {
  const [open, setOpen] = useState(false);
  const { t, digits, language } = useLanguage();
  const { settings, update } = useSettings();
  const { progress } = useProgress();
  const { active, profiles, pinChangedAt } = useProfiles();
  const pad = useScreenPadding();
  const [changingPin, setChangingPin] = useState(false);

  const row = { flexDirection: language === "en" ? "row" : "row-reverse" } as const;
  const activity = useMemo(() => subjectActivity(progress, books), [progress]);
  const last = useMemo(() => lastLesson(progress, books), [progress]);
  const align = { textAlign: language === "en" ? "left" : "right" } as const;

  return (
    <ScreenBackground style={[styles.screen, { paddingTop: pad.top + 4 }]}>
      <View style={[styles.header, row]}>
        <BackButton fallback={routes.home()} />
        <UiText style={styles.title}>ركن الأهل</UiText>
        <View style={{ width: touchTarget }} />
      </View>

      {!open ? (
        <ScrollView contentContainerStyle={styles.lock}>
          <ParentsLock onOpen={() => setOpen(true)} />
        </ScrollView>
      ) : (
        <ScrollView
          testID="parents-content"
          contentContainerStyle={[styles.content, { paddingBottom: pad.bottom + 24 }]}
        >
          <ChildrenCard />

          {/*
            What the child learned, per subject (as Lingokids' progress centre): parents in the
            user test could not tell when their child was in Arabic and when in maths.
          */}
          <View testID="subject-progress" style={styles.card}>
            <View style={[styles.progressHead, row]}>
              {profiles.length > 1 ? <Avatar id={active.avatar} size={32} /> : null}
              <UiText style={[styles.cardTitle, align]}>
                {profiles.length > 1
                  ? `${t("ماذا تعلّم طفلك؟")} ${profileLabel(active)}`
                  : "ماذا تعلّم طفلك؟"}
              </UiText>
            </View>
            <Text testID="last-lesson" style={[styles.note, align]}>
              {last
                ? `${t("آخر درس")}: ${t(subjectName(last.book))}، ${last.title}`
                : t("لم يبدأ بعد")}
            </Text>
            {activity.map(({ book, today, week, done, total }) => (
              <View key={book.id} testID={`subject-row-${book.id}`} style={styles.subjectRow}>
                <View style={[styles.subjectHead, row]}>
                  <SubjectLabel book={book} />
                  <Text style={styles.progressCount}>{digits(`${done} / ${total}`)}</Text>
                </View>
                <View style={[styles.progressTrack, row]}>
                  <View
                    style={{
                      width: `${total ? Math.round((done / total) * 100) : 0}%`,
                      backgroundColor: readableFill(book.color),
                      borderRadius: 6,
                    }}
                  />
                </View>
                <View style={[styles.counts, row]}>
                  <Text testID={`today-${book.id}`} style={styles.count}>
                    {`${t("اليوم")}: ${digits(today)}`}
                  </Text>
                  <Text testID={`week-${book.id}`} style={styles.count}>
                    {`${t("هذا الأسبوع")}: ${digits(week)}`}
                  </Text>
                </View>
              </View>
            ))}
            <View style={[styles.progressRow, row]}>
              <UiText style={styles.progressName}>ألبوم الملصقات</UiText>
              <Text style={styles.progressCount}>
                {digits(`${stickersEarned(progress.totalStars)} / ${STICKERS.length}`)}
              </Text>
            </View>
          </View>

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

          <VoiceCard />

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
            <UiText style={[styles.cardTitle, align]}>رمز الأهل</UiText>
            {pinChangedAt ? (
              <Text testID="pin-changed-at" style={[styles.note, align]}>
                {`${t("آخر تغيير للرمز:")} ${digits(pinChangedAt.slice(0, 10))}`}
              </Text>
            ) : null}
            {changingPin ? (
              <PinSetup onSaved={() => setChangingPin(false)} />
            ) : (
              <Pressable
                testID="pin-change"
                accessibilityRole="button"
                accessibilityLabel={t("تغيير الرمز")}
                onPress={() => setChangingPin(true)}
                style={({ pressed }) => [
                  styles.button,
                  styles.storyButton,
                  pressed && styles.pressed,
                ]}
              >
                <UiText style={styles.buttonText}>تغيير الرمز</UiText>
              </Pressable>
            )}
          </View>
        </ScrollView>
      )}
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
  title: { fontSize: 22, fontWeight: "800", color: yemen.ink },
  lock: { flexGrow: 1, justifyContent: "center", paddingBottom: 24 },
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
  progressHead: { alignItems: "center", gap: 8 },
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
  subjectRow: { gap: 6, paddingVertical: 4 },
  subjectHead: { alignItems: "center", gap: 10 },
  counts: { gap: 16 },
  count: { fontSize: 14, fontWeight: "700", color: yemen.inkSoft },
  button: {
    flex: 1,
    minHeight: touchTarget,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  buttonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800", textAlign: "center" },
  storyButton: { flex: 0, backgroundColor: yemen.clay, gap: 8 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
  voiceRow: { alignItems: "center", gap: 10 },
  voiceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  voiceText: { flex: 1, fontSize: 14, lineHeight: 22 },
  textButton: { minHeight: touchTarget, justifyContent: "center" },
  textButtonLabel: { fontSize: 14, fontWeight: "700", color: yemen.clay },
});
