import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ScreenBackground } from "@/components/ScreenBackground";
import { UiText } from "@/components/UiText";
import { routes } from "@/lib/routes";
import { colors, radius, shadow, spacing, touchTarget } from "@/theme/tokens";

/** Small card for an unknown book, unit or lesson id, with a way back home. */
export function NotFoundCard({ message }: { message: string }) {
  return (
    <ScreenBackground style={styles.centered}>
      <View style={styles.card} testID="not-found">
        <UiText style={styles.message}>{message}</UiText>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.link, pressed && styles.pressed]}
          onPress={() => router.replace(routes.home())}
        >
          <UiText style={styles.linkText}>العودة إلى الرئيسية</UiText>
        </Pressable>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
    ...shadow.card,
  },
  message: { fontSize: 18, fontWeight: "700", color: colors.muted },
  link: { minHeight: touchTarget, justifyContent: "center", paddingHorizontal: spacing.md },
  linkText: { fontSize: 15, fontWeight: "700", color: colors.star },
  pressed: { opacity: 0.7 },
});
