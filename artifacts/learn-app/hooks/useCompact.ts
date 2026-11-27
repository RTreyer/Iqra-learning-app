import { useWindowDimensions } from "react-native";

/**
 * Below this window height (small phones such as 360x640, a phone held sideways, and most
 * phones once the browser bars take their share), lessons use their compact layout, so the
 * answers fit on the first screen without scrolling (UX-01, DSGN-01): a pre-reader does not
 * know the page scrolls. At 700 px, heights from 700 to about 800 still hid answers
 * (DSGN-R2-01); 390x844 and taller fit without it.
 */
export const COMPACT_HEIGHT = 820;

export function useCompact(): boolean {
  return useWindowDimensions().height < COMPACT_HEIGHT;
}
