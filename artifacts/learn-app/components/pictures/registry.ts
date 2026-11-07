import { PICTURES_EXAMPLE } from "./example";
import { PICTURES_THINGS } from "./things";

/** Every drawing, keyed by its emoji without variation selector (see pictureKey). */
export const PICTURES: Record<string, string> = {
  ...PICTURES_EXAMPLE,
  ...PICTURES_THINGS,
};
