import React from "react";
import { StyleSheet, View } from "react-native";
import { Pressable } from "@/components/demo/DemoPressable";
import { Pulse } from "@/components/world/Guide";
import { Icon } from "@/components/world/Icon";
import { useLanguage } from "@/context/LanguageContext";
import { readableFill } from "@/theme/tokens";

type Props = {
  /** Spoken and announced name of the step (interface text, translated). */
  label: string;
  color: string;
  onPress: () => void;
  testID?: string;
  disabled?: boolean;
};

/**
 * Continue: one big round play button that breathes, as in the design. No words on it; its
 * name (e.g. the score) is announced for screen readers and parents.
 */
export function DoneButton({ label, color, onPress, testID, disabled }: Props) {
  const { t, digits } = useLanguage();
  const fill = readableFill(color);
  return (
    <Pulse style={styles.wrap}>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={digits(t(label))}
        accessibilityState={{ disabled: !!disabled }}
        disabled={disabled}
        style={[
          styles.btn,
          { backgroundColor: fill, boxShadow: `0 6px 0 ${readableFill(color, 9)}` },
          disabled && styles.disabled,
        ]}
        onPress={onPress}
      >
        <View style={styles.nudge}>
          <Icon name="play" size={40} color="#FFFFFF" />
        </View>
      </Pressable>
    </Pulse>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: "center", marginTop: 12, borderRadius: 999 },
  btn: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 5,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  nudge: { marginLeft: 5 },
  disabled: { opacity: 0.6 },
});
