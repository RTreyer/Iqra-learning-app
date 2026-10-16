import { Link, Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

import { UiText } from "@/components/UiText";
import { useLanguage } from "@/context/LanguageContext";
import { routes } from "@/lib/routes";
import { colors, touchTarget } from "@/theme/tokens";

export default function NotFoundScreen() {
  const { t } = useLanguage();

  return (
    <>
      <Stack.Screen options={{ title: t("الصفحة غير موجودة") }} />
      <View style={[styles.container, { backgroundColor: colors.cream }]}>
        <UiText style={[styles.title, { color: colors.text }]}>
          الصفحة غير موجودة
        </UiText>

        <Link href={routes.home()} style={styles.link}>
          <UiText style={[styles.linkText, { color: colors.starText }]}>
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
    minHeight: touchTarget,
  },
  linkText: {
    fontSize: 14,
  },
});
