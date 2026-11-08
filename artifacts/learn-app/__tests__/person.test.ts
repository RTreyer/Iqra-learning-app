import { faceFor } from "@/components/world/Person";
import { PICTURES } from "@/components/pictures/registry";

const PEOPLE = ["👨", "👴", "🧕", "👩‍🏫", "👮"];

test("every person of the story has the shared face: two eyes and a smiling mouth", () => {
  for (const emoji of PEOPLE) {
    const { eyes, xml } = faceFor(PICTURES[emoji], "smile");
    expect(eyes).toHaveLength(2);
    expect(xml).toBe(PICTURES[emoji]);
  }
});

test("each mood redraws the face: laughing eyes, round eyes and a round mouth, sad brows", () => {
  const base = PICTURES["👨"];
  const happy = faceFor(base, "happy").xml;
  const wonder = faceFor(base, "wonder").xml;
  const sad = faceFor(base, "sad").xml;
  for (const xml of [happy, wonder, sad]) expect(xml).not.toBe(base);
  // Happy: no open eyes left, an open (filled) smile.
  expect(happy).not.toMatch(/r="2\.2" fill="#2B1D14"/);
  expect(happy).toMatch(/Z" fill="#7A3418"/);
  // Astonished: white eyes and a round mouth.
  expect(wonder).toMatch(/r="3\.7" fill="#FFFFFF"/);
  expect(wonder).toMatch(/<ellipse[^>]*fill="#7A3418"/);
  // A picture without that face (the camel) is left as it is.
  expect(faceFor(PICTURES["🐪"], "happy").xml).toBe(PICTURES["🐪"]);
});
