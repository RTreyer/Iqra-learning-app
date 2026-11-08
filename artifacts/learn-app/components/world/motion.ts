import { useEffect, useState } from "react";
import { Animated, Easing, Platform } from "react-native";

/**
 * Whether looping animations may run on the native driver. On the web there is no native
 * animated module: React Native Web falls back to JavaScript, but a loop started for the native
 * driver then plays only once. Loops therefore use the JavaScript driver on the web.
 */
export const LOOP_NATIVE = Platform.OS !== "web";

/** 0 → 1 in a loop while `run`, after a delay: one cycle of a cartoon movement. */
export function useCycle(run: boolean, duration: number, delay = 0) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!run) {
      v.setValue(0);
      return;
    }
    let loop: Animated.CompositeAnimation | undefined;
    const start = setTimeout(() => {
      loop = Animated.loop(
        Animated.timing(v, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: LOOP_NATIVE,
        }),
      );
      loop.start();
    }, delay);
    return () => {
      clearTimeout(start);
      loop?.stop();
    };
  }, [run, duration, delay, v]);
  return v;
}

/** Keyframes of a cycle: values at points of it, held before the first and after the last. */
export function key(
  v: Animated.Value,
  inputRange: number[],
  outputRange: number[],
): Animated.AnimatedInterpolation<number>;
export function key(
  v: Animated.Value,
  inputRange: number[],
  outputRange: string[],
): Animated.AnimatedInterpolation<string>;
export function key(v: Animated.Value, inputRange: number[], outputRange: number[] | string[]) {
  return v.interpolate({ inputRange, outputRange: outputRange as number[], extrapolate: "clamp" });
}
