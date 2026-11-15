import {
  AVATAR_IDS,
  FIRST_PROFILE_ID,
  MAX_PROFILES,
  addProfile,
  checkPin,
  childSettingsKey,
  createDefaultProfiles,
  demoSeenKey,
  freeAvatars,
  makePin,
  parseProfiles,
  profileStorageKeys,
  progressKey,
  removeProfile,
  setActiveProfile,
  updateProfile,
  type ProfilesState,
} from "@/lib/profiles";

const NOW = new Date("2026-11-15T10:00:00.000Z");

function family(n: number): ProfilesState {
  let state = createDefaultProfiles(NOW);
  for (let i = 1; i < n; i++)
    state = addProfile(state, { name: `child ${i}`, avatar: freeAvatars(state)[0] }, `c${i}`, NOW);
  return state;
}

test("the first child keeps the keys from before profiles existed", () => {
  expect(progressKey(FIRST_PROFILE_ID)).toBe("@kidlearn_progress_v1");
  expect(childSettingsKey(FIRST_PROFILE_ID)).toBe("@iqra_settings_v1");
  expect(demoSeenKey(FIRST_PROFILE_ID)).toBe("@iqra_demo_seen_v1");
  expect(progressKey("c1")).toBe("@kidlearn_progress_v1:c1");
  expect(childSettingsKey("c1")).toBe("@iqra_settings_v1:c1");
});

test("deleting the first child never removes the shared settings blob", () => {
  expect(profileStorageKeys(FIRST_PROFILE_ID)).not.toContain("@iqra_settings_v1");
  expect(profileStorageKeys("c1")).toEqual([
    "@kidlearn_progress_v1:c1",
    "@iqra_demo_seen_v1:c1",
    "@iqra_settings_v1:c1",
  ]);
});

test("a phone holds at most eight children, each with its own picture", () => {
  const full = family(MAX_PROFILES);
  expect(full.profiles).toHaveLength(MAX_PROFILES);
  expect(new Set(full.profiles.map((p) => p.avatar)).size).toBe(MAX_PROFILES);
  const ninth = addProfile(full, { name: "", avatar: freeAvatars(full)[0] }, "c9", NOW);
  expect(ninth).toBe(full);
  expect(AVATAR_IDS.length).toBeGreaterThanOrEqual(MAX_PROFILES);
});

test("a picture another child has is refused", () => {
  const state = family(2);
  expect(addProfile(state, { name: "", avatar: "camel" }, "c5", NOW)).toBe(state);
  expect(updateProfile(state, "c1", { avatar: "camel" })).toBe(state);
  // A child may keep its own picture.
  expect(updateProfile(state, "c1", { avatar: state.profiles[1].avatar }).profiles[1].avatar).toBe(
    state.profiles[1].avatar,
  );
});

test("names are trimmed and kept short", () => {
  const state = updateProfile(family(1), "main", { name: "   فاطمة    الزهراء  " });
  expect(state.profiles[0].name).toBe("فاطمة الزهراء");
  expect(updateProfile(state, "main", { name: "ا".repeat(50) }).profiles[0].name).toHaveLength(20);
});

test("removing the active child makes another one active; the last child stays", () => {
  const state = setActiveProfile(family(3), "c2");
  const removed = removeProfile(state, "c2");
  expect(removed.profiles.map((p) => p.id)).toEqual(["main", "c1"]);
  expect(removed.activeId).toBe("main");
  const one = family(1);
  expect(removeProfile(one, "main")).toBe(one);
});

test("stored profiles are checked; unknown content is not taken for a profile list", () => {
  expect(parseProfiles(null)).toBeNull();
  expect(parseProfiles("text")).toBeNull();
  expect(parseProfiles({ profiles: [] })).toBeNull();
  const parsed = parseProfiles(
    {
      profiles: [
        { id: "main", name: 5, avatar: "camel" },
        { id: "main", name: "duplicate", avatar: "palm" },
        { id: "c1", name: "ok", avatar: "not-a-picture" },
        { id: "c2", name: "ok", avatar: "ibex", createdAt: "2026-11-01" },
      ],
      activeId: "gone",
      pin: { salt: 1 },
    },
    NOW,
  );
  expect(parsed).toEqual({
    version: 1,
    profiles: [
      { id: "main", name: "", avatar: "camel", createdAt: NOW.toISOString() },
      { id: "c2", name: "ok", avatar: "ibex", createdAt: "2026-11-01" },
    ],
    activeId: "main",
    pin: null,
  });
});

test("the PIN is checked against its hash and never stored as typed", () => {
  const pin = makePin("2580", NOW, () => 0.5);
  expect(JSON.stringify(pin)).not.toContain("2580");
  expect(checkPin(pin, "2580")).toBe(true);
  expect(checkPin(pin, "2581")).toBe(false);
  expect(checkPin(pin, "258")).toBe(false);
  expect(checkPin(null, "2580")).toBe(false);
  // Another salt gives another hash for the same PIN.
  expect(makePin("2580", NOW, () => 0.25).hash).not.toBe(pin.hash);
});
