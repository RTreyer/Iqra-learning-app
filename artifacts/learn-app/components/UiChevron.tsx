import { Feather } from "@expo/vector-icons";
import { useLanguage } from "@/context/LanguageContext";

export function UiChevron({ size, color }: { size: number; color: string }) {
  const { language } = useLanguage();
  return <Feather name={language === "en" ? "chevron-right" : "chevron-left"} size={size} color={color} />;
}
