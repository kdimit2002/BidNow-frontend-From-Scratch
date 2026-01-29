// // src/utils/authErrorMessages.ts

// export type AuthContext = "SIGN_IN" | "SIGN_UP" | "RESET_PASSWORD" | "GENERIC";

// type UnknownRecord = Record<string, unknown>;

// function isRecord(v: unknown): v is UnknownRecord {
//   return typeof v === "object" && v !== null;
// }

// function getStringProp(obj: UnknownRecord, key: string): string | null {
//   const v = obj[key];
//   return typeof v === "string" ? v : null;
// }

// function getNested(obj: unknown, path: string[]): unknown {
//   let cur: unknown = obj;
//   for (const p of path) {
//     if (!isRecord(cur)) return null;
//     cur = cur[p];
//   }
//   return cur;
// }

// function getNestedString(obj: unknown, path: string[]): string | null {
//   const v = getNested(obj, path);
//   return typeof v === "string" ? v : null;
// }

// function normalize(raw: string): string {
//   return raw.trim().toUpperCase();
// }

// function includesAny(code: string, parts: readonly string[]) {
//   return parts.some((p) => code.includes(p));
// }

// /**
//  * Προσπαθεί να βρει "code" / "message" από διάφορες μορφές σφαλμάτων (Error, axios response, firebase REST κτλ).
//  * Χωρίς `any`.
//  */
// export function getAuthErrorCode(err: unknown): string {
//   if (!err) return "";

//   if (typeof err === "string") return err;

//   if (err instanceof Error) {
//     // πολλές φορές το err.message περιέχει κάτι όπως INVALID_PASSWORD, EMAIL_NOT_FOUND κτλ
//     return err.message ?? "";
//   }

//   if (isRecord(err)) {
//     // { code: "..." }
//     const directCode = getStringProp(err, "code");
//     if (directCode) return directCode;

//     // { message: "..." }
//     const directMsg = getStringProp(err, "message");
//     if (directMsg) return directMsg;

//     // Firebase REST: { error: { message: "INVALID_PASSWORD" } }
//     const fbMsg = getNestedString(err, ["error", "message"]);
//     if (fbMsg) return fbMsg;

//     // Axios: err.response.data.message
//     const axiosMsg = getNestedString(err, ["response", "data", "message"]);
//     if (axiosMsg) return axiosMsg;

//     // Axios/Firebase REST: err.response.data.error.message
//     const axiosFbMsg = getNestedString(err, ["response", "data", "error", "message"]);
//     if (axiosFbMsg) return axiosFbMsg;

//     // Άλλο πιθανό: err.response.data.errorMessage
//     const axiosAlt = getNestedString(err, ["response", "data", "errorMessage"]);
//     if (axiosAlt) return axiosAlt;
//   }

//   return "";
// }

// export function toGreekAuthMessage(err: unknown, ctx: AuthContext = "GENERIC"): string {
//   const raw = getAuthErrorCode(err);
//   const code = normalize(raw);

//   // Network / timeouts
//   if (includesAny(code, ["NETWORK", "REQUEST_FAILED", "ECONN", "TIMEOUT", "ERR_NETWORK"])) {
//     return "Πρόβλημα σύνδεσης. Έλεγξε το internet σου και δοκίμασε ξανά.";
//   }

//   // Invalid email
//   if (includesAny(code, ["INVALID_EMAIL", "AUTH/INVALID-EMAIL"])) {
//     return "Το email δεν είναι έγκυρο.";
//   }

//   // Wrong credentials (κρατάμε generic για να μην αποκαλύπτει αν υπάρχει email)
//   if (
//     includesAny(code, [
//       "INVALID_PASSWORD",
//       "EMAIL_NOT_FOUND",
//       "USER_NOT_FOUND",
//       "INVALID_LOGIN_CREDENTIALS",
//       "WRONG_PASSWORD",
//       "AUTH/WRONG-PASSWORD",
//       "AUTH/INVALID-CREDENTIAL",
//       "AUTH/USER-NOT-FOUND",
//     ])
//   ) {
//     return "Λάθος στοιχεία σύνδεσης. Έλεγξε email/κωδικό και δοκίμασε ξανά.";
//   }

//   // Disabled user
//   if (includesAny(code, ["USER_DISABLED", "AUTH/USER-DISABLED"])) {
//     return "Ο λογαριασμός σου είναι απενεργοποιημένος. Επικοινώνησε με την υποστήριξη.";
//   }

//   // Rate limit / too many attempts
//   if (includesAny(code, ["TOO_MANY", "TRY_LATER", "RATE_LIMIT", "TOO_MANY_ATTEMPTS"])) {
//     return "Πάρα πολλές προσπάθειες. Δοκίμασε ξανά σε λίγα λεπτά.";
//   }

//   // SIGN UP ειδικά
//   if (ctx === "SIGN_UP") {
//     if (
//       includesAny(code, ["EMAIL_EXISTS", "EMAIL_ALREADY_IN_USE", "AUTH/EMAIL-ALREADY-IN-USE"])
//     ) {
//       return "Υπάρχει ήδη λογαριασμός με αυτό το email.";
//     }

