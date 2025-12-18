// π.χ. src/api/Firebase/authStorage.ts
const REFRESH_TOKEN_KEY = "fb_refresh_token";
const REFRESH_TOKEN_TS_KEY = "fb_refresh_token_ts";
//const REFRESH_TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 μέρες

export function saveRefreshToken(refreshToken: string) {
  try {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(REFRESH_TOKEN_TS_KEY, Date.now().toString());
  } catch (e) {
    console.error("Failed to save refresh token", e);
  }
}

export function clearRefreshToken() {
  try {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_TS_KEY);
  } catch (e) {
    console.error("Failed to clear refresh token", e);
  }
}

export function getValidStoredRefreshToken(): string | null {
  try {
    const token = localStorage.getItem(REFRESH_TOKEN_KEY);
    const tsStr = localStorage.getItem(REFRESH_TOKEN_TS_KEY);
    if (!token || !tsStr) return null;

    const ts = Number(tsStr);
    if (Number.isNaN(ts)) return null;

    // const age = Date.now() - ts;
    // if (age > REFRESH_TOKEN_MAX_AGE_MS) {
    //   // έχει περάσει ο 1 μήνας – το πετάμε
    //   clearRefreshToken();
    //   return null;
    // }

    return token;
  } catch (e) {
    console.error("Failed to read refresh token", e);
    return null;
  }
}



