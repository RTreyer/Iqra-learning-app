/**
 * Children's profiles on one family phone (docs/KINDERPROFILE.md). Pure rules, no React and no
 * storage IO, so every rule is unit tested directly.
 *
 * Everything stays on the phone: there is no account, no email and no server. The first
 * profile ("main") keeps the storage keys the app used before profiles existed, so an update
 * never moves or copies a child's progress.
 */

/** Profile list, active profile and the parents' PIN. */
export const PROFILES_KEY = "@iqra_profiles_v1";
/** The profile every phone starts with; it owns the keys from before profiles existed. */
export const FIRST_PROFILE_ID = "main";
export const MAX_PROFILES = 8;
export const PIN_LENGTH = 4;
/** Names are for the parents; long ones do not fit under the picture. */
export const MAX_NAME_LENGTH = 20;

/** Pictures from Yemen a child recognises as its own (components/world/Avatar.tsx draws them). */
export const AVATAR_IDS = [
  "camel",
  "palm",
  "dhow",
  "coffee",
  "house",
  "turtle",
  "leopard",
  "dragontree",
  "ibex",
  "coffeepot",
] as const;
export type AvatarId = (typeof AVATAR_IDS)[number];

export type Profile = {
  id: string;
  /** Optional, for the parents; the child finds itself by its picture. */
  name: string;
  avatar: AvatarId;
  createdAt: string;
};

/**
 * The parents' PIN, hashed with a salt. It keeps children out of the parents' corner; it is
 * not meant to stop an attacker (four digits are quickly tried), so a simple hash is enough.
 */
export type PinRecord = { salt: string; hash: string; changedAt: string };

export type ProfilesState = {
  version: 1;
  profiles: Profile[];
  activeId: string;
  pin: PinRecord | null;
};

// ─── Storage keys per profile ────────────────────────────────────────────────

/** Keys from before profiles existed; the first profile keeps using them. */
export const LEGACY_PROGRESS_KEY = "@kidlearn_progress_v1";
export const LEGACY_SETTINGS_KEY = "@iqra_settings_v1";
export const LEGACY_DEMO_SEEN_KEY = "@iqra_demo_seen_v1";

function keyFor(legacy: string, id: string): string {
  return id === FIRST_PROFILE_ID ? legacy : `${legacy}:${id}`;
}

/** Lessons, stars and review items of one child. */
export function progressKey(id: string): string {
  return keyFor(LEGACY_PROGRESS_KEY, id);
}

/**
 * The child's own settings (story told, chosen subject, chapters told). For the first profile
 * they stay inside the shared settings blob, next to the phone's switches, as before.
 */
export function childSettingsKey(id: string): string {
  return keyFor(LEGACY_SETTINGS_KEY, id);
}

/** Worked examples the child has seen. */
export function demoSeenKey(id: string): string {
  return keyFor(LEGACY_DEMO_SEEN_KEY, id);
}

/**
 * What to remove when a profile is deleted. The first profile's settings blob also holds the
 * phone's switches, so it is never removed; its child fields simply stay unused.
 */
export function profileStorageKeys(id: string): string[] {
  const keys = [progressKey(id), demoSeenKey(id)];
  if (id !== FIRST_PROFILE_ID) keys.push(childSettingsKey(id));
  return keys;
}

// ─── State rules ─────────────────────────────────────────────────────────────

function isAvatar(value: unknown): value is AvatarId {
  return typeof value === "string" && (AVATAR_IDS as readonly string[]).includes(value);
}

export function cleanName(name: string): string {
  return name.replace(/\s+/g, " ").trim().slice(0, MAX_NAME_LENGTH);
}

export function createDefaultProfiles(now: Date = new Date()): ProfilesState {
  return {
    version: 1,
    profiles: [{ id: FIRST_PROFILE_ID, name: "", avatar: "camel", createdAt: now.toISOString() }],
    activeId: FIRST_PROFILE_ID,
    pin: null,
  };
}

function parsePin(value: unknown): PinRecord | null {
  if (typeof value !== "object" || value === null) return null;
  const { salt, hash, changedAt } = value as Record<string, unknown>;
  if (typeof salt !== "string" || typeof hash !== "string" || typeof changedAt !== "string")
    return null;
  return { salt, hash, changedAt };
}

/**
 * Keeps only valid profiles from whatever was stored. Returns null when the stored value is not
 * a profile list at all, so the caller can keep it instead of overwriting it.
 */
