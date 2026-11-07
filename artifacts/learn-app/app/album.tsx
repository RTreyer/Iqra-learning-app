/**
 * Sticker album: pictures of Yemen earned with stars (lib/stickers.ts). Tapping a sticker says
 * its name; a locked one says how to get it. A bar shows the way to the next sticker.
 */

import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { BackButton } from "@/components/BackButton";
import { ScreenBackground } from "@/components/ScreenBackground";
import { StarBadge } from "@/components/StarBadge";
import { Guide } from "@/components/world/Guide";
import { Icon, StarIcon } from "@/components/world/Icon";
import { StickerArt } from "@/components/world/StickerArt";
import { useLanguage } from "@/context/LanguageContext";
import { useProgress } from "@/context/ProgressContext";
import { useScreenPadding } from "@/hooks/useScreenPadding";
import * as haptics from "@/lib/haptics";
import { routes } from "@/lib/routes";
import { speak } from "@/lib/speech";
import { STICKERS, nextStickerProgress, stickersEarned } from "@/lib/stickers";
import { touchTarget, yemen } from "@/theme/tokens";

const INTRO = "اِضْغَطْ عَلَى صُورَةٍ لِتَسْمَعَ اسْمَهَا";
const LOCKED = "اِجْمَعِ النُّجُومَ لِتَأْخُذَهَا!";
const TILTS = ["-3deg", "2deg", "-2deg", "3deg"];

export default function AlbumScreen() {
  const { progress } = useProgress();
  const { digits, language } = useLanguage();
  const pad = useScreenPadding();
  const earned = stickersEarned(progress.totalStars);
  const next = nextStickerProgress(progress.totalStars);
  const [line, setLine] = useState(INTRO);

  const say = (text: string) => {
    haptics.tap();
    setLine(text);
    speak(text);
  };

  return (
    <ScreenBackground style={[styles.screen, { paddingTop: pad.top + 4 }]}>
      <View style={[styles.header, { flexDirection: language === "en" ? "row" : "row-reverse" }]}>
        <BackButton fallback={routes.home()} />
        <View
          style={styles.count}
          accessible
          accessibilityLabel={digits(`${earned} / ${STICKERS.length}`)}
        >
          <Icon name="album" size={28} color={yemen.green} />
          <Text style={styles.countText}>{digits(`${earned} / ${STICKERS.length}`)}</Text>
        </View>
        <StarBadge stars={progress.totalStars} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: pad.bottom + 24 }]}>
        <View style={styles.page}>
          {STICKERS.map((sticker, i) => {
            const open = i < earned;
            return (
              <Pressable
                key={sticker.id}
                testID={`sticker-${sticker.id}`}
                accessibilityRole="button"
                accessibilityLabel={open ? sticker.name : LOCKED}
                accessibilityState={{ disabled: false }}
                onPress={() => say(open ? sticker.name : LOCKED)}
                style={({ pressed }) => [
                  styles.sticker,
                  open ? styles.open : styles.locked,
                  { transform: [{ rotate: open ? TILTS[i % TILTS.length] : "0deg" }] },
                  pressed && styles.pressed,
                ]}
              >
                <StickerArt id={sticker.id} size={78} locked={!open} />
                {!open ? (
                  <View style={styles.lock}>
                    <Icon name="lock" size={20} color={yemen.lockedInk} />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        {next ? (
          <View
            style={[styles.next, { flexDirection: language === "en" ? "row" : "row-reverse" }]}
            accessible
            accessibilityLabel={digits(`${next.missing} ⭐`)}
          >
            <StarIcon size={30} />
            <View style={[styles.track, { flexDirection: "row-reverse" }]}>
              <View style={[styles.fill, { width: `${Math.round(next.share * 100)}%` }]} />
            </View>
            <StickerArt id={STICKERS[earned].id} size={40} locked />
          </View>
        ) : null}

        <Guide text={line} birdSize={80} />
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
  count: { flexDirection: "row", alignItems: "center", gap: 6 },
  countText: { fontSize: 22, fontWeight: "800", color: yemen.ink },
  content: { padding: 14, gap: 16 },
  page: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
    backgroundColor: yemen.sandLight,
    borderRadius: 26,
    padding: 12,
    boxShadow: `0 6px 0 ${yemen.sandShadow}`,
  },
  sticker: {
    width: "31%",
    aspectRatio: 0.9,
    minHeight: touchTarget,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
  },
  open: { backgroundColor: "#FFFFFF", borderColor: yemen.sandShadow },
  locked: { backgroundColor: "#F1E7D9", borderColor: "#D6C4AA", borderStyle: "dashed" },
  pressed: { opacity: 0.85 },
  lock: { position: "absolute", bottom: 6, left: 6 },
  next: {
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  track: {
    flex: 1,
    height: 16,
    borderRadius: 8,
    backgroundColor: yemen.paneEmpty,
    overflow: "hidden",
  },
  fill: { height: 16, borderRadius: 8, backgroundColor: yemen.gold, minWidth: 16 },
});
