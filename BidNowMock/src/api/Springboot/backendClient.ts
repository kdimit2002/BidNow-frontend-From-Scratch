// src/api/backendClient.ts

import { clearRefreshToken } from "../Firebase/authStorage";

const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_BASE_URL ?? "http://localhost:8080";


  export { BACKEND_BASE_URL };


let currentFirebaseIdToken: string | null = null;
let currentFirebaseUserId: string | null = null;

/**
 * Καλείς αυτό ΜΕΤΑ το login / signup,
 * για να αποθηκεύσεις το Firebase idToken στη μνήμη του JS.
 */
export function setFirebaseAuthToken(token: string | null, userId?: string) {
  currentFirebaseIdToken = token;
  if (userId) currentFirebaseUserId = userId;
}

export function getFirebaseUserId(): string | null {
  return currentFirebaseUserId;
}
export function getFirebaseAuthToken(): string | null  {
  return currentFirebaseIdToken;
}


/** Sign out: απλά πετάμε το token από τη μνήμη */
/** Sign out: πετάμε token ΚΑΙ userId από τη μνήμη */
export function signOutFirebase(): void {
  currentFirebaseIdToken = null;
  currentFirebaseUserId = null;
  clearRefreshToken(); // 👈 ΠΟΛΥ ΣΗΜΑΝΤΙΚΟ

}


type BackendGetOptions = {
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  // αν θέλεις μπορείς να προσθέσεις κι άλλα πεδία αργότερα
};



import { initSessionFromStoredRefreshToken } from "../Firebase/firebaseIdentityService"; // ✅ ΝΕΟ import

/**
 * Generic wrapper για ΟΛΑ τα requests προς Spring Boot.
 * Αυτό θα βάζει αυτόματα το Authorization: Bearer <token> αν υπάρχει.
 * + κάνει αυτόματο refresh του Firebase token αν πάρει 401.
 */
async function backendRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BACKEND_BASE_URL}${path}`;

  // μικρό helper για να φτιάχνουμε headers με το τρέχον token
  const buildHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (currentFirebaseIdToken) {
      headers.Authorization = `Bearer ${currentFirebaseIdToken}`;
    }

    return headers;
  };

  // 1️⃣ Πρώτη προσπάθεια
  let res = await fetch(url, {
    ...options,
    headers: buildHeaders(),
  });

  // 2️⃣ Αν πάρουμε 401 → δοκίμασε refresh token + retry ΜΙΑ φορά
  if (res.status === 401) {
    console.warn("Backend 401 - trying to refresh Firebase token...");

    const session = await initSessionFromStoredRefreshToken();

    if (session) {
      // initSessionFromStoredRefreshToken κάλεσε ήδη setFirebaseAuthToken,
      // άρα currentFirebaseIdToken τώρα έχει το νέο idToken.
      res = await fetch(url, {
        ...options,
        headers: buildHeaders(),
      });
    }
    // Αν δεν υπάρχει valid refresh token (ή απέτυχε), session θα είναι null,
    // άρα αφήνουμε το res ως έχει (401) και θα πέσει στο error handling πιο κάτω.
  }

  // 3️⃣ Κοινό error handling όπως πριν
  if (!res.ok) {
    // προσπάθησε να διαβάσεις error body, αν υπάρχει
    let message = `HTTP ${res.status}`;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = (await res.json()) as any;
      if (data?.message) {
        message = data.message;
      }
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  // 4️⃣ 204 = No Content
  if (res.status === 204) {
    return undefined as T;
  }

  const data = (await res.json()) as T;
  return data;
}


export function backendGet<T>(
  path: string,
  options: BackendGetOptions = {}
): Promise<T> {
  return backendRequest<T>(path, {
    ...options,
    method: "GET",
  });
}

export function backendPost<T, B = unknown>(
  path: string,
  body?: B
): Promise<T> {
  return backendRequest<T>(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function backendPut<T, B = unknown>(
  path: string,
  body?: B
): Promise<T> {
  return backendRequest<T>(path, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function backendDelete<T>(path: string): Promise<T> {
  return backendRequest<T>(path, { method: "DELETE" });
}

export function backendPatch<T, B = unknown>(
  path: string,
  body?: B
): Promise<T> {
  return backendRequest<T>(path, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
}


