import { groupLabel, picLabel } from "@/content/math/picLabel";

test("names shape, colour and size with the right gender", () => {
  expect(picLabel({ shape: "triangle", color: "red", size: "big" })).toBe(
    "مُثَلَّثٌ أَحْمَرُ كَبِيرٌ",
  );
  expect(picLabel({ shape: "circle", color: "blue", size: "small" })).toBe(
    "دَائِرَةٌ زَرْقَاءُ صَغِيرَةٌ",
  );
  expect(picLabel({ shape: "square", color: "green" })).toBe("مُرَبَّعٌ أَخْضَرُ");
});

test("names shading and crossing out", () => {
  expect(picLabel({ shape: "circle", color: "yellow", shaded: "half" })).toBe(
    "دَائِرَةٌ صَفْرَاءُ، النِّصْفُ مُلَوَّنٌ",
  );
  expect(picLabel({ emoji: "🍎", crossed: true })).toBe("🍎 مَشْطُوبٌ");
  expect(picLabel({ shape: "circle", color: "blue", crossed: true })).toBe(
    "دَائِرَةٌ زَرْقَاءُ مَشْطُوبَةٌ",
  );
  expect(picLabel({ shape: "square", color: "red", crossed: true, shaded: "half" })).toBe(
    "مُرَبَّعٌ أَحْمَرُ مَشْطُوبٌ، النِّصْفُ مُلَوَّنٌ",
  );
});

test("an emoji names its size, then crossing out", () => {
  expect(picLabel({ emoji: "🍎", size: "big" })).toBe("🍎 كَبِيرٌ");
  expect(picLabel({ emoji: "🍎", size: "small", crossed: true })).toBe("🍎 صَغِيرٌ مَشْطُوبٌ");
});

test("a group is its labels joined", () => {
  expect(groupLabel([{ emoji: "🍎" }, { emoji: "🍎" }])).toBe("🍎 🍎");
});

test("the empty group is spoken as empty", () => {
  expect(groupLabel([])).toBe("فَارِغٌ");
});
