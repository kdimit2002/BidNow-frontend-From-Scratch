// π.χ. src/api/Firebase/authStorage.ts
const REFRESH_TOKEN_KEY = "fb_refresh_token";
const REFRESH_TOKEN_TS_KEY = "fb_refresh_token_ts";
const REFRESH_TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 μέρες

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

    const age = Date.now() - ts;
    if (age > REFRESH_TOKEN_MAX_AGE_MS) {
      // έχει περάσει ο 1 μήνας – το πετάμε
      clearRefreshToken();
      return null;
    }

    return token;
  } catch (e) {
    console.error("Failed to read refresh token", e);
    return null;
  }
}






import { getFirebaseAuthToken, setFirebaseAuthToken } from "../Springboot/backendClient";

interface RefreshTokenResponse {
  access_token: string;
  expires_in: string;
  token_type: string;
  refresh_token: string;
  id_token: string;
  user_id: string;
  project_id: string;
}

/**
 * Προσπαθεί να αρχικοποιήσει session από αποθηκευμένο refresh token.
 * Επιστρέφει:
 *  - { firebaseUserId, idToken } αν πετύχει
 *  - null αν δεν υπάρχει/έληξε/απέτυχε
 */
export async function initSessionFromStoredRefreshToken(): Promise<{
  firebaseUserId: string;
  idToken: string;
} | null> {
  const refreshToken = getValidStoredRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const res = await fetch(
      `https://securetoken.googleapis.com/v1/token?key=${getFirebaseAuthToken()}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }).toString(),
      }
    );

    if (!res.ok) {
      console.error("Failed to refresh Firebase token", res.status);
      clearRefreshToken();
      return null;
    }

    const data = (await res.json()) as RefreshTokenResponse;

    // Νέο idToken + refreshToken + user_id
    setFirebaseAuthToken(data.id_token, data.user_id);
    saveRefreshToken(data.refresh_token); // ανανέωσε το αποθηκευμένο

    return {
      firebaseUserId: data.user_id,
      idToken: data.id_token,
    };
  } catch (e) {
    console.error("Error refreshing Firebase token", e);
    clearRefreshToken();
    return null;
  }
}
