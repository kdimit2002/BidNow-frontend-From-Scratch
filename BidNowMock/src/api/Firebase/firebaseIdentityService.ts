
// !!!!!!!!!!!!!!!!!!!!!!!!todo: san env variable sto mellon!!!!!!!!!!!!!!!!!!!!!!!!
import type {
  SignUpResponse,
  SendVerificationCodeResponse,
  SignInWithPhoneNumberResponse,
  UpdateAccountResponse,
  SignInWithPasswordResponse
} from "../../models/Firebase";

import { setFirebaseAuthToken } from "../Springboot/backendClient";


const FIREBASE_API_KEY =
//   import.meta.env.VITE_FIREBASE_API_KEY ??
  "AIzaSyDCx7Aza5uuSOkJgPWZmKYK3GCoslqMlqg"; // fallback για dev

const BASE_URL = "https://identitytoolkit.googleapis.com/v1";


async function firebasePost<T>(
  path: string,
  body: unknown
): Promise<T> {
  const url = `${BASE_URL}${path}?key=${FIREBASE_API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Firebase error:", data);
    const message = data?.error?.message ?? `HTTP ${res.status}`;
    throw new Error(message);
  }

  return data as T;
}

/**
 * 1) Create account with email + password + displayName
 *    POST /accounts:signUp
 */
export async function createAccountWithEmailAndPassword(params: {
  email: string;
  password: string;
  displayName: string;
}): Promise<SignUpResponse> {
  const { email, password, displayName } = params;

  return firebasePost<SignUpResponse>("/accounts:signUp", {
    email,
    password,
    displayName,
    returnSecureToken: true,
  });
}

/**
 * 2) Send verification code to phone number
 *    POST /accounts:sendVerificationCode
 *    ⚠️ Στο δικό σου παράδειγμα έλειπε το '?'
 */
export async function sendVerificationCodeToPhone(params: {
  phoneNumber: string;
  recaptchaToken?: string;
}): Promise<SendVerificationCodeResponse> {
  const { phoneNumber, recaptchaToken = "unused_for_testing" } = params;

  return firebasePost<SendVerificationCodeResponse>(
    "/accounts:sendVerificationCode",
    {
      phoneNumber,
      recaptchaToken,
      // Αν θες να κάνεις link με υπάρχον user, μπορείς να προσθέσεις "idToken"
    }
  );
}

/**
 * 3) Sign in with phone number (χρησιμοποιεί sessionInfo + code + idToken)
 *    POST /accounts:signInWithPhoneNumber
 */
export async function signInWithPhoneNumberAndLinkToEmail(params: {
  sessionInfo: string;
  smsCode: string;
  idTokenFromEmailUser: string;
}): Promise<SignInWithPhoneNumberResponse> {
  const { sessionInfo, smsCode, idTokenFromEmailUser } = params;

  return firebasePost<SignInWithPhoneNumberResponse>(
    "/accounts:signInWithPhoneNumber",
    {
      sessionInfo,
      code: smsCode,
      idToken: idTokenFromEmailUser,
      returnSecureToken: true,
    }
  );
}

/**
 * 4) Match email + password + phone in ένα account
 *    POST /accounts:update
 */
export async function updateAccountWithEmailPassword(params: {
  idToken: string;
  email: string;
  password: string;
}): Promise<UpdateAccountResponse> {
  const { idToken, email, password } = params;

  return firebasePost<UpdateAccountResponse>("/accounts:update", {
    idToken,
    email,
    password,
    returnSecureToken: true,
  });
}



/**
 * 5) DELETE user από Firebase (rollback)
 *    POST /accounts:delete
 */
export async function deleteFirebaseUser(params: {
  idToken: string;
}): Promise<void> {
  const { idToken } = params;

  await firebasePost<unknown>("/accounts:delete", {
    idToken,
  });
}


/**
 * High-level flow ΜΕ ROLLBACK:
 *
 *  1) signUp (email + password + displayName)
 *  2) sendVerificationCode (phone)
 *  3) signInWithPhoneNumber (sessionInfo + smsCode + idToken του user)
 *  4) updateAccount (αν χρειάζεται)
 *
 *  Αν ΣΕ ΟΠΟΙΟΔΗΠΟΤΕ ΒΗΜΑ από το (2) και μετά γίνει error,
 *  τότε σβήνουμε τον user από το Firebase χρησιμοποιώντας το idToken του.
 */
export async function fullEmailPhoneRegistrationFlowWithRollback(params: {
  email: string;
  password: string;
  displayName: string;
  phoneNumber: string;
  smsCode: string;
}) {
  const { email, password, displayName, phoneNumber, smsCode } = params;

  let emailSignUpIdToken: string | null = null;

  try {
    // 1) signUp
    const signUpRes = await createAccountWithEmailAndPassword({
      email,
      password,
      displayName,
    });

    emailSignUpIdToken = signUpRes.idToken;

    // 2) sendVerificationCode
    const sendCodeRes = await sendVerificationCodeToPhone({
      phoneNumber,
      recaptchaToken: "unused_for_testing", // test mode
    });

    // 3) signInWithPhoneNumber + link
    const signInPhoneRes = await signInWithPhoneNumberAndLinkToEmail({
      sessionInfo: sendCodeRes.sessionInfo,
      smsCode,
      idTokenFromEmailUser: signUpRes.idToken,
    });

    // 4) update account (optional, αν χρειάζεται να επιβεβαιώσεις/αλλάξεις κάτι)
    const finalUpdateRes = await updateAccountWithEmailPassword({
      idToken: signInPhoneRes.idToken,
      email,
      password,
    });

    // Αν φτάσουμε εδώ → ΟΛΑ ΟΚ, επιστρέφουμε τον τελικό user/token
    // setFirebaseAuthToken(finalUpdateRes.idToken); // edo arxikopoioume ti gobal metabliti me to token

    // στο τέλος του flow:
    setFirebaseAuthToken(finalUpdateRes.idToken, finalUpdateRes.localId);
    // εδώ βάλε:
    saveRefreshToken(finalUpdateRes.refreshToken);


    return {
      firebaseUserId: finalUpdateRes.localId,
      idToken: finalUpdateRes.idToken,
      email: finalUpdateRes.email,
    };
  } catch (err) {
    // ROLLBACK: αν έχουμε ήδη δημιουργήσει user (signUp έγινε) → διαγραφή
    if (emailSignUpIdToken) {
      try {
        await deleteFirebaseUser({ idToken: emailSignUpIdToken });
        console.warn("Rollback: Firebase user deleted due to error in flow");
      } catch (deleteErr) {
        console.error("Failed to delete user during rollback", deleteErr);
      }
    }

    throw err; // ξαναπετάμε το error προς το component
  }
}



  export function isExistingFirebaseUserError(err: unknown): boolean {
    if (!(err instanceof Error)) return false;
    const msg = err.message || "";
    // τα τυπικά codes του Firebase REST:
    return (
      msg.includes("EMAIL_EXISTS") ||
      msg.includes("PHONE_NUMBER_EXISTS") ||
      msg.includes("CREDENTIAL_ALREADY_IN_USE")
    );
  }


//////////////// SIGN IN ///////////////////////

import { saveRefreshToken } from "./authStorage";

export async function signInWithEmailAndInitSession(
  params: { email: string; password: string }
): Promise<SignInWithPasswordResponse> {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: params.email,
        password: params.password,
        returnSecureToken: true,
      }),
    }
  );

  if (!res.ok) {
    // handle errors...
    throw new Error("Firebase sign-in failed");
  }

  const data = (await res.json()) as SignInWithPasswordResponse;

  setFirebaseAuthToken(data.idToken, data.localId);
  saveRefreshToken(data.refreshToken); // 👈 εδώ

  return data;
}






import { getValidStoredRefreshToken, clearRefreshToken } from "./authStorage";

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
      `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`,
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





///////////////// FORGOT PASSWORD ///////////////////

interface FirebaseOobCodeErrorResponse {
  error?: {
    code?: number;
    message?: string;
    errors?: Array<{
      message?: string;
      domain?: string;
      reason?: string;
    }>;
  };
}



/**
 * Στέλνει password reset email μέσω Firebase Authentication.
 * Αν το email δεν υπάρχει, θα πετάξει Error("EMAIL_NOT_FOUND").
 */
export async function sendPasswordResetEmail(email: string): Promise<void> {
  const url = `${BASE_URL}/accounts:sendOobCode?key=${FIREBASE_API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      requestType: "PASSWORD_RESET",
      email,
    }),
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;

    try {
      const data = (await res.json()) as FirebaseOobCodeErrorResponse;

      if (data.error?.message) {
        // π.χ. "EMAIL_NOT_FOUND", "INVALID_EMAIL", ...
        message = data.error.message;
      }
    } catch {
      // αν αποτύχει το parsing, κρατάμε το default message
    }

    throw new Error(message);
  }

  // Δεν χρειαζόμαστε το body στην επιτυχία, οπότε δεν κάνουμε res.json()
}





