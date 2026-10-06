---
name: Replit Auth mobile setup
description: Quirks when integrating Replit Auth with expo-auth-session v7 in SDK 54
---

## Rule 1 — Web popup must use its initiating auth request
On Expo web, `promptAsync()` opens a **popup**, not a full-page redirect. The popup briefly shows the Expo domain when it returns and then closes normally. Do not infer that the popup closing is itself a crash.

**Why:** A previous assumption that web reloads the opener led to storing the PKCE verifier in `sessionStorage` and processing the response in a separate effect. A later render can no longer be trusted to represent the request that launched the popup. That assumption was misleading; the later persistent `invalid_grant` had another cause.

**How to apply:** For web, capture the initiating auth request at login time and pair the resolved `promptAsync()` response with that exact request's verifier and redirect URI. Keep the native response-effect path separate, and guard against exchanging the same code twice. If `invalid_grant` persists, investigate the provider's exact redirect URI and PKCE handling rather than assuming a web page reload.

## Rule 2 — Exact web redirect URI matters in token exchange
Canonicalize an origin-only Expo web redirect URI before starting authorization; both authorization and token exchange must use the exact same string, including the final slash.

**Why:** Expo Linking's web `createURL` deliberately removes a final slash, but the server's `new URL(redirect_uri)` restores it. OIDC codes are bound to the original redirect URI; this explains why `invalid_grant` persisted despite pairing the response with the initiating PKCE request. The canonicalization has passed typechecking and a URL invariant check, but a live sign-in has not yet been verified.

**How to apply:** For web only, use `new URL(AuthSession.makeRedirectUri()).href` before constructing the auth request; preserve the native redirect unchanged. Do not log codes or verifiers. If login still fails, diagnose provider-side rejection with a fresh code.
