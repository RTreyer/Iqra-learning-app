/** Four dots and a number pad for the parents' PIN. Digits follow the menu language. */

import React, { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { UiText } from "@/components/UiText";
import { useLanguage } from "@/context/LanguageContext";
import { PIN_LENGTH } from "@/lib/profiles";
import { touchTarget, yemen } from "@/theme/tokens";

const ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", "del"],
];

type Props = {
  title: string;
  /** Shown under the dots after a wrong or mismatched PIN. */
  message?: string | null;
  disabled?: boolean;
  onDone: (pin: string) => void;
};

export function PinPad({ title, message, disabled = false, onDone }: Props) {
  const { t, digits } = useLanguage();
  const [entered, setEntered] = useState("");
  // Fast taps can come before the next render: the digits so far are kept here too.
  const digitsSoFar = useRef("");

  const press = (key: string) => {
    if (disabled) return;
    const next = key === "del" ? digitsSoFar.current.slice(0, -1) : digitsSoFar.current + key;
    const done = next.length === PIN_LENGTH;
    digitsSoFar.current = done ? "" : next;
    setEntered(digitsSoFar.current);
    if (done) onDone(next);
  };

  return (
    <View style={styles.pad}>
      <UiText style={styles.title}>{title}</UiText>
      <View
        testID="pin-dots"
        accessible
        accessibilityLabel={digits(`${entered.length} / ${PIN_LENGTH}`)}
        style={styles.dots}
      >
        {Array.from({ length: PIN_LENGTH }, (_, i) => (
          <View key={i} style={[styles.dot, i < entered.length && styles.dotOn]} />
        ))}
      </View>
      {message ? (
        <UiText testID="pin-message" style={styles.message}>
          {message}
        </UiText>
      ) : null}
      {ROWS.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((key, k) =>
            key === "" ? (
              <View key={k} style={styles.key} />
            ) : (
              <Pressable
                key={k}
                testID={key === "del" ? "pin-delete" : `pin-key-${key}`}
                accessibilityRole="button"
                accessibilityLabel={key === "del" ? t("حذف رقم") : digits(key)}
                accessibilityState={{ disabled }}
                onPress={() => press(key)}
                style={({ pressed }) => [
                  styles.key,
                  styles.keyFace,
                  pressed && styles.pressed,
                  disabled && styles.disabled,
                ]}
              >
                <Text style={styles.keyText}>{key === "del" ? "⌫" : digits(key)}</Text>
              </Pressable>
            ),
          )}
        </View>
      ))}
    </View>
  );
}

const KEY = 72;

const styles = StyleSheet.create({
  pad: { alignItems: "center", gap: 12, paddingVertical: 16 },
  title: { fontSize: 18, fontWeight: "800", color: yemen.ink, textAlign: "center" },
  dots: { flexDirection: "row", gap: 16, marginVertical: 6 },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: yemen.inkSoft,
  },
  dotOn: { backgroundColor: yemen.inkSoft },
  message: { fontSize: 15, color: yemen.red, textAlign: "center", fontWeight: "700" },
  // Number pads read left to right in every language.
  row: { flexDirection: "row", direction: "ltr", gap: 14 },
  key: { width: KEY, height: Math.max(KEY - 8, touchTarget) },
  keyFace: {
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  keyText: { fontSize: 26, fontWeight: "800", color: yemen.ink },
  pressed: { opacity: 0.8, transform: [{ scale: 0.95 }] },
  disabled: { opacity: 0.4 },
});