// export async function signInWithEmailAndInitSession(params: {
//   email: string;
//   password: string;
// }): Promise<SignInWithPasswordResponse> {
//   const { email, password } = params;

//   const res = await firebasePost<SignInWithPasswordResponse>(
//     "/accounts:signInWithPassword",
//     {
//       email,
//       password,
//       returnSecureToken: true,
//     }
//   );

//   setFirebaseAuthToken(res.idToken); // edo arxikopoioume ti gobal metabliti me to token
//   return res;
// }






export interface FirebaseUserInfo {
  email?: string;
  displayName?: string;
  phoneNumber?: string;
}




/**
 * Παίρνει πληροφορίες του τρέχοντος Firebase user (email, displayName, phoneNumber)
 * χρησιμοποιώντας το idToken.
 */
export async function fetchFirebaseUserInfo(
  idToken: string
): Promise<FirebaseUserInfo | null> {
  const url = `${BASE_URL}/accounts:lookup?key=${FIREBASE_API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = (await res.json()) as any;
      if (data?.error?.message) {
        message = data.error.message;
      }
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (await res.json()) as any;
  const user = data.users?.[0];
  if (!user) return null;

  return {
    email: user.email,
    displayName: user.displayName,
    phoneNumber: user.phoneNumber,
  };
}