//     if (includesAny(code, ["WEAK_PASSWORD", "AUTH/WEAK-PASSWORD"])) {
//       return "Ο κωδικός είναι αδύναμος. Βάλε έναν πιο ισχυρό κωδικό.";
//     }

//     if (includesAny(code, ["INVALID_PHONE", "INVALID_PHONE_NUMBER", "AUTH/INVALID-PHONE-NUMBER"])) {
//       return "Ο αριθμός τηλεφώνου δεν είναι έγκυρος.";
//     }

//     if (includesAny(code, ["PHONE_NUMBER_EXISTS", "PHONE_NUMBER_ALREADY_EXISTS"])) {
//       return "Υπάρχει ήδη λογαριασμός με αυτό το τηλέφωνο.";
//     }

//     if (
//       includesAny(code, [
//         "INVALID_CODE",
//         "INVALID_VERIFICATION_CODE",
//         "CODE",
//         "AUTH/INVALID-VERIFICATION-CODE",
//       ])
//     ) {
//       return "Ο κωδικός επιβεβαίωσης (SMS) είναι λάθος. Δοκίμασε ξανά.";
//     }
//   }

//   // RESET PASSWORD: σε email-not-found θέλουμε να μην αποκαλύπτει ύπαρξη λογαριασμού
//   if (ctx === "RESET_PASSWORD") {
//     if (includesAny(code, ["EMAIL_NOT_FOUND", "USER_NOT_FOUND", "AUTH/USER-NOT-FOUND"])) {
//       return "Αν το email υπάρχει στο σύστημα, θα λάβεις σύντομα μήνυμα επαναφοράς.";
//     }
//   }

//   // Default fallback
//   if (ctx === "SIGN_IN") return "Δεν ήταν δυνατή η σύνδεση. Δοκίμασε ξανά.";
//   if (ctx === "SIGN_UP") return "Δεν ήταν δυνατή η εγγραφή. Έλεγξε τα στοιχεία σου και δοκίμασε ξανά.";
//   if (ctx === "RESET_PASSWORD")
//     return "Δεν μπορέσαμε να στείλουμε μήνυμα επαναφοράς. Δοκίμασε ξανά αργότερα.";

//   return "Κάτι πήγε λάθος. Δοκίμασε ξανά.";
// }
// src/utils/authErrorMessages.ts

export type AuthContext = "SIGN_IN" | "SIGN_UP" | "RESET_PASSWORD" | "GENERIC";

type UnknownRecord = Record<string, unknown>;

function isRecord(v: unknown): v is UnknownRecord {
  return typeof v === "object" && v !== null;
}

function getStringProp(obj: UnknownRecord, key: string): string | null {
  const v = obj[key];
  return typeof v === "string" ? v : null;
}

function getNested(obj: unknown, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (!isRecord(cur)) return null;
    cur = cur[p];
  }
  return cur;
}

function getNestedString(obj: unknown, path: string[]): string | null {
  const v = getNested(obj, path);
  return typeof v === "string" ? v : null;
}

function getNestedNumber(obj: unknown, path: string[]): number | null {
  const v = getNested(obj, path);
  return typeof v === "number" ? v : null;
}

function normalize(raw: string): string {
  return raw.trim().toUpperCase();
}

function includesAny(code: string, parts: readonly string[]) {
  return parts.some((p) => code.includes(p));
}

/**
 * Tries to extract a "code" / "message" from various error shapes (Error, axios-like responses, REST payloads, etc).
 * No `any`.
 */
export function getAuthErrorCode(err: unknown): string {
  if (!err) return "";

  if (typeof err === "string") return err;

  if (err instanceof Error) {
    // Often the message contains something code-like (e.g. INVALID_PASSWORD, USER_NOT_FOUND, etc).
    return err.message ?? "";
  }

  if (isRecord(err)) {
    // { code: "..." }
    const directCode = getStringProp(err, "code");
    if (directCode) return directCode;

    // { message: "..." }
    const directMsg = getStringProp(err, "message");
    if (directMsg) return directMsg;

    // REST style: { error: { message: "..." } }
    const restMsg = getNestedString(err, ["error", "message"]);
    if (restMsg) return restMsg;

    // Axios-like: err.response.data.message
    const axiosMsg = getNestedString(err, ["response", "data", "message"]);
    if (axiosMsg) return axiosMsg;

    // Axios-like + nested error: err.response.data.error.message
    const axiosNestedMsg = getNestedString(err, ["response", "data", "error", "message"]);
    if (axiosNestedMsg) return axiosNestedMsg;

    // Alternative: err.response.data.errorMessage
    const axiosAlt = getNestedString(err, ["response", "data", "errorMessage"]);
    if (axiosAlt) return axiosAlt;

    // HTTP status as a fallback (helps map backend errors)
    const axiosStatus = getNestedNumber(err, ["response", "status"]);
    if (typeof axiosStatus === "number") return `HTTP_${axiosStatus}`;

    const directStatus = ((): number | null => {
      const v = err["status"];
      return typeof v === "number" ? v : null;
    })();
    if (typeof directStatus === "number") return `HTTP_${directStatus}`;
  }

  return "";
}

