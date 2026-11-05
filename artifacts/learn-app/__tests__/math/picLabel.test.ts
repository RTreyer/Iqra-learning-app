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
});

test("a group is its labels joined", () => {
  expect(groupLabel([{ emoji: "🍎" }, { emoji: "🍎" }])).toBe("🍎 🍎");
});
