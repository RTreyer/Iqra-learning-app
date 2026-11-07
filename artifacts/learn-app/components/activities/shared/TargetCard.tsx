import React from "react";
import { Gloss } from "@/components/Gloss";
import { StyleSheet, Text, View } from "react-native";

import { Pressable } from "@/components/demo/DemoPressable";
import { Icon } from "@/components/world/Icon";
import * as haptics from "@/lib/haptics";
import { speak } from "@/lib/speech";
import { readableFill, touchTarget } from "@/theme/tokens";

type Props = { text: string; color: string; testID?: string };

/**
 * The letter to find, big on a card, with a speaker to hear it again (design). No words to
 * read: Hudhud says the task, the card shows what is meant.
 */
export function TargetCard({ text, color, testID = "letter-target" }: Props) {
  const fill = readableFill(color);
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`🔊 ${text}`}
      onPress={() => {
        haptics.tap();
        speak(text);
      }}
      style={({ pressed }) => [styles.card, { borderColor: fill }, pressed && styles.pressed]}
    >
      <Text style={[styles.letter, { color: fill }]}>{text}</Text>
      <Gloss text={text} />
      <View style={[styles.speaker, { backgroundColor: fill }]}>
        <Icon name="speaker" size={26} color="#FFFFFF" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "80%",
    minHeight: 150,
    borderRadius: 28,
    borderWidth: 4,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    boxShadow: "0 6px 0 #D9E1EC",
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  letter: { fontSize: 92, fontWeight: "900", lineHeight: 124 },
  speaker: {
    position: "absolute",
    top: -18,
    left: -18,
    width: touchTarget + 8,
    height: touchTarget + 8,
    borderRadius: (touchTarget + 8) / 2,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
});
