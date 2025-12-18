// // src/api/backendClient.ts

// import { clearRefreshToken } from "../Firebase/authStorage";

// const BACKEND_BASE_URL =
//   import.meta.env.VITE_BACKEND_BASE_URL ?? "http://localhost:8080";


// export { BACKEND_BASE_URL };


// let currentFirebaseIdToken: string | null = null;
// let currentFirebaseUserId: string | null = null;

// /**
//  * Καλείς αυτό ΜΕΤΑ το login / signup,
//  * για να αποθηκεύσεις το Firebase idToken στη μνήμη του JS.
//  */
// export function setFirebaseAuthToken(token: string | null, userId?: string) {
//   currentFirebaseIdToken = token;
//   if (userId) currentFirebaseUserId = userId;
// }

// export function getFirebaseUserId(): string | null {
//   return currentFirebaseUserId;
// }
// export function getFirebaseAuthToken(): string | null  {
//   return currentFirebaseIdToken;
// }


// /** Sign out: απλά πετάμε το token από τη μνήμη */
// /** Sign out: πετάμε token ΚΑΙ userId από τη μνήμη */
// export function signOutFirebase(): void {
//   currentFirebaseIdToken = null;
//   currentFirebaseUserId = null;
//   clearRefreshToken(); // 👈 ΠΟΛΥ ΣΗΜΑΝΤΙΚΟ

// }


// type BackendGetOptions = {
//   params?: Record<string, string | number | boolean | undefined>;
//   headers?: Record<string, string>;
//   // αν θέλεις μπορείς να προσθέσεις κι άλλα πεδία αργότερα
// };



// import { initSessionFromStoredRefreshToken } from "../Firebase/firebaseIdentityService"; // ✅ ΝΕΟ import

// /**
//  * Generic wrapper για ΟΛΑ τα requests προς Spring Boot.
//  * Αυτό θα βάζει αυτόματα το Authorization: Bearer <token> αν υπάρχει.
//  * + κάνει αυτόματο refresh του Firebase token αν πάρει 401.
//  */
// async function backendRequest<T>(
//   path: string,
//   options: RequestInit = {}
// ): Promise<T> {
//   const url = `${BACKEND_BASE_URL}${path}`;

//   // μικρό helper για να φτιάχνουμε headers με το τρέχον token
//   const buildHeaders = (): Record<string, string> => {
//     const headers: Record<string, string> = {
//       "Content-Type": "application/json",
//     };

//     if (currentFirebaseIdToken) {
//       headers.Authorization = `Bearer ${currentFirebaseIdToken}`;
//     }

//     return headers;
//   };

//   // 1️⃣ Πρώτη προσπάθεια
//   let res = await fetch(url, {
//     ...options,
//     headers: buildHeaders(),
//   });

//   // 2️⃣ Αν πάρουμε 401 → δοκίμασε refresh token + retry ΜΙΑ φορά
//   if (res.status === 401) {
//     console.warn("Backend 401 - trying to refresh Firebase token...");

//     const session = await initSessionFromStoredRefreshToken();

//     if (session) {
//       // initSessionFromStoredRefreshToken κάλεσε ήδη setFirebaseAuthToken,
//       // άρα currentFirebaseIdToken τώρα έχει το νέο idToken.
//       res = await fetch(url, {
//         ...options,
//         headers: buildHeaders(),
//       });
//     }
//     // Αν δεν υπάρχει valid refresh token (ή απέτυχε), session θα είναι null,
//     // άρα αφήνουμε το res ως έχει (401) και θα πέσει στο error handling πιο κάτω.
//   }

//   // 3️⃣ Κοινό error handling όπως πριν
//   if (!res.ok) {
//     // προσπάθησε να διαβάσεις error body, αν υπάρχει
//     let message = `HTTP ${res.status}`;
//     try {
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       const data = (await res.json()) as any;
//       if (data?.message) {
//         message = data.message;
//       }
//     } catch {
//       // ignore
//     }
//     throw new Error(message);
//   }

//   // 4️⃣ 204 = No Content
//   if (res.status === 204) {
//     return undefined as T;
//   }

