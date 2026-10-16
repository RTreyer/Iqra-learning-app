import React, { useCallback, useState } from "react";
import { Animated, Pressable, Text } from "react-native";
import { UiText } from "@/components/UiText";
import * as haptics from "@/lib/haptics";
import { speak } from "@/lib/speech";
import { act } from "./styles";

type Props = { text: string; color: string; showText?: boolean };

/** Big speaker button that replays the round prompt. */
export function ListenButton({ text, color, showText }: Props) {
  const [scale] = useState(() => new Animated.Value(1));
  const handlePress = useCallback(() => {
    speak(text);
    haptics.tap();
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.2, useNativeDriver: true, speed: 30 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
  }, [text, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        testID="listen-button"
        accessibilityRole="button"
        accessibilityLabel={`🔊 ${text}`}
        style={[act.listenBtn, { backgroundColor: color }]}
        onPress={handlePress}
      >
        <Text style={act.listenEmoji}>🔊</Text>
        {showText ? <Text style={act.listenBtnText}>{text}</Text> : null}
        <UiText style={act.listenHint}>اضغط للاستماع</UiText>
      </Pressable>
    </Animated.View>
  );
}
