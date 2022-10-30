//App.spec.tsx
import { Input } from "../src/ui/core/input/input";
import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react-native";

afterEach(cleanup);

test("STextInput", () => {
  render(<Input />);
  const { getByTestId } = screen;

  const input = getByTestId("STextInput");
  console.log(input);
  // expect(input).toBeDefined();
});
