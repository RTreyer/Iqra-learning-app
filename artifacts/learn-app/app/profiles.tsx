/**
 * Who learns today? One big picture per child; the child taps its own. Shown at the start when
 * more than one child learns on this phone, and from the picture on the home screen. Nothing
 * here needs reading: the names are small, for the parents.
 */

import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { BackButton, goBackOr } from "@/components/BackButton";
import { ScreenBackground } from "@/components/ScreenBackground";
import { UiText } from "@/components/UiText";
import { Avatar, profileLabel } from "@/components/world/Avatar";
import { Guide } from "@/components/world/Guide";
import { useLanguage } from "@/context/LanguageContext";
import { useProfiles } from "@/context/ProfilesContext";
import { useScreenPadding } from "@/hooks/useScreenPadding";
import * as haptics from "@/lib/haptics";
import { routes } from "@/lib/routes";
import { touchTarget, yemen } from "@/theme/tokens";

export const WHO_LEARNS = "مَنْ يَتَعَلَّمُ الْيَوْمَ؟";

export default function ProfilesScreen() {
  const { profiles, active, chosen, choose } = useProfiles();
  const { language } = useLanguage();
  const pad = useScreenPadding();

  return (
    <ScreenBackground style={[styles.screen, { paddingTop: pad.top + 4 }]}>
      <View style={[styles.header, { flexDirection: language === "en" ? "row" : "row-reverse" }]}>
        {/* At the start a child has to be chosen first; later the child may go back. */}
        {chosen ? <BackButton fallback={routes.home()} /> : <View style={styles.spacer} />}
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: pad.bottom + 24 }]}>
        <Guide text={WHO_LEARNS} layout="stack" birdSize={96} speakOnMount />
        <View style={styles.grid}>
          {profiles.map((profile) => (
            <Pressable
              key={profile.id}
              testID={`profile-${profile.id}`}
              accessibilityRole="button"
              accessibilityLabel={profileLabel(profile)}
              accessibilityState={{ selected: chosen && profile.id === active.id }}
              onPress={() => {
                haptics.tap();
                choose(profile.id);
                // From home: back to it. At the start (nothing behind): home replaces the question.
                goBackOr(routes.home());
              }}
              style={({ pressed }) => [styles.child, pressed && styles.pressed]}
            >
              <Avatar id={profile.avatar} size={112} />
              {profile.name ? (
                <UiText style={styles.name} numberOfLines={1}>
                  {profile.name}
                </UiText>
              ) : null}
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 16, minHeight: touchTarget },
  spacer: { width: touchTarget, height: touchTarget },
  content: { alignItems: "center", gap: 18, paddingHorizontal: 16 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 18,
    maxWidth: 420,
  },
  child: {
    width: 140,
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    boxShadow: `0 5px 0 ${yemen.sandShadow}`,
  },
  name: { fontSize: 15, fontWeight: "700", color: yemen.ink, maxWidth: 124 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.96 }] },
});