//   const data = (await res.json()) as T;
//   return data;
// }


// export function backendGet<T>(
//   path: string,
//   options: BackendGetOptions = {}
// ): Promise<T> {
//   return backendRequest<T>(path, {
//     ...options,
//     method: "GET",
//   });
// }

// export function backendPost<T, B = unknown>(
//   path: string,
//   body?: B
// ): Promise<T> {
//   return backendRequest<T>(path, {
//     method: "POST",
//     body: body ? JSON.stringify(body) : undefined,
//   });
// }

// export function backendPut<T, B = unknown>(
//   path: string,
//   body?: B
// ): Promise<T> {
//   return backendRequest<T>(path, {
//     method: "PUT",
//     body: body ? JSON.stringify(body) : undefined,
//   });
// }

// export function backendDelete<T>(path: string): Promise<T> {
//   return backendRequest<T>(path, { method: "DELETE" });
// }

// export function backendPatch<T, B = unknown>(
//   path: string,
//   body?: B
// ): Promise<T> {
//   return backendRequest<T>(path, {
//     method: "PATCH",
//     body: body ? JSON.stringify(body) : undefined,
//   });
// }


// src/api/Springboot/backendClient.ts

import { clearRefreshToken } from "../Firebase/authStorage";
import { initSessionFromStoredRefreshToken } from "../Firebase/firebaseIdentityService";

export const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_BASE_URL ?? "http://localhost:8080";

let currentFirebaseIdToken: string | null = null;
let currentFirebaseUserId: string | null = null;

/**
 * Καλείς αυτό ΜΕΤΑ το login / signup,
 * για να αποθηκεύσεις το Firebase idToken στη μνήμη του JS.
 */
export function setFirebaseAuthToken(token: string | null, userId?: string): void {
  currentFirebaseIdToken = token;
  if (typeof userId === "string" && userId.trim().length > 0) {
    currentFirebaseUserId = userId;
  }
}

export function getFirebaseAuthToken(): string | null {
  return currentFirebaseIdToken;
}

export function getFirebaseUserId(): string | null {
  return currentFirebaseUserId;
}

/** Sign out: πετάμε token + userId από τη μνήμη + καθαρίζουμε refresh token */
export function signOutFirebase(): void {
  currentFirebaseIdToken = null;
  currentFirebaseUserId = null;
  clearRefreshToken();
}

type BackendParams = Record<string, string | number | boolean | undefined>;

type BackendGetOptions = {
  params?: BackendParams;
  headers?: Record<string, string>;
};

type BackendRequestOptions = {
  params?: BackendParams;
  headers?: Record<string, string>;
  skipJsonContentType?: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function buildPathWithParams(path: string, params?: BackendParams): string {
  if (!params) return path;

  const [base, existingQuery] = path.split("?");
  const sp = new URLSearchParams(existingQuery ?? "");

  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined) return;
    sp.set(k, String(v));
  });

  const qs = sp.toString();
  return qs ? `${base}?${qs}` : base;
}

function extractErrorMessage(
  status: number,
  statusText: string,
  text: string
): string {
  const fallback = `HTTP ${status}${statusText ? ` ${statusText}` : ""}`;

  const trimmed = text.trim();
  if (!trimmed) return fallback;

  // προσπάθησε JSON
  try {
    const parsed: unknown = JSON.parse(trimmed);

    if (isRecord(parsed)) {
      const msg = parsed["message"];
      if (typeof msg === "string" && msg.trim().length > 0) return msg;

      const err = parsed["error"];
      if (typeof err === "string" && err.trim().length > 0) return err;

      return JSON.stringify(parsed);
    }

    return String(parsed);
  } catch {
    // fallback σε raw text
    return trimmed;
  }
}

function buildHeaders(
  extraHeaders?: Record<string, string>,
  skipJsonContentType?: boolean
): Record<string, string> {
  const headers: Record<string, string> = {};

  if (!skipJsonContentType) {
    headers["Content-Type"] = "application/json";
  }

  if (currentFirebaseIdToken) {
    headers["Authorization"] = `Bearer ${currentFirebaseIdToken}`;
  }

  return { ...headers, ...(extraHeaders ?? {}) };
}

