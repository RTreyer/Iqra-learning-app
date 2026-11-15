/**
 * The children on this phone, in the parents' corner: each with its picture, stars and lessons.
 * Parents add a child (name optional, a picture from Yemen), rename it, give it another
 * picture, reset its progress or remove it. Every destructive step asks once more, naming the
 * child. At most MAX_PROFILES children; the last child can only be reset.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { UiText } from "@/components/UiText";
import { AVATARS, Avatar } from "@/components/world/Avatar";
import { useLanguage } from "@/context/LanguageContext";
import { useProfiles } from "@/context/ProfilesContext";
import { useProgress } from "@/context/ProgressContext";
import {
  AVATAR_IDS,
  MAX_NAME_LENGTH,
  MAX_PROFILES,
  progressKey,
  type AvatarId,
  type Profile,
} from "@/lib/profiles";
import { upgradeState, type ProgressState } from "@/lib/progressState";
import { touchTarget, yemen } from "@/theme/tokens";

type Summary = { stars: number; lessons: number };

function summarize(progress: ProgressState): Summary {
  return {
    stars: progress.totalStars,
    lessons: Object.values(progress.lessons).filter((l) => l.completed).length,
  };
}

/** Stars and lessons of every child: the active one live, the others as stored. */
function useSummaries(profiles: Profile[], activeId: string, live: ProgressState, version: number) {
  const [stored, setStored] = useState<Record<string, Summary>>({});
  const others = profiles
    .filter((p) => p.id !== activeId)
    .map((p) => p.id)
    .join(",");
  useEffect(() => {
    let alive = true;
    const ids = others ? others.split(",") : [];
    void Promise.all(
      ids.map(async (id): Promise<[string, Summary]> => {
        try {
          const raw = await AsyncStorage.getItem(progressKey(id));
          return [id, summarize(upgradeState(raw ? JSON.parse(raw) : null))];
        } catch {
          return [id, { stars: 0, lessons: 0 }];
        }
      }),
    ).then((entries) => {
      if (alive) setStored(Object.fromEntries(entries));
    });
    return () => {
      alive = false;
    };
  }, [others, version]);
  return (id: string): Summary =>
    id === activeId ? summarize(live) : (stored[id] ?? { stars: 0, lessons: 0 });
}

/** Pictures a child may take: its own and every one no other child has. */
function choosable(profiles: Profile[], id: string | null): AvatarId[] {
  return AVATAR_IDS.filter((a) => !profiles.some((p) => p.id !== id && p.avatar === a));
}

function AvatarChoice({
  options,
  value,
  onChange,
}: {
  options: AvatarId[];
  value: AvatarId;
  onChange: (id: AvatarId) => void;
}) {
  const { t } = useLanguage();
  return (
    <View style={styles.avatarGrid}>
      {options.map((id) => (
        <Pressable
          key={id}
          testID={`choose-avatar-${id}`}
          accessibilityRole="button"
          accessibilityLabel={t(AVATARS[id].label)}
          accessibilityState={{ selected: id === value }}
          onPress={() => onChange(id)}
          style={[styles.avatarOption, id === value && styles.avatarSelected]}
        >
          <Avatar id={id} size={52} />
        </Pressable>
      ))}
    </View>
  );
}

function Button({
  testID,
  label,
  color,
  onPress,
}: {
  testID: string;
  label: string;
  color: string;
  onPress: () => void;
}) {
  const { t } = useLanguage();
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={t(label)}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: color },
        pressed && styles.pressed,
      ]}
    >
      <UiText style={styles.buttonText}>{label}</UiText>
    </Pressable>
  );
}

