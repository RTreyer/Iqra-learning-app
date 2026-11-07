// Import as a namespace: import * as haptics from "../lib/haptics"
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

// Convention: tap on any press, success on correct, error on wrong, warning on invalid trace.
let enabled = true;

/** Parents' switch (context/SettingsContext). */
export function setHapticsEnabled(value: boolean): void {
  enabled = value;
}

const safe = (run: () => Promise<void>) => {
  if (Platform.OS === "web" || !enabled) return;
  try {
    run().catch(() => {});
  } catch {}
};

export const tap = () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
export const success = () =>
  safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
export const error = () =>
  safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
export const warning = () =>
  safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
