import { render, screen } from "@testing-library/react-native";
import React from "react";

import { lessonPicture } from "@/components/world/lessonPicture";

test("a missing-number exercise is pictured as two numbers with the dashed box between them", () => {
  render(<>{lessonPicture("number_fill", "#FFFFFF", 32)}</>);
  const picture = screen.getByTestId("picture-gap");
  expect(picture).toHaveTextContent(/٢/);
  expect(picture).toHaveTextContent(/٤/);
});
