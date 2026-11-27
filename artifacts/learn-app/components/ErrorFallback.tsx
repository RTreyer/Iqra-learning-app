import { reloadAppAsync } from "expo";
import React, { useEffect, useState } from "react";
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";

import { UiText } from "@/components/UiText";
import { useLanguage } from "@/context/LanguageContext";
import { claimAutoReload, isLoadError, serverReachable } from "@/lib/serviceWorker";

/** How often the app tries again while the server does not answer. */
const RETRY_MS = 5000;
import { colors, shadow } from "@/theme/tokens";

export type ErrorFallbackProps = {
  error: Error;
  resetError: () => void;
};

function sessionStore(): Storage | null {
  try {
    return typeof sessionStorage === "undefined" ? null : sessionStorage;
  } catch {
    return null;
  }
}

/** On the web without a connection, unless the service worker can serve the app page. */
function offlineWithoutCopy() {
  if (Platform.OS !== "web" || typeof navigator === "undefined") return false;
  return navigator.onLine === false && !navigator.serviceWorker?.controller;
}

/**
 * A screen's code did not download (TECH-01): online, reload once by itself; offline, say so
 * and reload as soon as the connection is back, rather than landing on the browser's own
 * offline page.
 */
function useLoadErrorRecovery(error: Error) {
  const loadError = Platform.OS === "web" && isLoadError(error);
  const [offline, setOffline] = useState(() => loadError && offlineWithoutCopy());
  useEffect(() => {
    if (!loadError || typeof window === "undefined") return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    // Reload only once the server answers: a phone with one bar says "online" while no data
    // comes through, and a reload then shows the browser's own error page (TECH-R2-01). Until
    // then the app says there is no connection and keeps trying.
    const tryReload = async () => {
      if (cancelled) return;
      if (navigator.onLine !== false && (await serverReachable())) {
        if (!cancelled && claimAutoReload(sessionStore())) window.location.reload();
        return;
      }
      if (cancelled) return;
      setOffline(true);
      timer = setTimeout(tryReload, RETRY_MS);
    };
    void tryReload();
    const back = () => {
      clearTimeout(timer);
      void tryReload();
    };
    const gone = () => setOffline(true);
    window.addEventListener("online", back);
    window.addEventListener("offline", gone);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener("online", back);
      window.removeEventListener("offline", gone);
    };
  }, [loadError]);
  return offline;
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const offline = useLoadErrorRecovery(error);

  const handleRestart = async () => {
    // Reloading now would show the browser's offline page instead of the app.
    if (offlineWithoutCopy()) return;
    if (Platform.OS === "web" && isLoadError(error) && !(await serverReachable())) return;
    try {
      await reloadAppAsync();
    } catch (restartError) {
      console.error("Failed to restart app:", restartError);
      resetError();
    }
  };

  const formatErrorDetails = (): string => {
    let details = `Error: ${error.message}\n\n`;
    if (error.stack) {
      details += `Stack Trace:\n${error.stack}`;
    }
    return details;
  };

  const monoFont = Platform.select({
    ios: "Menlo",
    android: "monospace",
    default: "monospace",
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.cream }]}>
      {__DEV__ ? (
        <Pressable
          onPress={() => setIsModalVisible(true)}
          accessibilityLabel={t("عرض تفاصيل الخطأ")}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.topButton,
            {
              top: insets.top + 16,
              backgroundColor: colors.white,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.text}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Circle cx={12} cy={12} r={10} />
            <Path d="M12 8v4M12 16h.01" />
          </Svg>
        </Pressable>
      ) : null}

      <View style={styles.content}>
        <UiText style={[styles.title, { color: colors.text }]}>
          {offline ? "لا يوجد اتصال بالإنترنت" : "حدث خطأ"}
        </UiText>

        <UiText style={[styles.message, { color: colors.muted }]} testID="error-message">
          {offline ? "سيعود التطبيق وحده عندما يعود الاتصال." : "أعد تحميل التطبيق للمتابعة."}
        </UiText>

        <Pressable
          onPress={handleRestart}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: colors.star,
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
        >
          <UiText style={[styles.buttonText, { color: colors.white }]}>حاول مرة أخرى</UiText>
        </Pressable>
      </View>

      {__DEV__ ? (
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: colors.cream }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <UiText style={[styles.modalTitle, { color: colors.text }]}>تفاصيل الخطأ</UiText>
                <Pressable
                  onPress={() => setIsModalVisible(false)}
                  accessibilityLabel={t("إغلاق تفاصيل الخطأ")}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.closeButton, { opacity: pressed ? 0.6 : 1 }]}
                >
                  <Svg
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={colors.text}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <Path d="M18 6L6 18M6 6l12 12" />
                  </Svg>
                </Pressable>
              </View>

              <ScrollView
                style={styles.modalScrollView}
                contentContainerStyle={[
                  styles.modalScrollContent,
                  { paddingBottom: insets.bottom + 16 },
                ]}
                showsVerticalScrollIndicator
              >
                <View style={[styles.errorContainer, { backgroundColor: colors.white }]}>
                  <Text
                    style={[
                      styles.errorText,
                      {
                        color: colors.text,
                        fontFamily: monoFont,
                      },
                    ]}
                    selectable
                  >
                    {formatErrorDetails()}
                  </Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    width: "100%",
    maxWidth: 600,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 40,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  topButton: {
    position: "absolute",
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 8,
    paddingHorizontal: 24,
    minWidth: 200,
    ...shadow.card,
  },
  buttonText: {
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    width: "100%",
    height: "90%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 16,
  },
  errorContainer: {
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
    padding: 16,
  },
  errorText: {
    fontSize: 12,
    lineHeight: 18,
    width: "100%",
  },
});