async function fetchWithAuthRetry(
  url: string,
  init: RequestInit,
  headersFactory: () => HeadersInit
): Promise<Response> {
  // 1) first try
  let res = await fetch(url, { ...init, headers: headersFactory() });

  // 2) 401 -> refresh + retry once
  if (res.status === 401) {
    const session = await initSessionFromStoredRefreshToken();
    if (session) {
      res = await fetch(url, { ...init, headers: headersFactory() });
    }
  }

  return res;
}

async function backendRequest<T>(
  path: string,
  options: RequestInit = {},
  extra?: BackendRequestOptions
): Promise<T> {
  const finalPath = buildPathWithParams(path, extra?.params);
  const url = `${BACKEND_BASE_URL}${finalPath}`;

  const headersFactory = (): HeadersInit =>
    buildHeaders(extra?.headers, extra?.skipJsonContentType);

  const res = await fetchWithAuthRetry(url, options, headersFactory);

  const text = await res.text(); // ✅ πάντα text

  if (!res.ok) {
    throw new Error(extractErrorMessage(res.status, res.statusText, text));
  }

  // ✅ 204 ή empty
  if (res.status === 204 || text.trim().length === 0) {
    return undefined as T;
  }

  // Αν δεν είναι JSON, γύρνα raw text (cast)
  const contentType = res.headers.get("content-type") ?? "";
  const looksJson = contentType.includes("application/json");

  if (!looksJson) {
    return text as unknown as T;
  }

  try {
    const parsed: unknown = JSON.parse(text);
    return parsed as T;
  } catch {
    // αν backend επέστρεψε κάτι μη-JSON με content-type json, γύρνα text
    return text as unknown as T;
  }
}

// -----------------------------
// Public helpers
// -----------------------------

export function backendGet<T>(
  path: string,
  options: BackendGetOptions = {}
): Promise<T> {
  return backendRequest<T>(
    path,
    { method: "GET" },
    { params: options.params, headers: options.headers }
  );
}

export function backendPost<T, B = unknown>(
  path: string,
  body?: B,
  headers?: Record<string, string>
): Promise<T> {
  return backendRequest<T>(
    path,
    {
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    },
    { headers }
  );
}

export function backendPut<T, B = unknown>(
  path: string,
  body?: B,
  headers?: Record<string, string>
): Promise<T> {
  return backendRequest<T>(
    path,
    {
      method: "PUT",
      body: body === undefined ? undefined : JSON.stringify(body),
    },
    { headers }
  );
}

export function backendPatch<T, B = unknown>(
  path: string,
  body?: B,
  headers?: Record<string, string>
): Promise<T> {
  return backendRequest<T>(
    path,
    {
      method: "PATCH",
      body: body === undefined ? undefined : JSON.stringify(body),
    },
    { headers }
  );
}

export function backendDelete<T>(
  path: string,
  headers?: Record<string, string>
): Promise<T> {
  return backendRequest<T>(path, { method: "DELETE" }, { headers });
}

/**
 * POST με FormData (uploads).
 * ΔΕΝ βάζουμε Content-Type — το βάζει ο browser (boundary).
 */
export async function backendPostFormData<Res>(
  path: string,
  formData: FormData,
  headers?: Record<string, string>
): Promise<Res> {
  const url = `${BACKEND_BASE_URL}${path}`;

  const headersFactory = (): HeadersInit =>
    buildHeaders(headers, true /* skip JSON Content-Type */);

  const res = await fetchWithAuthRetry(
    url,
    { method: "POST", body: formData },
    headersFactory
  );

  const text = await res.text();

  if (!res.ok) {
    throw new Error(extractErrorMessage(res.status, res.statusText, text));
  }

  if (res.status === 204 || text.trim().length === 0) {
    return undefined as Res;
  }

  const contentType = res.headers.get("content-type") ?? "";
  const looksJson = contentType.includes("application/json");

  if (!looksJson) {
    return text as unknown as Res;
  }

  try {
    const parsed: unknown = JSON.parse(text);
    return parsed as Res;
  } catch {
    return text as unknown as Res;
  }
}
