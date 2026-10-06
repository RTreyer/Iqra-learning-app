/**
 * Home screen — grade selector (Klasse 1–6).
 * Children tap their grade to see available books.
 * Shows a login gate if the user is not authenticated.
 */

import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenBackground } from "@/components/ScreenBackground";
import { grades } from "@/constants/grades";
import { useProgress } from "@/context/ProgressContext";
import { useAuth } from "@/lib/auth";
import { UiText } from "@/components/UiText";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { useLanguage } from "@/context/LanguageContext";

export default function HomeScreen() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { progress } = useProgress();
  const { user, isLoading, isAuthenticated, login, logout, loginError } = useAuth();

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  if (isLoading) {
    return (
      <ScreenBackground
        variant="home"
        style={[styles.container, { paddingTop: topPad + 8, paddingBottom: botPad + 16 }]}
      >
        <ActivityIndicator size="large" color="#D97706" style={{ marginTop: 80 }} />
        <UiText style={styles.loadingText}>جاري التحميل...</UiText>
      </ScreenBackground>
    );
  }

  if (!isAuthenticated) {
    return (
      <ScreenBackground
        variant="home"
        style={[styles.container, { paddingTop: topPad + 8, paddingBottom: botPad + 16 }]}
      >
        <LanguageSwitch />
        <Text style={styles.appTitle}>أَقْرَأُ وَأَتَعَلَّمُ</Text>
        <Text style={styles.loginEmoji}>📚✨</Text>
        <UiText style={styles.loginWelcome}>مرحباً بك!</UiText>
        <UiText style={styles.loginSubtitle}>سجِّل دخولك لتبدأ رحلة التعلّم</UiText>
        <Pressable
          style={({ pressed }) => [styles.loginButton, pressed && styles.loginButtonPressed]}
          onPress={login}
          accessibilityLabel={t("تسجيل الدخول")}
        >
          <UiText style={styles.loginButtonText}>ابدأِ التَّعَلُّم 🚀</UiText>
        </Pressable>
        {loginError ? <UiText role="alert" style={styles.loginError}>{loginError}</UiText> : null}
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground
      variant="home"
      style={[styles.container, { paddingTop: topPad + 8, paddingBottom: botPad + 16 }]}
    >
      {/* Header */}
      <LanguageSwitch />
      <View style={styles.header}>
        <View style={styles.starsRow}>
          <Text style={styles.starEmoji}>⭐</Text>
          <Text style={styles.starsCount}>{progress.totalStars}</Text>
        </View>
        <View style={styles.userRow}>
          <Pressable onPress={logout} style={styles.logoutBtn}>
            <UiText style={styles.logoutText}>خروج</UiText>
          </Pressable>
          <Text style={styles.userName} numberOfLines={1}>
            {user?.firstName ?? t("أهلاً")}
          </Text>
          <Text style={styles.appTitle}>أَقْرَأُ وَأَتَعَلَّمُ</Text>
        </View>
      </View>

      {/* Subtitle */}
      <UiText style={styles.subtitle}>اختَر صفّك</UiText>

      {/* Grade grid */}
      <View style={styles.grid}>
        {grades.map((grade) => (
          <Pressable
            key={grade.id}
            style={({ pressed }) => [
              styles.gradeCard,
              { backgroundColor: grade.color },
              pressed && styles.cardPressed,
            ]}
            onPress={() => router.push(`/(tabs)/grade/${grade.id}` as any)}
            accessibilityLabel={t(grade.label)}
          >
            <Text style={styles.gradeEmoji}>{grade.emoji}</Text>
            <Text style={styles.gradeNumber}>{grade.id}</Text>
            <UiText style={styles.gradeLabel}>{grade.label}</UiText>
          </Pressable>
        ))}
      </View>

      <UiText style={styles.footer}>أنت رائع! 🌟</UiText>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#78350F",
    marginTop: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E293B",
    textAlign: "right",
  },
  loginEmoji: {
    fontSize: 80,
    textAlign: "center",
    marginTop: 30,
    marginBottom: 10,
  },
  loginWelcome: {
    fontSize: 36,
    fontWeight: "900",
    color: "#92400E",
    textAlign: "center",
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 18,
    color: "#78350F",
    textAlign: "center",
    marginBottom: 40,
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: "#D97706",
    borderRadius: 32,
    paddingHorizontal: 48,
    paddingVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonPressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  loginButtonText: {
    fontSize: 26,
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
  },
  loginError: {
    color: "#9F1239",
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
    fontWeight: "700",
  },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  starEmoji: { fontSize: 20 },
  starsCount: { fontSize: 22, fontWeight: "700", color: "#92400E" },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    maxWidth: 80,
  },
  logoutBtn: {
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#92400E",
  },
  subtitle: {
    fontSize: 16,
    color: "#5C4A00",
    textAlign: "center",
    marginBottom: 16,
    marginTop: 4,
    fontWeight: "700",
  },
  grid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    justifyContent: "center",
    alignContent: "center",
    maxHeight: 520,
    width: "100%",
  },
  gradeCard: {
    width: "44%",
    aspectRatio: 1,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  cardPressed: { opacity: 0.88, transform: [{ scale: 0.96 }] },
  gradeEmoji: { fontSize: 40 },
  gradeNumber: {
    fontSize: 48,
    fontWeight: "900",
    color: "rgba(255,255,255,0.95)",
    lineHeight: 52,
  },
  gradeLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
  },
  footer: {
    fontSize: 18,
    color: "#78350F",
    marginTop: 12,
    textAlign: "center",
    fontWeight: "700",
  },
});
