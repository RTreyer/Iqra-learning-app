import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Top and bottom screen padding; web gets a small minimum since browsers report no insets. */
export function useScreenPadding() {
  const insets = useSafeAreaInsets();
  const web = Platform.OS === "web";
  return {
    top: web ? Math.max(insets.top, 20) : insets.top,
    bottom: web ? Math.max(insets.bottom, 34) : insets.bottom,
  };
}
