import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Top and bottom screen padding; web gets a minimum so content clears browser chrome. */
export function useScreenPadding() {
  const insets = useSafeAreaInsets();
  const web = Platform.OS === "web";
  return {
    top: web ? Math.max(insets.top, 67) : insets.top,
    bottom: web ? Math.max(insets.bottom, 34) : insets.bottom,
  };
}
