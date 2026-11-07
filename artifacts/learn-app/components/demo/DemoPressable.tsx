import React, { forwardRef, useMemo, useRef, type ComponentRef, type Ref } from "react";
import {
  Pressable as RNPressable,
  type GestureResponderEvent,
  type PressableProps,
} from "react-native";

import { useLatest } from "@/components/activities/shared/useLatest";
import { measureNode, useDemoEntry } from "./DemoContext";

/**
 * React Native's Pressable that the demo hand can find (by testID or accessibility label)
 * and press. Outside a demo it is a plain Pressable.
 */
type Node = ComponentRef<typeof RNPressable>;

export const Pressable = forwardRef(function DemoPressable(props: PressableProps, ref: Ref<Node>) {
  const node = useRef<Node | null>(null);
  const latest = useLatest(props);
  const { testID, accessibilityLabel } = props;
  const entry = useMemo(
    () => ({
      testID,
      label: accessibilityLabel,
      measure: () => measureNode(node.current),
      press: () => {
        const { disabled, onPress } = latest.current;
        if (!disabled) onPress?.(undefined as unknown as GestureResponderEvent);
      },
    }),
    [testID, accessibilityLabel, latest],
  );
  useDemoEntry(entry);
  return (
    <RNPressable
      {...props}
      ref={(value) => {
        node.current = value;
        if (typeof ref === "function") ref(value);
        else if (ref) ref.current = value;
      }}
    />
  );
});