export function parseProfiles(raw: unknown, now: Date = new Date()): ProfilesState | null {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return null;
  const value = raw as Record<string, unknown>;
  if (!Array.isArray(value.profiles)) return null;
  const seen = new Set<string>();
  const profiles: Profile[] = [];
  for (const entry of value.profiles) {
    if (typeof entry !== "object" || entry === null) continue;
    const p = entry as Record<string, unknown>;
    if (typeof p.id !== "string" || !p.id || seen.has(p.id) || !isAvatar(p.avatar)) continue;
    seen.add(p.id);
    profiles.push({
      id: p.id,
      name: typeof p.name === "string" ? cleanName(p.name) : "",
      avatar: p.avatar,
      createdAt: typeof p.createdAt === "string" ? p.createdAt : now.toISOString(),
    });
    if (profiles.length === MAX_PROFILES) break;
  }
  if (profiles.length === 0) return null;
  const activeId =
    typeof value.activeId === "string" && seen.has(value.activeId)
      ? value.activeId
      : profiles[0].id;
  return { version: 1, profiles, activeId, pin: parsePin(value.pin) };
}

/** Pictures no other child uses yet (the profile `exceptId` may keep its own). */
export function freeAvatars(state: ProfilesState, exceptId?: string): AvatarId[] {
  const taken = new Set(state.profiles.filter((p) => p.id !== exceptId).map((p) => p.avatar));
  return AVATAR_IDS.filter((id) => !taken.has(id));
}

export function canAddProfile(state: ProfilesState): boolean {
  return state.profiles.length < MAX_PROFILES && freeAvatars(state).length > 0;
}

export function newProfileId(now: Date = new Date(), random: () => number = Math.random): string {
  return `c${now.getTime().toString(36)}${Math.floor(random() * 36 ** 4)
    .toString(36)
    .padStart(4, "0")}`;
}

/** Adds a child; unchanged when the phone is full or the picture is taken. */
export function addProfile(
  state: ProfilesState,
  input: { name: string; avatar: AvatarId },
  id: string,
  now: Date = new Date(),
): ProfilesState {
  if (!canAddProfile(state) || !freeAvatars(state).includes(input.avatar)) return state;
  if (state.profiles.some((p) => p.id === id)) return state;
  const profile: Profile = {
    id,
    name: cleanName(input.name),
    avatar: input.avatar,
    createdAt: now.toISOString(),
  };
  return { ...state, profiles: [...state.profiles, profile] };
}

/** Renames a child or gives it another free picture. */
export function updateProfile(
  state: ProfilesState,
  id: string,
  patch: { name?: string; avatar?: AvatarId },
): ProfilesState {
  if (patch.avatar && !freeAvatars(state, id).includes(patch.avatar)) return state;
  return {
    ...state,
    profiles: state.profiles.map((p) =>
      p.id === id
        ? {
            ...p,
            ...(patch.name !== undefined ? { name: cleanName(patch.name) } : {}),
            ...(patch.avatar ? { avatar: patch.avatar } : {}),
          }
        : p,
    ),
  };
}

/** Removes a child. The last profile stays (it can only be reset). */
export function removeProfile(state: ProfilesState, id: string): ProfilesState {
  if (state.profiles.length <= 1 || !state.profiles.some((p) => p.id === id)) return state;
  const profiles = state.profiles.filter((p) => p.id !== id);
  const activeId = state.activeId === id ? profiles[0].id : state.activeId;
  return { ...state, profiles, activeId };
}

export function setActiveProfile(state: ProfilesState, id: string): ProfilesState {
  if (state.activeId === id || !state.profiles.some((p) => p.id === id)) return state;
  return { ...state, activeId: id };
}

export function activeProfile(state: ProfilesState): Profile {
  return state.profiles.find((p) => p.id === state.activeId) ?? state.profiles[0];
}

// ─── PIN ─────────────────────────────────────────────────────────────────────

export function isValidPin(pin: string): boolean {
  return new RegExp(`^\\d{${PIN_LENGTH}}$`).test(pin);
}

/** FNV-1a, repeated: enough to not keep the PIN readable on the phone (see PinRecord). */
export function hashPin(pin: string, salt: string): string {
  let text = `${salt}:${pin}`;
  let hash = 0x811c9dc5;
  for (let round = 0; round < 1000; round++) {
    hash = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    text = `${salt}${hash.toString(16)}${pin}`;
  }
  return hash.toString(16).padStart(8, "0");
}

export function makePin(
  pin: string,
  now: Date = new Date(),
  random: () => number = Math.random,
): PinRecord {
  const salt = Math.floor(random() * 0xffffffff)
    .toString(16)
    .padStart(8, "0");
  return { salt, hash: hashPin(pin, salt), changedAt: now.toISOString() };
}

export function checkPin(record: PinRecord | null, pin: string): boolean {
  return record !== null && isValidPin(pin) && hashPin(pin, record.salt) === record.hash;
}

/** A new PIN, e.g. after it was forgotten. The children and their progress stay as they are. */
export function setPin(state: ProfilesState, pin: PinRecord): ProfilesState {
  return { ...state, pin };
}
