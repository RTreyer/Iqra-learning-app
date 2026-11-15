/**
 * The lock in front of the parents' corner: the parents' PIN (docs/KINDERPROFILE.md).
 * - No PIN yet: hold the button, then choose a PIN (typed twice).
 * - PIN set: type it. After five wrong tries the pad waits half a minute.
 * - PIN forgotten: hold a button for a long time, then choose a new PIN. The children and their
 *   progress stay as they are; the corner shows when the PIN was changed, so parents notice a
 *   change they did not make.
 */

import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { UiText } from "@/components/UiText";
import { useLanguage } from "@/context/LanguageContext";
import { useProfiles } from "@/context/ProfilesContext";
import { touchTarget, yemen } from "@/theme/tokens";

import { HoldGate } from "./HoldGate";
import { PinPad } from "./PinPad";

/** How long the first gate must be held (no PIN yet). */
export const GATE_HOLD_MS = 1500;
/** How long the "forgot PIN" gate must be held: long, so a child gives up first. */
export const FORGOT_HOLD_MS = 6000;
export const MAX_TRIES = 5;
export const WAIT_MS = 30_000;

/** Choosing a PIN: typed twice, both must match. */
export function PinSetup({ onSaved }: { onSaved: () => void }) {
  const { setPin } = useProfiles();
  const [first, setFirst] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  return (
    <PinPad
      key={first === null ? "first" : "again"}
      title={first === null ? "اختر رمزاً من أربعة أرقام للأهل" : "اكتب الرمز مرة أخرى"}
      message={message}
      onDone={(pin) => {
        if (first === null) {
          setFirst(pin);
          setMessage(null);
        } else if (pin === first) {
          setPin(pin);
          onSaved();
        } else {
          setFirst(null);
          setMessage("الرمزان مختلفان. حاول مرة أخرى.");
        }
      }}
    />
  );
}

type Step = "gate" | "setup" | "enter" | "forgot";

export function ParentsLock({ onOpen }: { onOpen: () => void }) {
  const { hasPin, checkPin } = useProfiles();
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>(hasPin ? "enter" : "gate");
  const [tries, setTries] = useState(0);
  const [waitUntil, setWaitUntil] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // The wait after too many wrong tries ends by itself.
  useEffect(() => {
    if (waitUntil === null) return;
    const timer = setTimeout(
      () => {
        setWaitUntil(null);
        setTries(0);
        setMessage(null);
      },
      Math.max(0, waitUntil - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [waitUntil]);

  if (step === "gate")
    return (
      <HoldGate
        testID="parents-gate"
        text="هذا الركن للأهل. اضغط على الزر مطوّلاً."
        holdMs={GATE_HOLD_MS}
        onOpen={() => setStep("setup")}
      />
    );

  if (step === "setup") return <PinSetup onSaved={onOpen} />;

  if (step === "forgot")
    return (
      <View style={styles.forgot}>
        <HoldGate
          testID="forgot-gate"
          text="يمكنك وضع رمز جديد. يبقى الأطفال وتقدمهم كما هم. اضغط على الزر مطوّلاً."
          holdMs={FORGOT_HOLD_MS}
          onOpen={() => setStep("setup")}
        />
        <Pressable
          testID="forgot-cancel"
          accessibilityRole="button"
          accessibilityLabel={t("رجوع")}
          onPress={() => setStep("enter")}
          style={styles.link}
        >
          <UiText style={styles.linkText}>رجوع</UiText>
        </Pressable>
      </View>
    );

  return (
    <View style={styles.enter}>
      <PinPad
        title="اكتب رمز الأهل"
        message={message}
        disabled={waitUntil !== null}
        onDone={(pin) => {
          if (checkPin(pin)) return onOpen();
          const next = tries + 1;
          setTries(next);
          if (next >= MAX_TRIES) {
            setWaitUntil(Date.now() + WAIT_MS);
            setMessage("انتظر قليلاً ثم حاول مرة أخرى.");
          } else {
            setMessage("الرمز غير صحيح.");
          }
        }}
      />
      <Pressable
        testID="forgot-pin"
        accessibilityRole="button"
        accessibilityLabel={t("نسيت الرمز؟")}
        onPress={() => setStep("forgot")}
        style={styles.link}
      >
        <UiText style={styles.linkText}>نسيت الرمز؟</UiText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  enter: { alignItems: "center" },
  forgot: { alignItems: "center" },
  link: { minHeight: touchTarget, justifyContent: "center", paddingHorizontal: 18 },
  linkText: {
    fontSize: 15,
    fontWeight: "700",
    color: yemen.inkSoft,
    textDecorationLine: "underline",
  },
});
