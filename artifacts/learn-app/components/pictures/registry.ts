import { PICTURES_HOME } from "./home";
import { PICTURES_PLACES } from "./places";
import { PICTURES_THINGS } from "./things";

/** Every drawing, keyed by its emoji without variation selector (see pictureKey). */
export const PICTURES: Record<string, string> = {
  ...PICTURES_HOME,
  ...PICTURES_PLACES,
  ...PICTURES_THINGS,
};
