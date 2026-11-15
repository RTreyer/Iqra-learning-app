/**
 * A child's picture: something from Yemen on a coloured disc. A child who cannot read yet finds
 * its own profile by it. Six reuse the exercise drawings, four are drawn for the profiles.
 */

import React, { memo } from "react";
import { View } from "react-native";
import { SvgXml } from "react-native-svg";

import { PICTURES } from "@/components/pictures/registry";
import type { AvatarId, Profile } from "@/lib/profiles";

import { AVATAR_ART } from "./avatarArt";

type AvatarInfo = { label: string; color: string; art: string };

export const AVATARS: Record<AvatarId, AvatarInfo> = {
  camel: { label: "جَمَل", color: "#F6E3C0", art: PICTURES["🐪"] },
  palm: { label: "نَخْلَة", color: "#DCEFD6", art: PICTURES["🌴"] },
  dhow: { label: "سَفِينَة", color: "#D5E7F8", art: PICTURES["⛵"] },
  coffee: { label: "بُنّ", color: "#F8DAD3", art: PICTURES["🍒"] },
  house: { label: "بَيْت", color: "#F1DCC9", art: PICTURES["🏠"] },
  turtle: { label: "سُلَحْفَاة", color: "#D3EEE6", art: PICTURES["🐢"] },
  leopard: { label: "نَمِر", color: "#FBE9B8", art: AVATAR_ART.leopard },
  dragontree: { label: "شَجَرَةُ دَمِ الأَخَوَيْن", color: "#E4EFD2", art: AVATAR_ART.dragontree },
  ibex: { label: "وَعِل", color: "#EADFD0", art: AVATAR_ART.ibex },
  coffeepot: { label: "دَلَّة", color: "#F5E4C4", art: AVATAR_ART.coffeepot },
};

/** The name the parents gave, or else what the picture shows. */
export function profileLabel(profile: Profile): string {
  return profile.name || AVATARS[profile.avatar].label;
}

const xmlCache = new Map<AvatarId, string>();
function xmlFor(id: AvatarId): string {
  let xml = xmlCache.get(id);
  if (!xml) {
    xml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${AVATARS[id].art}</svg>`;
    xmlCache.set(id, xml);
  }
  return xml;
}

export const Avatar = memo(function Avatar({ id, size }: { id: AvatarId; size: number }) {
  const inner = Math.round(size * 0.76);
  return (
    <View
      testID={`avatar-${id}`}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: AVATARS[id].color,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <SvgXml xml={xmlFor(id)} width={inner} height={inner} />
    </View>
  );
});
