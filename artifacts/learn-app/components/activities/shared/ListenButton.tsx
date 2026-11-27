import React, { useCallback, useState } from "react";
import { Gloss, useLine } from "@/components/Gloss";
import { Icon } from "@/components/world/Icon";
import { Animated, Pressable, Text, View } from "react-native";
import { UiText } from "@/components/UiText";
import { useLanguage } from "@/context/LanguageContext";
import { useCompact } from "@/hooks/useCompact";
import * as haptics from "@/lib/haptics";
import { readableFill } from "@/theme/tokens";
import { speak } from "@/lib/speech";
import { act } from "./styles";

type Props = { text: string; color: string; showText?: boolean };

/**
 * Big speaker button that replays the round prompt. On a short screen it is one slim row
 * (speaker beside the text, no "tap to listen"), so the answers below stay on screen.
 */
export function ListenButton({ text, color, showText }: Props) {
  const { t, language } = useLanguage();
  const compact = useCompact();
  const line = useLine();
  const [scale] = useState(() => new Animated.Value(1));
  const handlePress = useCallback(() => {
    speak(text);
    haptics.tap();
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.2, useNativeDriver: true, speed: 30 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
  }, [text, scale]);

  const words = (
    <>
      {showText ? (
        <Text style={[act.listenBtnText, compact && act.listenBtnTextCompact]}>{line(text)}</Text>
      ) : null}
      {/* A question is shown in English already; a word keeps its meaning below it. */}
      {line(text) === text ? <Gloss text={text} style={act.listenGloss} /> : null}
    </>
  );

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        testID="listen-button"
        accessibilityRole="button"
        accessibilityLabel={`${t("اضغط للاستماع")}: ${text}`}
        style={[
          act.listenBtn,
          compact && act.listenBtnCompact,
          compact && { flexDirection: language === "en" ? "row" : "row-reverse" },
          { backgroundColor: readableFill(color) },
        ]}
        onPress={handlePress}
      >
        {/* Never squeezed by a long question beside it (DSGN-R2). */}
        <View style={act.listenIcon}>
          <Icon name="speaker" size={compact ? 30 : 40} color="#FFFFFF" />
        </View>
        {compact ? <View style={act.listenTextCompact}>{words}</View> : words}
        {compact ? null : <UiText style={act.listenHint}>اضغط للاستماع</UiText>}
      </Pressable>
    </Animated.View>
  );
}
