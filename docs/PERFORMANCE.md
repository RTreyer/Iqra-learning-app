# Performance baseline (Task 6.2)

## Measurements

| Metric | Value |
|---|---|
| Web JS bundle | 1.56 MB (1,557,433 B). History: 2.82 MB baseline, 2.06 MB after Task 1.2, 1.53 MB after Task 4.4 |
| JS files in dist | 1 (single entry chunk) |
| Total web dist size | 1.6 MB |
| Dependencies (`artifacts/learn-app/package.json`) | 18 |
| node_modules (workspace root, hoisted) | 477 MB |
| Jest | 37 suites, 220 tests, about 2.6 s test time (about 3.6 s wall) |
| E2E | about 82 s wall including web export |
| APK size | pending EAS build |
| `adb shell dumpsys meminfo com.iqra.yemenlearn` | pending device |

## Verified checklist

| Check | Result |
|---|---|
| `require(` in app, components, lib, context, hooks | 0 matches |
| `shadow*` / `boxShadow` in app, components | 0 matches after fix (13 files used inline shadows, now `...shadow.card` from `theme/tokens.ts`) |
| `elevation` in app, components | 1 match: `VoiceHintBanner` overlay, kept for Android z order |
| Decorative emoji per screen (`ScreenBackground`) | trimmed to 4 each (home 6, reading 5, numbers 5 before) |
| `LinearGradient` | 1 usage, in `ScreenBackground` only; none in list rows |
| `useNativeDriver` | all 8 `Animated.timing`/`spring` calls use `true`; all drive transform values, none touch layout props |
| `console.*` in app code | `console.error` in ErrorFallback restart failure handler; `console.warn` in ProgressContext guarded by `__DEV__`; no `console.log` |
