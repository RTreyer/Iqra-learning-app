import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { UiText } from "@/components/UiText";
import { useLanguage } from "@/context/LanguageContext";

export default function NotFoundScreen() {
  const { t } = useLanguage();
  const colors = useColors();

  return (
    <>
      <Stack.Screen options={{ title: t("الصفحة غير موجودة") }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <UiText style={[styles.title, { color: colors.foreground }]}>
          الصفحة غير موجودة
        </UiText>

        <Link href="/" style={styles.link}>
          <UiText style={[styles.linkText, { color: colors.primary }]}>
            العودة إلى الرئيسية
          </UiText>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
  },
});