/** Name and picture, for a new child or one being edited. */
function ChildForm({
  initialName,
  options,
  initialAvatar,
  submitLabel,
  testID,
  onSubmit,
}: {
  initialName: string;
  options: AvatarId[];
  initialAvatar: AvatarId;
  submitLabel: string;
  testID: string;
  onSubmit: (name: string, avatar: AvatarId) => void;
}) {
  const { t, language } = useLanguage();
  const [name, setName] = useState(initialName);
  const [avatar, setAvatar] = useState(initialAvatar);
  const align = { textAlign: language === "en" ? "left" : "right" } as const;
  return (
    <View style={styles.form}>
      <UiText style={[styles.label, align]}>الاسم (اختياري)</UiText>
      <TextInput
        testID="child-name"
        accessibilityLabel={t("الاسم (اختياري)")}
        value={name}
        onChangeText={setName}
        maxLength={MAX_NAME_LENGTH}
        style={[styles.input, align]}
      />
      <UiText style={[styles.label, align]}>الصورة</UiText>
      <AvatarChoice options={options} value={avatar} onChange={setAvatar} />
      <Button
        testID={testID}
        label={submitLabel}
        color={yemen.green}
        onPress={() => onSubmit(name, avatar)}
      />
    </View>
  );
}

type Confirm = { kind: "reset" | "remove"; id: string } | null;

