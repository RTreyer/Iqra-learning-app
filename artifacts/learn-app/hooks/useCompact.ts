import { useWindowDimensions } from "react-native";

/**
 * Below this window height (small phones such as 360x640, a phone held sideways), lessons use
 * their compact layout, so the answers fit on the first screen without scrolling (UX-01,
 * DSGN-01): a pre-reader does not know the page scrolls.
 */
export const COMPACT_HEIGHT = 700;

export function useCompact(): boolean {
  return useWindowDimensions().height < COMPACT_HEIGHT;
}
