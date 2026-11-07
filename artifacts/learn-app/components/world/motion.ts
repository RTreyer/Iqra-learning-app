import { Platform } from "react-native";

/**
 * Whether looping animations may run on the native driver. On the web there is no native
 * animated module: React Native Web falls back to JavaScript, but a loop started for the native
 * driver then plays only once. Loops therefore use the JavaScript driver on the web.
 */
export const LOOP_NATIVE = Platform.OS !== "web";