export function ChildrenCard() {
  const { t, digits, language } = useLanguage();
  const { profiles, active, add, update, remove, removeStoredProgress } = useProfiles();
  const { progress, resetProgress } = useProgress();
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [version, setVersion] = useState(0);
  const summaryOf = useSummaries(profiles, active.id, progress, version);
  const row = { flexDirection: language === "en" ? "row" : "row-reverse" } as const;
  const align = { textAlign: language === "en" ? "left" : "right" } as const;
  const full = profiles.length >= MAX_PROFILES || choosable(profiles, null).length === 0;

  const runConfirmed = async (c: NonNullable<Confirm>) => {
    if (c.kind === "remove") {
      await remove(c.id);
      setOpen(null);
    } else if (c.id === active.id) {
      await resetProgress();
    } else {
      await removeStoredProgress(c.id);
    }
    setConfirm(null);
    setVersion((v) => v + 1);
  };

  return (
    <View testID="children-card" style={styles.card}>
      <UiText style={[styles.cardTitle, align]}>الأطفال</UiText>
      {profiles.map((profile) => {
        const { stars, lessons } = summaryOf(profile.id);
        const isOpen = open === profile.id;
        const label = profile.name || t(AVATARS[profile.avatar].label);
        return (
          <View key={profile.id} style={styles.child}>
            <Pressable
              testID={`child-${profile.id}`}
              accessibilityRole="button"
              accessibilityLabel={`${label}، ${t("النجوم")} ${digits(stars)}، ${t("الدروس")} ${digits(lessons)}`}
              accessibilityState={{ expanded: isOpen }}
              onPress={() => {
                setOpen(isOpen ? null : profile.id);
                setConfirm(null);
                setAdding(false);
              }}
              style={[styles.childRow, row]}
            >
              <Avatar id={profile.avatar} size={44} />
              <View style={styles.childText}>
                <Text style={[styles.childName, align]} numberOfLines={1}>
                  {label}
                </Text>
                {/* Two separate runs, so Arabic words and digits keep their order. */}
                <View style={[styles.stats, row]}>
                  <Text style={styles.childStats}>{`⭐ ${digits(stars)}`}</Text>
                  <Text style={styles.childStats}>{`${t("الدروس")}: ${digits(lessons)}`}</Text>
                </View>
              </View>
              {profile.id === active.id && profiles.length > 1 ? (
                <UiText style={styles.activeTag}>يتعلّم الآن</UiText>
              ) : null}
            </Pressable>

            {isOpen ? (
              <View style={styles.editor}>
                <ChildForm
                  initialName={profile.name}
                  options={choosable(profiles, profile.id)}
                  initialAvatar={profile.avatar}
                  submitLabel="حفظ"
                  testID="child-save"
                  onSubmit={(name, avatar) => {
                    update(profile.id, { name, avatar });
                    setOpen(null);
                  }}
                />
                {confirm?.id === profile.id ? (
                  <View style={styles.danger}>
                    <UiText style={[styles.dangerText, align]}>
                      {confirm.kind === "remove"
                        ? "سيُحذف هذا الطفل وكل تقدمه. لا يمكن التراجع."
                        : "سيُمسح تقدم هذا الطفل: النجوم والدروس والملصقات. لا يمكن التراجع."}
                    </UiText>
                    <View style={[styles.dangerChild, row]}>
                      <Avatar id={profile.avatar} size={32} />
                      <Text style={styles.childName}>{label}</Text>
                    </View>
                    <View style={[styles.buttons, row]}>
                      <Button
                        testID="child-confirm"
                        label={confirm.kind === "remove" ? "نعم، احذف" : "نعم، امسح التقدم"}
                        color={yemen.red}
                        onPress={() => void runConfirmed(confirm)}
                      />
                      <Button
                        testID="child-cancel"
                        label="إلغاء"
                        color={yemen.inkSoft}
                        onPress={() => setConfirm(null)}
                      />
                    </View>
                  </View>
                ) : (
                  <View style={[styles.buttons, row]}>
                    <Button
                      testID={`child-reset-${profile.id}`}
                      label="مسح التقدم"
                      color={yemen.clay}
                      onPress={() => setConfirm({ kind: "reset", id: profile.id })}
                    />
                    {profiles.length > 1 ? (
                      <Button
                        testID={`child-remove-${profile.id}`}
                        label="حذف الطفل"
                        color={yemen.red}
                        onPress={() => setConfirm({ kind: "remove", id: profile.id })}
                      />
                    ) : null}
                  </View>
                )}
              </View>
            ) : null}
          </View>
        );
      })}

      {adding ? (
        <View style={styles.editor}>
          <ChildForm
            initialName=""
            options={choosable(profiles, null)}
            initialAvatar={choosable(profiles, null)[0]}
            submitLabel="إضافة"
            testID="child-add-save"
            onSubmit={(name, avatar) => {
              add({ name, avatar });
              setAdding(false);
            }}
          />
        </View>
      ) : full ? (
        <UiText
          style={[styles.note, align]}
        >{`${digits(MAX_PROFILES)} ${t("أطفال على الأكثر.")}`}</UiText>
      ) : (
        <Button
          testID="child-add"
          label="إضافة طفل"
          color={yemen.green}
          onPress={() => {
            setAdding(true);
            setOpen(null);
            setConfirm(null);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 14, gap: 10 },
  cardTitle: { fontSize: 17, fontWeight: "800", color: yemen.ink },
  child: { gap: 8 },
  childRow: { alignItems: "center", gap: 12, minHeight: touchTarget },
  childText: { flex: 1, gap: 2 },
  childName: { fontSize: 16, fontWeight: "800", color: yemen.ink },
  stats: { gap: 14 },
  childStats: { fontSize: 13, color: yemen.inkSoft },
  activeTag: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
    backgroundColor: yemen.green,
    borderRadius: 10,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  editor: { backgroundColor: "#F8F3EA", borderRadius: 14, padding: 12, gap: 10 },
  form: { gap: 8 },
  label: { fontSize: 14, fontWeight: "700", color: yemen.inkSoft },
  input: {
    minHeight: touchTarget,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E2D6C3",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    fontSize: 17,
    color: yemen.ink,
  },
  avatarGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  avatarOption: {
    minWidth: touchTarget,
    minHeight: touchTarget,
    padding: 3,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: "transparent",
  },
  avatarSelected: { borderColor: yemen.green },
  buttons: { gap: 10 },
  button: {
    flex: 1,
    minHeight: touchTarget,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  buttonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800", textAlign: "center" },
  danger: { borderWidth: 2, borderColor: yemen.red, borderRadius: 14, padding: 10, gap: 8 },
  dangerText: { fontSize: 15, color: yemen.ink, lineHeight: 22 },
  dangerChild: { alignItems: "center", gap: 8 },
  note: { fontSize: 13, color: yemen.inkSoft },
  pressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
});
