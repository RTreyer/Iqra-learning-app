import { setExplainMode } from "@/lib/explain";
import { speak, stopSpeaking } from "@/lib/speech";

const Speech = jest.requireMock("expo-speech") as { speak: jest.Mock };

afterEach(() => setExplainMode(false));

test("a stopped multi part line does not go on to its next part, but still reports done", () => {
  setExplainMode(true);
  Speech.speak.mockClear();
  const onDone = jest.fn();
  speak("حَاوِلْ مَرَّةً أُخْرَى، مَ", { onDone });
  expect(Speech.speak).toHaveBeenCalledTimes(1);
  const [, options] = Speech.speak.mock.calls[0];
  stopSpeaking();
  options.onStopped();
  expect(Speech.speak).toHaveBeenCalledTimes(1);
  expect(onDone).toHaveBeenCalledTimes(1);
});