export function toGreekAuthMessage(err: unknown, ctx: AuthContext = "GENERIC"): string {
  const raw = getAuthErrorCode(err);
  const code = normalize(raw);

  // -------------------------
  // ✅ Pending / not activated
  // -------------------------
  if (
    includesAny(code, [
      "ACCOUNT_PENDING",
      "PENDING_APPROVAL",
      "PENDING_ACTIVATION",
      "AWAITING_APPROVAL",
      "AWAITING_VERIFICATION",
      "NOT_VERIFIED",
      "UNVERIFIED",
      "EMAIL_NOT_VERIFIED",
      "PHONE_NOT_VERIFIED",
      "VERIFICATION_REQUIRED",
      // keep a generic PENDING last (some backends only send "PENDING")
      "PENDING",
    ])
  ) {
    // User-friendly: no platform/provider wording
    return "Your account is pending approval. Once it’s activated, you’ll be able to sign in.";
  }

  // -------------------------
  // Network / timeouts
  // -------------------------
  if (includesAny(code, ["NETWORK", "REQUEST_FAILED", "ECONN", "TIMEOUT", "ERR_NETWORK"])) {
    return "Connection problem. Please check your internet and try again.";
  }

  // -------------------------
  // Invalid email
  // -------------------------
  if (includesAny(code, ["INVALID_EMAIL", "AUTH/INVALID-EMAIL"])) {
    return "Please enter a valid email address.";
  }

  // -------------------------
  // Wrong credentials (keep generic to avoid revealing if an email exists)
  // -------------------------
  if (
    includesAny(code, [
      "INVALID_PASSWORD",
      "EMAIL_NOT_FOUND",
      "USER_NOT_FOUND",
      "INVALID_LOGIN_CREDENTIALS",
      "WRONG_PASSWORD",
      "AUTH/WRONG-PASSWORD",
      "AUTH/INVALID-CREDENTIAL",
      "AUTH/USER-NOT-FOUND",
      "HTTP_401",
    ])
  ) {
    return "Incorrect email or password.";
  }

  // -------------------------
  // Disabled user / forbidden
  // -------------------------
  if (includesAny(code, ["USER_DISABLED", "AUTH/USER-DISABLED", "HTTP_403"])) {
    return "Your account is currently unavailable. If you need help, please contact support.";
  }

  // -------------------------
  // Rate limit / too many attempts
  // -------------------------
  if (includesAny(code, ["TOO_MANY", "TRY_LATER", "RATE_LIMIT", "TOO_MANY_ATTEMPTS", "AUTH/TOO-MANY-REQUESTS"])) {
    return "Too many attempts. Please try again in a few minutes.";
  }

  // -------------------------
  // SIGN UP specific
  // -------------------------
  if (ctx === "SIGN_UP") {
    if (includesAny(code, ["EMAIL_EXISTS", "EMAIL_ALREADY_IN_USE", "AUTH/EMAIL-ALREADY-IN-USE", "HTTP_409"])) {
      return "An account with this email already exists.";
    }

    if (includesAny(code, ["WEAK_PASSWORD", "AUTH/WEAK-PASSWORD"])) {
      return "Your password is too weak. Please choose a stronger password.";
    }

    if (includesAny(code, ["INVALID_PHONE", "INVALID_PHONE_NUMBER", "AUTH/INVALID-PHONE-NUMBER"])) {
      return "The phone number is not valid.";
    }

    if (includesAny(code, ["PHONE_NUMBER_EXISTS", "PHONE_NUMBER_ALREADY_EXISTS"])) {
      return "An account with this phone number already exists.";
    }

    if (
      includesAny(code, [
        "INVALID_CODE",
        "INVALID_VERIFICATION_CODE",
        "AUTH/INVALID-VERIFICATION-CODE",
      ])
    ) {
      return "The verification code is incorrect. Please try again.";
    }
  }

  // -------------------------
  // RESET PASSWORD privacy-friendly behavior
  // -------------------------
  if (ctx === "RESET_PASSWORD") {
    if (includesAny(code, ["EMAIL_NOT_FOUND", "USER_NOT_FOUND", "AUTH/USER-NOT-FOUND"])) {
      return "If this email exists in our system, you’ll receive a password reset link shortly.";
    }

    if (includesAny(code, ["HTTP_429"])) {
      return "Too many attempts. Please try again in a few minutes.";
    }

    // fallback for reset flow
    return "We couldn’t send a password reset email right now. Please try again later.";
  }

  // -------------------------
  // Other HTTP fallbacks (generic)
  // -------------------------
  if (includesAny(code, ["HTTP_500", "HTTP_502", "HTTP_503", "HTTP_504"])) {
    return "The service is temporarily unavailable. Please try again later.";
  }

  // -------------------------
  // Default fallbacks per context
  // -------------------------
  if (ctx === "SIGN_IN") return "Sign in failed. Please try again.";
  if (ctx === "SIGN_UP") return "Sign up failed. Please check your details and try again.";
  if (ctx === "GENERIC") return "Something went wrong. Please try again.";

  return "Something went wrong. Please try again.";
}
