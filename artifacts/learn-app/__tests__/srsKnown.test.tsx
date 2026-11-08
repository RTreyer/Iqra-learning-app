import { act, renderHook, waitFor } from "@testing-library/react-native";
import React from "react";

import { ProgressProvider, useProgress } from "@/context/ProgressContext";
import { allItems } from "@/lib/reviewItems";
import { introduce, pickDue } from "@/lib/srs";

const now = new Date(2026, 0, 10, 9);
const due = introduce(new Date(2026, 0, 1, 9));

test("stored ids no longer in the content take no slot and are not counted", () => {
  const real = [...allItems().keys()].slice(0, 10);
  const items = Object.fromEntries([
    ...Array.from({ length: 10 }, (_, i) => [`letter:gone${i}`, due] as const),
    ...real.map((id) => [id, due] as const),
  ]);
  const picked = pickDue(items, now, 10, allItems());
  expect(picked).toHaveLength(10);
  expect(picked.every((id) => allItems().has(id))).toBe(true);
  expect(pickDue({ "letter:gone": due }, now, 10, allItems())).toEqual([]);
});

test("the due list (home badge and review) leaves out ids missing from the content", async () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ProgressProvider>{children}</ProgressProvider>
  );
  const { result } = renderHook(() => useProgress(), { wrapper });
  await waitFor(() => expect(result.current.hydrated).toBe(true));
  act(() => result.current.recordRoundResult("letter:gone", true));
  act(() => result.current.recordRoundResult("count:3", true));
  const later = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  expect(result.current.getDueItemIds(later)).toEqual(["count:3"]);
});
