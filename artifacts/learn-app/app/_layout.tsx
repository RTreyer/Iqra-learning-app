import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { VoiceHintBanner } from "@/components/VoiceHintBanner";
import { ProgressProvider } from "@/context/ProgressContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { useVoiceHint } from "@/hooks/useVoiceHint";
import { shadow } from "@/theme/tokens";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

/** Widest the app gets in a browser — keeps the phone-portrait layout intact. */
const WEB_MAX_WIDTH = 480;

function RootLayoutNav() {
  const { visible, dismiss } = useVoiceHint();
  return (
    <>
      <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }} />
      {visible && <VoiceHintBanner onDismiss={dismiss} />}
    </>
  );
}

/**
 * On web, render the app as a centered phone-width column so screens
 * designed for portrait phones don't stretch across wide desktop windows.
 */
function WebFrame({ children }: { children: React.ReactNode }) {
  if (Platform.OS !== "web") return <>{children}</>;
  return (
    <View style={styles.webBackdrop}>
      <View style={styles.webApp}>{children}</View>
    </View>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <ErrorBoundary>
          <ProgressProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <WebFrame>
                <RootLayoutNav />
              </WebFrame>
            </GestureHandlerRootView>
          </ProgressProvider>
        </ErrorBoundary>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  webBackdrop: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#E8DDBE",
  },
  webApp: {
    flex: 1,
    width: "100%",
    maxWidth: WEB_MAX_WIDTH,
    overflow: "hidden",
    ...shadow.card,
  },
});
