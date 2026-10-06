/**
 * Root layout for all app screens.
 * Uses a plain Stack (no tabs) for the kiosk-style child UI.
 */

import { Stack } from "expo-router";
import { AuthProvider } from "@/lib/auth";
import { useProgress } from "@/context/ProgressContext";

function AuthWithProgressSync({ children }: { children: React.ReactNode }) {
  const { syncFromServer } = useProgress();
  return (
    <AuthProvider
      onAuthSuccess={(apiBase, token, userId) =>
        syncFromServer(apiBase, token, userId)
      }
    >
      {children}
    </AuthProvider>
  );
}

export default function AppLayout() {
  return (
    <AuthWithProgressSync>
      <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="grade/[grade]" />
        <Stack.Screen name="book/[grade]/[bookId]" />
        <Stack.Screen name="reading/index" />
        <Stack.Screen name="reading/[id]" />
        <Stack.Screen name="math/index" />
        <Stack.Screen name="math/[id]" />
        <Stack.Screen name="writing/index" />
        <Stack.Screen name="writing/[id]" />
        <Stack.Screen name="unit1/index" />
        <Stack.Screen name="unit1/[id]" />
        <Stack.Screen name="unit2/index" />
        <Stack.Screen name="unit2/[id]" />
        <Stack.Screen name="unit/[unitId]/index" />
        <Stack.Screen name="unit/[unitId]/[lessonId]" />
      </Stack>
    </AuthWithProgressSync>
  );
}
