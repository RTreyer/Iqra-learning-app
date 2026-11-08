import { router, type Href } from "expo-router";
import React, { useEffect, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";

import { goBackOr } from "@/components/BackButton";
import { UiText } from "@/components/UiText";
import { Hudhud } from "@/components/world/Hudhud";
import { Icon, StarIcon } from "@/components/world/Icon";
import { BowlGoal } from "@/components/world/Bowl";
import { StickerArt } from "@/components/world/StickerArt";
import type { Lesson } from "@/content/types";
import { useLanguage } from "@/context/LanguageContext";
import * as haptics from "@/lib/haptics";
import { routes } from "@/lib/routes";
import { speak } from "@/lib/speech";
import type { Sticker } from "@/lib/stickers";
import { touchTarget, yemen } from "@/theme/tokens";

const MAX_STARS = 3;
const CONFETTI = 18;
const CONFETTI_COLOURS = [yemen.red, yemen.blue, yemen.green, yemen.gold, "#FFFFFF"];

type Props = {
  /** Stars earned by this attempt, 1 to 3. */
  stars: number;
  onRepeat: () => void;
  /** Next lesson in the unit, or null when the unit is finished. */
  next: Lesson | null;
  /** The unit list, used when "back" has no history (web deep link). */
  backTo: Href;
  /** Lessons done today, for the qamariya window. */
  today?: number;
  /** A sticker this lesson earned, shown and named. */
  sticker?: Sticker | null;
  /** The unit's goal in Hudhud's story, with what this lesson brought back shining. */
  story?: React.ReactNode;
};

/** One short fall of paper in the qamariya colours; it plays once and stops. */
function Confetti() {
  const [drops] = useState(() =>
    Array.from({ length: CONFETTI }, (_, i) => ({
      fall: new Animated.Value(0),
      left: `${(i * 53) % 100}%` as const,
      colour: CONFETTI_COLOURS[i % CONFETTI_COLOURS.length],
      delay: (i * 97) % 600,
      round: i % 3 === 0,
    })),
  );
  useEffect(() => {
    const anims = drops.map((d) =>
      Animated.timing(d.fall, {
        toValue: 1,
        duration: 2200,
        delay: d.delay,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    );
    Animated.parallel(anims).start();
    return () => anims.forEach((a) => a.stop());
  }, [drops]);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {drops.map((d, i) => (
        <Animated.View
          key={i}
          style={[
            styles.drop,
            d.round && styles.dropRound,
            {
              left: d.left,
              backgroundColor: d.colour,
              opacity: d.fall.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 1, 0] }),
              transform: [
                { translateY: d.fall.interpolate({ inputRange: [0, 1], outputRange: [-30, 700] }) },
                {
                  rotate: d.fall.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "540deg"],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

/** The earned stars pop in one after another. */
function PopStar({ index, earned }: { index: number; earned: boolean }) {
  const [scale] = useState(() => new Animated.Value(earned ? 0 : 1));
  useEffect(() => {
    if (!earned) return;
    const anim = Animated.spring(scale, {
      toValue: 1,
      delay: 250 + index * 300,
      friction: 4,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [earned, index, scale]);
  const big = index === 1;
  return (
    <Animated.View
      testID={earned ? "star-earned" : "star-dimmed"}
      style={[{ transform: [{ scale }] }, big && styles.bigStar]}
    >
      <StarIcon size={big ? 96 : 76} dim={!earned} />
    </Animated.View>
  );
}

export function LessonCompleteCard({
  stars,
  onRepeat,
  next,
  backTo,
  today = 0,
  sticker = null,
  story = null,
}: Props) {
  const { language, t, digits } = useLanguage();
  const row = language === "en" ? "row" : "row-reverse";
  return (
    <View style={styles.content} testID="lesson-complete">
      <Confetti />
      <View
        style={styles.starsRow}
        accessible
        accessibilityLabel={digits(`${stars} / ${MAX_STARS} ⭐`)}
      >
        {Array.from({ length: MAX_STARS }, (_, i) => (
          <PopStar key={i} index={i} earned={i < stars} />
        ))}
      </View>
      <Hudhud size={130} pose="cheer" />
      <UiText style={styles.title}>أَحْسَنْت!</UiText>
      {story}

      <View style={[styles.rewards, { flexDirection: row }]}>
        <View style={styles.window} accessible accessibilityLabel={t("صحن اليوم")}>
          <BowlGoal filled={today} width={110} />
        </View>
        {sticker ? (
          <Pressable
            testID="new-sticker"
            accessibilityRole="button"
            accessibilityLabel={sticker.name}
            onPress={() => {
              haptics.tap();
              speak(sticker.name);
            }}
            style={styles.sticker}
          >
            <StickerArt id={sticker.id} size={70} />
            <Text style={styles.stickerName} numberOfLines={1}>
              {sticker.name}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {next ? null : (
        <UiText testID="unit-finished" style={styles.celebration}>
          أتممت الوحدة!
        </UiText>
      )}

      <View style={[styles.buttons, { flexDirection: row }]}>
        <Pressable
          testID="back-to-list"
          accessibilityRole="button"
          accessibilityLabel={t("العودة إلى القائمة")}
          style={({ pressed }) => [styles.round, pressed && styles.pressed]}
          onPress={() => goBackOr(backTo)}
        >
          <Icon name="map" size={34} color={yemen.blue} />
        </Pressable>
        {next ? (
          <Pressable
            testID="next-lesson"
            accessibilityRole="button"
            accessibilityLabel={`${t("النشاط التالي:")} ${next.title}`}
            style={({ pressed }) => [styles.round, styles.primary, pressed && styles.pressed]}
            onPress={() => router.replace(routes.lesson(next.id))}
          >
            <View style={styles.playNudge}>
              <Icon name="play" size={52} color="#FFFFFF" />
            </View>
          </Pressable>
        ) : null}
        <Pressable
          testID="repeat-lesson"
          accessibilityRole="button"
          accessibilityLabel={t("إعادة الدرس")}
          style={({ pressed }) => [styles.round, pressed && styles.pressed]}
          onPress={onRepeat}
        >
          <Icon name="replay" size={34} color={yemen.green} strokeWidth={2.6} />
        </Pressable>
      </View>
      {next ? (
        <Text style={styles.nextTitle} numberOfLines={1}>
          {next.title}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 10,
    overflow: "hidden",
  },
  drop: { position: "absolute", top: 0, width: 10, height: 16, borderRadius: 2 },
  dropRound: { width: 12, height: 12, borderRadius: 6 },
  starsRow: { flexDirection: "row", alignItems: "flex-end", gap: 4 },
  bigStar: { marginBottom: 14 },
  title: { fontSize: 32, fontWeight: "900", color: yemen.ink },
  rewards: { alignItems: "center", gap: 14 },
  window: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sticker: {
    width: 112,
    minHeight: 104,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    borderColor: yemen.gold,
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
    transform: [{ rotate: "-4deg" }],
  },
  stickerName: { fontSize: 13, fontWeight: "800", color: yemen.ink },
  celebration: { fontSize: 22, fontWeight: "900", color: yemen.ink, textAlign: "center" },
  buttons: { alignItems: "center", gap: 22, marginTop: 8 },
  round: {
    width: 72,
    height: 72,
    minHeight: touchTarget,
    borderRadius: 36,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: `0 5px 0 ${yemen.sandShadow}`,
  },
  primary: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: yemen.clay,
    borderWidth: 6,
    borderColor: "#FFFFFF",
    boxShadow: `0 7px 0 ${yemen.clayDeep}`,
  },
  playNudge: { marginLeft: 6 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.95 }] },
  nextTitle: { fontSize: 14, fontWeight: "700", color: yemen.inkSoft },
});
