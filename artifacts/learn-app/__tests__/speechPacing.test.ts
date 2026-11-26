import {
  LINE_PAUSE_MS,
  afterCurrentLine,
  setSpeechMuted,
  silentLineMs,
  speak,
  speakLater,
  speakThen,
  stopSpeaking,
} from "@/lib/speech";

type Callbacks = { onStart?: () => void; onDone?: () => void };
const Speech = jest.requireMock("expo-speech") as { speak: jest.Mock };
/** The callbacks of the last line handed to the engine. */
const lastLine = (): Callbacks => Speech.speak.mock.calls.at(-1)![1];

beforeEach(() => {
  jest.useFakeTimers();
  Speech.speak.mockReset();
  stopSpeaking();
});
afterEach(() => {
  setSpeechMuted(false);
  jest.useRealTimers();
});

describe("speakThen", () => {
  test("waits for a slow voice to end, however long it takes, then pauses", () => {
    const onEnd = jest.fn();
    speakThen("اللُّغَةُ الْعَرَبِيَّةُ", onEnd);
    lastLine().onStart!();
    jest.advanceTimersByTime(silentLineMs("اللُّغَةُ الْعَرَبِيَّةُ") + 1000);
    expect(onEnd).not.toHaveBeenCalled();
    lastLine().onDone!();
    jest.advanceTimersByTime(LINE_PAUSE_MS - 1);
    expect(onEnd).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  test("moves on after a while when the voice never starts", () => {
    const onEnd = jest.fn();
    speakThen("بَ", onEnd);
    jest.advanceTimersByTime(silentLineMs("بَ") + LINE_PAUSE_MS);
    expect(onEnd).toHaveBeenCalledTimes(1);
    // A late report changes nothing.
    lastLine().onDone!();
    jest.advanceTimersByTime(LINE_PAUSE_MS);
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  test("a voice that started but never reports its end is capped", () => {
    const onEnd = jest.fn();
    speakThen("بَ", onEnd);
    lastLine().onStart!();
    jest.advanceTimersByTime(60_000);
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  test("cancelled, it never calls back", () => {
    const onEnd = jest.fn();
    const cancel = speakThen("بَ", onEnd);
    lastLine().onDone!();
    cancel();
    jest.advanceTimersByTime(60_000);
    expect(onEnd).not.toHaveBeenCalled();
  });

  test("muted, it goes on after the pause", () => {
    setSpeechMuted(true);
    const onEnd = jest.fn();
    speakThen("بَ", onEnd);
    jest.advanceTimersByTime(LINE_PAUSE_MS);
    expect(onEnd).toHaveBeenCalledTimes(1);
  });
});

describe("afterCurrentLine", () => {
  test("goes on at once when nothing is being spoken", () => {
    const then = jest.fn();
    afterCurrentLine(then);
    expect(then).toHaveBeenCalledTimes(1);
  });

  test("waits for the praise being spoken to end, then pauses", () => {
    speak("أَحْسَنْت!");
    lastLine().onStart!();
    const then = jest.fn();
    afterCurrentLine(then);
    jest.advanceTimersByTime(2000);
    expect(then).not.toHaveBeenCalled();
    lastLine().onDone!();
    jest.advanceTimersByTime(LINE_PAUSE_MS);
    expect(then).toHaveBeenCalledTimes(1);
  });

  test("a voice that never reports its end holds it up only so long", () => {
    speak("أَحْسَنْت!");
    lastLine().onStart!();
    const then = jest.fn();
    afterCurrentLine(then, { maxWaitMs: 3000 });
    jest.advanceTimersByTime(3000 + LINE_PAUSE_MS);
    expect(then).toHaveBeenCalledTimes(1);
  });

  test("cancelled, it never calls back", () => {
    speak("أَحْسَنْت!");
    lastLine().onStart!();
    const then = jest.fn();
    afterCurrentLine(then)();
    lastLine().onDone!();
    jest.advanceTimersByTime(10_000);
    expect(then).not.toHaveBeenCalled();
  });
});

describe("speakLater", () => {
  test("speaks the prompt after the delay", () => {
    speakLater("رَ", 400);
    jest.advanceTimersByTime(400);
    expect(Speech.speak).toHaveBeenLastCalledWith("رَ", expect.anything());
  });

  test("stays silent when something was spoken meanwhile (a quick answer's praise)", () => {
    speakLater("رَ", 400);
    speak("أَحْسَنْت!");
    jest.advanceTimersByTime(400);
    expect(Speech.speak).not.toHaveBeenCalledWith("رَ", expect.anything());
  });

  test("its cleanup cancels it", () => {
    speakLater("رَ", 400)();
    jest.advanceTimersByTime(400);
    expect(Speech.speak).not.toHaveBeenCalled();
  });
});
