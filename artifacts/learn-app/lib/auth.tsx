import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { Platform } from "react-native";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";

WebBrowser.maybeCompleteAuthSession();

const AUTH_TOKEN_KEY = "auth_session_token";
const AUTH_USER_KEY = "auth_user_cache";
const ISSUER_URL = process.env.EXPO_PUBLIC_ISSUER_URL ?? "https://replit.com/oidc";

interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginError: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
  /**
   * Called once after each successful authentication with the api base URL,
   * bearer token, and the authenticated user's ID (for per-account scoping).
   */
  onAuthSuccess?: (apiBase: string, token: string, userId: string) => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  loginError: null,
  login: async () => {},
  logout: async () => {},
});

function getApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_DOMAIN) {
    return `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
  }
  return "";
}

function getClientId(): string {
  return process.env.EXPO_PUBLIC_REPL_ID || "";
}

export function AuthProvider({ children, onAuthSuccess }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const lastExchangedCode = useRef<string | null>(null);

  const discovery = AuthSession.useAutoDiscovery(ISSUER_URL);
  const generatedRedirectUri = AuthSession.makeRedirectUri();
  // Expo Linking removes the trailing slash from the web origin. The server
  // reconstructs the callback with new URL(), which restores the slash; OAuth
  // requires the authorization and token-exchange redirect URIs to match exactly.
  const redirectUri = Platform.OS === "web" && generatedRedirectUri
    ? new URL(generatedRedirectUri).href
    : generatedRedirectUri;

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: getClientId(),
      scopes: ["openid", "email", "profile", "offline_access"],
      redirectUri,
      prompt: AuthSession.Prompt.Login,
    },
    discovery,
  );

  const fetchUser = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const apiBase = getApiBaseUrl();
      try {
        const res = await fetch(`${apiBase}/api/auth/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.user) {
          setUser(data.user);
          // Cache user profile for offline use
          await SecureStore.setItemAsync(AUTH_USER_KEY, JSON.stringify(data.user));
          // Notify after we know the user ID (for per-account progress scoping)
          onAuthSuccess?.(apiBase, token, data.user.id);
        } else {
          // Server explicitly rejected the token — clear everything
          await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
          await SecureStore.deleteItemAsync(AUTH_USER_KEY);
          setUser(null);
        }
      } catch {
        // Network error (offline): fall back to cached user profile
        const cached = await SecureStore.getItemAsync(AUTH_USER_KEY);
        if (cached) {
          const cachedUser = JSON.parse(cached) as User;
          setUser(cachedUser);
          // Still notify so offline progress is loaded from the user-scoped key
          onAuthSuccess?.(apiBase, token, cachedUser.id);
        } else {
          // No cache yet — user must log in once with connectivity
          setUser(null);
        }
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const exchangeCode = useCallback(async (
    result: AuthSession.AuthSessionResult,
    codeVerifier: string,
    originalRedirectUri: string,
    nonce?: string,
  ) => {
    if (result.type !== "success") return;
    const { code, state } = result.params;
    if (!code || lastExchangedCode.current === code) return;
    lastExchangedCode.current = code;

    try {
      const apiBase = getApiBaseUrl();
      if (!apiBase) throw new Error("API domain unavailable");

      const exchangeRes = await fetch(`${apiBase}/api/mobile-auth/token-exchange`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          code_verifier: codeVerifier,
          redirect_uri: originalRedirectUri,
          state,
          nonce,
        }),
      });

      if (!exchangeRes.ok) throw new Error("Token exchange failed");
      const data = await exchangeRes.json();
      if (!data.token) throw new Error("Session token missing");

      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, data.token);
      setLoginError(null);
      setIsLoading(true);
      await fetchUser();
    } catch {
      setLoginError("تعذّر تسجيل الدخول. حاول مرة أخرى.");
      setIsLoading(false);
    }
  }, [fetchUser]);

  useEffect(() => {
    // On web the result is handled directly by login(), using the exact
    // request that opened the popup. A later render may create a new request.
    if (Platform.OS === "web" || response?.type !== "success" || !request?.codeVerifier) return;
    void exchangeCode(response, request.codeVerifier, request.redirectUri, (request as any).nonce ?? undefined);
  }, [response, request, exchangeCode]);

  const login = useCallback(async () => {
    setLoginError(null);
    try {
      if (!request?.codeVerifier) {
        setLoginError("تعذّر بدء تسجيل الدخول. حاول مرة أخرى.");
        return;
      }
      // Capture verifier and redirect URI before opening the browser. The web
      // popup returns to this same page, so the original request is available.
      const originalRequest = request;
      const result = await promptAsync();
      if (Platform.OS === "web" && result.type === "success") {
        await exchangeCode(result, originalRequest.codeVerifier!, originalRequest.redirectUri, (originalRequest as any).nonce ?? undefined);
      } else if (result.type === "error") {
        setLoginError("تعذّر تسجيل الدخول. حاول مرة أخرى.");
      }
    } catch {
      setLoginError("تعذّر تسجيل الدخول. حاول مرة أخرى.");
    }
  }, [promptAsync, request, exchangeCode]);

  const logout = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      if (token) {
        const apiBase = getApiBaseUrl();
        await fetch(`${apiBase}/api/mobile-auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
    } catch {
    } finally {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(AUTH_USER_KEY);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        loginError,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
